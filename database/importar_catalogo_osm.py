"""Build a reproducible catalog seed from a Costa Rica OpenStreetMap PBF."""
import argparse
from collections import defaultdict
from pathlib import Path
import re
import unicodedata

import osmium
from shapely import from_wkb, make_valid
from shapely.geometry import Point
from shapely.strtree import STRtree


def normalized(value):
    return "".join(c for c in unicodedata.normalize("NFD", value.lower()) if not unicodedata.combining(c))


def canton_name(name):
    return re.sub(r"^canton (?:de )?", "", normalized(name)).strip()


class Boundaries(osmium.SimpleHandler):
    def __init__(self, codes):
        super().__init__()
        self.codes = codes
        self.areas = {}
        self.factory = osmium.geom.WKBFactory()

    def area(self, area):
        tags = area.tags
        if tags.get("boundary") != "administrative" or tags.get("admin_level") != "6":
            return
        code = self.codes.get(canton_name(tags.get("name", "")))
        if code:
            self.areas[code] = make_valid(from_wkb(bytes.fromhex(self.factory.create_multipolygon(area))))


def classify(tags):
    tourism = tags.get("tourism")
    amenity = tags.get("amenity")
    if amenity in {"restaurant", "cafe", "fast_food"}:
        return "restaurant", {"restaurant": "Restaurante", "cafe": "Cafetería", "fast_food": "Comida rápida"}[amenity]
    if tourism in {"hotel", "hostel", "guest_house", "camp_site"}:
        return "lodging", "Alojamiento"
    for key, values in (
        ("tourism", {"viewpoint": ("nature", "Mirador"), "museum": ("culture", "Museo"),
                     "gallery": ("culture", "Galería"), "attraction": ("culture", "Atractivo")}),
        ("natural", {"beach": ("nature", "Playa")}),
        ("leisure", {"park": ("nature", "Parque"), "nature_reserve": ("nature", "Reserva natural"),
                     "garden": ("nature", "Jardín")}),
        ("amenity", {"arts_centre": ("culture", "Centro cultural"), "theatre": ("culture", "Teatro"),
                     "library": ("culture", "Biblioteca"), "marketplace": ("culture", "Mercado"),
                     "place_of_worship": ("culture", "Templo")}),
        ("historic", {"monument": ("culture", "Monumento"), "archaeological_site": ("culture", "Sitio arqueológico")}),
    ):
        if tags.get(key) in values:
            return values[tags.get(key)]


class Places(osmium.SimpleHandler):
    def __init__(self, areas):
        super().__init__()
        self.codes = list(areas)
        self.index = STRtree(list(areas.values()))
        self.results = defaultdict(dict)

    def add(self, element, kind, location):
        tags = element.tags
        name = " ".join(tags.get("name", "").split())
        classification = classify(tags) if name else None
        if not classification or len(name) > 130 or tags.get("landuse") == "cemetery" or re.search(r"\bcementerio\b", normalized(name)):
            return
        if classification[0] == "lodging" and normalized(name).startswith("casa de ") and not tags.get("website"):
            return
        matches = self.index.query(Point(location.lon, location.lat), predicate="within")
        if len(matches) != 1:
            return
        code = self.codes[matches[0]]
        category, subtype = classification
        cuisines = sorted({value.strip() for value in (tags.get("cuisine") or "").split(";")
                           if re.fullmatch(r"[a-z_]{1,35}", value.strip())}) if category == "restaurant" else []
        vegan = {"yes": "vegan_options", "only": "fully_vegan"}.get(tags.get("diet:vegan")) if category == "restaurant" else None
        vegetarian = tags.get("diet:vegetarian") in {"yes", "only"} or vegan is not None
        # Wheelchair access is a separate attribute. A wheelchair tag alone is not ramp evidence.
        features = [value for value, present in [
            ("ramp", tags.get("ramp:wheelchair") == "yes"),
            ("wheelchair", tags.get("wheelchair") == "yes"),
            ("accessible_toilet", tags.get("toilets:wheelchair") == "yes"),
        ] if present]
        score = ((category != "restaurant" and subtype != "Templo") * 2 + bool(vegan) * 4
                 + bool(cuisines) * 2 + bool(features) * 3 + bool(tags.get("wikidata")) * 2)
        value = (score, name, kind, int(element.id), code, category, subtype, cuisines, vegan, vegetarian, features)
        key = normalized(name)
        previous = self.results[code].get(key)
        if not previous or (score, kind == "node", -element.id) > (previous[0], previous[2] == "node", -previous[3]):
            self.results[code][key] = value

    def node(self, node):
        if node.location.valid():
            self.add(node, "node", node.location)

    def way(self, way):
        if not way.tags.get("name") or not classify(way.tags):
            return
        nodes = list(way.nodes)
        valid = [node.location for node in nodes if node.location.valid()]
        if valid:
            self.add(way, "way", valid[len(valid) // 2])


def sql(value):
    if value is None:
        return "null"
    if isinstance(value, list):
        return "array[" + ", ".join(map(sql, value)) + "]::text[]"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    return "'" + value.replace("'", "''") + "'"


def export(places, output, snapshot_date):
    rows = []
    for code, items in sorted(places.items()):
        ordered = sorted(items.values(), key=lambda row: (-row[0], normalized(row[1]), row[3]))
        selected = []
        for category in ("nature", "culture", "restaurant", "lodging"):
            match = next((item for item in ordered if item[5] == category), None)
            if match:
                selected.append(match)
        selected.extend(item for item in ordered if item not in selected)
        for _, name, kind, osm_id, _, category, subtype, cuisines, vegan, vegetarian, features in selected[:6]:
            rows.append("  (" + ", ".join(map(sql, (
                f"osm-{kind}-{osm_id}", code, name, category, subtype, cuisines, vegan, vegetarian, features,
                f"https://www.openstreetmap.org/{kind}/{osm_id}",
            ))) + ")")
    template = Path(__file__).with_name("plantilla-catalogo-osm.sql.txt").read_text(encoding="utf-8")
    output.write_text(template.replace("@@ROWS@@", ",\n".join(rows)).replace("@@DATE@@", snapshot_date), encoding="utf-8")
    print(f"{len(rows)} lugares; {len(places)} cantones")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pbf")
    parser.add_argument("output", type=Path)
    parser.add_argument("--snapshot-date", required=True)
    args = parser.parse_args()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.snapshot_date):
        parser.error("--snapshot-date debe tener formato AAAA-MM-DD")
    cantons = Path(__file__).with_name("cantones.sql").read_text(encoding="utf-8")
    codes = {canton_name(name): int(code) for code, name in re.findall(r"\((\d{3}), '[a-z-]+', '([^']+)'\)", cantons)}
    print(len(codes), "códigos DTA")
    borders = Boundaries(codes)
    borders.apply_file(args.pbf, locations=True)
    missing = sorted(set(codes.values()) - borders.areas.keys())
    if missing:
        raise SystemExit(f"Sin polígono para los cantones: {missing}")
    places = Places(borders.areas)
    places.apply_file(args.pbf, locations=True)
    sparse = [code for code in sorted(codes.values()) if len(places.results[code]) < 2]
    if sparse:
        raise SystemExit(f"Faltan lugares con nombre en: {sparse}")
    export(places.results, args.output, args.snapshot_date)


if __name__ == "__main__":
    main()

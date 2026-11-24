"""Export coordinates and explicit amenities for the existing OpenStreetMap seed."""
import argparse
from pathlib import Path
import re

import osmium

from importar_catalogo_osm import sql


class Details(osmium.SimpleHandler):
    def __init__(self, slugs):
        super().__init__()
        self.slugs = slugs
        self.rows = {}

    def add(self, slug, tags, location):
        if not location.valid():
            return
        services = [
            name for name, present in {
                "outdoor": tags.get("outdoor_seating") == "yes",
                "takeaway": tags.get("takeaway") in {"yes", "only"},
                "delivery": tags.get("delivery") in {"yes", "only"},
                "reservations": tags.get("reservation") in {"yes", "required", "recommended"},
                "wifi": tags.get("internet_access") == "wlan",
                "parking": tags.get("parking") in {"yes", "surface", "underground", "multi-storey"},
                "dogs": tags.get("dog") in {"yes", "leashed"},
                "camping": tags.get("tourism") == "camp_site",
                "free": tags.get("fee") == "no",
                "paid": tags.get("fee") == "yes",
            }.items() if present
        ]
        street = " ".join(filter(None, (tags.get("addr:street"), tags.get("addr:housenumber"))))
        address = clean(tags.get("addr:full") or ", ".join(filter(None, (street, tags.get("addr:city")))), 160)
        hours = clean(tags.get("opening_hours"), 160)
        self.rows[slug] = (slug, location.lat, location.lon, address, hours, services)

    def node(self, node):
        slug = f"osm-node-{node.id}"
        if slug in self.slugs:
            self.add(slug, node.tags, node.location)

    def way(self, way):
        slug = f"osm-way-{way.id}"
        if slug in self.slugs:
            valid = [node.location for node in way.nodes if node.location.valid()]
            if valid:
                self.add(slug, way.tags, valid[len(valid) // 2])


def clean(value, size):
    value = " ".join((value or "").split())
    return value if value and len(value) <= size else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pbf")
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    seed = Path(__file__).with_name("catalogo-osm.sql").read_text(encoding="utf-8")
    slugs = set(re.findall(r"^\s*\('(osm-(?:node|way)-\d+)'", seed, re.M))
    details = Details(slugs)
    details.apply_file(args.pbf, locations=True)
    if details.rows.keys() != slugs or not slugs:
        raise SystemExit("El extracto no contiene todas las fichas del catálogo seleccionado.")
    values = ",\n".join(
        f"  ({sql(slug)}, {latitude:.5f}, {longitude:.5f}, {sql(address)}, {sql(hours)}, {sql(services)})"
        for slug, latitude, longitude, address, hours, services in sorted(details.rows.values())
    )
    args.output.write_text(
        "-- © OpenStreetMap contributors — ODbL 1.0. https://www.openstreetmap.org/copyright\n"
        "update rutea.places p set latitude = d.latitude, longitude = d.longitude,\n"
        "  address = d.address, hours = d.hours, services = d.services\n"
        f"from (values\n{values}\n) as d(slug, latitude, longitude, address, hours, services)\n"
        "where p.slug = d.slug and p.evidence_kind = 'openstreetmap';\n",
        encoding="utf-8",
    )
    print(f"{len(details.rows)} fichas georreferenciadas")


if __name__ == "__main__":
    main()

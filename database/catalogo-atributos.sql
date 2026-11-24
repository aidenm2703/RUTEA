alter table rutea.places
  add column cuisine_codes text[] not null default '{}',
  add column vegetarian_options boolean,
  add column accessibility_features text[] not null default '{}',
  add column evidence_kind text not null default 'editorial'
    check (evidence_kind in ('editorial', 'openstreetmap'));

update rutea.places set vegetarian_options = true where vegan_menu is not null;

update rutea.places set accessibility_features = '{ramp,elevator}' where slug = 'museo-nacional-san-jose';
update rutea.places set accessibility_features = '{accessible_toilet}' where slug = 'volcan-irazu-cartago';
insert into rutea.place_links (place_slug, kind, label, url) values
  ('museo-nacional-san-jose', 'source', 'Museo Nacional: rampas y ascensor', 'https://www.museocostarica.go.cr/visitar/'),
  ('volcan-irazu-cartago', 'source', 'SINAC: sanitarios del sector Cráteres', 'https://www.sinac.go.cr/ES/ac/accvc/pnvi/Paginas/default.aspx');

insert into rutea.places (
  slug, province_slug, canton_code, name, visit_notes, reviewed_on,
  category, cuisine_codes, accessibility_features
) values
  ('kyomi-tsuki', 'heredia', 408, 'Kyomi Tsuki', 'Restaurante de cocina coreana en San Joaquín de Flores. Su menú incluye corn dogs de estilo coreano.', '2026-11-24', 'restaurant', '{korean}', '{}'),
  ('parque-nacional-carara', 'puntarenas', 611, 'Parque Nacional Carara', 'El SINAC documenta rampas y adaptaciones en el sendero de acceso universal, con mapa háptico e información en braille.', '2026-11-24', 'nature', '{}', '{ramp,braille}');

insert into rutea.place_links (place_slug, kind, label, url) values
  ('kyomi-tsuki', 'source', 'Reportaje sobre el restaurante y su menú', 'https://www.teletica.com/masqn/este-restaurante-coreano-en-heredia-esconde-una-historia-de-resiliencia-y-sabor_388036'),
  ('kyomi-tsuki', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Kyomi%20Tsuki%20San%20Joaquin%20Costa%20Rica'),
  ('parque-nacional-carara', 'official_site', 'SINAC: accesibilidad del sendero', 'https://www.sinac.go.cr/ES/turismo/Paginas/accinclus.aspx'),
  ('parque-nacional-carara', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Parque%20Nacional%20Carara%20Costa%20Rica');

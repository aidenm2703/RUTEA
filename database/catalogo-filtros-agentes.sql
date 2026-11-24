alter table rutea.places add column category text not null default 'culture'
  check (category in ('nature', 'culture', 'restaurant', 'lodging'));
alter table rutea.places add column vegan_menu text
  check (vegan_menu in ('fully_vegan', 'vegan_options'));
alter table rutea.places add check (vegan_menu is null or category = 'restaurant');
update rutea.places set category = 'nature' where slug in (
  'volcan-poas-poas', 'volcan-irazu-cartago', 'rincon-de-la-vieja-sector-las-pailas',
  'parque-nacional-cahuita-talamanca', 'manuel-antonio', 'tortuguero', 'volcan-turrialba'
);

insert into rutea.places (slug, province_slug, canton_code, name, visit_notes, reviewed_on, category, vegan_menu) values
  ('huacamole-san-pedro', 'san-jose', 115, 'Huacamole Vegan Food', 'Restaurante vegano en San Pedro. Consulta sus canales oficiales para ver el menú y la disponibilidad.', '2026-11-24', 'restaurant', 'fully_vegan'),
  ('la-esquina-vegana', 'heredia', null, 'La Esquina Vegana', 'Restaurante vegano en Lagunilla, Heredia. El operador publica el menú y los horarios en sus canales oficiales.', '2026-11-24', 'restaurant', 'fully_vegan'),
  ('azuleo-manuel-antonio', 'puntarenas', 606, 'Azuleo en Teva', 'Restaurante en Manuel Antonio con platos marcados como veganos, incluido el falafel del menú publicado.', '2026-11-24', 'restaurant', 'vegan_options');

insert into rutea.place_links (place_slug, kind, label, url) values
  ('huacamole-san-pedro', 'official_site', 'Menú y canales oficiales', 'https://lajamavegana.com/restaurantes-la-jama/'),
  ('huacamole-san-pedro', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Huacamole%20San%20Pedro%20Costa%20Rica'),
  ('la-esquina-vegana', 'official_site', 'Canales oficiales', 'https://lajamavegana.com/restaurantes-la-jama/'),
  ('la-esquina-vegana', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=La%20Esquina%20Vegana%20Lagunilla%20Heredia'),
  ('azuleo-manuel-antonio', 'official_site', 'Menú oficial', 'https://www.teva-cr.com/tevacostarica.com/dining/index.html'),
  ('azuleo-manuel-antonio', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Teva%20Manuel%20Antonio%20Costa%20Rica');

create table rutea.ai_agent_runs (
  id bigint generated always as identity primary key,
  user_id uuid references rutea.users (id) on delete set null,
  agent_slug text not null,
  status text not null check (status in ('ok', 'error')),
  duration_ms integer not null check (duration_ms >= 0),
  created_at timestamptz not null default now()
);
alter table rutea.ai_agent_runs enable row level security;

insert into rutea.places (
  slug, province_slug, canton_code, name, visit_notes, reviewed_on, category, subtype, address, hours, services
) values (
  'museo-de-arte-costarricense', 'san-jose', 101, 'Museo de Arte Costarricense',
  'El museo ofrece entrada gratuita para todo público. Al ingresar se solicita un registro breve por código QR.',
  '2026-11-24', 'culture', 'Museo', 'Parque Metropolitano La Sabana, San José',
  'Martes a domingo, 9:00 a. m. a 4:00 p. m.', '{free}'
)
on conflict (slug) do nothing;

insert into rutea.place_links (place_slug, kind, label, url)
values ('museo-de-arte-costarricense', 'official_site', 'Boletería, horario y condiciones de visita',
  'https://www.mac.go.cr/es/visita/boleteria')
on conflict do nothing;

update rutea.places
set services = array_append(services, 'paid')
where slug = 'manuel-antonio' and not ('paid' = any(services));

alter table rutea.places
  add column subtype text,
  add column latitude numeric(8,5),
  add column longitude numeric(8,5),
  add column address text,
  add column hours text,
  add column services text[] not null default '{}',
  add check ((latitude is null) = (longitude is null)),
  add check (latitude between -90 and 90 and longitude between -180 and 180);

update rutea.places set subtype = visit_notes where evidence_kind = 'openstreetmap';
update rutea.places set subtype = 'Restaurante' where category = 'restaurant' and subtype is null;
update rutea.places p set subtype = types.subtype
from (values
  ('teatro-nacional-san-jose', 'Teatro'),
  ('museo-nacional-san-jose', 'Museo'),
  ('museo-historico-cultural-juan-santamaria-alajuela', 'Museo'),
  ('museo-de-cultura-popular-santa-lucia-de-barva', 'Museo'),
  ('volcan-poas-poas', 'Volcán'),
  ('volcan-irazu-cartago', 'Volcán'),
  ('volcan-turrialba', 'Volcán'),
  ('rincon-de-la-vieja-sector-las-pailas', 'Parque nacional'),
  ('parque-nacional-cahuita-talamanca', 'Parque nacional'),
  ('parque-nacional-carara', 'Parque nacional'),
  ('manuel-antonio', 'Parque nacional'),
  ('tortuguero', 'Parque nacional'),
  ('monumento-guayabo', 'Sitio arqueológico'),
  ('sitio-museo-finca-6-palmar-sur-de-osa', 'Sitio arqueológico'),
  ('mercado-de-puntarenas-ciudad-de-puntarenas', 'Mercado'),
  ('fortin-heredia', 'Monumento'),
  ('ruta-de-cafe-en-heredia', 'Ruta de café'),
  ('orosi-paraiso', 'Pueblo histórico'),
  ('centro-de-nicoya', 'Centro histórico'),
  ('puerto-limon', 'Ciudad')
) as types(slug, subtype)
where p.slug = types.slug;

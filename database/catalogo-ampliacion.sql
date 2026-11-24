with new_places (slug, province_slug, canton_code, name, notes, source) as (values
  ('fortin-heredia', 'heredia', 401, 'El Fortín de Heredia', 'Caminar por el centro histórico y observar el torreón que Fadrique Gutiérrez mandó construir en 1876.', 'https://www.heredia.go.cr/es/bienestar-social/noticias/arte-y-cultura/celebracion-del-legado-de-el-fortin-simbolo-de-identidad'),
  ('monumento-guayabo', 'cartago', 305, 'Monumento Nacional Guayabo', 'Recorrer el sitio arqueológico de Santa Teresita y observar las calzadas de piedra que comunicaban el asentamiento.', 'https://www.sinac.go.cr/es/ac/accvc/mng/paginas/default.aspx'),
  ('manuel-antonio', 'puntarenas', 606, 'Parque Nacional Manuel Antonio', 'Caminar por los senderos habilitados. Cerca de Espadilla Sur y Manuel Antonio se puede observar un manglar donde se mezclan agua dulce y salada.', 'https://www.sinac.go.cr/es/ac/acopac/pnma/paginas/default.aspx'),
  ('tortuguero', 'limon', 702, 'Parque Nacional Tortuguero', 'Recorrer los canales habilitados en un paseo guiado y conocer cómo la red fluvial conecta las comunidades del entorno.', 'https://www.sinac.go.cr/ES/ac/acto/pnt/Paginas/default.aspx'),
  ('volcan-turrialba', 'cartago', 305, 'Parque Nacional Volcán Turrialba', 'Consultar las condiciones de ingreso antes de planear el recorrido. El Turrialba y el Irazú forman un mismo sistema volcánico.', 'https://www.sinac.go.cr/ES/ac/accvc/pnvt/Paginas/default.aspx')
), inserted as (
  insert into rutea.places (slug, province_slug, canton_code, name, visit_notes, reviewed_on)
  select slug, province_slug, canton_code, name, notes, date '2026-11-24' from new_places
  returning slug
)
insert into rutea.place_links (place_slug, kind, label, url)
select slug, 'official_site', 'Sitio oficial', source from new_places
union all
select slug, 'lodging_directory', 'Consultar alojamientos del ICT',
  'https://es.visitcostarica.com/planning-your-trip/accommodations' from new_places
union all
select 'fortin-heredia', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=El%20Fort%C3%ADn%20de%20Heredia%2C%20Costa%20Rica'
union all
select 'monumento-guayabo', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Monumento%20Nacional%20Guayabo%2C%20Costa%20Rica'
union all
select 'manuel-antonio', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Parque%20Nacional%20Manuel%20Antonio%2C%20Costa%20Rica'
union all
select 'tortuguero', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Parque%20Nacional%20Tortuguero%2C%20Costa%20Rica'
union all
select 'volcan-turrialba', 'map_search', 'Buscar en Google Maps', 'https://www.google.com/maps/search/?api=1&query=Parque%20Nacional%20Volc%C3%A1n%20Turrialba%2C%20Costa%20Rica';

update rutea.places set canton_code = 307,
  visit_notes = 'Visitar los miradores del sector Cráteres cuando estén habilitados. El SINAC documenta servicios sanitarios aptos para personas con discapacidad física en este sector.'
where slug = 'volcan-irazu-cartago';

insert into rutea.place_links (place_slug, kind, label, url) values
  ('volcan-irazu-cartago', 'official_site', 'SINAC, sector Cráteres', 'https://www.sinac.go.cr/ES/ac/accvc/pnvi/Paginas/default.aspx'),
  ('volcan-irazu-cartago', 'source', 'SINAC, ubicación administrativa', 'https://www.sinac.go.cr/ES/transprncia/Documents/Guia%20telef%C3%B3nica%20de%20las%20Areas%20y%20Sub%20Regionales.pdf'),
  ('museo-nacional-san-jose', 'official_site', 'Museo Nacional, sede Bellavista', 'https://www.museocostarica.go.cr/museo/historia-cuartel/');

update rutea.places set visit_notes = visit_notes ||
  ' El antiguo Cuartel Bellavista fue el escenario del acto simbólico de abolición del ejército en 1948.'
where slug = 'museo-nacional-san-jose';

insert into rutea.glossary (slug, province_slug, expression, language, usage_notes, source_url, reviewed_on)
values ('carreta', null, 'Carreta', 'español costarricense',
  'Carro tradicional tirado por bueyes. Las carretas llevaron café del Valle Central a Puntarenas y sus ruedas pintadas llegaron a identificar el origen de sus conductores.',
  'https://ich.unesco.org/en/RL/oxherding-and-oxcart-traditions-in-costa-rica-00103', '2026-11-24');

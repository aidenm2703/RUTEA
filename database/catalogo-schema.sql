create schema rutea;
revoke all on schema rutea from public;

create table rutea.provinces (
  slug text primary key,
  name text not null unique,
  curiosity text not null,
  source_url text not null,
  reviewed_on date not null
);

create table rutea.places (
  slug text primary key,
  province_slug text not null references rutea.provinces (slug),
  name text not null,
  visit_notes text not null,
  reviewed_on date not null
);
create index places_province_idx on rutea.places (province_slug);

create table rutea.place_links (
  place_slug text not null references rutea.places (slug) on delete cascade,
  kind text not null check (kind in ('source', 'map_search', 'lodging_directory', 'official_site', 'reservation')),
  label text not null,
  url text not null check (url like 'https://%'),
  primary key (place_slug, kind, url)
);

create table rutea.glossary (
  slug text primary key,
  province_slug text references rutea.provinces (slug),
  expression text not null,
  language text not null,
  usage_notes text not null,
  source_url text not null,
  reviewed_on date not null
);

alter table rutea.provinces enable row level security;
alter table rutea.places enable row level security;
alter table rutea.place_links enable row level security;
alter table rutea.glossary enable row level security;

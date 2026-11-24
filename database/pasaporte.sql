create table rutea.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role text not null default 'traveler' check (role in ('traveler', 'business', 'moderator', 'admin', 'auditor')),
  home_province_slug text references rutea.provinces (slug),
  home_canton_code smallint,
  check (home_canton_code is null or home_province_slug is not null),
  foreign key (home_province_slug, home_canton_code) references rutea.cantons (province_slug, code)
);

create table rutea.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references rutea.users (id) on delete cascade,
  place_slug text references rutea.places (slug),
  canton_code smallint references rutea.cantons (code),
  province_slug text references rutea.provinces (slug),
  visited_on date not null,
  check (num_nonnulls(place_slug, canton_code, province_slug) = 1),
  unique nulls not distinct (user_id, place_slug, canton_code, province_slug, visited_on)
);

create table rutea.badges (
  slug text primary key,
  name text not null,
  metric text not null check (metric in ('places', 'cantons', 'provinces')),
  threshold smallint not null check (threshold > 0),
  unique (metric, threshold)
);

insert into rutea.badges values
  ('primer-sello', 'Primer sello', 'places', 1),
  ('cinco-cantones', 'Cinco cantones', 'cantons', 5),
  ('tres-provincias', 'Tres provincias', 'provinces', 3),
  ('siete-provincias', 'Siete provincias', 'provinces', 7);

alter table rutea.users enable row level security;
alter table rutea.visits enable row level security;
alter table rutea.badges enable row level security;

create view rutea.passport_visits with (security_invoker = true) as
select v.id, v.user_id, v.visited_on, v.place_slug,
  coalesce(v.canton_code, p.canton_code) as canton_code,
  coalesce(v.province_slug, c.province_slug, p.province_slug) as province_slug
from rutea.visits v
left join rutea.cantons c on c.code = v.canton_code
left join rutea.places p on p.slug = v.place_slug;

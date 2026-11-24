async function getPassport(database, userId) {
  const { rows: [passport] } = await database.query(`
    with visits as (
      select id, visited_on, place_slug, canton_code, province_slug
      from rutea.passport_visits where user_id = $1
    ), progress as (
      select count(distinct place_slug)::integer as places,
        count(distinct canton_code)::integer as cantons,
        count(distinct province_slug)::integer as provinces
      from visits
    )
    select to_jsonb(progress) as progress,
      coalesce((select jsonb_agg(visits order by visited_on desc, id) from visits), '[]') as visits,
      coalesce((select jsonb_agg(stamp order by stamped_on desc, place_slug) from (
        select place_slug, min(visited_on) as stamped_on
        from visits where place_slug is not null group by place_slug
      ) stamp), '[]') as stamps,
      coalesce((select jsonb_agg(badge order by metric, threshold)
        from rutea.badges badge where threshold <= case metric
          when 'places' then progress.places
          when 'cantons' then progress.cantons
          when 'provinces' then progress.provinces end), '[]') as badges
    from progress
  `, [userId]);
  return passport;
}

async function addVisit(database, userId, visit) {
  const { rowCount } = await database.query(`
    insert into rutea.visits (user_id, place_slug, canton_code, province_slug, visited_on)
    values ($1, $2, $3, $4, $5)
    on conflict (user_id, place_slug, canton_code, province_slug, visited_on) do nothing
  `, [userId, visit.placeSlug, visit.cantonCode, visit.provinceSlug, visit.visitedOn]);
  return rowCount === 1;
}

module.exports = { getPassport, addVisit };

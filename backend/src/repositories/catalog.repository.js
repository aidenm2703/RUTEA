async function listProvinces(database) {
  const result = await database.query('select * from rutea.provinces order by name');
  return result.rows;
}

async function listGlossary(database) {
  const result = await database.query('select * from rutea.glossary order by expression');
  return result.rows;
}

async function listCantons(database) {
  const result = await database.query('select * from rutea.cantons order by province_slug, name');
  return result.rows;
}

async function findProvince(database, slug) {
  const result = await database.query(`
    select province.*,
      coalesce((
        select jsonb_agg(to_jsonb(place) || jsonb_build_object('links', coalesce((
          select jsonb_agg(jsonb_build_object('kind', link.kind, 'label', link.label, 'url', link.url)
            order by link.kind, link.label, link.url)
          from rutea.place_links link where link.place_slug = place.slug
        ), '[]'::jsonb)) order by place.name)
        from rutea.places place where place.province_slug = province.slug
      ), '[]'::jsonb) as places,
      coalesce((
        select jsonb_agg(to_jsonb(term) order by term.expression)
        from rutea.glossary term where term.province_slug = province.slug or term.province_slug is null
      ), '[]'::jsonb) as glossary
    from rutea.provinces province
    where province.slug = $1
  `, [slug]);
  return result.rows[0];
}

module.exports = { listProvinces, findProvince, listGlossary, listCantons };

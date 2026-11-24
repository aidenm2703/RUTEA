const { Router } = require('express');
const { getPassport, addVisit } = require('../repositories/passport.repository');

function isSlug(value) {
  return typeof value === 'string' && /^[a-z0-9-]{1,100}$/.test(value);
}

function isCanton(value) {
  return Number.isInteger(value) && value >= 101 && value <= 799;
}

function isVisitDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Costa_Rica' }).format(new Date());
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value
    && value >= '1900-01-01' && value <= today;
}

function createPassportRouter(database, authenticate) {
  const router = Router();
  router.use(authenticate);
  router.get('/profile', (request, response) => response.json(request.user));
  router.patch('/profile', async (request, response) => {
    const { homeProvinceSlug, homeCantonCode = null } = request.body ?? {};
    if (!(isSlug(homeProvinceSlug) || homeProvinceSlug === null)
      || !(homeCantonCode === null || (isSlug(homeProvinceSlug) && isCanton(homeCantonCode)))) {
      return response.status(400).json({ error: 'Indica una provincia y, opcionalmente, su cantón' });
    }
    try {
      const { rows: [profile] } = await database.query(`
        update rutea.users set home_province_slug = $2, home_canton_code = $3 where id = $1
        returning id, display_name, role, home_province_slug, home_canton_code
      `, [request.user.id, homeProvinceSlug, homeCantonCode]);
      return response.json(profile);
    } catch (error) {
      if (error.code === '23503') return response.status(400).json({ error: 'Provincia o cantón inválido' });
      throw error;
    }
  });
  router.get('/passport', async (request, response) => {
    response.json(await getPassport(database, request.user.id));
  });
  router.post('/passport/visits', async (request, response) => {
    const { placeSlug = null, cantonCode = null, provinceSlug = null, visitedOn } = request.body ?? {};
    const targets = [placeSlug, cantonCode, provinceSlug].filter((value) => value !== null);
    if (targets.length !== 1 || !isVisitDate(visitedOn)
      || (placeSlug !== null && !isSlug(placeSlug))
      || (cantonCode !== null && !isCanton(cantonCode))
      || (provinceSlug !== null && !isSlug(provinceSlug))) {
      return response.status(400).json({ error: 'Indica un lugar, cantón o provincia y una fecha válida' });
    }
    try {
      const created = await addVisit(database, request.user.id, { placeSlug, cantonCode, provinceSlug, visitedOn });
      return response.status(created ? 201 : 200).json(await getPassport(database, request.user.id));
    } catch (error) {
      if (error.code === '23503') return response.status(400).json({ error: 'Destino inválido' });
      throw error;
    }
  });
  return router;
}

module.exports = { createPassportRouter };

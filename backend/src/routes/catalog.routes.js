const { Router } = require('express');
const { listProvinces, findProvince, listGlossary } = require('../repositories/catalog.repository');

function createCatalogRouter(database) {
  const router = Router();
  router.get('/provinces', async (_request, response) => {
    response.json(await listProvinces(database));
  });

  router.get('/provinces/:slug', async (request, response) => {
    const province = await findProvince(database, request.params.slug);
    if (!province) return response.status(404).json({ error: 'Provincia no encontrada' });
    response.json(province);
  });

  router.get('/glossary', async (_request, response) => {
    response.json(await listGlossary(database));
  });
  return router;
}

module.exports = { createCatalogRouter };

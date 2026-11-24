const express = require('express');
const { createCatalogRouter } = require('./routes/catalog.routes');

function createApp(database) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/catalog', createCatalogRouter(database));
  app.use((_request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, _request, response, _next) => {
    console.error('Error de API', error.code ?? error.name);
    response.status(500).json({ error: 'No se pudo completar la consulta' });
  });
  return app;
}

module.exports = { createApp };

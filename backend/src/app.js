const express = require('express');
const { createCatalogRouter } = require('./routes/catalog.routes');
const { createAuthRouter, createAuthentication } = require('./routes/auth.routes');
const { createPassportRouter } = require('./routes/passport.routes');
const { createAgentsRouter } = require('./routes/agents.routes');
const { createGooglePlacesRouter } = require('./routes/google-places.routes');

function createApp(database, { jwtSecret, allowRegistration = false, gemini, googlePlacesKey } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));
  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  let authenticate = (_request, response) => response.status(503).json({ error: 'El acceso a RUTEA todavía no está configurado.' });
  if (jwtSecret) {
    if (Buffer.byteLength(jwtSecret) < 32) throw new Error('JWT_SECRET debe tener al menos 32 bytes');
    app.use('/api/auth', createAuthRouter(database, jwtSecret, allowRegistration));
    authenticate = createAuthentication(database, jwtSecret);
    app.use('/api/me', createPassportRouter(database, authenticate));
  }
  app.use('/api/catalog', authenticate, createCatalogRouter(database));
  app.use('/api/google-places', authenticate, createGooglePlacesRouter(googlePlacesKey, database));
  app.use('/api/agents', authenticate, createAgentsRouter(database, gemini));
  app.use((_request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, _request, response, _next) => {
    if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'JSON inválido' });
    if (error.type === 'entity.too.large') return response.status(413).json({ error: 'Solicitud demasiado grande' });
    console.error('Error de API', error.code ?? error.name);
    response.status(500).json({ error: 'No se pudo completar la consulta' });
  });
  return app;
}

module.exports = { createApp };

const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');

const base = 'https://places.googleapis.com/v1';
const searchFields = 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri';
const detailFields = [
  'id', 'displayName', 'formattedAddress', 'googleMapsUri', 'websiteUri', 'nationalPhoneNumber',
  'rating', 'userRatingCount', 'regularOpeningHours.weekdayDescriptions', 'reviews', 'photos', 'attributions',
].join(',');
const placeIdPattern = /^[A-Za-z0-9_-]{1,255}$/;
const photoNamePattern = /^places\/[A-Za-z0-9_-]{1,255}\/photos\/[A-Za-z0-9_-]{1,2048}$/;

async function requestGoogle(key, path, { fields, body } = {}) {
  const response = await fetch(`${base}/${path}`, {
    method: body ? 'POST' : 'GET',
    signal: AbortSignal.timeout(12000),
    redirect: 'error',
    headers: {
      'x-goog-api-key': key,
      ...(fields && { 'x-goog-fieldmask': fields }),
      ...(body && { 'Content-Type': 'application/json' }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = new Error('Google Places request failed');
    error.upstreamStatus = response.status;
    throw error;
  }
  return response.json();
}

function providerError(response, error) {
  if (error.upstreamStatus === 429) return response.status(429).json({ error: 'Google Places alcanzó su cuota. Intenta más tarde.' });
  if (error.upstreamStatus === 404) return response.status(404).json({ error: 'Google Maps ya no encuentra este lugar.' });
  return response.status(502).json({ error: 'Google Places no está disponible. Revisa la configuración o vuelve a intentarlo.' });
}

function createGooglePlacesRouter(key) {
  const router = Router();
  router.use((_request, response, next) => {
    response.set('Cache-Control', 'no-store');
    next();
  });
  router.get('/status', (_request, response) => response.json({ available: Boolean(key) }));
  router.use((_request, response, next) => {
    if (!key) return response.status(503).json({ error: 'Google Places todavía no está configurado.' });
    next();
  });
  router.use(rateLimit({ windowMs: 60000, limit: 12,
    message: { error: 'Espera un minuto antes de consultar Google Maps de nuevo.' } }));

  router.post('/search', async (request, response) => {
    const query = request.body?.query;
    if (typeof query !== 'string' || query.trim().length < 3 || query.length > 180) {
      return response.status(400).json({ error: 'Escribe una búsqueda de 3 a 180 caracteres.' });
    }
    try {
      const result = await requestGoogle(key, 'places:searchText', {
        fields: searchFields,
        body: {
          textQuery: `${query.trim()}, Costa Rica`,
          languageCode: 'es', regionCode: 'CR', pageSize: 8,
          locationRestriction: { rectangle: {
            low: { latitude: 8, longitude: -86 },
            high: { latitude: 11.3, longitude: -82.45 },
          } },
        },
      });
      return response.json({ places: result.places ?? [] });
    } catch (error) {
      return providerError(response, error);
    }
  });

  router.get('/:id', async (request, response) => {
    const { id } = request.params;
    if (!placeIdPattern.test(id)) return response.status(400).json({ error: 'Identificador de lugar inválido.' });
    try {
      const { photos = [], ...place } = await requestGoogle(key, `places/${id}?languageCode=es&regionCode=CR`, { fields: detailFields });
      const firstPhoto = photos.find(({ name }) => typeof name === 'string' && photoNamePattern.test(name)
        && name.startsWith(`places/${id}/photos/`));
      let photo;
      if (firstPhoto) {
        try {
          const { photoUri } = await requestGoogle(key, `${firstPhoto.name}/media?maxWidthPx=720&skipHttpRedirect=true`);
          if (typeof photoUri === 'string' && photoUri.startsWith('https://')) {
            photo = { url: photoUri, authors: firstPhoto.authorAttributions ?? [] };
          }
        } catch {
          // A photo failure should not hide the place details.
        }
      }
      return response.json({ place, photo });
    } catch (error) {
      return providerError(response, error);
    }
  });
  return router;
}

module.exports = { createGooglePlacesRouter };

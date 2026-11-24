const { Router } = require('express');
const { rateLimit } = require('express-rate-limit');
const { agents, examples, canRun, generate } = require('../services/agents');
const { forecastFor } = require('../services/weather');
const { findProvince, listProvinces, listCantons } = require('../repositories/catalog.repository');
const { getPassport } = require('../repositories/passport.repository');

function createAgentsRouter(database, authenticate, gemini) {
  const router = Router();
  const available = Boolean(authenticate && gemini?.key && gemini?.model);
  router.get('/', (_request, response) => response.json({
    available,
    agents: agents.map(({ id, name, audience, description }) => ({ id, name, audience, description, example: examples[id] })),
  }));
  if (!authenticate) return router;
  router.get('/permissions', authenticate, (request, response) => {
    response.json({ allowed: agents.filter((agent) => canRun(agent, request.user.role)).map(({ id }) => id) });
  });
  router.post('/:id', authenticate, rateLimit({ windowMs: 60000, limit: 6,
    message: { error: 'Espera un minuto antes de realizar más consultas.' } }), async (request, response) => {
    const agent = agents.find((item) => item.id === request.params.id);
    if (!agent) return response.status(404).json({ error: 'Agente no encontrado' });
    if (!canRun(agent, request.user.role)) return response.status(403).json({ error: 'Tu rol no tiene acceso a este agente' });
    if (!available) return response.status(503).json({ error: 'Configura la llave y el modelo de Gemini en el backend' });
    const { prompt, provinceSlug, destination } = request.body ?? {};
    if (typeof prompt !== 'string' || prompt.trim().length < 5 || prompt.length > 2500
      || (provinceSlug != null && (typeof provinceSlug !== 'string' || !/^[a-z-]{1,30}$/.test(provinceSlug)))) {
      return response.status(400).json({ error: 'Escribe una consulta de 5 a 2500 caracteres y elige una provincia válida' });
    }
    const province = provinceSlug ? await findProvince(database, provinceSlug) : null;
    if (provinceSlug && !province) return response.status(400).json({ error: 'Provincia inválida' });
    const context = {};
    const sources = [];
    let weather;
    if (agent.id === 'maleta' && destination != null) {
      if (typeof destination !== 'string' || !/^[\p{L}\p{M} .'-]{2,70}$/u.test(destination.trim())) {
        return response.status(400).json({ error: 'Indica una localidad válida para consultar el pronóstico.' });
      }
      try {
        weather = await forecastFor(destination.trim(), province?.name);
        if (weather) {
          context.pronostico = weather;
          sources.push({ label: `Pronóstico de ${weather.place}`, url: weather.source });
        }
      } catch {
        context.pronostico = 'Proveedor temporalmente indisponible.';
      }
    }
    if (['preguntale', 'itinerario', 'accesibilidad', 'maleta'].includes(agent.id)) {
      const regions = province ? [province] : await Promise.all((await listProvinces(database))
        .map(({ slug }) => findProvince(database, slug)));
      const cantons = new Map((await listCantons(database)).map(({ code, name }) => [code, name]));
      const terms = new Map();
      const words = prompt.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').match(/[a-z]{4,}/g) ?? [];
      const placeMatches = [];
      context.regions = regions.map((region) => {
        if (province) sources.push({ label: `Información de ${region.name}`, url: region.source_url });
        region.glossary.forEach(({ slug, expression, usage_notes }) => terms.set(slug, { expression, usage_notes }));
        for (const place of region.places) {
          const searchable = `${place.name} ${region.name} ${place.visit_notes}`.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
          placeMatches.push({ place, region: region.name, score: words.filter((word) => searchable.includes(word)).length });
        }
        return { name: region.name, curiosity: region.curiosity };
      });
      context.places = placeMatches.sort((left, right) => right.score - left.score).slice(0, 12)
        .map(({ place: { name, visit_notes, category, vegan_menu, canton_code, links, cuisine_codes,
          vegetarian_options, accessibility_features, evidence_kind }, region }) => {
          const link = links.find(({ kind }) => kind === 'official_site' || kind === 'source');
          if (link) sources.push({ label: name, url: link.url });
          return { name, province: region, canton: cantons.get(canton_code), visit_notes, category, vegan_menu,
            cuisine_codes, vegetarian_options, accessibility_features, evidence_kind };
        });
      context.glossary = [...terms.values()];
    }
    if (agent.id === 'recuerdos') {
      const passport = await getPassport(database, request.user.id);
      context.visits = passport.visits.slice(0, 15).map(({ place_slug, province_slug, visited_on }) => ({ place_slug, province_slug, visited_on }));
    }
    const started = Date.now();
    let answer;
    let failure;
    try { answer = await generate(gemini, agent, prompt.trim(), context); }
    catch (error) { failure = error; }
    await database.query(
      'insert into rutea.ai_agent_runs (user_id, agent_slug, status, duration_ms) values ($1, $2, $3, $4)',
      [request.user.id, agent.id, failure ? 'error' : 'ok', Date.now() - started],
    );
    if (failure?.name === 'TimeoutError') return response.status(504).json({
      error: 'Gemini tardó demasiado en responder. Intenta de nuevo.',
    });
    if (failure) return response.status(failure.status === 429 ? 429 : 502).json({
      error: failure.status === 429 ? 'Gemini alcanzó su cuota. Intenta más tarde.' : 'Gemini no pudo responder. Intenta de nuevo.',
    });
    return response.json({ answer, sources, weather });
  });
  return router;
}

module.exports = { createAgentsRouter };

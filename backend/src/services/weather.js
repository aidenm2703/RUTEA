const source = 'https://open-meteo.com/';

async function read(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error('No se pudo obtener el pronóstico');
  return response.json();
}

async function forecastFor(destination, province) {
  const lookup = new URL('https://geocoding-api.open-meteo.com/v1/search');
  lookup.search = new URLSearchParams({
    name: province ? `${destination}, ${province}` : destination,
    countryCode: 'CR', language: 'es', count: '5',
  });
  const { results = [] } = await read(lookup);
  const place = results.find((item) => item.country_code === 'CR' &&
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
  if (!place) return null;

  const forecast = new URL('https://api.open-meteo.com/v1/forecast');
  forecast.search = new URLSearchParams({
    latitude: place.latitude, longitude: place.longitude,
    timezone: 'America/Costa_Rica', forecast_days: '5',
    daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max',
  });
  const { daily } = await read(forecast);
  if (!daily?.time?.length) return null;
  return {
    place: [place.name, place.admin1].filter(Boolean).join(', '),
    source,
    days: daily.time.map((date, index) => ({
      date,
      minCelsius: daily.temperature_2m_min?.[index],
      maxCelsius: daily.temperature_2m_max?.[index],
      rainProbability: daily.precipitation_probability_max?.[index],
    })),
  };
}

module.exports = { forecastFor };

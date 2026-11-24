import { catalogPhoto } from '../media.js'

export const categories = { nature: 'Naturaleza', culture: 'Cultura', restaurant: 'Restaurantes', lodging: 'Alojamiento' }
export const menuLabels = { fully_vegan: '100 % vegano', vegan_options: 'Opciones veganas' }
export const serviceLabels = {
  outdoor: 'Mesas al aire libre', takeaway: 'Para llevar', delivery: 'Entrega a domicilio',
  reservations: 'Reservas', wifi: 'Wi-Fi', parking: 'Estacionamiento',
  dogs: 'Admite perros', camping: 'Camping', free: 'Entrada gratuita', paid: 'Entrada de pago',
}
export const googlePriceLabels = {
  PRICE_LEVEL_FREE: 'Gratis según Google',
  PRICE_LEVEL_INEXPENSIVE: 'Económico',
  PRICE_LEVEL_MODERATE: 'Moderado',
  PRICE_LEVEL_EXPENSIVE: 'Caro',
  PRICE_LEVEL_VERY_EXPENSIVE: 'Muy caro',
}
export const accessibilityLabels = {
  ramp: 'Rampa para silla de ruedas',
  wheelchair: 'Acceso en silla de ruedas',
  accessible_toilet: 'Baño adaptado',
  elevator: 'Ascensor',
  braille: 'Información en braille',
}
const cuisineNames = {
  korean: 'Coreana', japanese: 'Japonesa', chinese: 'China', italian: 'Italiana',
  mexican: 'Mexicana', regional: 'Regional', local: 'Local', pizza: 'Pizzería',
  seafood: 'Mariscos', coffee_shop: 'Café', burger: 'Hamburguesas',
  costa_rican: 'Costarricense', asian: 'Asiática', indian: 'India',
  international: 'Internacional', breakfast: 'Desayunos', american: 'Estadounidense',
}
const cuisineAliases = {
  korean: /^(corean[oa]s?|korean[oa]s?|korean)$/,
  japanese: /^(japones[aes]*|japanese|sushi)$/,
  chinese: /^(chin[oa]s?|chinese)$/,
  italian: /^(italian[oa]s?|italian)$/,
  mexican: /^(mexican[oa]s?|mexican)$/,
}
const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
export const cuisineLabel = (code) => cuisineNames[code] ?? code.replaceAll('_', ' ')

export function directionsUrl(destination, placeId) {
  const query = new URLSearchParams({ api: '1', destination })
  if (placeId) query.set('destination_place_id', placeId)
  return `https://www.google.com/maps/dir/?${query}`
}

export function filterPlaces(places, cantonNames, filters) {
  const words = normalize(filters.search).match(/[a-z0-9]+/g) ?? []
  const asksVegan = words.some((word) => /^vegan[oa]s?$/.test(word))
  const asksVegetarian = words.some((word) => /^vegetarian[oa]s?$/.test(word))
  const asksRestaurant = words.some((word) => /^(restaurantes?|comida|cocina)$/.test(word))
  const asksLodging = words.some((word) => /^(hotel(es)?|alojamientos?|hospedajes?)$/.test(word))
  const asksRamp = words.some((word) => /^(rampas?)$/.test(word))
  const requestedCuisine = Object.keys(cuisineAliases).find((key) => words.some((word) => cuisineAliases[key].test(word)))
  const requestedMenu = asksVegan && (words.includes('100') ? 'fully_vegan'
    : words.some((word) => /^opcion(es)?$/.test(word)) ? 'vegan_options' : '')
  const terms = words.filter((word) => !/^(restaurantes?|comida|cocina|hotel(es)?|alojamientos?|hospedajes?|vegan[oa]s?|vegetarian[oa]s?|rampas?|en|de|del|para|con|y)$/.test(word)
    && !(asksVegan && word === '100')
    && !((asksVegan || asksVegetarian) && /^opcion(es)?$/.test(word))
    && !Object.values(cuisineAliases).some((pattern) => pattern.test(word)))

  return places.filter((item) => {
    const cuisines = item.cuisine_codes ?? []
    const accessibility = item.accessibility_features ?? []
    const searchable = normalize(`${item.name} ${item.province} ${cantonNames.get(item.canton_code) ?? ''} ${item.visit_notes} ${item.subtype ?? ''} ${item.address ?? ''} ${categories[item.category] ?? ''}`)
    return (!filters.province || item.province_slug === filters.province)
      && (!filters.canton || Number(filters.canton) === item.canton_code)
      && (!filters.category || filters.category === item.category)
      && (!filters.subtype || filters.subtype === item.subtype)
      && (!filters.evidence || filters.evidence === item.evidence_kind)
      && (!filters.hasHours || Boolean(item.hours))
      && (!filters.withPhotos || Boolean(catalogPhoto(item)))
      && (!filters.entrance || item.services?.includes(filters.entrance))
      && (filters.services ?? []).every((service) => item.services?.includes(service))
      && (!asksRestaurant || item.category === 'restaurant')
      && (!asksLodging || item.category === 'lodging')
      && (!asksVegan || Boolean(item.vegan_menu)) && (!requestedMenu || item.vegan_menu === requestedMenu)
      && (!asksVegetarian || item.vegetarian_options === true)
      && (!filters.diet || (filters.diet === 'vegetarian' ? item.vegetarian_options === true
        : filters.diet === 'any_vegan' ? Boolean(item.vegan_menu) : item.vegan_menu === filters.diet))
      && (!filters.cuisine || cuisines.includes(filters.cuisine))
      && (!requestedCuisine || cuisines.includes(requestedCuisine))
      && (!asksRamp || accessibility.includes('ramp'))
      && filters.accessibility.every((feature) => accessibility.includes(feature))
      && terms.every((term) => searchable.includes(term))
  })
}

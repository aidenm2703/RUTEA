import { photos } from './media'

const food = {
  src: '/media/referencia-comida.jpg', author: 'Ella Olsson',
  source: 'https://www.pexels.com/photo/flat-lay-photography-of-vegetable-salad-on-plate-1640777/',
}
const chicken = [
  { src: '/media/referencia-parrilla.jpg', author: 'Golboo Maghooli',
    source: 'https://www.pexels.com/photo/close-up-of-spicy-grilled-chicken-dish-33683057/' },
  { src: '/media/referencia-asado.jpg', author: 'Jack Baghel',
    source: 'https://www.pexels.com/photo/top-view-of-a-plate-with-roasted-chicken-20371512/' },
]

function pickReference(name, category, query) {
  const text = `${name} ${query}`.toLowerCase()
  if (/\b(pollo|pollos|chicken|pollolandia)\b/.test(text)) {
    const variant = Array.from(name).reduce((sum, letter) => sum + letter.codePointAt(0), 0)
    return chicken[variant % chicken.length]
  }
  if (category === 'restaurant' || /restaurante|cafeter|comida|soda |pizza|bistro|taquer|restaurant/.test(text)) return food
  if (category === 'culture' || /museo|teatro|arte|cultura|galer/.test(text)) return photos.national
  if (category === 'nature' || /parque|bosque|reserva|catarata/.test(text)) return photos.forest
  return photos.volcano
}

export function ReferencePhoto({ name = '', category, query = '' }) {
  const image = pickReference(name, category, query)
  return <figure className="reference-photo">
    <img src={image.src} alt="" loading="lazy" />
    <figcaption>
      <a href={image.source} target="_blank" rel="noreferrer" title={`Foto de ${image.author}`}>Imagen de referencia</a>
      {image.license && <a className="reference-license" href={image.license} target="_blank" rel="noreferrer">CC</a>}
    </figcaption>
  </figure>
}

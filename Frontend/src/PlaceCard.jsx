import { useState } from 'react'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { accessibilityLabels, categories, cuisineLabel, directionsUrl, menuLabels, serviceLabels } from './utils/catalog-filters'

function MiniMap({ latitude, longitude, name }) {
  const [open, setOpen] = useState(false)
  const bounds = [longitude - .008, latitude - .004, longitude + .008, latitude + .004]
  const query = new URLSearchParams({ bbox: bounds.join(','), layer: 'mapnik', marker: [latitude, longitude].join(',') })
  return <>
    <button className="secondary" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      {open ? 'Ocultar mapa' : 'Ver mini mapa'}
    </button>
    {open && <iframe className="place-map" title={`Mapa de ${name}`} loading="lazy"
      src={`https://www.openstreetmap.org/export/embed.html?${query}`} />}
  </>
}

export default function PlaceCard({ place, canton, onVisit }) {
  const hasCoordinates = place.latitude != null && place.longitude != null
    && Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude))
  const destination = hasCoordinates ? `${place.latitude},${place.longitude}`
    : [...new Set([place.name, place.address, canton, place.province, 'Costa Rica'].filter(Boolean))].join(', ')
  const imported = place.evidence_kind === 'openstreetmap'
  const featureLabels = place.accessibility_features?.map((key) => accessibilityLabels[key]).filter(Boolean) ?? []
  const services = place.services?.map((key) => serviceLabels[key]).filter(Boolean) ?? []
  return <article className="place-card panel">
    <p className="eyebrow"><MapPin size={14} aria-hidden="true" />
      {[place.province, canton, place.subtype || categories[place.category]].filter(Boolean).join(' · ')}
    </p>
    <h3>{place.name}</h3>
    {place.address && <p className="place-address">{place.address}</p>}
    {place.visit_notes !== place.subtype && <p>{place.visit_notes}</p>}
    {place.vegan_menu && <p className="menu-label">{menuLabels[place.vegan_menu]}</p>}
    {place.vegetarian_options && !place.vegan_menu && <p className="menu-label">Opciones vegetarianas</p>}
    {Boolean(place.cuisine_codes?.length) && <p><strong>Cocina</strong> {place.cuisine_codes.map(cuisineLabel).join(', ')}</p>}
    {Boolean(services.length) && <p><strong>Servicios</strong> {services.join(' · ')}</p>}
    <p className="place-access"><strong>Accesibilidad</strong> {featureLabels.join(', ') || 'Sin información disponible'}</p>
    <details>
      <summary>Información y fuentes</summary>
      {place.hours && <p><strong>Horario registrado</strong> {place.hours}</p>}
      {place.reviewed_on && <p className="place-access">
        {imported ? 'Datos comunitarios de OpenStreetMap · Extracto del ' : 'Revisión del catálogo · '}
        <time dateTime={String(place.reviewed_on).slice(0, 10)}>{String(place.reviewed_on).slice(0, 10)}</time>
      </p>}
      {hasCoordinates && <p className="place-access">Punto cartográfico aproximado. Consulta el acceso exacto con el lugar.</p>}
      <ul>{place.links.map((link) => <li key={link.kind + link.url}>
        <a href={link.url} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={14} /></a>
      </li>)}</ul>
    </details>
    <div className="place-actions">
      <a className="directions-link" href={directionsUrl(destination)} target="_blank" rel="noreferrer">Cómo llegar <ArrowUpRight size={15} /></a>
      <button className="secondary" onClick={onVisit}>Registrar visita</button>
      {hasCoordinates && <MiniMap latitude={Number(place.latitude)} longitude={Number(place.longitude)} name={place.name} />}
    </div>
  </article>
}

import { useState } from 'react'
import { ArrowUpRight, Camera, MapPin } from 'lucide-react'
import { accessibilityLabels, categories, cuisineLabel, directionsUrl, menuLabels, serviceLabels } from './utils/catalog-filters'
import { catalogPhoto } from './media'
import { api } from './services/api'
import { ReferencePhoto } from './PlaceMedia'

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

function PlacePhoto({ place, token }) {
  const original = catalogPhoto(place)
  const [photo, setPhoto] = useState(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [unavailable, setUnavailable] = useState(false)

  async function loadPhoto() {
    setBusy(true)
    setStatus('')
    try {
      const result = await api(`google-places/catalog-photo/${encodeURIComponent(place.slug)}`, { token })
      setPhoto(result.photo)
      if (!result.photo) { setUnavailable(true); setStatus('No hay una foto confirmada para este lugar.') }
    } catch (error) {
      setStatus(error.message)
    } finally {
      setBusy(false)
    }
  }

  if (original) return <figure className="place-photo">
    <img src={original.src} alt={original.title} loading="lazy" />
    <figcaption><a href={original.source} target="_blank" rel="noreferrer">{original.author}</a>
      {' · '}<a href={original.license} target="_blank" rel="noreferrer">Creative Commons</a></figcaption>
  </figure>
  if (photo) return <figure className="place-photo">
    <img src={photo.url} alt={`Foto de ${place.name}`} loading="lazy" referrerPolicy="no-referrer" onError={() => {
      setPhoto(null); setStatus('La foto dejó de estar disponible. Puedes consultarla de nuevo.')
    }} />
    <figcaption>Google Maps{photo.authors.map((author, index) => <span key={author.uri ?? index}>
      {' · '}{author.uri?.startsWith('https://') ? <a href={author.uri} target="_blank" rel="noreferrer">{author.displayName}</a> : author.displayName}
    </span>)}</figcaption>
  </figure>
  return <div className={`place-photo-placeholder place-photo-${place.category}`}>
    <ReferencePhoto name={place.name} category={place.category} />
    {!unavailable && <button className="photo-lookup" onClick={loadPhoto} disabled={busy}><Camera size={14} aria-hidden="true" />{busy ? 'Buscando foto…' : 'Buscar foto del lugar'}</button>}
    {status && <p role="status">{status}</p>}
  </div>
}

export default function PlaceCard({ place, token, canton, onVisit }) {
  const hasCoordinates = place.latitude != null && place.longitude != null
    && Number.isFinite(Number(place.latitude)) && Number.isFinite(Number(place.longitude))
  const destination = hasCoordinates ? `${place.latitude},${place.longitude}`
    : [...new Set([place.name, place.address, canton, place.province, 'Costa Rica'].filter(Boolean))].join(', ')
  const imported = place.evidence_kind === 'openstreetmap'
  const featureLabels = place.accessibility_features?.map((key) => accessibilityLabels[key]).filter(Boolean) ?? []
  const services = place.services?.map((key) => serviceLabels[key]).filter(Boolean) ?? []
  return <article className="place-card panel">
    <PlacePhoto place={place} token={token} />
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

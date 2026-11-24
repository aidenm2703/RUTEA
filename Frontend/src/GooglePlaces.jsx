import { useEffect, useState } from 'react'
import { api } from './services/api'
import { directionsUrl } from './utils/catalog-filters'

function Credit({ author }) {
  const name = author?.displayName
  if (!name) return null
  return author.uri?.startsWith('https://')
    ? <a href={author.uri} target="_blank" rel="noreferrer">{name}</a>
    : name
}

function GooglePhoto({ photo, name }) {
  const [failed, setFailed] = useState(false)
  if (!photo || failed) return null
  return <figure className="google-photo">
    <img src={photo.url} alt={name ?? 'Foto del lugar'} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    {Boolean(photo.authors.length) && <figcaption>Foto de {photo.authors.map((author, index) => (
      <span key={author.uri ?? index}>{index > 0 && ', '}<Credit author={author} /></span>
    ))} · <span translate="no">Google Maps</span></figcaption>}
  </figure>
}

function Rating({ place }) {
  if (place.rating == null) return null
  return <p><strong>{place.rating.toLocaleString('es-CR')} / 5</strong>
    {place.userRatingCount != null && ` · ${place.userRatingCount.toLocaleString('es-CR')} valoraciones`}</p>
}

function Attributions({ place }) {
  return place.attributions?.map(({ provider, providerUri }) => <p className="google-attribution" key={provider}>
    <Credit author={{ displayName: provider, uri: providerUri }} />
  </p>)
}

export default function GooglePlaces({ query, token, hasLocalFilters }) {
  const [places, setPlaces] = useState(null)
  const [details, setDetails] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const delay = setTimeout(async () => {
      try {
        const result = await api('google-places/search', {
          token, signal: controller.signal, method: 'POST', body: { query },
        })
        if (!controller.signal.aborted) setPlaces(result.places)
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure.message)
      }
    }, 750)
    return () => {
      clearTimeout(delay)
      controller.abort()
    }
  }, [query, token, retry])

  async function openDetails(id) {
    setBusy(true)
    setDetails(null)
    setError('')
    try { setDetails(await api(`google-places/${encodeURIComponent(id)}`, { token })) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <section className="panel google-results" aria-labelledby="google-places-title">
    <div className="section-title">
      <h2 id="google-places-title">Resultados en vivo</h2>
      <span className="google-attribution" translate="no">Google Maps</span>
    </div>
    {hasLocalFilters && <p className="place-access">Los filtros de accesibilidad, servicios, horario y fuente se aplican al catálogo de RUTEA.</p>}
    {((!places && !error) || busy) && <p role="status">Consultando lugares…</p>}
    {error && <div role="alert"><p>{error}</p>
      {!places && <button className="secondary" onClick={() => { setError(''); setRetry((value) => value + 1) }}>Reintentar</button>}
    </div>}
    {places?.length === 0 && <p role="status">Google Maps no encontró resultados.</p>}
    {Boolean(places?.length) && <ul className="google-list">{places.map((place) => (
      <li key={place.id}>
        <GooglePhoto photo={place.photo} name={place.displayName?.text} />
        <strong>{place.displayName?.text}</strong>
        <p>{place.formattedAddress}</p>
        <Rating place={place} />
        <Attributions place={place} />
        <button className="secondary" disabled={busy} onClick={() => openDetails(place.id)}>Ver ficha de {place.displayName?.text ?? 'este lugar'}</button>
      </li>
    ))}</ul>}
    {details && <Details {...details} />}
  </section>
}

function Details({ place, photo }) {
  return <article className="google-details" aria-label="Ficha de Google Maps">
    <h3>{place.displayName?.text}</h3>
    <p>{place.formattedAddress}</p>
    <Rating place={place} />
    <GooglePhoto key={place.id} photo={photo} name={place.displayName?.text} />
    {place.nationalPhoneNumber && <p>Teléfono {place.nationalPhoneNumber}</p>}
    {Boolean(place.regularOpeningHours?.weekdayDescriptions?.length) && <details><summary>Horarios</summary><ul>
      {place.regularOpeningHours.weekdayDescriptions.map((day) => <li key={day}>{day}</li>)}
    </ul></details>}
    {place.googleMapsUri?.startsWith('https://') && <p><a href={place.googleMapsUri} target="_blank" rel="noreferrer">Abrir en Google Maps</a></p>}
    {(place.formattedAddress || place.displayName?.text) && <p><a target="_blank" rel="noreferrer"
      href={directionsUrl(place.formattedAddress || place.displayName.text, place.id)}>Cómo llegar</a></p>}
    {place.websiteUri?.startsWith('https://') && <p><a href={place.websiteUri} target="_blank" rel="noreferrer">Sitio del lugar</a></p>}
    {Boolean(place.reviews?.length) && <details><summary>Reseñas destacadas de Google Maps</summary><ul>
      {place.reviews.map((review, index) => <li key={review.name ?? index}>
        <strong><Credit author={review.authorAttribution} /></strong> {review.rating != null && `· ${review.rating} / 5`}
        <p>{review.text?.text ?? review.originalText?.text}</p>
      </li>)}
    </ul></details>}
    <Attributions place={place} />
  </article>
}

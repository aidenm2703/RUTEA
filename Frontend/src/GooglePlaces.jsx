import { useState } from 'react'
import { api } from './services/api'

function Credit({ author }) {
  const name = author?.displayName
  if (!name) return null
  return author.uri?.startsWith('https://')
    ? <a href={author.uri} target="_blank" rel="noreferrer">{name}</a>
    : name
}

export default function GooglePlaces({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery)
  const [places, setPlaces] = useState(null)
  const [details, setDetails] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(path, options, onSuccess) {
    setBusy(true)
    setError('')
    try { onSuccess(await api(path, options)) }
    catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return <section className="panel google-results" aria-labelledby="google-places-title">
    <p className="google-attribution">Google Maps</p>
    <h2 id="google-places-title">Buscar también en Google Maps</h2>
    <form onSubmit={(event) => {
      event.preventDefault()
      setPlaces(null)
      setDetails(null)
      run('google-places/search', { method: 'POST', body: { query } }, (result) => setPlaces(result.places))
    }}>
      <label>Busca un negocio o lugar en Costa Rica
        <input required minLength={3} maxLength={180} value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <button disabled={busy}>Buscar en Google Maps</button>
    </form>
    {busy && <p role="status">Consultando Google Maps…</p>}
    {error && <p role="alert">{error}</p>}
    {places?.length === 0 && <p role="status">Google Maps no encontró resultados.</p>}
    {Boolean(places?.length) && <ul className="google-list">{places.map((place) => (
      <li key={place.id}>
        <strong>{place.displayName?.text}</strong>
        <p>{place.formattedAddress}</p>
        <button className="secondary" disabled={busy} onClick={() => {
          setDetails(null)
          run(`google-places/${encodeURIComponent(place.id)}`, {}, setDetails)
        }}>Ver ficha de {place.displayName?.text ?? 'este lugar'}</button>
      </li>
    ))}</ul>}
    {details && <Details {...details} />}
  </section>
}

function Details({ place, photo }) {
  return <article className="google-details" aria-label="Ficha de Google Maps">
    <h3>{place.displayName?.text}</h3>
    <p>{place.formattedAddress}</p>
    {place.rating != null && <p><strong>{place.rating} / 5</strong>{place.userRatingCount != null && ` · ${place.userRatingCount} valoraciones`}</p>}
    {photo && <figure>
      <img src={photo.url} alt={place.displayName?.text ?? 'Foto del lugar'} loading="lazy" referrerPolicy="no-referrer" />
      {Boolean(photo.authors.length) && <figcaption>Foto de {photo.authors.map((author, index) => (
        <span key={author.uri ?? index}>{index > 0 && ', '}<Credit author={author} /></span>
      ))} · Google Maps</figcaption>}
    </figure>}
    {place.nationalPhoneNumber && <p>Teléfono {place.nationalPhoneNumber}</p>}
    {Boolean(place.regularOpeningHours?.weekdayDescriptions?.length) && <details><summary>Horarios</summary><ul>
      {place.regularOpeningHours.weekdayDescriptions.map((day) => <li key={day}>{day}</li>)}
    </ul></details>}
    {place.googleMapsUri?.startsWith('https://') && <p><a href={place.googleMapsUri} target="_blank" rel="noreferrer">Abrir en Google Maps</a></p>}
    {place.websiteUri?.startsWith('https://') && <p><a href={place.websiteUri} target="_blank" rel="noreferrer">Sitio del lugar</a></p>}
    {Boolean(place.reviews?.length) && <details><summary>Reseñas destacadas de Google Maps</summary><ul>
      {place.reviews.map((review, index) => <li key={review.name ?? index}>
        <strong><Credit author={review.authorAttribution} /></strong> {review.rating != null && `· ${review.rating} / 5`}
        <p>{review.text?.text ?? review.originalText?.text}</p>
      </li>)}
    </ul></details>}
    {place.attributions?.map(({ provider, providerUri }) => <p key={provider}>
      <Credit author={{ displayName: provider, uri: providerUri }} />
    </p>)}
  </article>
}

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { api } from './services/api'
import { directionsUrl, googlePriceLabels } from './utils/catalog-filters'
import { ReferencePhoto } from './PlaceMedia'

function Credit({ author }) {
  const name = author?.displayName
  if (!name) return null
  return author.uri?.startsWith('https://')
    ? <a href={author.uri} target="_blank" rel="noreferrer">{name}</a>
    : name
}

function GooglePhoto({ photo, name, category, query }) {
  const [failed, setFailed] = useState(false)
  if (!photo || failed) return <ReferencePhoto name={name} category={category} query={query} />
  return <figure className="google-photo">
    <img src={photo.url} alt={name ?? 'Foto del lugar'} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    {Boolean(photo.authors.length) && <figcaption>Foto de {photo.authors.map((author, index) => (
      <span key={author.uri ?? index}>{index > 0 && ', '}<Credit author={author} /></span>
    ))} · <span translate="no">Google Maps</span></figcaption>}
  </figure>
}

function Rating({ place }) {
  if (place.rating == null) return null
  return <p className="result-rating"><Star size={15} fill="currentColor" aria-hidden="true" /><strong>{place.rating.toLocaleString('es-CR')}</strong>
    {place.userRatingCount != null && <span>{place.userRatingCount.toLocaleString('es-CR')} valoraciones</span>}</p>
}

function formatPrice(money) {
  if (!/^[A-Z]{3}$/.test(money?.currencyCode ?? '')) return null
  const value = Number(money.units ?? 0) + (money.nanos ?? 0) / 1e9
  if (!Number.isFinite(value)) return null
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: money.currencyCode }).format(value)
}

function PriceAndHours({ place }) {
  const start = formatPrice(place.priceRange?.startPrice)
  const end = formatPrice(place.priceRange?.endPrice)
  const band = googlePriceLabels[place.priceLevel]
  return <div className="google-facts">
    {(start || end || band) && <span>{start && end ? `${start}–${end}` : start ? `Desde ${start}` : end ? `Hasta ${end}` : band}</span>}
    {place.currentOpeningHours?.openNow != null && <span>{place.currentOpeningHours.openNow ? 'Abierto ahora' : 'Cerrado ahora'}</span>}
  </div>
}

function recommendation(place) {
  if (place.rating == null) return -1
  const count = place.userRatingCount ?? 1
  return (place.rating * count + 4.2 * 25) / (count + 25)
}

function orderPlaces(places, order) {
  if (!places || !order) return places
  const score = order === 'rating' ? (place) => place.rating ?? -1
    : order === 'reviews' ? (place) => place.userRatingCount ?? -1 : recommendation
  return [...places].sort((a, b) => score(b) - score(a))
}

function Attributions({ place }) {
  return place.attributions?.map(({ provider, providerUri }) => <p className="google-attribution" key={provider}>
    <Credit author={{ displayName: provider, uri: providerUri }} />
  </p>)
}

export default function GooglePlaces({ query, token, hasLocalFilters, minRating, priceLevel, withPhotos, openNow, order, category }) {
  const [places, setPlaces] = useState(null)
  const [details, setDetails] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const detailPanel = useRef(null)

  useEffect(() => {
    if (!details || !detailPanel.current) return
    detailPanel.current.scrollIntoView({ block: 'nearest' })
    detailPanel.current.focus({ preventScroll: true })
  }, [details])

  useEffect(() => {
    const controller = new AbortController()
    const delay = setTimeout(async () => {
      try {
        const result = await api('google-places/search', {
          token, signal: controller.signal, method: 'POST', body: {
            query, minRating: minRating ? Number(minRating) : null, priceLevel: priceLevel || null, withPhotos, openNow,
          },
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
  }, [query, token, retry, minRating, priceLevel, withPhotos, openNow])

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
    {hasLocalFilters && <p className="place-access">Los filtros de entrada, accesibilidad, servicios, horario y fuente se aplican al catálogo de RUTEA.</p>}
    {order === 'recommended' && <p className="place-access">Recomendación basada en la calificación y la cantidad de valoraciones.</p>}
    {((!places && !error) || busy) && <p role="status">Consultando lugares…</p>}
    {error && <div role="alert"><p>{error}</p>
      {!places && <button className="secondary" onClick={() => { setError(''); setRetry((value) => value + 1) }}>Reintentar</button>}
    </div>}
    {places?.length === 0 && <p role="status">Google Maps no encontró resultados.</p>}
    {Boolean(places?.length) && <ul className="google-list">{orderPlaces(places, order).map((place) => (
      <li className="google-card" key={place.id}>
        <GooglePhoto photo={place.photo} name={place.displayName?.text} category={category} query={query} />
        <div className="google-card-content">
          <h3>{place.displayName?.text}</h3>
          <Rating place={place} />
          {place.formattedAddress && <p className="result-address"><MapPin size={15} aria-hidden="true" />{place.formattedAddress}</p>}
          <PriceAndHours place={place} />
          <Attributions place={place} />
          <button className="result-action" aria-label={`Ver ficha de ${place.displayName?.text ?? 'este lugar'}`}
            disabled={busy} onClick={() => openDetails(place.id)}>Ver ficha <ArrowUpRight size={16} /></button>
        </div>
      </li>
    ))}</ul>}
    {details && <div ref={detailPanel} tabIndex={-1}><Details {...details} category={category} query={query} /></div>}
  </section>
}

function Details({ place, photo, category, query }) {
  return <article className="google-details" aria-label="Ficha de Google Maps">
    <h3>{place.displayName?.text}</h3>
    <p>{place.formattedAddress}</p>
    <Rating place={place} />
    <PriceAndHours place={place} />
    <GooglePhoto key={place.id} photo={photo} name={place.displayName?.text} category={category} query={query} />
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

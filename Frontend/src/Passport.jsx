import { useEffect, useState } from 'react'
import { Award, BookOpen, LockKeyhole, MapPin } from 'lucide-react'
import { api } from './services/api'

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Costa_Rica' }).format(new Date())

export default function Passport(props) {
  return <><div className="page-heading"><p className="eyebrow"><LockKeyhole size={14} /> Bitácora privada</p><h1>Mi pasaporte</h1></div>
    <PersonalPassport key={props.token} {...props} />
  </>
}

function PersonalPassport({ token, updateSession, catalog, catalogStatus, places, destination, clearDestination }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [homeProvince, setHomeProvince] = useState('')
  const [homeCanton, setHomeCanton] = useState('')
  const [visitType, setVisitType] = useState('placeSlug')
  const [target, setTarget] = useState(destination)

  useEffect(() => {
    const controller = new AbortController()
    const options = { token, signal: controller.signal }
    Promise.all([api('me/profile', options), api('me/passport', options)]).then(([profile, passport]) => {
      if (controller.signal.aborted) return
      setHomeProvince(profile.home_province_slug ?? '')
      setHomeCanton(profile.home_canton_code ?? '')
      setData({ profile, passport })
    }).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.status === 401 ? 'La sesión venció. Inicia sesión de nuevo.' : failure.message)
    })
    return () => controller.abort()
  }, [token, retry])

  async function save(event, path, method, body, onSuccess) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setStatus('')
    try {
      onSuccess(await api(path, { token, method, body }))
    } catch (failure) {
      setError(failure.status === 401 ? 'La sesión venció. Inicia sesión de nuevo.' : failure.message)
    } finally {
      setBusy(false)
    }
  }

  if (!data) return error ? <div className="panel"><p role="alert">{error}</p>
    <button onClick={() => { setError(''); setRetry((value) => value + 1) }}>Reintentar</button>{' '}
    <button className="secondary" onClick={() => updateSession('')}>Volver al inicio de sesión</button>
  </div> : <p role="status">Cargando tu pasaporte…</p>

  const { profile, passport } = data
  const provinces = catalog.provinces
  const cantonNames = new Map(catalog.cantons.map((canton) => [canton.code, canton.name]))
  const provinceNames = new Map(provinces.map((province) => [province.slug, province.name]))
  const placeNames = new Map(places.map((place) => [place.slug, place.name]))
  const visitOptions = visitType === 'placeSlug' ? places.map((place) => [place.slug, place.name])
    : visitType === 'cantonCode' ? catalog.cantons.map((canton) => [canton.code, `${canton.name} · ${provinceNames.get(canton.province_slug)}`])
      : provinces.map((province) => [province.slug, province.name])
  const visitedProvinces = new Set(passport.visits.map((visit) => visit.province_slug))

  return <>
    <div className="passport-top">
      <section className="passport-cover">
        <BookOpen size={44} strokeWidth={1.2} aria-hidden="true" />
        <p className="eyebrow">Pasaporte RUTEA</p><h2>{profile.display_name}</h2>
        <p>{[cantonNames.get(profile.home_canton_code), provinceNames.get(profile.home_province_slug)].filter(Boolean).join(' · ') || 'Origen sin indicar'}</p>
      </section>
      <section className="panel progress-panel">
        <h2>Tu recorrido</h2>
        <dl className="stats">{[['Lugares', passport.progress.places], ['Cantones', passport.progress.cantons],
          ['Provincias', `${passport.progress.provinces} / 7`]].map(([label, count]) => (
          <div key={label}><dt>{label}</dt><dd>{count}</dd></div>
        ))}</dl>
        <progress aria-label="Provincias visitadas" max={7} value={passport.progress.provinces} />
        <ul className="province-list">{provinces.map((province) => (
          <li key={province.slug} className={visitedProvinces.has(province.slug) ? 'visited' : ''}>
            {province.name}<small>{visitedProvinces.has(province.slug) ? 'Visitada' : 'Por visitar'}</small>
          </li>
        ))}</ul>
      </section>
    </div>
    {error && <p className="field-note" role="alert">{error}</p>}
    {status && <p className="field-note" role="status">{status}</p>}
    {catalogStatus ?? <div className="passport-forms">
      <section className="panel"><h2>Registrar visita</h2>
        <form onSubmit={(event) => {
          const visitedOn = new FormData(event.currentTarget).get('visitedOn')
          save(event, 'me/passport/visits', 'POST', { visitedOn, [visitType]: visitType === 'cantonCode' ? Number(target) : target },
            (updated) => { setData({ profile, passport: updated }); clearDestination(); setTarget(''); setStatus('Visita guardada en tu pasaporte.') })
        }}>
          <label>Tipo de destino<select value={visitType} onChange={(event) => { setVisitType(event.target.value); setTarget('') }}>
            <option value="placeSlug">Lugar</option><option value="cantonCode">Cantón</option><option value="provinceSlug">Provincia</option>
          </select></label>
          <label>Destino<select required value={target} onChange={(event) => setTarget(event.target.value)}>
            <option value="">Selecciona un destino</option>
            {visitOptions.map(([key, name]) => <option key={key} value={key}>{name}</option>)}
          </select></label>
          <label>Fecha<input name="visitedOn" type="date" required min="1900-01-01" max={today()} defaultValue={today()} /></label>
          <button disabled={busy}>Guardar visita</button>
        </form>
      </section>
      <section className="panel"><h2>Mi lugar de origen</h2>
        <form onSubmit={(event) => save(event, 'me/profile', 'PATCH', {
          homeProvinceSlug: homeProvince || null, homeCantonCode: homeCanton ? Number(homeCanton) : null,
        }, (updated) => { setData({ profile: updated, passport }); setStatus('Origen actualizado.') })}>
          <label>Provincia<select value={homeProvince} onChange={(event) => { setHomeProvince(event.target.value); setHomeCanton('') }}>
            <option value="">Sin indicar</option>
            {provinces.map((province) => <option key={province.slug} value={province.slug}>{province.name}</option>)}
          </select></label>
          <label>Cantón<select value={homeCanton} disabled={!homeProvince} onChange={(event) => setHomeCanton(event.target.value)}>
            <option value="">Sin indicar</option>
            {catalog.cantons.filter((canton) => canton.province_slug === homeProvince).map((canton) => (
              <option key={canton.code} value={canton.code}>{canton.name}</option>
            ))}
          </select></label>
          <button className="secondary" disabled={busy}>Guardar origen</button>
        </form>
      </section>
    </div>}
    <div className="passport-forms">
      <section className="panel"><h2><Award size={22} /> Insignias</h2>
        {passport.badges.length ? <ul>{passport.badges.map((badge) => <li key={badge.slug}>{badge.name}</li>)}</ul> : <p>Aún no tienes insignias.</p>}
        <h3>Sellos</h3>
        {passport.stamps.length ? <ul>{passport.stamps.map((stamp) => <li key={stamp.place_slug}>{placeNames.get(stamp.place_slug) ?? stamp.place_slug} · {stamp.stamped_on}</li>)}</ul> : <p>Registra una visita a un lugar para obtener tu primer sello.</p>}
      </section>
      <section className="panel"><h2><MapPin size={22} /> Historial</h2>
        {passport.visits.length ? <ul className="history">{passport.visits.map((visit) => (
          <li key={visit.id}><strong>{placeNames.get(visit.place_slug) ?? cantonNames.get(visit.canton_code)
            ?? provinceNames.get(visit.province_slug) ?? visit.province_slug}</strong><time dateTime={visit.visited_on}>{visit.visited_on}</time></li>
        ))}</ul> : <p>Tus visitas aparecerán aquí.</p>}
      </section>
    </div>
  </>
}

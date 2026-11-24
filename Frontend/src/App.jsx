import { useEffect, useState } from 'react'
import { ArrowUpRight, BookOpen, Compass, MapPin, Search } from 'lucide-react'
import { api } from './services/api'
import Passport from './Passport'
import './App.css'

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function App() {
  const [view, setView] = useState('explorar')
  const [token, setToken] = useState(() => sessionStorage.getItem('rutea-session') ?? '')
  const [catalog, setCatalog] = useState({ loading: true, provinces: [], cantons: [], glossary: [] })
  const [retry, setRetry] = useState(0)
  const [province, setProvince] = useState('')
  const [search, setSearch] = useState('')
  const [destination, setDestination] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }
    async function loadCatalog() {
      try {
        const [provinces, cantons, glossary] = await Promise.all(
          ['provinces', 'cantons', 'glossary'].map((path) => api(`catalog/${path}`, options)),
        )
        const details = await Promise.all(provinces.map(({ slug }) => api(`catalog/provinces/${slug}`, options)))
        setCatalog({ loading: false, provinces: details, cantons, glossary })
      } catch (error) {
        if (!controller.signal.aborted) setCatalog({ loading: false, error: error.message, provinces: [], cantons: [], glossary: [] })
      }
    }
    loadCatalog()
    return () => controller.abort()
  }, [retry])

  function updateSession(value) {
    if (value) sessionStorage.setItem('rutea-session', value)
    else sessionStorage.removeItem('rutea-session')
    setToken(value)
  }

  function navigate(next) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  const places = catalog.provinces.flatMap((item) => item.places.map((place) => ({ ...place, province: item.name })))
  const visiblePlaces = places.filter((item) => (!province || item.province_slug === province)
    && normalize(`${item.name} ${item.province} ${item.visit_notes}`).includes(normalize(search.trim())))
  const currentProvince = catalog.provinces.find((item) => item.slug === province)
  const catalogStatus = catalog.loading ? <p role="status">Cargando el catálogo…</p> : catalog.error ? (
    <div className="panel" role="alert"><p>{catalog.error}</p><button onClick={() => {
      setCatalog((previous) => ({ ...previous, loading: true, error: '' }))
      setRetry((previous) => previous + 1)
    }}>Reintentar</button></div>
  ) : null

  return (
    <>
      <header className="site-header">
        <div className="shell masthead">
          <button className="brand" onClick={() => navigate('explorar')}>
            <BookOpen size={24} aria-hidden="true" /><span>RUTEA<small>Bitácora de Costa Rica</small></span>
          </button>
          <nav aria-label="Principal">
            {[['explorar', 'Explorar'], ['glosario', 'Glosario'], ['pasaporte', 'Mi pasaporte']].map(([key, label]) => (
              <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>
            ))}
          </nav>
          {token && <button className="quiet" onClick={() => { updateSession(''); setDestination('') }}>Cerrar sesión</button>}
        </div>
      </header>
      <main className="shell">
        {view === 'explorar' && <>
          <section className="hero">
            <div>
              <p className="eyebrow">Explora Costa Rica</p>
              <h1>Tu próxima parada<br />empieza aquí.</h1>
              <p>Encuentra lugares, conoce su historia y guarda tus visitas en tu pasaporte.</p>
            </div>
            <Compass className="hero-compass" size={180} strokeWidth={0.7} aria-hidden="true" />
          </section>
          {catalogStatus ?? <>
            <section className="filter-bar" aria-label="Filtros del catálogo">
              <label className="search-field"><Search size={19} aria-hidden="true" />
                <input aria-label="Buscar lugares" placeholder="Busca un lugar o actividad" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <label className="province-field">Provincia
                <select value={province} onChange={(event) => setProvince(event.target.value)}>
                  <option value="">Todas las provincias</option>
                  {catalog.provinces.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}
                </select>
              </label>
              {(search || province) && <button className="secondary" onClick={() => { setSearch(''); setProvince('') }}>Limpiar filtros</button>}
            </section>
            {currentProvince && <aside className="field-note"><strong>Dato de {currentProvince.name}</strong>
              <p>{currentProvince.curiosity}</p><a href={currentProvince.source_url} target="_blank" rel="noreferrer">Consultar fuente <ArrowUpRight size={14} /></a>
            </aside>}
            <div className="section-title"><h2>Lugares para descubrir</h2><span role="status">{visiblePlaces.length} {visiblePlaces.length === 1 ? 'lugar' : 'lugares'}</span></div>
            {visiblePlaces.length === 0 && <p>No encontramos lugares para esta búsqueda.</p>}
            <div className="card-grid">{visiblePlaces.map((place) => (
              <article className="place-card panel" key={place.slug}>
                <p className="eyebrow"><MapPin size={14} aria-hidden="true" />{place.province}</p>
                <h3>{place.name}</h3><p>{place.visit_notes}</p>
                <details><summary>Ubicación, alojamiento y fuentes</summary><ul>
                  {place.links.map((link) => <li key={link.kind + link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={14} /></a></li>)}
                </ul></details>
                <button className="secondary" onClick={() => { setDestination(place.slug); navigate('pasaporte') }}>Registrar visita</button>
              </article>
            ))}</div>
          </>}
        </>}
        {view === 'glosario' && <>
          <div className="page-heading"><p className="eyebrow">Cultura costarricense</p><h1>Glosario</h1></div>
          {catalogStatus ?? <div className="card-grid">{catalog.glossary.map((term) => (
            <article className="panel" key={term.slug}>
              <p className="eyebrow">{term.language}</p><h3>{term.expression}</h3><p>{term.usage_notes}</p>
              <a href={term.source_url} target="_blank" rel="noreferrer">Consultar fuente <ArrowUpRight size={14} /></a>
            </article>
          ))}</div>}
        </>}
        {view === 'pasaporte' && <Passport token={token} updateSession={updateSession} catalog={catalog}
          catalogStatus={catalogStatus} places={places} destination={destination} clearDestination={() => setDestination('')} />}
      </main>
      <footer className="shell site-footer"><strong>RUTEA</strong><span>Bitácora de Costa Rica</span></footer>
    </>
  )
}

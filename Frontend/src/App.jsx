import { useEffect, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { api } from './services/api'
import Passport from './Passport'
import Agents from './Agents'
import GooglePlaces from './GooglePlaces'
import PlaceCard from './PlaceCard'
import Landing from './Landing'
import logo from './assets/rutea-logo.svg'
import { accessibilityLabels, categories, cuisineLabel, filterPlaces, serviceLabels } from './utils/catalog-filters'
import './App.css'
import './Landing.css'

const emptyFilters = { province: '', canton: '', category: '', subtype: '', diet: '', cuisine: '', search: '',
  accessibility: [], services: [], hasHours: false, evidence: '' }
const pageSize = 24
const emptyCatalog = { loading: true, provinces: [], cantons: [], glossary: [] }

export default function App() {
  const [view, setView] = useState('inicio')
  const [token, setToken] = useState(() => sessionStorage.getItem('rutea-session') ?? '')
  const [catalog, setCatalog] = useState(emptyCatalog)
  const [retry, setRetry] = useState(0)
  const [filters, setFilters] = useState(emptyFilters)
  const [limit, setLimit] = useState(pageSize)
  const [destination, setDestination] = useState('')
  const [showGoogle, setShowGoogle] = useState(false)

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    const options = { token, signal: controller.signal }
    async function loadCatalog() {
      try {
        const [provinces, cantons, glossary] = await Promise.all(
          ['provinces', 'cantons', 'glossary'].map((path) => api(`catalog/${path}`, options)),
        )
        const details = await Promise.all(provinces.map(({ slug }) => api(`catalog/provinces/${slug}`, options)))
        if (!controller.signal.aborted) setCatalog({ loading: false, provinces: details, cantons, glossary })
      } catch (error) {
        if (!controller.signal.aborted) setCatalog({ loading: false, error: error.message, provinces: [], cantons: [], glossary: [] })
      }
    }
    loadCatalog()
    return () => controller.abort()
  }, [token, retry])

  function updateSession(value) {
    if (value) sessionStorage.setItem('rutea-session', value)
    else sessionStorage.removeItem('rutea-session')
    setToken(value)
    setCatalog(emptyCatalog)
    setDestination('')
    setShowGoogle(false)
    setFilters(emptyFilters)
    setLimit(pageSize)
    setView(value ? 'explorar' : 'inicio')
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    function expired() { updateSession('') }
    window.addEventListener('rutea-session-expired', expired)
    return () => window.removeEventListener('rutea-session-expired', expired)
  }, [])

  function navigate(next) {
    setView(next)
    window.scrollTo({ top: 0 })
  }

  const places = catalog.provinces.flatMap((item) => item.places.map((place) => ({ ...place, province: item.name })))
  const cantonNames = new Map(catalog.cantons.map(({ code, name }) => [code, name]))
  const { province, canton, category, subtype, diet, cuisine, search, accessibility, services, hasHours, evidence } = filters
  const cuisines = [...new Set(places.flatMap((item) => item.cuisine_codes ?? []))]
    .sort((a, b) => cuisineLabel(a).localeCompare(cuisineLabel(b), 'es'))
  const visiblePlaces = filterPlaces(places, cantonNames, filters)
  const byCategory = places.filter((place) => !category || place.category === category)
  const subtypes = [...new Set(byCategory.map((place) => place.subtype).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'es'))
  const validServices = new Set(byCategory.flatMap((place) => place.services ?? []))
  const filtered = Boolean(province || canton || category || subtype || diet || cuisine || search ||
    evidence || hasHours || accessibility.length || services.length)
  const currentProvince = catalog.provinces.find((item) => item.slug === province)

  function changeFilters(updates) {
    setFilters((current) => ({ ...current, ...updates }))
    setLimit(pageSize)
  }
  const catalogStatus = catalog.loading ? <p role="status">Cargando el catálogo…</p> : catalog.error ? (
    <div className="panel" role="alert"><p>{catalog.error}</p><button onClick={() => {
      setCatalog((previous) => ({ ...previous, loading: true, error: '' }))
      setRetry((previous) => previous + 1)
    }}>Reintentar</button></div>
  ) : null

  if (!token) return <Landing onLogin={updateSession} />

  return (
    <>
      <header className="site-header">
        <div className="shell masthead">
          <button className="brand" onClick={() => navigate('inicio')}>
            <img src={logo} alt="" /><span>RUTEA<small>Bitácora de Costa Rica</small></span>
          </button>
          <nav aria-label="Principal">
            {[['inicio', 'Qué es RUTEA'], ['explorar', 'Adónde ir'], ['glosario', 'Glosario'], ['agentes', 'Agentes'], ['pasaporte', 'Mi pasaporte']].map(([key, label]) => (
              <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>
            ))}
          </nav>
          <button className="quiet" onClick={() => updateSession('')}>Cerrar sesión</button>
        </div>
      </header>
      <main className="shell">
        {view === 'inicio' && <Landing onExplore={() => navigate('explorar')} />}
        {view === 'explorar' && <>
          <div className="page-heading"><h1>Adónde ir</h1></div>
          {catalogStatus ?? <>
            <section className="filter-bar" aria-label="Filtros del catálogo">
              <label className="search-field"><Search size={19} aria-hidden="true" />
                <input aria-label="Buscar lugares" placeholder="Ej. comida coreana en Heredia" value={search} onChange={(event) => changeFilters({ search: event.target.value })} />
              </label>
              <label className="province-field">Provincia
                <select value={province} onChange={(event) => changeFilters({ province: event.target.value, canton: '' })}>
                  <option value="">Todas las provincias</option>
                  {catalog.provinces.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}
                </select>
              </label>
              <label className="province-field">Cantón<select value={canton} disabled={!province} onChange={(event) => changeFilters({ canton: event.target.value })}>
                <option value="">Todos los cantones</option>{catalog.cantons.filter((item) => item.province_slug === province).map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select></label>
              <label className="province-field">Tipo de lugar<select value={category} onChange={(event) => {
                const next = event.target.value
                changeFilters({ category: next, subtype: '', services: [], ...(next && next !== 'restaurant' ? { diet: '', cuisine: '' } : {}) })
              }}>
                <option value="">Todos los tipos</option>{Object.entries(categories).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
              </select></label>
              <label className="province-field">Subtipo<select value={subtype} onChange={(event) => changeFilters({ subtype: event.target.value })}>
                <option value="">Todos los subtipos</option>
                {subtypes.map((item) => <option key={item} value={item}>{item}</option>)}
              </select></label>
              {(!category || category === 'restaurant') && <>
                <label className="province-field">Menú<select value={diet} onChange={(event) => changeFilters({ diet: event.target.value })}>
                  <option value="">Cualquier menú</option><option value="fully_vegan">Solo 100 % vegano</option>
                  <option value="vegan_options">Con opciones veganas</option><option value="any_vegan">Cualquier opción vegana</option>
                  <option value="vegetarian">Con opciones vegetarianas</option>
                </select></label>
                <label className="province-field">Cocina<select value={cuisine} onChange={(event) => changeFilters({ cuisine: event.target.value })}>
                  <option value="">Todas las cocinas</option>
                  {cuisines.map((code) => <option key={code} value={code}>{cuisineLabel(code)}</option>)}
                </select></label>
              </>}
              {filtered && <button className="secondary" onClick={() => changeFilters(emptyFilters)}>Limpiar filtros</button>}
            </section>
            <fieldset className="access-filters"><legend>Accesibilidad</legend>
              {Object.entries(accessibilityLabels).map(([key, label]) => <label key={key}>
                <input type="checkbox" checked={accessibility.includes(key)} onChange={(event) => changeFilters({
                  accessibility: event.target.checked ? [...accessibility, key] : accessibility.filter((feature) => feature !== key),
                })} /> {label}
              </label>)}
            </fieldset>
            {(validServices.size > 0 || places.some((place) => place.hours)) && <fieldset className="access-filters"><legend>Servicios y horarios</legend>
              {Object.entries(serviceLabels).filter(([value]) => validServices.has(value)).map(([value, label]) => <label key={value}>
                <input type="checkbox" checked={services.includes(value)} onChange={(event) => changeFilters({
                  services: event.target.checked ? [...services, value] : services.filter((service) => value !== service),
                })} /> {label}
              </label>)}
              <label><input type="checkbox" checked={hasHours} onChange={(event) => changeFilters({ hasHours: event.target.checked })} /> Con horario registrado</label>
              <label className="source-filter">Fuente<select value={evidence} onChange={(event) => changeFilters({ evidence: event.target.value })}>
                <option value="">Todas las fuentes</option><option value="editorial">Catálogo editorial</option><option value="openstreetmap">OpenStreetMap</option>
              </select></label>
            </fieldset>}
            {currentProvince && <aside className="field-note"><strong>Dato de {currentProvince.name}</strong>
              <p>{currentProvince.curiosity}</p><a href={currentProvince.source_url} target="_blank" rel="noreferrer">Consultar fuente <ArrowUpRight size={14} /></a>
            </aside>}
            <div className="section-title"><h2>Lugares para descubrir</h2><span role="status">{visiblePlaces.length} {visiblePlaces.length === 1 ? 'lugar' : 'lugares'}</span>
              <button className="secondary" aria-expanded={showGoogle} onClick={() => setShowGoogle((visible) => !visible)}>
                {showGoogle ? 'Cerrar búsqueda en Google' : 'Buscar también en Google'}
              </button>
            </div>
            {showGoogle && <GooglePlaces token={token} initialQuery={search || [
              cuisine ? `comida ${cuisineLabel(cuisine)}` : categories[category], cantonNames.get(Number(canton)), currentProvince?.name,
            ].filter(Boolean).join(' ')} />}
            {visiblePlaces.length === 0 && <p>El catálogo aún no tiene lugares que cumplan todos estos filtros.</p>}
            <div className="card-grid">{visiblePlaces.slice(0, limit).map((place) => (
              <PlaceCard key={place.slug} place={place} token={token} canton={cantonNames.get(place.canton_code)}
                onVisit={() => { setDestination(place.slug); navigate('pasaporte') }} />
            ))}</div>
            {visiblePlaces.length > limit && <button className="secondary load-more" onClick={() => setLimit((count) => count + pageSize)}>Cargar más lugares</button>}
            <p className="osm-attribution">Datos cartográficos © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">colaboradores de OpenStreetMap</a>.</p>
          </>}
        </>}
        {view === 'agentes' && <Agents token={token} provinces={catalog.provinces} openPassport={() => navigate('pasaporte')} />}
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

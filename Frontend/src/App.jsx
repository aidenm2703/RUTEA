import { useEffect, useState } from 'react'
import { ArrowUpRight, Compass, MapPin, Search } from 'lucide-react'
import { api } from './services/api'
import Passport from './Passport'
import Agents from './Agents'
import logo from './assets/rutea-logo.svg'
import './App.css'

const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const categories = { nature: 'Naturaleza', culture: 'Cultura', restaurant: 'Restaurantes' }
const menuLabels = { fully_vegan: '100 % vegano', vegan_options: 'Opciones veganas' }

export default function App() {
  const [view, setView] = useState('inicio')
  const [token, setToken] = useState(() => sessionStorage.getItem('rutea-session') ?? '')
  const [catalog, setCatalog] = useState({ loading: true, provinces: [], cantons: [], glossary: [] })
  const [retry, setRetry] = useState(0)
  const [province, setProvince] = useState('')
  const [canton, setCanton] = useState('')
  const [category, setCategory] = useState('')
  const [diet, setDiet] = useState('')
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
  const cantonNames = new Map(catalog.cantons.map(({ code, name }) => [code, name]))
  const words = normalize(search).match(/[a-z0-9]+/g) ?? []
  const asksVegan = words.some((word) => /^vegan[oa]s?$/.test(word))
  const asksRestaurant = words.some((word) => /^restaurantes?$/.test(word))
  const requestedMenu = asksVegan && (words.includes('100') ? 'fully_vegan'
    : words.some((word) => /^opcion(es)?$/.test(word)) ? 'vegan_options' : '')
  const terms = words.filter((word) => !/^(restaurantes?|vegan[oa]s?|en|de|del|para|con)$/.test(word)
    && !(asksVegan && /^(100|opcion(es)?)$/.test(word)))
  const visiblePlaces = places.filter((item) => {
    const searchable = normalize(`${item.name} ${item.province} ${cantonNames.get(item.canton_code) ?? ''} ${item.visit_notes} ${categories[item.category] ?? ''}`)
    return (!province || item.province_slug === province) && (!canton || Number(canton) === item.canton_code)
      && (!category || category === item.category) && (!asksRestaurant || item.category === 'restaurant')
      && (!asksVegan || Boolean(item.vegan_menu)) && (!requestedMenu || item.vegan_menu === requestedMenu)
      && (!diet || (diet === 'any_vegan' ? Boolean(item.vegan_menu) : item.vegan_menu === diet))
      && terms.every((term) => searchable.includes(term))
  })
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
          <button className="brand" onClick={() => navigate('inicio')}>
            <img src={logo} alt="" /><span>RUTEA<small>Bitácora de Costa Rica</small></span>
          </button>
          <nav aria-label="Principal">
            {[['inicio', 'Qué es RUTEA'], ['explorar', 'Adónde ir'], ['glosario', 'Glosario'], ['agentes', 'Agentes'], ['pasaporte', 'Mi pasaporte']].map(([key, label]) => (
              <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>
            ))}
          </nav>
          {token && <button className="quiet" onClick={() => { updateSession(''); setDestination('') }}>Cerrar sesión</button>}
        </div>
      </header>
      <main className="shell">
        {view === 'inicio' && <>
          <section className="hero">
            <div>
              <p className="eyebrow">Bitácora de Costa Rica</p>
              <h1>¿Qué es RUTEA?</h1>
              <p>Una guía para descubrir Costa Rica por provincia y cantón, conocer la historia de cada visita y guardar tu recorrido en un pasaporte personal.</p>
              <button className="secondary hero-action" onClick={() => navigate('explorar')}>Buscar adónde ir</button>
            </div>
            <Compass className="hero-compass" size={180} strokeWidth={0.7} aria-hidden="true" />
          </section>
          <div className="card-grid">
            <section className="panel"><h2>Encuentra tu próxima parada</h2><p>Busca naturaleza, cultura o restaurantes con el tipo de menú que necesitas.</p><button onClick={() => navigate('explorar')}>Abrir catálogo</button></section>
            <section className="panel"><h2>Conoce cómo hablamos</h2><p>Lee costarriqueñismos, ejemplos y datos culturales con sus fuentes.</p><button onClick={() => navigate('glosario')}>Ver glosario</button></section>
            <section className="panel"><h2>Guarda tu recorrido</h2><p>Registra visitas y consulta tus sellos, provincias recorridas e insignias.</p><button onClick={() => navigate('pasaporte')}>Abrir mi pasaporte</button></section>
          </div>
        </>}
        {view === 'explorar' && <>
          <div className="page-heading"><h1>Adónde ir</h1></div>
          {catalogStatus ?? <>
            <section className="filter-bar" aria-label="Filtros del catálogo">
              <label className="search-field"><Search size={19} aria-hidden="true" />
                <input aria-label="Buscar lugares" placeholder="Ej. restaurantes veganos en Heredia" value={search} onChange={(event) => setSearch(event.target.value)} />
              </label>
              <label className="province-field">Provincia
                <select value={province} onChange={(event) => { setProvince(event.target.value); setCanton('') }}>
                  <option value="">Todas las provincias</option>
                  {catalog.provinces.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}
                </select>
              </label>
              <label className="province-field">Cantón<select value={canton} disabled={!province} onChange={(event) => setCanton(event.target.value)}>
                <option value="">Todos los cantones</option>{catalog.cantons.filter((item) => item.province_slug === province).map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
              </select></label>
              <label className="province-field">Tipo de lugar<select value={category} onChange={(event) => { setCategory(event.target.value); if (event.target.value !== 'restaurant') setDiet('') }}>
                <option value="">Todos los tipos</option>{Object.entries(categories).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
              </select></label>
              {(!category || category === 'restaurant') && <label className="province-field">Menú<select value={diet} onChange={(event) => setDiet(event.target.value)}>
                <option value="">Cualquier menú</option><option value="fully_vegan">Solo 100 % vegano</option><option value="vegan_options">Con opciones veganas</option><option value="any_vegan">Ambos tipos</option>
              </select></label>}
              {(search || province || canton || category || diet) && <button className="secondary" onClick={() => { setSearch(''); setProvince(''); setCanton(''); setCategory(''); setDiet('') }}>Limpiar filtros</button>}
            </section>
            {currentProvince && <aside className="field-note"><strong>Dato de {currentProvince.name}</strong>
              <p>{currentProvince.curiosity}</p><a href={currentProvince.source_url} target="_blank" rel="noreferrer">Consultar fuente <ArrowUpRight size={14} /></a>
            </aside>}
            <div className="section-title"><h2>Lugares para descubrir</h2><span role="status">{visiblePlaces.length} {visiblePlaces.length === 1 ? 'lugar' : 'lugares'}</span></div>
            {visiblePlaces.length === 0 && <p>No encontramos lugares para esta búsqueda.</p>}
            <div className="card-grid">{visiblePlaces.map((place) => (
              <article className="place-card panel" key={place.slug}>
                <p className="eyebrow"><MapPin size={14} aria-hidden="true" />{[place.province, cantonNames.get(place.canton_code), categories[place.category]].filter(Boolean).join(' · ')}</p>
                <h3>{place.name}</h3><p>{place.visit_notes}</p>
                {place.vegan_menu && <p className="menu-label">{menuLabels[place.vegan_menu]}</p>}
                <details><summary>Ubicación, alojamiento y fuentes</summary><ul>
                  {place.links.map((link) => <li key={link.kind + link.url}><a href={link.url} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={14} /></a></li>)}
                </ul></details>
                <button className="secondary" onClick={() => { setDestination(place.slug); navigate('pasaporte') }}>Registrar visita</button>
              </article>
            ))}</div>
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

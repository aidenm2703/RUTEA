import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Compass } from 'lucide-react'
import { api } from './services/api'

export default function Agents({ token, provinces, openPassport }) {
  const [catalog, setCatalog] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [allowed, setAllowed] = useState(null)
  const panel = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    api('agents', { token, signal: controller.signal }).then(setCatalog).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message)
    })
    return () => controller.abort()
  }, [token, retry])

  useEffect(() => {
    if (!selected || !panel.current) return
    panel.current.scrollIntoView({ block: 'nearest' })
    panel.current.focus({ preventScroll: true })
  }, [selected])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    api('agents/permissions', { token, signal: controller.signal }).then(({ allowed }) => {
      if (!controller.signal.aborted) setAllowed({ token, ids: allowed })
    }).catch(() => {})
    return () => controller.abort()
  }, [token, retry])

  return <>
    <div className="page-heading"><p className="eyebrow">Herramientas para tu visita</p><h1>Agentes RUTEA</h1></div>
    {error && <div className="panel" role="alert"><p>{error}</p><button onClick={() => { setError(''); setRetry((value) => value + 1) }}>Reintentar</button></div>}
    {!catalog && !error && <p role="status">Cargando agentes…</p>}
    {catalog && <>
      {!catalog.available && <p className="field-note" role="status">Gemini todavía no está configurado en este entorno.</p>}
      <div className="agent-layout">
        <div className="card-grid">
          {catalog.agents.map((agent) => <article className="panel agent-card" key={agent.id}>
            <p className="eyebrow"><Compass size={16} /> {agent.audience}</p>
            <h3>{agent.name}</h3><p>{agent.description}</p>
            <button className="secondary" aria-pressed={selected?.id === agent.id} onClick={() => setSelected(agent)}>Elegir {agent.name}</button>
          </article>)}
        </div>
        {selected && <div className="agent-selection" tabIndex={-1} ref={panel} id="consulta-agente"><AgentForm key={selected.id} agent={selected} available={catalog.available}
          token={token} restricted={Boolean(allowed?.token === token && !allowed.ids.includes(selected.id))}
          provinces={provinces} openPassport={openPassport} /></div>}
      </div>
    </>}
  </>
}

function AgentForm({ agent, available, token, restricted, provinces, openPassport }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [prompt, setPrompt] = useState('')

  async function submit(event) {
    event.preventDefault()
    const { province, destination } = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    setResult(null)
    setBusy(true)
    try {
      setResult(await api(`agents/${agent.id}`, {
        token, method: 'POST', body: { prompt, provinceSlug: province || null, destination: destination?.trim() || null },
      }))
    } catch (failure) {
      setError(failure.status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión.' : failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="panel agent-form"><h2>{agent.name}</h2><p>{agent.description}</p>
    <p><strong>Ejemplo de consulta</strong><br />{agent.example}</p>
    {!token && <button onClick={openPassport}>Iniciar sesión</button>}
    {restricted && <p role="status">Disponible para el equipo de {agent.audience.toLowerCase()}.</p>}
    {token && available && !restricted && <form onSubmit={submit}>
      <label>Provincia opcional<select name="province">
        <option value="">Sin especificar</option>{provinces.map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
      </select></label>
      {agent.id === 'maleta' && <label>Localidad para el pronóstico
        <input name="destination" maxLength={70} minLength={2} placeholder="Por ejemplo, Turrialba" />
      </label>}
      <label>Consulta<textarea name="prompt" required minLength={5} maxLength={2500} rows={6} value={prompt} onChange={(event) => setPrompt(event.target.value)} /></label>
      <button type="button" className="secondary" onClick={() => setPrompt(agent.example)}>Usar el ejemplo</button>
      <small>Omite nombres, correos y otros datos personales en la consulta.</small>
      <button disabled={busy}>{busy ? 'Consultando…' : 'Consultar agente'}</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    {result && <div role="status"><h3>Respuesta</h3><p className="agent-answer">{result.answer}</p>
      {result.weather && <details><summary>Pronóstico para {result.weather.place}</summary><ul>
        {result.weather.days.map(({ date, minCelsius, maxCelsius, rainProbability }) => <li key={date}>
          {date} · {minCelsius ?? '—'} a {maxCelsius ?? '—'} °C · Lluvia {rainProbability != null ? `${rainProbability} %` : 'sin datos'}
        </li>)}
      </ul></details>}
      {Boolean(result.sources.length) && <><h3>Fuentes del catálogo consultado</h3><ul>
        {result.sources.map(({ label, url }) => <li key={label + url}><a href={url} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={14} /></a></li>)}
      </ul></>}
    </div>}
  </section>
}

import { useEffect, useState } from 'react'
import { ArrowUpRight, Compass } from 'lucide-react'
import { api } from './services/api'

export default function Agents({ token, provinces, openPassport }) {
  const [catalog, setCatalog] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api('agents', { signal: controller.signal }).then(setCatalog).catch((failure) => {
      if (!controller.signal.aborted) setError(failure.message)
    })
    return () => controller.abort()
  }, [retry])

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
        {selected && <AgentForm key={selected.id} agent={selected} available={catalog.available}
          token={token} provinces={provinces} openPassport={openPassport} />}
      </div>
    </>}
  </>
}

function AgentForm({ agent, available, token, provinces, openPassport }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const { prompt, province } = Object.fromEntries(new FormData(event.currentTarget))
    setError('')
    setResult(null)
    setBusy(true)
    try {
      setResult(await api(`agents/${agent.id}`, { token, method: 'POST', body: { prompt, provinceSlug: province || null } }))
    } catch (failure) {
      setError(failure.status === 401 ? 'Tu sesión venció. Vuelve a iniciar sesión.' : failure.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="panel agent-form"><h2>{agent.name}</h2><p>{agent.description}</p>
    {!token && <button onClick={openPassport}>Iniciar sesión</button>}
    {token && available && <form onSubmit={submit}>
      <label>Provincia opcional<select name="province">
        <option value="">Sin especificar</option>{provinces.map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
      </select></label>
      <label>Consulta<textarea name="prompt" required minLength={5} maxLength={2500} rows={6} placeholder={agent.description} /></label>
      <small>Omite nombres, correos y otros datos personales en la consulta.</small>
      <button disabled={busy}>{busy ? 'Consultando…' : 'Consultar agente'}</button>
    </form>}
    {error && <p role="alert">{error}</p>}
    {result && <div role="status"><h3>Respuesta</h3><p className="agent-answer">{result.answer}</p>
      {Boolean(result.sources.length) && <><h3>Fuentes del catálogo consultado</h3><ul>
        {result.sources.map(({ label, url }) => <li key={label + url}><a href={url} target="_blank" rel="noreferrer">{label} <ArrowUpRight size={14} /></a></li>)}
      </ul></>}
    </div>}
  </section>
}

import { useState } from 'react'
import { api } from './services/api'

export default function Account({ onLogin, register, setRegister }) {
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const { displayName, email, password } = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    setFeedback('')
    try {
      if (register) {
        await api('auth/register', { method: 'POST', body: { displayName, email, password } })
        setFeedback('Cuenta creada. Ya puedes iniciar sesión.')
        setRegister(false)
      } else {
        const { accessToken } = await api('auth/login', { method: 'POST', body: { email, password } })
        onLogin(accessToken)
      }
    } catch (error) {
      setFeedback(register && error.status === 404 ? 'El registro de cuentas está deshabilitado en este entorno.' : error.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="panel account">
    <h2>{register ? 'Crear una cuenta' : 'Iniciar sesión'}</h2>
    <form onSubmit={submit}>
      {register && <label>Nombre<input name="displayName" autoComplete="name" required maxLength={80} /></label>}
      <label>Correo<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Contraseña<input key={register ? 'new' : 'existing'} name="password" type="password" required minLength={register ? 12 : undefined}
        autoComplete={register ? 'new-password' : 'current-password'} /></label>
      {register && <small>Usa al menos 12 caracteres.</small>}
      <button disabled={busy}>{busy ? 'Procesando…' : register ? 'Crear cuenta' : 'Entrar'}</button>
    </form>
    {feedback && <p role="status">{feedback}</p>}
    <button className="secondary" disabled={busy} onClick={() => { setFeedback(''); setRegister(!register) }}>
      {register ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
    </button>
  </section>
}

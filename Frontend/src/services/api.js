export async function api(path, { token, method = 'GET', body, signal } = {}) {
  const response = await fetch(`/api/${path}`, {
    method,
    signal,
    headers: {
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  })
  const content = await response.json().catch(() => null)
  if (!response.ok || !content) {
    if (response.status === 401 && token && sessionStorage.getItem('rutea-session') === token) {
      window.dispatchEvent(new Event('rutea-session-expired'))
    }
    const error = new Error(content?.error ?? 'No se pudo conectar con RUTEA. Inténtalo de nuevo.')
    error.status = response.status
    throw error
  }
  return content
}

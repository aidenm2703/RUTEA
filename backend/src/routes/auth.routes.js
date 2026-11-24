const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');

const issuer = 'rutea';
const dummyHash = '$2b$12$9yNCQhWIq9zKtfk6Ph.CDecrlQK9P8wkC0GNXFzWn2b48zoVua1pW';
const profileColumns = 'id, display_name, role, home_province_slug, home_canton_code';

function credentials(body) {
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body?.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 72) {
    return null;
  }
  return { email, password };
}

function createAuthRouter(database, secret, allowRegistration) {
  const router = Router();
  router.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { error: 'Demasiados intentos. Vuelve a intentarlo más tarde.' },
  }));
  if (allowRegistration) {
    router.post('/register', async (request, response) => {
      const input = credentials(request.body);
      const name = typeof request.body?.displayName === 'string' ? request.body.displayName.trim() : '';
      if (!input || name.length < 1 || name.length > 80) {
        return response.status(400).json({ error: 'Indica nombre, correo y una contraseña de 12 caracteres como mínimo' });
      }
      const hash = await bcrypt.hash(input.password, 12);
      const { rowCount } = await database.query(`
        insert into rutea.users (display_name, email, password_hash) values ($1, $2, $3)
        on conflict (email) do nothing
      `, [name, input.email, hash]);
      if (!rowCount) return response.status(409).json({ error: 'No se pudo registrar esta cuenta' });
      return response.status(201).json({ status: 'created' });
    });
  }
  router.post('/login', async (request, response) => {
    const input = credentials(request.body);
    if (!input) return response.status(401).json({ error: 'Credenciales inválidas' });
    const { rows: [user] } = await database.query(
      `select ${profileColumns}, password_hash from rutea.users where email = $1`, [input.email],
    );
    const valid = await bcrypt.compare(input.password, user?.password_hash ?? dummyHash);
    if (!user || !valid) return response.status(401).json({ error: 'Credenciales inválidas' });
    const accessToken = jwt.sign({ role: user.role }, secret, {
      issuer, subject: user.id, algorithm: 'HS256', expiresIn: '30m',
    });
    return response.json({ accessToken });
  });
  return router;
}

function createAuthentication(database, secret) {
  return async (request, response, next) => {
    const token = request.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1];
    let claims;
    try {
      claims = jwt.verify(token, secret, { issuer, algorithms: ['HS256'] });
    } catch {
      return response.status(401).json({ error: 'Sesión inválida o vencida' });
    }
    if (typeof claims.sub !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(claims.sub)) {
      return response.status(401).json({ error: 'Sesión inválida o vencida' });
    }
    const { rows: [user] } = await database.query(
      `select ${profileColumns} from rutea.users where id = $1`, [claims.sub],
    );
    if (!user) return response.status(401).json({ error: 'Sesión inválida o vencida' });
    request.user = user;
    return next();
  };
}

module.exports = { createAuthRouter, createAuthentication };

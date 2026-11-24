require('dotenv').config({ quiet: true });
const { Pool } = require('pg');
const { createApp } = require('./app');

if (!process.env.DATABASE_URL) {
  throw new Error('Configura DATABASE_URL en el entorno del backend');
}

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  statement_timeout: 5000,
  max: 5,
});
database.on('error', (error) => {
  console.error('Error de conexión PostgreSQL', error.code ?? error.name);
});

const port = process.env.PORT || 3000;
createApp(database).listen(port, () => console.log(`API RUTEA en puerto ${port}`));

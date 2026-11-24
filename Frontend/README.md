# RUTEA · Frontend

1. Configura y arranca Express en el puerto 3000 siguiendo la [guía del backend](../backend/README.md).
2. Desde `Frontend`, ejecuta `npm ci` y `npm run dev`. Abre la dirección que muestra Vite.
3. En **Mi pasaporte**, crea una cuenta si el backend tiene habilitado el registro de demostración. Inicia sesión para guardar el lugar de origen y registrar visitas.

Vite reenvía las solicitudes `/api` a Express. En producción, sirve el frontend y enruta `/api` al backend en el mismo dominio. La conexión de Supabase y el secreto de JWT se configuran únicamente en Express.

Usa `npm run lint` para verificar el código y `npm run build` para generar el frontend en `dist`.

Las imágenes de `src/assets` son referencias de diseño. La interfaz usa el catálogo y el pasaporte que devuelve la API.

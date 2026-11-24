# API de RUTEA

Ejecuta `npm ci` en `backend`. Copia `.env.example` a `.env` y configura `DATABASE_URL` con la conexión PostgreSQL de desarrollo que entrega el panel **Connect** de Supabase. El proceso toma el puerto de `PORT` y arranca con `npm start`.

El catálogo de RUTEA se instaló en el esquema privado `rutea`. Para reproducirlo en otra base vacía, aplica `database/catalogo-schema.sql` y después `database/catalogo-seed.sql`. La aplicación de producción debe usar un rol PostgreSQL de lectura con acceso al esquema y políticas de lectura del catálogo.

| Ruta GET | Contenido |
| --- | --- |
| `/health` | Estado del proceso |
| `/api/catalog/provinces` | Provincias con curiosidades y procedencia |
| `/api/catalog/provinces/:slug` | Lugares, enlaces y glosario aplicable a una provincia |
| `/api/catalog/glossary` | Glosario completo |

El enlace de mapa realiza una búsqueda por nombre. El enlace de alojamiento dirige al directorio del ICT. Las futuras fichas de negocios pueden añadir su sitio oficial y su enlace externo de reserva. Las tarifas, horarios, coordenadas y condiciones de accesibilidad requieren evidencia específica antes de publicarse.

## Siguiente alcance

1. Cuentas y roles en Express con bcrypt y JWT, recuperación por correo y consentimiento versionado.
2. Catálogo editorial con accesibilidad documentada, favoritos, reseñas, moderación y gestión de establecimientos.
3. Viajes, pasaporte, insignias, amistades y fotos privadas en Supabase Storage.
4. Ocho agentes con Gemini, fuentes del catálogo y bitácora, y los flujos n8n de bienvenida, tipo de cambio y eliminación.

Registra cada actualización en la rama `Aiden` con un commit que describa el cambio.

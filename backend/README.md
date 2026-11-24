# API de RUTEA

Ejecuta `npm ci` en `backend`. Copia `.env.example` a `.env` y configura `DATABASE_URL` con la conexión PostgreSQL de desarrollo que entrega el panel **Connect** de Supabase. El proceso toma el puerto de `PORT` y arranca con `npm start`.

El catálogo de RUTEA se instaló en el esquema privado `rutea`. Para reproducirlo en otra base vacía, aplica `database/catalogo-schema.sql` y después `database/catalogo-seed.sql`. La aplicación de producción debe usar un rol PostgreSQL de lectura con acceso al esquema y políticas de lectura del catálogo.

| Ruta GET | Contenido |
| --- | --- |
| `/health` | Estado del proceso |
| `/api/catalog/provinces` | Provincias con curiosidades y procedencia |
| `/api/catalog/cantons` | 84 cantones con sus códigos oficiales y provincias |
| `/api/catalog/provinces/:slug` | Lugares, enlaces y glosario aplicable a una provincia |
| `/api/catalog/glossary` | Glosario completo |

El enlace de mapa realiza una búsqueda por nombre. El enlace de alojamiento dirige al directorio del ICT. Las futuras fichas de negocios pueden añadir su sitio oficial y su enlace externo de reserva. Las tarifas, horarios, coordenadas y condiciones de accesibilidad requieren evidencia específica antes de publicarse.

## Perfil y pasaporte

Después del esquema y el catálogo inicial, aplica `database/cantones.sql`, `database/catalogo-ampliacion.sql` y `database/pasaporte.sql`, en ese orden. Para habilitar las rutas personales, configura `JWT_SECRET` con al menos 32 bytes aleatorios. `ALLOW_DEMO_REGISTRATION=true` habilita el registro en una instancia de pruebas con datos ficticios.

| Método y ruta | Datos |
| --- | --- |
| `POST /api/auth/register` | `displayName`, `email`, `password` en modo demo. |
| `POST /api/auth/login` | `email`, `password`. Devuelve `accessToken`. |
| `GET /api/me/profile` | Perfil del titular de la sesión. |
| `PATCH /api/me/profile` | `homeProvinceSlug` y `homeCantonCode` opcional. Envía provincia nula para borrar el origen. |
| `GET /api/me/passport` | Historial, progreso, sellos e insignias. |
| `POST /api/me/passport/visits` | `visitedOn` (AAAA-MM-DD) y uno de `placeSlug`, `cantonCode` o `provinceSlug`. |

Envía el token en `Authorization: Bearer <accessToken>` para usar `/api/me`. El perfil guarda el origen a nivel de provincia y cantón. El historial es privado y las visitas son autorregistradas. Un registro repetido para el mismo destino y fecha devuelve el pasaporte existente. El progreso cuenta lugares, cantones y provincias distintos. Cada lugar aporta un sello con la fecha de la primera visita y las insignias se calculan con los umbrales de PostgreSQL.

## Siguiente alcance

1. Completar cuentas y roles con verificación y recuperación por correo, y consentimiento versionado.
2. Catálogo editorial con accesibilidad documentada, favoritos, reseñas, moderación y gestión de establecimientos.
3. Viajes, pasaporte, insignias, amistades y fotos privadas en Supabase Storage.
4. Ocho agentes con Gemini, fuentes del catálogo y bitácora, y los flujos n8n de bienvenida, tipo de cambio y eliminación.

Registra cada actualización en la rama `Aiden` con un commit que describa el cambio.

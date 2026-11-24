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

Después del pasaporte aplica `database/catalogo-filtros-agentes.sql`. Los lugares incluyen una categoría. El menú vegano distingue `fully_vegan` y `vegan_options`, con evidencia del operador enlazada en la ficha.

Aplica después `database/catalogo-atributos.sql` y `database/catalogo-osm.sql` para las cocinas, opciones vegetarianas, accesibilidad y cobertura cantonal. Las fichas importadas conservan el enlace a la entidad de OpenStreetMap y muestran su procedencia comunitaria. La ausencia de una etiqueta representa información desconocida. Una etiqueta de acceso en silla de ruedas se registra por separado de una rampa.

El archivo `database/catalogo-osm.sql` contiene datos de los colaboradores de OpenStreetMap bajo [ODbL 1.0](https://www.openstreetmap.org/copyright), extraídos de [Geofabrik](https://download.geofabrik.de/central-america/costa-rica.html). Para generar un extracto nuevo usa Python con `osmium` y `shapely`, el PBF de Costa Rica y `python database/importar_catalogo_osm.py <extracto.osm.pbf> <salida.sql> --snapshot-date AAAA-MM-DD`. El generador exige cobertura de los 84 cantones y asigna fichas mediante los límites cantonales de OpenStreetMap. Revisa el resultado antes de aplicarlo a una base existente.

Aplica `database/catalogo-detalles.sql` y después `database/catalogo-osm-detalles.sql` para habilitar subtipos, servicios, horarios, direcciones y coordenadas. Puedes reproducir el segundo archivo con el mismo PBF mediante `python database/enriquecer_catalogo_osm.py <extracto.osm.pbf> <salida.sql>`. Una coordenada de OpenStreetMap señala la ficha cartográfica y puede diferir de la entrada. Los filtros de servicio y horario incluyen las fichas que tienen datos registrados.

| Método y ruta | Datos |
| --- | --- |
| `POST /api/auth/register` | `displayName`, `email`, `password` en modo demo. |
| `POST /api/auth/login` | `email`, `password`. Devuelve `accessToken`. |
| `GET /api/me/profile` | Perfil del titular de la sesión. |
| `PATCH /api/me/profile` | `homeProvinceSlug` y `homeCantonCode` opcional. Envía provincia nula para borrar el origen. |
| `GET /api/me/passport` | Historial, progreso, sellos e insignias. |
| `POST /api/me/passport/visits` | `visitedOn` (AAAA-MM-DD) y uno de `placeSlug`, `cantonCode` o `provinceSlug`. |

Envía el token en `Authorization: Bearer <accessToken>` para usar `/api/me`. El perfil guarda el origen a nivel de provincia y cantón. El historial es privado y las visitas son autorregistradas. Un registro repetido para el mismo destino y fecha devuelve el pasaporte existente. El progreso cuenta lugares, cantones y provincias distintos. Cada lugar aporta un sello con la fecha de la primera visita y las insignias se calculan con los umbrales de PostgreSQL.

## Agentes Gemini

Configura `GEMINI_API_KEY` y `GEMINI_MODEL` con un modelo que tenga habilitado `generateContent` en tu proyecto de Google AI Studio. `GET /api/agents` lista los ocho agentes con ejemplos e indica si el entorno está configurado. `GET /api/agents/permissions` devuelve los agentes habilitados para el titular de la sesión. `POST /api/agents/:id` requiere una sesión JWT y recibe `prompt` y `provinceSlug` opcional. El backend conserva estado, autor y duración en `rutea.ai_agent_runs`. Las consultas y respuestas quedan fuera de la bitácora.

| Agente | ID | Comportamiento actual |
| --- | --- | --- |
| Pregúntale a RUTEA | `preguntale` | Consulta el catálogo y el glosario de la provincia elegida. |
| Planificador | `itinerario` | Propone paradas por cantón. Queda pendiente calcular distancias con PostGIS. |
| Accesibilidad | `accesibilidad` | Resume la evidencia disponible e identifica información pendiente. |
| Maleta y clima | `maleta` | Si se aporta `destination`, busca la localidad costarricense y consulta el pronóstico de cinco días con [Open-Meteo](https://open-meteo.com/). La ficha muestra la localidad encontrada y las fechas cubiertas. |
| Presupuesto | `presupuesto` | Organiza los gastos aportados y usa el tipo de cambio indicado. |
| Moderación | `moderacion` | Sugiere una revisión para moderadores y administradores. |
| Recuerdos | `recuerdos` | Redacta un diario con notas y visitas del titular. |
| Privacidad | `privacidad` | Revisa textos de ejemplo para auditores y administradores. |

## Búsqueda en Google Maps

Agrega `GOOGLE_PLACES_API_KEY` al entorno de Express y reinicia el backend. En Google Cloud, habilita únicamente **Places API (New)** para esa llave y configura las cuotas del proyecto. La interfaz envía búsquedas cuando la persona pulsa el botón y pide los detalles y una foto al abrir una ficha. La primera búsqueda utiliza hasta ocho resultados.

| Método y ruta | Datos |
| --- | --- |
| `GET /api/google-places/status` | Indica si hay una llave configurada. |
| `POST /api/google-places/search` | `query`, texto para buscar en Costa Rica. |
| `GET /api/google-places/:id` | Ficha, reseñas destacadas y foto disponible con atribución. |

La interfaz diferencia estos resultados del catálogo de RUTEA. El backend mantiene la llave en el servidor y entrega el contenido de Google con `Cache-Control: no-store`. La integración consulta el servicio en vivo y respeta las [reglas de atribución de Google Maps](https://developers.google.com/maps/documentation/places/web-service/policies).

## Siguiente alcance

1. Completar cuentas y roles con verificación y recuperación por correo, y consentimiento versionado.
2. Catálogo editorial con accesibilidad documentada, favoritos, reseñas, moderación y gestión de establecimientos.
3. Viajes, pasaporte, insignias, amistades y fotos privadas en Supabase Storage.
4. Completar distancias PostGIS y BCCR para los agentes, y los flujos n8n de bienvenida, tipo de cambio y eliminación.

Registra cada actualización en la rama `Aiden` con un commit que describa el cambio.

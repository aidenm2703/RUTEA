RUTEA
Tu ruta, tu experiencia
Anteproyecto del Proyecto Final Full Stack
Plataforma web de turismo, cultura y accesibilidad para Costa Rica
Integrantes: Aiden Montero Pérez y Bianca Robles
Programa de Desarrollo Web Full Stack · FWD Costa Rica
Profesor: Barry
19 de noviembre de 2026

RUTEA — Anteproyecto del Proyecto Final Full Stack
Plataforma web de turismo, cultura y accesibilidad para Costa Rica · Aiden Montero Pérez · FWD Costa Rica · 19 de noviembre de 2026
Datos del proyecto
Nombre del proyecto: RUTEA
Estudiante: Aiden Montero Pérez y Bianca Robles 
Programa: Programa de Desarrollo Web Full Stack, FWD Costa Rica
Profesor: Barry
Fecha: 19 de noviembre de 2026
Versión: 1.0, borrador para el primer avance (3 de diciembre de 2026)
Índice
Introducción
Desarrollo (visión, roles, módulos, arquitectura, entidades, agentes, APIs, workflows, gobernanza y alcance)
Objetivo general
Objetivos específicos
Requerimientos funcionales y no funcionales
Historias de usuario
Mockups
Libro de marca
Cronograma
Anexos: A) Modelo de datos, B) Documentación de los agentes de IA, C) Riesgos, D) Decisiones pendientes
1. Introducción
1.1 Contexto del negocio
Costa Rica recibe visitantes nacionales e internacionales interesados en naturaleza, cultura, gastronomía y aventura. Para planear una visita, una persona suele alternar entre mapas, blogs, redes sociales, sitios de hoteles, pronósticos del clima, notas y chats grupales. La información queda dispersa, y los datos más importantes para ciertos viajeros, como la accesibilidad real de un lugar, las opciones veganas o los costos verificados, suelen estar incompletos o desactualizados.
1.2 Problema
No existe un único lugar que permita descubrir un sitio turístico, entender su contexto cultural, comprobar si se adapta a necesidades específicas (movilidad, alimentación, familia, mascotas), planificar el viaje y conservar la experiencia. Además, los datos de accesibilidad rara vez indican de dónde vienen ni cuándo se revisaron, lo que puede llevar a una persona a un lugar que no le sirve.
1.3 Solución propuesta
Rutea es un sistema web full stack, responsivo, que integra en una sola plataforma el ciclo completo de una experiencia turística: antes (descubrir y planificar), durante (registrar la visita y obtener sellos en un pasaporte digital) y después (conservar fotos y compartir el pasaporte con amigos). Sus diferenciadores son:
Fichas de lugares con fuente, fecha de revisión y nivel de confianza en cada dato. La ausencia de un dato se muestra como "desconocido", nunca como "inaccesible" ni como confirmado.
Accesibilidad granular (entrada sin escalones, baños adaptados, ruido, luces, entre otros) con procedencia de la información.
Pasaporte digital con sellos e insignias que no dependen de gastar dinero.
Componente social: avatar personalizable, amigos, y pasaporte y fotos visibles solo para quien el usuario autorice.
Agentes de IA que ayudan a planificar, consultar cultura y accesibilidad, armar el equipaje, controlar gastos y moderar contenido.
1.4 A quién va dirigido
Viajeros nacionales e internacionales, incluyendo personas con necesidades de accesibilidad, familias, adultos mayores, veganos o vegetarianos y personas que viajan con mascotas.
Negocios turísticos pequeños y medianos (restaurantes, hospedajes, operadores) que quieren mantener su ficha actualizada.
Moderadores, editores y administradores que garantizan la calidad de los datos.
Auditores que revisan el cumplimiento de la gobernanza de datos.
1.5 Alcance y límites
Rutea no es una copia de un servicio de mapas ni una agencia de viajes. Es una capa de experiencias turísticas sobre servicios cartográficos y fuentes de datos verificables. La primera versión cubre Costa Rica (7 provincias) con un catálogo inicial curado de lugares. Las reservas y los pagos dentro de la plataforma quedan fuera de esta entrega: las fichas redirigen a enlaces oficiales de los proveedores. La disponibilidad y los precios no se inventan; cada dato indica su fuente y su estado de verificación.
2. Desarrollo
2.1 Descripción general de la solución
El sistema se compone de un frontend en React que consume una API REST propia construida con Node.js y Express, organizada por capas, conectada a una base de datos relacional PostgreSQL con extensión geoespacial PostGIS. Desde la capa de servicios, el backend consume APIs externas y ejecuta los agentes de IA. Tres workflows de n8n replican procesos del sistema (onboarding, tipo de cambio y eliminación de datos). Toda acción sensible se registra en bitácoras.
2.2 Roles del sistema
Rol
Descripción
Permisos principales (validados en el backend)
Viajero (cliente)
Usuario final registrado
Explorar, favoritos, reseñas, viajes, pasaporte, amigos, fotos, agentes de viajero, gestión de su cuenta y baja
Negocio (colaborador)
Dueño o gestor de un establecimiento
Reclamar y editar su ficha (con aprobación), ver estadísticas agregadas, responder reseñas
Moderador/Editor (colaborador)
Revisa contenido y datos
Aprobar o rechazar reseñas, atender reportes, aprobar cambios de fichas, usar agentes de moderación
Administrador
Gestiona la plataforma
Usuarios y roles, lugares, reglas de insignias, configuración, acceso a todos los agentes y reportes
Auditor
Control de gobernanza
Solo lectura de bitácoras de agentes e integraciones, consentimientos y solicitudes de eliminación

Una cuenta tiene un rol principal. Todas las rutas del backend verifican el rol; ocultar botones en React es solo experiencia de usuario, no seguridad.
2.3 Módulos
Código
Módulo
Contenido
M1
Cuentas y autenticación
Registro, login, recuperación de contraseña, perfil, sesión, consentimientos
M2
Lugares y mapa
Catálogo, filtros, fichas, accesibilidad con procedencia, favoritos, reportes de corrección
M3
Reseñas y moderación
Reseñas con criterios, reportes, bloqueo y revisión
M4
Pasaporte
Visitas autorregistradas, sellos, insignias por reglas configurables
M5
Social
Avatar, amigos, privacidad, fotos en lugares
M6
Viajes
Viaje básico con paradas y fechas, presupuesto, equipaje
M7
Negocios
Reclamar ficha con validación de identificación, edición con historial
M8
Agentes de IA
Servicio base y 8 agentes con control de rol y bitácora
M9
Integraciones y automatización
APIs externas y workflows de n8n
M10
Gobernanza y auditoría
Política de privacidad, términos, consentimientos, baja, panel del auditor
M11
Administración
Usuarios, roles, lugares, reglas y registros

2.4 Arquitectura y cómo se construirá
Stack (obligatorio del enunciado y decisiones propias):
Frontend: React con Vite, React Router y manejo de sesión con contexto. Estilos con CSS y variables del libro de marca.
Backend: Node.js con Express, por capas.
Base de datos: PostgreSQL con PostGIS (SQL relacional, normalizado hasta 3FN), con consultas parametrizadas.
Seguridad: bcrypt y JWT.
Pruebas: Jest.
Automatización: n8n.
Control de versiones: Git y GitHub con ramas main, develop, feature/... y fix/..., e integración por pull requests.
Estructura del repositorio:
rutea/
├─ backend/
│  ├─ src/
│  │  ├─ server.js        # servidor Express, middlewares globales, rutas y errores
│  │  ├─ config/          # conexión a la BD y variables de entorno
│  │  ├─ models/          # acceso a las tablas
│  │  ├─ controllers/     # reciben la petición y devuelven la respuesta
│  │  ├─ routes/          # endpoints y middlewares de cada ruta
│  │  ├─ middlewares/     # validación, JWT, roles, errores, límites
│  │  └─ services/        # lógica de negocio, APIs externas y agentes
│  │     └─ agents/       # servicio base + un archivo por agente
│  ├─ tests/              # pruebas Jest
│  └─ .env / .env.example
├─ frontend/              # React (Vite)
├─ database/              # schema.sql, seed.sql, diagrama ER, diccionario
├─ n8n/                   # workflows exportados (.json) y su descripción
├─ docs/                  # anteproyecto, agentes, APIs
└─ README.md
Recorrido de una petición: React llama a la ruta; pasan los middlewares en orden (validación de entrada, verificación del JWT, verificación del rol); el controlador invoca un service; el service usa los modelos y, si hace falta, una API externa o un agente; la respuesta vuelve con un código HTTP adecuado. Los errores se manejan en un middleware central.
Seguridad y autorización:
Las contraseñas se guardan solo como hash bcrypt. Nunca en texto plano.
El JWT se firma con un secreto guardado en .env, tiene expiración y contiene solo el identificador y el rol. React maneja la expiración cerrando sesión y redirigiendo al login.
Un middleware de roles protege cada ruta del backend. Las reglas sociales (quién ve un pasaporte o una foto) se resuelven en el servidor: la ruta verifica el JWT y un service de privacidad decide según la visibilidad elegida y la amistad aceptada; si no se cumple, responde 403.
Todas las credenciales (base de datos, JWT, IA, APIs, correo) viven en .env, que no se sube a GitHub. El repositorio incluye .env.example solo con los nombres.
Límite de peticiones en login y agentes, y encabezados de seguridad.
Archivos y fotos: se validan tipo y tamaño, se renombran, se eliminan los metadatos EXIF (que pueden traer la ubicación exacta) y se sirven con control de acceso según la visibilidad de cada foto.
Infraestructura de agentes: un servicio base recibe el agente, el usuario y la entrada; verifica que el rol pueda usarlo; minimiza los datos personales antes de enviarlos al proveedor de IA; llama al proveedor; valida la salida; registra la ejecución en ai_agent_runs (agente, usuario, fecha, estado, duración, resumen de entrada y salida) y devuelve el resultado. Cada agente es un archivo delgado con su prompt, entradas y salidas, lo que evita repetir lógica.
Pruebas: Jest cubre los middlewares de validación y de autenticación, la verificación de roles, los controladores principales, las reglas de privacidad social y los services (incluidos agentes e integraciones, simulando las respuestas externas). Se ejecutan con un solo comando, npm test, documentado en el README.
2.5 Entidades principales
El modelo completo se detalla en el Anexo A. Grupos de entidades:
Seguridad: users, roles, password_resets.
Lugares: provinces, places, place_categories, place_category_links, place_sources, place_prices, place_opening_hours, accessibility_features, place_accessibility, accessibility_evidence.
Comunidad: favorites, reviews, moderation_reports.
Pasaporte: visits, stamps, achievements, achievement_rules, user_achievements.
Social: friendships, user_blocks, privacy_settings, place_photos, y el campo avatar_config del perfil.
Viajes: trips, itinerary_items, trip_expenses, packing_lists, packing_items.
Negocios: businesses, business_claims.
IA e integraciones: ai_agents, ai_agent_runs, integration_logs, exchange_rates, knowledge_documents.
Gobernanza: policy_versions, terms_acceptances, consents, deletion_requests, audit_logs.
2.6 Agentes de IA
Se implementan ocho agentes en services/agents, accesibles desde el frontend según el rol (documentación completa en el Anexo B):
Pregúntale a Rutea (conversacional con RAG): responde sobre cultura y fichas citando las fuentes recuperadas.
Planificador de itinerarios: propone paradas según días, presupuesto y necesidades. El orden y la cercanía los calcula el backend con SQL espacial; la IA redacta y ajusta.
Asistente de accesibilidad: traduce necesidades a filtros y explica evidencia, fecha y confianza.
Maleta y clima: arma el equipaje según el pronóstico y las actividades.
Presupuesto y gastos: clasifica gastos, compara estimado contra real y convierte con el tipo de cambio.
Moderador de reseñas: detecta spam, ofensas y publicidad encubierta; la decisión final es humana.
Recuerdos y diario: resume el viaje a partir del itinerario, sellos y notas del usuario.
Cumplimiento y privacidad: revisa contenido público en busca de datos personales de terceros y apoya la auditoría.
2.7 APIs externas
Todas se consumen desde services, con manejo de errores y tiempos de espera, sin exponer credenciales al frontend.
API
Uso en Rutea
Estado
Banco Central de Costa Rica (indicadores económicos)
Tipo de cambio de compra y venta para presupuestos en colones y dólares
Requiere registrarse para obtener token
Ministerio de Hacienda
Validar la identificación de un negocio al reclamar su ficha
Por confirmar condiciones de uso
Servicio de clima
Pronóstico para el equipaje y avisos del viaje
Proveedor por definir; verificar términos, límites y costo
Mapas y geocodificación
Mostrar el mapa y buscar direcciones
Proveedor por definir; verificar licencia de los mosaicos
Proveedor de modelos de IA
Funcionamiento de los agentes
Proveedor por definir

Si una API externa falla, el sistema muestra el último dato guardado e indica su fecha.
2.8 Workflows de n8n
Onboarding: al registrarse un usuario, el backend invoca un webhook; el workflow envía el correo de bienvenida, confirma el rol inicial y registra el consentimiento de términos.
Tipo de cambio diario: cada día consulta el tipo de cambio del BCCR, lo guarda en exchange_rates y envía un resumen por correo.
Eliminación de datos: recibe la solicitud de baja, verifica la confirmación de identidad, ejecuta la anonimización (cuenta, fotos, avatar y amistades), registra el resultado y notifica al usuario.
Opcional si sobra tiempo: un cuarto workflow que detecta fichas con datos vencidos y las envía a la cola de revisión del moderador. Cada workflow se exporta al repositorio con la descripción de su disparador, pasos y el problema que resuelve.
2.9 Gobernanza de datos
Se toma como referencia la Ley N.° 8968 de Protección de la Persona frente al Tratamiento de sus Datos Personales y los principios de consentimiento informado, finalidad y derechos de acceso, rectificación y supresión.
Política de privacidad: qué datos se recopilan y por qué medio, para qué se usan, con quién se comparten (incluidos proveedores de IA y APIs externas), cómo se protegen y por cuánto tiempo se conservan.
Términos y condiciones: uso aceptable, responsabilidad del usuario sobre las fotos que sube (incluidas las de terceros), uso de los agentes y limitaciones sobre las respuestas generadas por IA.
Consentimiento explícito en el registro, guardado con versión y fecha en terms_acceptances y consents.
Baja de la cuenta: opción en el perfil, confirmación de identidad, eliminación o anonimización conservando solo lo exigido por ley (con el motivo explicado), notificación y registro en deletion_requests.
Privacidad por defecto: el pasaporte y las fotos son privados al crear la cuenta; la ubicación precisa nunca es pública; los datos enviados a proveedores de IA se minimizan.
Auditoría: el rol Auditor consulta en solo lectura las bitácoras de agentes, integraciones, consentimientos y eliminaciones.
Edad mínima: se debe definir y validar con el profesor cómo se trata el registro de menores (ver decisiones pendientes).
2.10 Alcance por niveles
Para cumplir el mínimo del enunciado dentro del plazo, el desarrollo se organiza en tres niveles. No se avanza al siguiente hasta completar el anterior.
Nivel 1 (obligatorio): autenticación, roles, lugares con mapa y filtros, accesibilidad con procedencia, favoritos, reseñas, pasaporte con sellos e insignias, ocho agentes, APIs externas, tres workflows, gobernanza, pruebas, GitHub y documentación.
Nivel 2 (valor agregado): avatar, amigos, privacidad y fotos en lugares; viaje básico con presupuesto y equipaje; panel de negocio; puntaje de confianza que decae con el tiempo; cuarto workflow.
Visión futura (no se programa ahora): recompensas y cupones con QR, gastos divididos y votaciones en grupo, modo offline, álbumes multimedia pesados, rutas de la comunidad, internacionalización y API pública de accesibilidad. Se describen como hoja de ruta.
3. Objetivo general
Desarrollar una plataforma web full stack de turismo, cultura y accesibilidad para Costa Rica que permita descubrir lugares con información verificable, planificar viajes, registrar visitas en un pasaporte digital y compartirlas con amigos, integrando agentes de IA, APIs externas y automatizaciones de negocio, con seguridad y gobernanza de datos conformes a la Ley N.° 8968.
4. Objetivos específicos
Diseñar un modelo de datos relacional normalizado hasta tercera forma normal, con entidades de seguridad, de dominio, de agentes y de gobernanza, y sus scripts de creación y datos de prueba.
Implementar un backend en Node.js con Express organizado por capas, con autenticación mediante bcrypt y JWT, autorización por roles y validación de entradas, verificado con pruebas unitarias en Jest.
Desarrollar un frontend en React responsivo con login, registro, rutas protegidas según el rol, mapa con filtros, pasaporte digital y funciones sociales.
Integrar ocho agentes de IA y al menos una API externa real desde la capa de servicios, registrando cada ejecución en la base de datos.
Automatizar tres procesos del sistema mediante workflows de n8n exportados y documentados.
Incorporar gobernanza de datos con política de privacidad, términos y condiciones, consentimiento explícito, baja de cuenta con anonimización y bitácoras auditables.

5. Requerimientos del sistema
Los requisitos se codifican de forma única para mantener trazabilidad entre análisis, desarrollo, pruebas y demostración. La prioridad Alta representa lo necesario para el MVP y para cumplir el enunciado oficial; Media corresponde a valor agregado condicionado al avance real.
Código
Nombre
Descripción
Prioridad
Módulo
RF-01
Registro y consentimiento
Permitir el registro con nombre, correo y contraseña; requerir aceptación explícita de términos y política de privacidad.
Alta
M1
RF-02
Inicio de sesión
Permitir iniciar y cerrar sesión con JWT, mensajes claros y control de expiración.
Alta
M1
RF-03
Roles autorizados
Aplicar permisos de viajero, negocio, moderador, administrador y auditor en rutas del backend.
Alta
M1/M11
RF-04
Perfil y privacidad
Permitir editar perfil, preferencias y visibilidad de pasaporte y fotografías.
Alta
M1/M5
RF-05
Eliminar cuenta
Permitir solicitar baja, confirmar identidad y registrar la anonimización o eliminación correspondiente.
Alta
M10
RF-06
Explorar lugares
Listar el catálogo curado por provincia, categoría, costo y características de accesibilidad.
Alta
M2
RF-07
Ficha verificable
Mostrar fuente, fecha de revisión, nivel de confianza y estado de cada dato relevante del lugar.
Alta
M2
RF-08
Favoritos
Permitir guardar y quitar lugares favoritos del usuario autenticado.
Alta
M2
RF-09
Reportar corrección
Permitir reportar datos desactualizados de una ficha para revisión humana.
Media
M2/M3
RF-10
Reseñas
Permitir publicar reseñas asociadas a un lugar y reportarlas para moderación.
Alta
M3
RF-11
Moderación
Permitir aprobar, rechazar o ocultar reseñas y conservar el registro de la decisión.
Alta
M3/M11
RF-12
Visitas
Permitir registrar una visita autorreportada sin exponer ubicación precisa de forma pública.
Alta
M4
RF-13
Insignias
Desbloquear sellos e insignias con reglas configurables y verificables.
Alta
M4
RF-14
Viaje básico
Crear un viaje con fechas, paradas y presupuesto estimado.
Media
M6
RF-15
Ficha de negocio
Permitir a un negocio solicitar cambios en su ficha, sujetos a aprobación.
Media
M7
RF-16
Agentes de IA
Permitir utilizar ocho agentes según rol y registrar cada ejecución en la base de datos.
Alta
M8
RF-17
Tipo de cambio
Consultar y mostrar el último tipo de cambio disponible con fecha y fuente.
Alta
M9
RF-18
Clima
Consultar pronóstico para una fecha y destino desde la capa de servicios.
Media
M9
RF-19
Workflows n8n
Ejecutar onboarding, actualización de tipo de cambio y eliminación de datos mediante tres workflows.
Alta
M9
RF-20
Administración
Permitir gestionar lugares, roles, reglas de insignias y registros de auditoría.
Alta
M11


5.1 Requerimientos no funcionales
Código
Criterio
Descripción
Prioridad
Área
RNF-01
Seguridad
Las contraseñas se almacenan exclusivamente como hash bcrypt; nunca se persisten en texto plano.
Alta
M1
RNF-02
Sesión
Los JWT usan secreto en .env, expiración definida y contienen únicamente identidad y rol mínimos.
Alta
M1
RNF-03
Autorización
Cada endpoint protegido valida JWT y rol en el backend; la interfaz no es la única barrera.
Alta
Transversal
RNF-04
Validación
Toda entrada se valida por tipo, longitud y formato antes de alcanzar controladores o servicios.
Alta
Transversal
RNF-05
Protección de datos
La ubicación precisa, pasaporte y fotografías son privados por defecto; existe consentimiento y baja de cuenta.
Alta
M5/M10
RNF-06
Accesibilidad
La interfaz ofrece contraste suficiente, navegación por teclado, etiquetas semánticas y diseño responsivo.
Alta
Frontend
RNF-07
Rendimiento
Las consultas de catálogo usan índices; las APIs externas aplican timeout, caché del último dato y manejo de error.
Media
M2/M9
RNF-08
Disponibilidad
El sistema publicado debe estar disponible en una URL HTTPS pública y mostrar estados de carga y error.
Alta
Producción
RNF-09
Mantenibilidad
El backend se separa en rutas, controladores, modelos, middlewares y services; cada agente es modular.
Alta
Backend
RNF-10
Auditoría
Las acciones sensibles y ejecuciones de IA e integraciones registran fecha, usuario, resultado y contexto mínimo.
Alta
M8/M10
RNF-11
Contenido
Los datos turísticos muestran procedencia y fecha; un dato ausente se representa como desconocido.
Alta
M2
RNF-12
Pruebas
Las pruebas unitarias se ejecutan con npm test y simulan proveedores externos.
Alta
Tests



6. Historias de usuario y aceptación
Las historias priorizan un recorrido demostrable: registrarse, explorar información verificable, planificar, registrar experiencia y administrar la calidad del catálogo.
Código
Historia
Criterios de aceptación
Estimación
Trazabilidad
HU-01
Como viajero, quiero crear mi cuenta y aceptar la política de privacidad, para usar Rutea con control sobre mis datos.
Se valida el correo; se aplica bcrypt; se guarda versión y fecha del consentimiento; no se permite continuar sin aceptación.
Alta · 5 pts
RF-01, RNF-01, RNF-05
HU-02
Como viajero, quiero iniciar sesión, para ver mis favoritos y pasaporte.
El JWT expira; rutas privadas rechazan una sesión inválida; la interfaz informa errores sin revelar datos sensibles.
Alta · 3 pts
RF-02, RNF-02
HU-03
Como viajero, quiero filtrar lugares por provincia, categoría, costo y accesibilidad, para elegir una experiencia adecuada.
Los filtros devuelven resultados reales del catálogo; cada filtro aplica simultáneamente; sin dato de accesibilidad se muestra desconocido.
Alta · 5 pts
RF-06, RNF-11
HU-04
Como viajero, quiero consultar una ficha con fuente y fecha, para decidir con información confiable.
La ficha muestra estado, fuente y fecha; los precios no verificados no se presentan como confirmados.
Alta · 3 pts
RF-07, RNF-11
HU-05
Como viajero, quiero guardar un lugar como favorito, para revisarlo después.
Solo el propietario puede ver y modificar sus favoritos; no se duplican registros.
Alta · 2 pts
RF-08, RNF-03
HU-06
Como viajero, quiero registrar una visita, para obtener sellos en mi pasaporte.
La visita pertenece al usuario; no hace pública una ubicación precisa; una regla válida desbloquea la insignia correspondiente.
Alta · 5 pts
RF-12, RF-13, RNF-05
HU-07
Como viajero, quiero pedir ayuda al planificador, para obtener una propuesta de viaje acorde a mis preferencias.
El agente registra la ejecución; no inventa disponibilidad; informa fuentes de lugares usados y permite ajustar la propuesta.
Alta · 5 pts
RF-16, RNF-10
HU-08
Como viajero, quiero consultar el clima y tipo de cambio, para preparar mi presupuesto y equipaje.
Las integraciones se consumen desde el backend; ante fallo se muestra el último dato con fecha o un mensaje claro.
Alta · 3 pts
RF-17, RF-18, RNF-07
HU-09
Como viajero, quiero solicitar eliminación de mi cuenta, para ejercer control sobre mis datos.
Se confirma identidad; se registra solicitud; el workflow procesa anonimización y envía resultado.
Alta · 5 pts
RF-05, RF-19, RNF-05
HU-10
Como moderador, quiero revisar una reseña reportada, para proteger la calidad de la comunidad.
Puede aprobar, rechazar u ocultar; se registra decisión y motivo; el agente solo recomienda, no decide por sí mismo.
Alta · 3 pts
RF-10, RF-11, RF-16
HU-11
Como administrador, quiero gestionar lugares y reglas de insignias, para mantener vigente el catálogo.
Las rutas exigen rol administrador; cada cambio sensible queda en audit_logs.
Alta · 5 pts
RF-20, RNF-03, RNF-10
HU-12
Como negocio, quiero solicitar una corrección en mi ficha, para mantener actualizada la información pública.
La solicitud no modifica datos publicados sin aprobación; se conserva historial de revisión.
Media · 3 pts
RF-15, RNF-11



7. Libro de marca RUTEA
RUTEA es una marca turística digital que acompaña a las personas antes, durante y después de un viaje. Su propuesta se apoya en la exploración responsable, la inclusión y la confianza en la información.
Elemento
Definición
Misión
Facilitar experiencias turísticas en Costa Rica mediante información verificable, planificación personalizada y herramientas accesibles.
Visión
Ser una referencia digital de turismo responsable e inclusivo en Costa Rica, preparada para crecer hacia otros destinos.
Valores
Confianza, inclusión, curiosidad, respeto cultural, privacidad y sostenibilidad.
Público
Viajeros nacionales e internacionales, familias, personas con necesidades de accesibilidad, personas con restricciones alimentarias y negocios turísticos locales.
Personalidad
Cercana, clara, optimista, informada y respetuosa. Nunca promete certezas sin evidencia.
Tono de voz
Usar frases directas y útiles: 'Revisa la fuente', 'Planifica a tu ritmo'. Evitar alarmismo, estereotipos y afirmaciones absolutas como 'totalmente accesible'.


7.1 Identidad visual
Elemento
Especificación
Logotipo principal
RUTEA en mayúsculas, con una ruta ascendente integrada como detalle de la letra R. Uso preferente en azul profundo sobre fondo claro.
Isotipo
Pin de mapa simplificado que contiene una curva de ruta; funciona como favicon y avatar de aplicación.
Versión negativa
Logotipo e isotipo en blanco sobre azul profundo. No utilizar sobre fotografías con poco contraste.
Área de protección
Dejar alrededor del logo un espacio libre equivalente a la altura de la letra U. No colocar texto, bordes ni otros logotipos dentro de esta zona.
Tamaño mínimo
Digital: 120 px para el logotipo completo y 24 px para el isotipo. Impreso: 30 mm y 8 mm, respectivamente.
Usos incorrectos
No deformar, girar, cambiar los colores definidos, agregar sombras, usar fondos saturados sin contraste ni separar el isotipo del nombre en el logotipo principal.


Color
HEX
RGB
CMYK aproximado
Uso
Azul Ruta
#0B2A4A
11, 42, 74
85, 43, 0, 71
Color principal, navegación y textos de alto contraste.
Turquesa Vivo
#12A8A8
18, 168, 168
89, 0, 0, 34
Acciones principales, rutas y estados positivos.
Arena Clara
#F5F0E6
245, 240, 230
0, 2, 6, 4
Fondo cálido secundario y superficies.
Verde Bosque
#2E6B4B
46, 107, 75
57, 0, 30, 58
Naturaleza, sostenibilidad y etiquetas complementarias.
Carbón
#1D252C
29, 37, 44
34, 16, 0, 83
Texto principal y contraste.


Tipografía: usar Poppins para títulos y botones (semibold o bold) e Inter para texto corrido (regular, medium y semibold). La iconografía será lineal, redondeada y de grosor uniforme; las fotografías mostrarán naturaleza, cultura y personas desde una perspectiva realista, diversa y respetuosa.

8. Plan de mockups y pantallas
Los mockups incluidos en el Anexo E representan las pantallas principales en versión de computadora y celular. Aplican la identidad visual de RUTEA y contemplan estados de navegación, información y acciones principales.
ID
Pantalla
Contenido esencial
Formato
Relacionada
P01
Inicio y exploración
Buscador, categorías, lugares destacados, aviso de fuente
Escritorio y móvil
HU-03, HU-04
P02
Login, registro y recuperación
Validaciones, consentimiento y mensajes de error
Escritorio y móvil
HU-01, HU-02
P03
Mapa y filtros
Mapa, provincias, categorías, costo y accesibilidad
Escritorio y móvil
HU-03
P04
Ficha de lugar
Fuente, fecha, accesibilidad, favoritos, reseñas y reporte
Escritorio y móvil
HU-04, HU-05
P05
Pasaporte
Visitas, sellos, insignias y visibilidad
Escritorio y móvil
HU-06
P06
Agentes Rutea
Selector, formulario de entrada, respuesta, fuentes y aviso de IA
Escritorio y móvil
HU-07
P07
Viaje y presupuesto
Fechas, paradas, clima, tipo de cambio y gastos
Escritorio y móvil
HU-08
P08
Perfil y privacidad
Datos, consentimientos, preferencias y eliminación de cuenta
Escritorio y móvil
HU-09
P09
Moderación
Cola de reseñas, decisión, motivo y evidencia
Escritorio
HU-10
P10
Administración
Gestión de lugares, roles, insignias y auditoría
Escritorio
HU-11
P11
Solicitud de negocio
Reclamo de ficha, datos y estado de revisión
Escritorio y móvil
HU-12
P12
Legales
Política, términos y confirmación de baja
Escritorio y móvil
RNF-05


Wireframe de navegación: Inicio → Explorar → Ficha de lugar → Favoritos o Viaje → Pasaporte. El menú autenticado agrega Agentes y Perfil; las opciones administrativas solo aparecen a roles autorizados, pero todas las restricciones se validan nuevamente en el backend.

9. Cronograma de trabajo
El cronograma asigna bloques diarios, responsables y entregables. Bianca controla experiencia visual, mockups, frontend y documentación; Aiden controla backend, base de datos, integraciones y n8n; las tareas marcadas como Ambos requieren revisión y ejecución conjunta.
Fecha
Día
Actividad
RF / HU
Entregable
Estado
Responsable
20/11/2026
Viernes
Cerrar alcance MVP, marca y estructura del anteproyecto
RF-01 a RF-20
Anteproyecto v1
Planificado
Ambos
21/11/2026
Sábado
Requisitos, historias y diseño del modelo ER
RF-01 a RF-13; HU-01 a HU-06
Matriz y ER
Planificado
Aiden
22/11/2026
Domingo
Mockups principales y diseño responsive
P01 a P08
Archivo de diseño
Planificado
Bianca
23/11/2026
Lunes
Inicializar repositorio, ramas y base del frontend/backend
RNF-09
Repositorios y README
Planificado
Aiden
24/11/2026
Martes
Schema SQL, seed y conexión PostgreSQL
RF-03, RF-06
schema.sql y seed.sql
Planificado
Aiden
25/11/2026
Miércoles
Registro, bcrypt, JWT y roles
RF-01 a RF-03
feature/auth
Planificado
Aiden
26/11/2026
Jueves
Rutas protegidas, validaciones y pruebas de auth
RNF-02 a RNF-04
Tests auth
Planificado
Aiden
27/11/2026
Viernes
Catálogo, filtros y fichas verificables
RF-06, RF-07
feature/places
Planificado
Ambos
28/11/2026
Sábado
Favoritos, reseñas y panel de moderación inicial
RF-08, RF-10, RF-11
feature/community
Planificado
Ambos
29/11/2026
Domingo
Pasaporte, visitas e insignias
RF-12, RF-13
feature/passport
Planificado
Ambos
30/11/2026
Lunes
API de tipo de cambio, clima y bitácoras
RF-17, RF-18
feature/integrations
Planificado
Aiden
01/12/2026
Martes
Servicio base de IA y primeros cuatro agentes
RF-16
feature/agents-core
Planificado
Aiden
02/12/2026
Miércoles
Resto de agentes, pruebas y demo del avance
RF-16, RNF-12
Demo preparada
Planificado
Ambos
03/12/2026
Jueves
Primer avance ante el profesor
Según avance
Presentación
Hito
Ambos
04–06/12/2026
Viernes–Domingo
n8n, gobernanza, baja de cuenta y pantallas legales
RF-05, RF-19
Workflows y legales
Planificado
Ambos
07–08/12/2026
Lunes–Martes
Pruebas integrales, correcciones y documentación
RNF-01 a RNF-12
npm test y README
Planificado
Ambos
09/12/2026
Miércoles
Segundo avance ante el profesor
Según avance
Presentación
Hito
Ambos
10–19/12/2026
Jueves–Sábado
Despliegue, plan de producción, capturas y ensayo de presentación empresarial
Producción
URL pública y demo
Planificado
Ambos



10. Complemento de arquitectura y anexos requeridos
10.1 Diagrama lógico de producción
Usuario → React (Vite) → API REST Node.js y Express → PostgreSQL con PostGIS. La API aplica validación, JWT y roles antes de invocar services. Los services consumen proveedores de IA, clima, BCCR, mapas y webhooks de n8n. PostgreSQL conserva datos del dominio, consentimientos, bitácoras, ejecuciones de IA e integraciones. n8n procesa onboarding, tipo de cambio y eliminación. Esta arquitectura se representará como diagrama visual en el plan de producción.
10.2 Diccionario de datos mínimo
Tabla
Propósito
Campos clave
users
Identidad y estado de cuenta
id, name, email, password_hash, role_id, created_at
roles
Catálogo de permisos
id, code, name
places
Lugar turístico verificable
id, province_id, name, location, status, updated_at
place_sources
Procedencia y confianza de datos
id, place_id, source_url, verified_at, confidence
place_accessibility
Características de accesibilidad
id, place_id, feature_id, value, evidence_id
reviews
Reseñas moderables
id, user_id, place_id, rating, text, status
visits
Visitas autorreportadas
id, user_id, place_id, visited_at, privacy
user_achievements
Insignias obtenidas
id, user_id, achievement_id, earned_at
ai_agent_runs
Bitácora de agentes
id, agent_id, user_id, status, duration_ms, created_at
consents
Consentimientos versionados
id, user_id, policy_version_id, accepted_at
deletion_requests
Bajas y anonimización
id, user_id, status, requested_at, completed_at
audit_logs
Auditoría de acciones sensibles
id, actor_id, action, entity, entity_id, created_at


10.3 Evidencia final solicitada
El repositorio incluirá schema.sql, seed.sql, el diagrama ER, diccionario de datos, .env.example, pruebas Jest, tres exportaciones JSON de n8n, documentación de agentes y APIs, README y las URLs públicas. La entrega de producción añadirá capturas de funcionamiento en escritorio y móvil, HTTPS, rutas protegidas, agentes, APIs, workflows, privacidad, términos y eliminación de cuenta.

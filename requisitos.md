1. Descripción general
El proyecto final del programa FWD Costa Rica consiste en el diseño, desarrollo y presentación de un sistema
web full stack completo, que integre un frontend, un backend, una base de datos relacional, agentes de
inteligencia artificial, consumo de APIs externas y automatizaciones de negocio. El objetivo es que cada
estudiante demuestre que puede construir una solución profesional, segura y mantenible, aplicando las buenas
prácticas vistas a lo largo del programa.
El tema o giro de negocio del sistema es de libre elección (por ejemplo: una pyme comercial, una clínica, un
despacho contable, una institución educativa o una intranet empresarial), siempre que permita cumplir con
todos los requerimientos descritos en este documento.
Importante: este documento describe qué debe construirse y qué se evaluará. No incluye código: las decisiones de
implementación son parte del trabajo del estudiante.

FWD Costa Rica - Proyecto Final Full Stack

Página 2

2. Anteproyecto
Antes del desarrollo, cada estudiante debe elaborar un anteproyecto: un trabajo escrito que define, justifica y
planifica el sistema que va a construir. Puede entregarse en formato PDF o Word.
2.1 Estructura del documento escrito
Apartado Contenido esperado
Portada Nombre del proyecto, nombre del estudiante, programa, grupo, profesor y fecha.
Índice Tabla de contenidos con la numeración de cada apartado.
Introducción Presentación del proyecto, el contexto del negocio, el problema que se busca resolver y a

quién va dirigido el sistema.

Desarrollo Descripción detallada de la solución: módulos del sistema, roles, entidades, agentes de IA,

APIs externas, workflows de n8n y cómo se relacionan entre sí.
Objetivo general Un único enunciado que resuma qué se logrará con el sistema.
Objetivos específicos Entre tres y seis objetivos concretos y medibles que, en conjunto, permitan cumplir el

objetivo general.

Requerimientos Requerimientos funcionales y no funcionales, codificados (ver 2.4).
Historias de usuario Historias codificadas con sus criterios de aceptación (ver 2.5).
Mockups Todas las pantallas del sistema (ver 2.2).
Libro de marca Identidad visual completa del proyecto (ver 2.3).
Cronograma Tabla con fechas y días de trabajo (ver 2.6).
Los objetivos deben redactarse iniciando con un verbo en infinitivo (por ejemplo: desarrollar, implementar,
integrar, automatizar). El objetivo general responde al qué y los específicos al cómo.
2.2 Mockups del sistema
El anteproyecto debe contener todos los mockups del sistema, no solo algunas pantallas. Como mínimo:
• Login, registro (o registro interno en caso de intranet) y recuperación de contraseña.
• Panel principal o dashboard de cada rol del sistema.
• Pantallas de cada módulo y de cada uno de los agentes de IA.
• Pantallas donde se muestre información de APIs externas (por ejemplo, el tipo de cambio).
• Perfil de usuario, política de privacidad, términos y condiciones y el flujo de eliminación de cuenta.
• Versión de escritorio y versión móvil de las pantallas principales.
Los mockups pueden elaborarse en Figma, Canva, Penpot u otra herramienta de diseño, y deben aplicar los
colores, tipografías y logotipo definidos en el libro de marca.

FWD Costa Rica - Proyecto Final Full Stack

Página 3

2.3 Libro de marca
El estudiante debe generar un libro de marca (manual de identidad) para su proyecto, que cumpla con todos
los elementos que lo constituyen. Se recomienda utilizar el libro de marca de FWD Costa Rica como guía de
referencia para su estructura y nivel de detalle.
Elemento Qué debe incluir
Concepto de marca Nombre, misión, visión, valores, público objetivo y personalidad de la marca.
Logotipo Versión principal, versiones secundarias, isotipo o imagotipo y versiones en positivo y

negativo.

Construcción y área de
protección

Retícula de construcción del logo y el espacio libre mínimo que debe rodearlo.

Tamaños mínimos Tamaño mínimo de reproducción en pantalla y en impresión.
Paleta de colores Colores primarios y secundarios con sus códigos HEX, RGB y CMYK.
Tipografía Familias tipográficas principal y secundaria, pesos y jerarquía (títulos, subtítulos y texto).
Iconografía y elementos
gráficos

Estilo de íconos, formas, patrones o texturas propias de la marca.
Fotografía e imágenes Estilo visual de las imágenes que acompañan la marca.
Tono de voz Cómo se comunica la marca: formal o cercana, palabras recomendadas y a evitar.
Usos incorrectos Ejemplos de lo que no se debe hacer con el logo (deformarlo, cambiar colores, fondos

inadecuados).

Aplicaciones Ejemplos de la marca aplicada: sitio web, favicon, redes sociales, papelería y firma de

correo.

2.4 Requerimientos funcionales y no funcionales
Todos los requerimientos deben estar correctamente numerados por código, de forma única y consecutiva,
para poder referenciarlos durante el desarrollo, las pruebas y la evaluación.
Tipo Código Ejemplo de redacción
Requerimiento funcional: qué hace
el sistema

RF-01, RF-02... RF-01: El sistema debe permitir que un usuario se registre

con nombre, correo y contraseña.

Requerimiento no funcional: cómo
lo hace (calidad, seguridad,
rendimiento)

RNF-01 (o RN-01),
RNF-02...

RNF-01: Las contraseñas deben almacenarse encriptadas
con bcrypt.

Cada requerimiento debe indicar, como mínimo: código, nombre, descripción, prioridad (alta, media o baja) y el
rol o módulo al que pertenece. Los requerimientos no funcionales deben abarcar seguridad, rendimiento,
usabilidad, disponibilidad, mantenibilidad y protección de datos personales.

FWD Costa Rica - Proyecto Final Full Stack

Página 4

2.5 Historias de usuario
Las historias de usuario también deben numerarse por código (HU-01, HU-02...) y seguir el formato: Como [rol],
quiero [acción], para [beneficio]. Cada historia debe incluir:
Campo Ejemplo
Código HU-03
Historia Como contador, quiero que el sistema lea las facturas que llegan a mi correo, para no

digitarlas manualmente.

Criterios de aceptación Se extraen emisor, fecha, subtotal, impuestos y total; la factura queda registrada; se

notifica si un adjunto no se pudo leer.
Prioridad y estimación Alta - 5 puntos o su equivalente en horas.
Requerimientos relacionados RF-08, RNF-04
2.6 Cronograma y avances
El anteproyecto debe incluir una tabla de cronograma que marque las fechas y los días de trabajo que el
estudiante dedicará a cada actividad, organizada en función de los dos avances obligatorios:
Avance Fecha Día
Primer avance 3 de diciembre de 2026 Jueves
Segundo avance 9 de diciembre de 2026 Miércoles
La tabla de cronograma del estudiante debe contener, como mínimo, las siguientes columnas. A continuación
se muestra un ejemplo de su estructura:
Fecha Día Actividad Requerimientos /

HU

Entregable Estado
30/11/2026 Lunes Modelado de la base de datos RF-01 a RF-04 Diagrama ER Completado
01/12/2026 Martes Autenticación con JWT y bcrypt HU-01, RNF-01 Rama
feature/auth

En proceso

03/12/2026 Jueves Primer avance Según lo
planificado

Presentación al
profesor

Pendiente

09/12/2026 Miércoles Segundo avance Según lo
planificado

Presentación al
profesor

Pendiente

Cada fila debe corresponder a un día o bloque de trabajo real. El cronograma se utilizará para comparar lo
planificado con lo presentado en cada avance.

FWD Costa Rica - Proyecto Final Full Stack

Página 5

3. Stack tecnológico obligatorio
Capa Tecnología requerida Observaciones
Frontend (FE) React Consumo del backend propio, manejo de sesión y vistas según rol.
Backend (BE) Node.js con Express API organizada por capas: rutas, controladores, modelos,

middlewares y services.

Base de datos MySQL u otro motor SQL

relacional

Se aceptan alternativas como PostgreSQL, MariaDB o SQL Server.
No se aceptan bases NoSQL como base principal.
Seguridad bcrypt y JWT Encriptación de contraseñas y autenticación por token.
Pruebas Jest u otra herramienta
equivalente

Pruebas unitarias sobre la lógica principal del sistema.
Automatización n8n Tres workflows que repliquen procesos del sistema.
Control de
versiones

Git y GitHub Uso obligatorio de ramas.

Si el estudiante desea utilizar una tecnología diferente a React o Node.js, debe conversarlo y obtener la
aprobación de su profesor antes de comenzar el desarrollo.

4. Base de datos y modelado de entidades
El sistema debe conectarse a una base de datos SQL relacional. Antes de programar, el estudiante debe realizar
el análisis del dominio e identificar todas las entidades del sistema, sus atributos y las relaciones entre ellas.
Se espera como mínimo:
• Un diagrama entidad-relación que muestre entidades, atributos, llaves primarias, llaves foráneas y
cardinalidades (1:1, 1:N, N:M).
• Un diccionario de datos que describa cada tabla, el tipo de dato de cada campo y su propósito.
• Un modelo normalizado (al menos hasta tercera forma normal), evitando datos duplicados
innecesariamente.
• Las entidades de seguridad necesarias: usuarios, roles y la relación entre ambos.
• Entidades que registren la actividad de los agentes de IA y de las integraciones (por ejemplo, historial de
ejecuciones o bitácoras).
• Entidades de gobernanza: aceptación de términos y políticas, consentimientos y solicitudes de eliminación
de datos.
• Scripts de creación de la base y datos de prueba (seed) incluidos en el repositorio.

FWD Costa Rica - Proyecto Final Full Stack

Página 6

5. Seguridad, autenticación y autorización
5.1 Encriptación con bcrypt
Ninguna contraseña puede almacenarse en texto plano. Todas deben guardarse como hash generado con
bcrypt, y la verificación en el inicio de sesión debe hacerse comparando contra ese hash.
5.2 Configuración de JWT
Al iniciar sesión correctamente, el backend debe emitir un JSON Web Token firmado con una clave secreta
almacenada en el archivo .env. El token debe tener un tiempo de expiración definido e incluir la información
mínima necesaria para identificar al usuario y su rol. Nunca debe contener información sensible como
contraseñas.
5.3 Acceso y autorización por roles
El sistema debe definir roles (por ejemplo: administrador, colaborador, cliente o auditor) y controlar dos
aspectos distintos:
• Acceso: qué pantallas y opciones ve cada usuario en el frontend según su rol.
• Autorización: qué rutas del backend puede consumir cada rol. Esta validación es obligatoria en el servidor;
ocultar botones en el frontend no se considera seguridad suficiente.
Ejemplo de rol Permisos sugeridos
Administrador Gestión de usuarios y roles, configuración del sistema, acceso a todos los agentes y reportes.
Colaborador Uso de los agentes relacionados con su área y gestión de la información operativa.
Cliente / usuario final Consulta de su propia información, uso del agente conversacional y gestión de su cuenta.
Auditor Acceso de solo lectura a bitácoras y reportes de gobernanza.
6. Arquitectura del backend
El backend debe construirse sobre un servidor de Express y organizarse por capas, de forma que cada carpeta
tenga una responsabilidad clara. La estructura mínima esperada es la siguiente:
Carpeta / archivo Responsabilidad
Servidor de Express Punto de entrada: crea el servidor, registra middlewares globales, monta las rutas y maneja

errores.

config Conexión a la base de datos y configuración general a partir de las variables de entorno.
models Representación de las entidades y acceso a las tablas de la base de datos.
controllers Reciben la petición, invocan la lógica necesaria y devuelven la respuesta al cliente.
routes Definen los endpoints de la API y qué middlewares y controladores se ejecutan en cada uno.
middlewares Validación de datos de entrada, verificación del JWT, verificación de roles y manejo

centralizado de errores.

FWD Costa Rica - Proyecto Final Full Stack

Página 7

Carpeta / archivo Responsabilidad
services Lógica de negocio, integración con APIs externas y creación de los agentes de IA.
tests Pruebas unitarias del sistema.
.env Todas las credenciales y valores sensibles del sistema.
6.1 Middlewares de validación
Toda ruta que reciba datos debe validarlos antes de que lleguen al controlador: campos obligatorios, formatos
(correo, cédula, fechas), longitudes y tipos. Ante datos inválidos, el sistema debe responder con un código de
estado HTTP adecuado y un mensaje claro.
6.2 Manejo de credenciales con .env
Todas las credenciales deben vivir en un archivo .env, que no se sube a GitHub. En su lugar, el repositorio debe
incluir un archivo de ejemplo con los nombres de las variables y sin valores reales. Algunas variables esperadas:
Variable (ejemplo) Propósito
Datos de conexión a la base Host, puerto, usuario, contraseña y nombre de la base de datos.
Secreto y expiración de JWT Clave para firmar los tokens y su tiempo de vida.
Claves de modelos de IA Credenciales de los proveedores usados por los agentes.
Credenciales de APIs externas Por ejemplo, el token del servicio de indicadores del Banco Central.
Credenciales de correo Acceso a la cuenta de correo usada por el agente de facturas.
Puerto y entorno Puerto del servidor y entorno de ejecución (desarrollo o producción).
7. Agentes de inteligencia artificial
El sistema debe incluir al menos 8 agentes de IA, creados dentro de la carpeta services del backend y accesibles
desde el frontend según el rol del usuario. Cada agente debe tener un propósito de negocio claro, entradas y
salidas definidas, y dejar registro de su uso en la base de datos.

...

4. Opciones de alojamiento de referencia
La siguiente tabla es solo una guía. El estudiante puede usar cualquier otra plataforma, siempre que cumpla con
el requisito de la URL pública.
Componente Opciones con plan gratuito o de prueba Opciones de pago
Frontend Vercel, Netlify, Render (sitio estático),

Cloudflare Pages

Planes pagados de esas plataformas, AWS,
Azure, Google Cloud

Backend Render, Railway, Koyeb Railway, Fly.io, DigitalOcean, AWS, Azure,

Google Cloud, un VPS

Base de datos SQL Aiven, TiDB Cloud, Railway, Clever Cloud Amazon RDS, Azure Database, Google Cloud

SQL, DigitalOcean

n8n Instalación propia (self-hosted) en Render,
Railway o un VPS; prueba de n8n Cloud

n8n Cloud o instalación propia en un servidor
pagado

Las condiciones de los planes gratuitos cambian con frecuencia. El estudiante debe verificar en el sitio oficial de
cada proveedor sus límites actuales (horas de uso, memoria, almacenamiento, si el servicio se "duerme" por
inactividad) y mencionarlos en su plan.

FWD Costa Rica - Plan de Producción

Página 3

5. Estructura del plan de producción
El documento debe contener, como mínimo, los siguientes apartados:
# Apartado Contenido esperado
1 Portada e índice Nombre del proyecto, estudiante, grupo, profesor, fecha e índice.
2 Introducción Qué es el sistema y qué significa ponerlo en producción.
3 Objetivos Objetivo general y objetivos específicos del despliegue.
4 Arquitectura de producción Diagrama que muestre cómo se conectan el frontend, el backend, la base de datos,

n8n y los servicios externos, con el proveedor de cada uno.

5 Selección de proveedores Proveedor elegido para cada componente y justificación: costo, facilidad de uso,

límites, rendimiento y ubicación de los servidores.

6 Tabla comparativa Comparación de al menos dos alternativas por componente, explicando por qué se

eligió una.

7 Estimación de costos Costo mensual de cada servicio, aunque sea cero, y qué ocurriría si el sistema creciera.
8 Variables de entorno Listado de las variables necesarias en producción (solo nombres, nunca valores) y

dónde se configuran en cada plataforma.

9 Base de datos en
producción

Cómo se crean las tablas, cómo se cargan los datos iniciales y quién puede acceder.
10 Proceso de despliegue Pasos para publicar el sistema desde GitHub y cómo se despliega automáticamente al

actualizar la rama main.

11 Dominio y HTTPS URL pública final, dominio propio si lo hay, y confirmación de que el sitio usa HTTPS.
12 Seguridad Configuración de CORS, protección de credenciales, acceso a la base de datos y

manejo de los datos personales según la política de privacidad.

13 Respaldos Cada cuánto se respalda la base de datos, dónde se guardan los respaldos y cómo se

restauran.

14 Monitoreo y registros Cómo se revisan los errores y los logs, y cómo se sabe si el sistema está caído.
15 Plan de reversión Qué hacer si un despliegue falla: cómo volver a la versión anterior que funcionaba.
16 Pruebas posteriores Lista de pruebas realizadas sobre la URL pública (ver sección 6).
17 Limitaciones y riesgos Restricciones del plan elegido y cómo afectan al sistema.
18 Conclusiones Resultado del despliegue y aprendizajes.

FWD Costa Rica - Plan de Producción

Página 4

6. Pruebas sobre la URL pública
El plan debe demostrar, con capturas de pantalla, que el sistema funciona en producción. Como mínimo:
☐ El frontend carga correctamente desde la URL pública, en computadora y en celular.
☐ El registro y el inicio de sesión funcionan, y las contraseñas se guardan encriptadas.
☐ Las vistas y rutas protegidas responden según el rol del usuario.
☐ Los agentes de IA responden desde el entorno de producción.
☐ Las APIs externas (por ejemplo, el tipo de cambio) devuelven datos actualizados.
☐ Los tres workflows de n8n se ejecutan correctamente.
☐ Las páginas de política de privacidad, términos y condiciones y eliminación de cuenta están disponibles.
☐ El sitio usa HTTPS y no expone credenciales en el navegador.
7. Entregables
• Documento del plan de producción en PDF o Word, con todos los apartados de la sección 5.
• URL pública del frontend y URL de la API del backend, incluidas en la portada del documento y en el
README del repositorio.
• Diagrama de la arquitectura de producción.
• Capturas de pantalla de las pruebas realizadas sobre la URL pública.
• Credenciales de un usuario de prueba por cada rol, entregadas solo al profesor para la revisión del sistema.
Recordatorio: nunca se deben incluir contraseñas, tokens ni claves reales dentro del documento ni en el
repositorio. Solo se mencionan los nombres de las variables de entorno.
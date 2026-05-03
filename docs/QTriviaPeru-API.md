# QTriviaPeru API — Documentación

> API RESTful + WebSockets para integrar trivia multijugador en tiempo real.
> Versión: **v1.0** · Idioma: **Español (Perú)**

---

## Índice

1. [Introducción](#introducción)
2. [Base URL](#base-url)
3. [Autenticación](#autenticación)
4. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Juegos](#juegos)
   - [Admin](#admin)
5. [Ejemplos de uso](#ejemplos-de-uso)
6. [WebSockets](#websockets)
7. [Manejo de errores](#manejo-de-errores)
8. [Buenas prácticas](#buenas-prácticas)

---

## Introducción

La **QTriviaPeru API** es una API RESTful que permite a desarrolladores integrar funciones de trivia multijugador en tiempo real dentro de sus aplicaciones. Gestiona usuarios, salas de juego, preguntas y tableros de puntuación.

| Propiedad    | Valor           |
|--------------|-----------------|
| Protocolo    | HTTPS + WSS     |
| Auth         | JWT Bearer      |
| Formato      | JSON (UTF-8)    |
| Rate limit   | 60 req/min      |

---

## Base URL

```
Producción: https://api.qtriviaperu.com/v1
Sandbox:    https://sandbox.qtriviaperu.com/v1
```

> ⚠️ El entorno sandbox reinicia sus datos cada 24 horas.

---

## Autenticación

QTriviaPeru usa **JSON Web Tokens (JWT)**. El token se obtiene al iniciar sesión y tiene vigencia de **24 horas**.

### Obtener token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "ana@ejemplo.com",
  "password": "MiPassword123!"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400,
  "user": {
    "id": "usr_xyz789",
    "nombre": "Ana García",
    "email": "ana@ejemplo.com",
    "rol": "jugador"
  }
}
```

### Usar el token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Incluye este header en **todas** las peticiones a endpoints protegidos.

---

## Endpoints

### Auth

#### `POST /auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "password": "MiPassword123!",
  "pais": "PE"
}
```

**Respuesta `201`:**
```json
{
  "mensaje": "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
  "user_id": "usr_xyz789"
}
```

---

#### `POST /auth/login`
Inicia sesión y retorna un JWT.

**Body:** `{ "email": string, "password": string }`

**Respuesta `200`:** Ver sección [Autenticación](#autenticación).

---

#### `GET /auth/me` 🔒
Retorna el perfil del usuario autenticado.

**Respuesta `200`:**
```json
{
  "id": "usr_xyz789",
  "nombre": "Ana García",
  "email": "ana@ejemplo.com",
  "rol": "jugador",
  "puntos_totales": 1250,
  "nivel": 4,
  "insignias": ["primera_victoria", "racha_7_dias"],
  "creado_en": "2025-01-10T14:30:00Z"
}
```

---

### Juegos

#### `GET /juegos` 🔒
Lista los juegos disponibles.

**Query params:**

| Parámetro    | Tipo    | Descripción                                              |
|--------------|---------|----------------------------------------------------------|
| `categoria`  | string  | Filtra: `historia`, `ciencia`, `cultura`, `deporte`      |
| `estado`     | string  | `esperando`, `en_curso`, `finalizado`                    |
| `pagina`     | integer | Por defecto: `1`                                         |
| `por_pagina` | integer | Máx: `50`. Por defecto: `20`                             |

**Respuesta `200`:**
```json
{
  "datos": [
    {
      "id": "jgo_abc001",
      "titulo": "Trivia Perú: Historia",
      "categoria": "historia",
      "estado": "esperando",
      "jugadores_actuales": 3,
      "max_jugadores": 8,
      "dificultad": "intermedio",
      "inicia_en": "2025-01-15T20:00:00Z"
    }
  ],
  "total": 24,
  "pagina": 1,
  "por_pagina": 20
}
```

---

#### `GET /juegos/:id` 🔒
Detalle completo de un juego.

**Parámetros URL:**

| Parámetro | Tipo   | Descripción         |
|-----------|--------|---------------------|
| `id`      | string | ID único del juego  |

**Respuesta `200`:**
```json
{
  "id": "jgo_abc001",
  "titulo": "Trivia Perú: Historia",
  "descripcion": "Pon a prueba tus conocimientos sobre la historia del Perú.",
  "estado": "esperando",
  "jugadores": [
    { "id": "usr_xyz789", "nombre": "Ana García", "listo": true }
  ],
  "total_preguntas": 10,
  "tiempo_por_pregunta": 30,
  "puntos_por_correcta": 100
}
```

---

### Admin

> 🛡 Requieren token con rol `admin`.

#### `POST /admin/juegos` 🔒🛡
Crea un nuevo juego.

**Body:**
```json
{
  "titulo": "Trivia Lima: Arquitectura",
  "categoria": "cultura",
  "max_jugadores": 10,
  "total_preguntas": 15,
  "tiempo_por_pregunta": 20,
  "dificultad": "avanzado",
  "inicia_en": "2025-02-01T18:00:00Z",
  "es_publico": true
}
```

**Respuesta `201`:**
```json
{
  "id": "jgo_new999",
  "mensaje": "Juego creado exitosamente.",
  "url_sala": "wss://rt.qtriviaperu.com/sala/jgo_new999"
}
```

---

#### `POST /admin/preguntas` 🔒🛡
Agrega preguntas a un juego.

**Body:**
```json
{
  "juego_id": "jgo_new999",
  "preguntas": [
    {
      "texto": "¿En qué año se fundó la ciudad de Lima?",
      "opciones": ["1535", "1521", "1492", "1600"],
      "respuesta_correcta": 0,
      "explicacion": "Lima fue fundada el 18 de enero de 1535 por Francisco Pizarro.",
      "puntos": 150,
      "tiempo_segundos": 20
    }
  ]
}
```

**Respuesta `201`:**
```json
{
  "mensaje": "1 pregunta(s) agregadas correctamente.",
  "ids": ["prg_001"],
  "total_en_juego": 11
}
```

---

## Ejemplos de uso

### JavaScript — fetch

```javascript
// Login
const { token } = await fetch('https://api.qtriviaperu.com/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ana@ejemplo.com', password: 'MiPassword123!' })
}).then(r => r.json());

// Obtener juegos
const { datos } = await fetch('https://api.qtriviaperu.com/v1/juegos', {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());
```

### JavaScript — axios

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'https://api.qtriviaperu.com/v1' });
API.interceptors.request.use(config => {
  const token = sessionStorage.getItem('qtp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const { data } = await API.post('/auth/login', { email, password });
sessionStorage.setItem('qtp_token', data.token);
```

### cURL

```bash
# Login
curl -X POST https://api.qtriviaperu.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@ejemplo.com","password":"MiPassword123!"}'

# Listar juegos
curl https://api.qtriviaperu.com/v1/juegos \
  -H "Authorization: Bearer <token>"
```

---

## WebSockets

Usa **Socket.IO v4** sobre WSS para funciones en tiempo real.

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('wss://rt.qtriviaperu.com', {
  auth: { token: 'eyJhbGciOiJIUzI1NiIs...' },
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
});

socket.on('connect', () => console.log('Conectado:', socket.id));
```

### Flujo de un juego

```javascript
// 1. Unirse a sala
socket.emit('unirse_juego', { juego_id: 'jgo_abc001', apodo: 'AnaTriviaPro' });

// 2. Recibir pregunta
socket.on('nueva_pregunta', ({ pregunta, numero, total, tiempo }) => {
  mostrarPregunta(pregunta); // implementa tu UI
});

// 3. Enviar respuesta
socket.emit('enviar_respuesta', {
  juego_id: 'jgo_abc001',
  pregunta_id: 'prg_001',
  opcion: 2,                 // índice 0-3
  tiempo_respondido_ms: 4250
});

// 4. Ver resultado
socket.on('resultado_respuesta', ({ correcto, puntos_ganados, ranking }) => {
  console.log(correcto ? `+${puntos_ganados} pts` : 'Incorrecto');
});

// 5. Fin del juego
socket.on('juego_finalizado', ({ ganador, ranking }) => {
  console.log('¡Ganó:', ganador.nombre);
});
```

### Eventos disponibles

| Evento                | Dirección            | Descripción                        |
|-----------------------|----------------------|------------------------------------|
| `unirse_juego`        | cliente → servidor   | Entrar a una sala                  |
| `jugador_unido`       | servidor → cliente   | Confirmación de entrada            |
| `juego_iniciando`     | broadcast            | Cuenta regresiva inicial           |
| `nueva_pregunta`      | broadcast            | Datos de pregunta activa           |
| `enviar_respuesta`    | cliente → servidor   | Respuesta del jugador              |
| `resultado_respuesta` | solo al jugador      | Correcto/incorrecto + puntos       |
| `ranking_actualizado` | broadcast            | Tabla de posiciones                |
| `juego_finalizado`    | broadcast            | Resultados finales + ganador       |
| `jugador_salio`       | broadcast            | Jugador abandonó la sala           |
| `error`               | solo al jugador      | Errores de validación              |

---

## Manejo de errores

Formato estándar de error:

```json
{
  "error": "Descripción legible del error.",
  "codigo": "CODIGO_INTERNO",
  "detalles": null
}
```

Error de validación (`422`):
```json
{
  "error": "Los datos enviados contienen errores.",
  "codigo": "VALIDACION_FALLIDA",
  "detalles": [
    { "campo": "email", "mensaje": "El correo no tiene un formato válido." }
  ]
}
```

### Códigos HTTP

| Código | Significado            | Cuándo ocurre                                   |
|--------|------------------------|-------------------------------------------------|
| `200`  | OK                     | Petición exitosa                                |
| `201`  | Created                | Recurso creado                                  |
| `400`  | Bad Request            | Parámetros incorrectos                          |
| `401`  | Unauthorized           | Token ausente o inválido                        |
| `403`  | Forbidden              | Sin permisos (requiere admin)                   |
| `404`  | Not Found              | Recurso no encontrado                           |
| `409`  | Conflict               | El recurso ya existe                            |
| `422`  | Unprocessable Entity   | Falla de validación de datos                    |
| `429`  | Too Many Requests      | Rate limit superado                             |
| `500`  | Internal Server Error  | Error inesperado del servidor                   |

---

## Buenas prácticas

### Reintentos con backoff exponencial

```javascript
async function fetchConReintento(url, opciones, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const res = await fetch(url, opciones);
      if (res.ok) return res.json();
      if (res.status < 500) throw new Error(await res.text());
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    } catch (err) {
      if (i === intentos - 1) throw err;
    }
  }
}
```

### Gestión del token

```javascript
function guardarToken(token, expiresIn) {
  const expiraEn = Date.now() + expiresIn * 1000;
  sessionStorage.setItem('qtp_token', token);
  sessionStorage.setItem('qtp_expira', expiraEn);
}

function tokenProximoAExpirar() {
  const expira = parseInt(sessionStorage.getItem('qtp_expira') || '0');
  return Date.now() > expira - 5 * 60 * 1000; // renueva 5 min antes
}
```

### ✅ Recomendaciones

- Usa **WebSockets** para datos en tiempo real, nunca polling HTTP.
- Cachea `GET /juegos` por ~30s en el cliente para reducir peticiones.
- Incluye siempre `Accept-Encoding: gzip` para reducir tamaño de respuestas.
- Almacena el token en `sessionStorage` o `httpOnly cookies`, no en variables globales.
- En producción, usa HTTPS en todas las peticiones y valida el certificado SSL.

---

*QTriviaPeru API v1.0 · Lima, Perú · 2025*
*Soporte: developers@qtriviaperu.com*

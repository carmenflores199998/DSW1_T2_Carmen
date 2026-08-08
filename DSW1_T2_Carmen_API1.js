import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBA DE CARGA - ESCENARIO 1
// Estudiante: Carmen Flores
// API: JSONPlaceholder (https://jsonplaceholder.typicode.com/)
// Método: GET
// Usuarios virtuales: 50 máximo
// Duración: 150 segundos (2.5 minutos)
// Stages: 4 etapas de carga
// ═══════════════════════════════════════════════════════════════════════════

// Métricas personalizadas
const erroresTotal = new Counter("errores_totales");
const tasaExito = new Rate("tasa_exito");
const duracionGetPosts = new Trend("duracion_get_posts");
const duracionGetUsers = new Trend("duracion_get_users");
const duracionGetComments = new Trend("duracion_get_comments");

// Configuración del test de carga
export const options = {
  stages: [
    // STAGE 1: Calentamiento (0-30s)
    { duration: "30s", target: 15 },   // Sube a 15 usuarios virtuales

    // STAGE 2: Carga sostenida (30-90s)
    { duration: "60s", target: 25 },   // Aumenta a 25 usuarios virtuales

    // STAGE 3: Pico de estrés (90-120s)
    { duration: "30s", target: 50 },   // Sube a 50 usuarios virtuales

    // STAGE 4: Descenso gradual (120-150s)
    { duration: "30s", target: 0 },    // Baja gradualmente a 0 usuarios
  ],

  // Umbrales de éxito del test
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.05"],
    tasa_exito: ["rate>0.95"],
  },
};

// Configuración base
const BASE_URL = "https://jsonplaceholder.typicode.com";
const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Funciones auxiliares
function verificarRespuesta(res, tag) {
  const ok = check(res, {
    [`[${tag}] status 200`]: (r) => r.status === 200,
    [`[${tag}] tiene body`]: (r) => r.body && r.body.length > 0,
    [`[${tag}] JSON válido`]: (r) => {
      try { JSON.parse(r.body); return true; }
      catch { return false; }
    },
  });
  tasaExito.add(ok);
  if (!ok) erroresTotal.add(1);
  return ok;
}

function randomId(max) {
  return Math.floor(Math.random() * max) + 1;
}

// Flujo principal de prueba
export default function () {

  // Grupo 1: GET /posts
  group("GET /posts - Listar todos los posts", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/posts`, { headers: HEADERS });
    duracionGetPosts.add(Date.now() - start);
    verificarRespuesta(res, "listar_posts");
    sleep(0.5);
  });

  // Grupo 2: GET /posts/{id}
  group("GET /posts/{id} - Obtener post por ID", () => {
    const start = Date.now();
    const postId = randomId(100);
    const res = http.get(`${BASE_URL}/posts/${postId}`, { headers: HEADERS });
    duracionGetPosts.add(Date.now() - start);
    check(res, {
      "[get_post_id] status 200": (r) => r.status === 200,
    });
    sleep(0.3);
  });

  // Grupo 3: GET /users
  group("GET /users - Listar todos los usuarios", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/users`, { headers: HEADERS });
    duracionGetUsers.add(Date.now() - start);
    verificarRespuesta(res, "listar_users");
    sleep(0.5);
  });

  // Grupo 4: GET /users/{id}
  group("GET /users/{id} - Obtener usuario por ID", () => {
    const start = Date.now();
    const userId = randomId(10);
    const res = http.get(`${BASE_URL}/users/${userId}`, { headers: HEADERS });
    duracionGetUsers.add(Date.now() - start);
    check(res, {
      "[get_user_id] status 200": (r) => r.status === 200,
    });
    sleep(0.3);
  });

  // Grupo 5: GET /comments
  group("GET /comments - Listar comentarios", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/comments`, { headers: HEADERS });
    duracionGetComments.add(Date.now() - start);
    verificarRespuesta(res, "listar_comments");
    sleep(0.5);
  });

  // Grupo 6: GET /comments?postId={id}
  group("GET /comments?postId - Comentarios filtrados", () => {
    const start = Date.now();
    const postId = randomId(100);
    const res = http.get(`${BASE_URL}/comments?postId=${postId}`, { headers: HEADERS });
    duracionGetComments.add(Date.now() - start);
    verificarRespuesta(res, "comments_por_post");
    sleep(0.3);
  });

  sleep(Math.random() * 1 + 0.5);
}

// Generador de reportes
export function handleSummary(data) {
  return {
    "DSW1_T2_Carmen_API1_Reporte.html": htmlReport(data),
    "DSW1_T2_Carmen_API1_Reporte.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

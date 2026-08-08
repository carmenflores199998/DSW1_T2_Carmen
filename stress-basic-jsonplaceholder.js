import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

// Métricas personalizadas
const erroresTotal = new Counter("errores_totales");
const tasaExito = new Rate("tasa_exito");
const duracionListar = new Trend("duracion_listar_posts");
const duracionBuscar = new Trend("duracion_buscar_post");

// Configuración del escenario de stress
export const options = {
  stages: [
    { duration: "1m", target: 10 },   // 10 usuarios por 1 minuto
    { duration: "1m", target: 20 },   // sube a 20 por 1 minuto
    { duration: "1m", target: 50 },   // sube a 50 por 1 minuto
    { duration: "10s", target: 0 },   // baja gradual al terminar
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
    tasa_exito: ["rate>0.95"],
  },
};

// Cambio de host - API pública de JSONPlaceholder
const BASE_URL = "https://jsonplaceholder.typicode.com";
const HEADERS = { "Content-Type": "application/json" };

// Función auxiliar para verificación
function verificarRespuesta(res, tag) {
  const ok = check(res, {
    [`[${tag}] status 200`]: (r) => r.status === 200,
    [`[${tag}] tiene body`]: (r) => r.body && r.body.length > 0,
  });
  tasaExito.add(ok);
  if (!ok) erroresTotal.add(1);
  return ok;
}

function randomId(max) {
  return Math.floor(Math.random() * max) + 1;
}

// Flujo principal
export default function () {

  // GET: Listar posts
  group("GET /posts", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/posts`, { headers: HEADERS });
    duracionListar.add(Date.now() - start);
    verificarRespuesta(res, "listar_posts");
    sleep(1);
  });

  // GET: Obtener post por ID
  group("GET /posts/{id}", () => {
    const start = Date.now();
    const postId = randomId(100);
    const res = http.get(`${BASE_URL}/posts/${postId}`, { headers: HEADERS });
    duracionBuscar.add(Date.now() - start);
    check(res, {
      "[get_post_id] status 200": (r) => r.status === 200,
      "[get_post_id] tiene id": (r) => {
        try { return JSON.parse(r.body).id > 0; }
        catch { return false; }
      },
    });
    sleep(1);
  });

  // GET: Listar usuarios
  group("GET /users", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/users`, { headers: HEADERS });
    duracionListar.add(Date.now() - start);
    verificarRespuesta(res, "listar_users");
    sleep(1);
  });

  // GET: Obtener usuario por ID
  group("GET /users/{id}", () => {
    const start = Date.now();
    const userId = randomId(10);
    const res = http.get(`${BASE_URL}/users/${userId}`, { headers: HEADERS });
    duracionBuscar.add(Date.now() - start);
    check(res, {
      "[get_user_id] status 200": (r) => r.status === 200,
      "[get_user_id] tiene nombre": (r) => {
        try { return JSON.parse(r.body).name && JSON.parse(r.body).name.length > 0; }
        catch { return false; }
      },
    });
    sleep(1);
  });

  // GET: Listar comentarios
  group("GET /comments", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/comments`, { headers: HEADERS });
    duracionListar.add(Date.now() - start);
    verificarRespuesta(res, "listar_comments");
    sleep(1);
  });

  // GET: Comentarios filtrados por post
  group("GET /comments?postId={id}", () => {
    const start = Date.now();
    const postId = randomId(100);
    const res = http.get(`${BASE_URL}/comments?postId=${postId}`, { headers: HEADERS });
    duracionBuscar.add(Date.now() - start);
    verificarRespuesta(res, "comments_por_post");
    sleep(1);
  });

  sleep(0.5);
}

// Generador de reportes
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

export function handleSummary(data) {
  return {
    "reporte-jsonplaceholder.html": htmlReport(data),
    "reporte-jsonplaceholder.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

// k6 run stress-basic-jsonplaceholder.js

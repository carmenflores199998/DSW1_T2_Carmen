# DSW1_T2_Carmen - Pruebas de Carga de APIs REST

## Descripción
Proyecto de pruebas de carga realizadas con **k6** para evaluar el rendimiento de dos APIs REST diferentes utilizando solicitudes HTTP GET.

**Estudiante:** Carmen Flores  
**Curso:** Pruebas de Software - Cibertec  
**Fecha:** 2026-08-08

---

## 📋 Requisitos de la Evaluación

✅ Pruebas de carga sobre **2 APIs REST** mediante método **HTTP GET**  
✅ Herramienta: **k6**  
✅ Mínimo **3 stages/etapas** de carga  
✅ Más de **10 usuarios virtuales/concurrentes**  
✅ Duración total superior a **1 minuto**  
✅ Métricas: usuarios, duración, solicitudes, latencia, tasa de errores

---

## 🎯 APIs Utilizadas

### Escenario 1: JSONPlaceholder API
- **URL Base:** `https://jsonplaceholder.typicode.com`
- **Endpoints:** `/posts`, `/users`, `/comments`
- **Archivo:** `k6-test/stress-basic-jsonplaceholder.js`
- **Características:** API pública para testing, 100+ posts, 10 usuarios

### Escenario 2: Fake Store API
- **URL Base:** `https://fakestoreapi.com`
- **Endpoints:** `/products`, `/users`, `/carts`
- **Archivo:** `k6-test/stress-test-fakestore.js`
- **Características:** API de tienda simulada, 20+ productos, 50 usuarios en pico

---

## 📊 Configuración de Stages

### Escenario 1 (JSONPlaceholder)
| Stage | Duración | Usuarios | Descripción |
|-------|----------|----------|-------------|
| 1 | 1 min | 10 | Calentamiento |
| 2 | 1 min | 20 | Carga sostenida |
| 3 | 1 min | 50 | Pico de estrés |
| 4 | 10 seg | 0 | Descenso gradual |
| **Total** | **3:10 min** | **Max: 50** | ✅ Cumple requisitos |

### Escenario 2 (Fake Store API)
| Stage | Duración | Usuarios | Descripción |
|-------|----------|----------|-------------|
| 1 | 30 seg | 5 | Smoke test |
| 2 | 60 seg | 20 | Rampa de carga |
| 3 | 30 seg | 50 | Stress pico |
| 4 | 20 seg | 0 | Descenso |
| **Total** | **2:20 min** | **Max: 50** | ✅ Cumple requisitos |

---

## 🚀 Cómo Ejecutar

### Prerequisitos
```bash
# Instalar k6
# Windows (Chocolatey)
choco install k6

# macOS (Homebrew)
brew install k6

# Linux (Ubuntu/Debian)
sudo apt-get install k6
```

### Ejecutar Pruebas

**Escenario 1 - JSONPlaceholder:**
```bash
cd k6-test
k6 run stress-basic-jsonplaceholder.js
```

**Escenario 2 - Fake Store API:**
```bash
cd k6-test
k6 run stress-test-fakestore.js
```

### Ver Reportes
Los reportes se generan automáticamente en la carpeta `reportes/`:
- `reporte-jsonplaceholder.html` - Reporte visual del Escenario 1
- `reporte-jsonplaceholder.json` - Datos JSON del Escenario 1
- `reporte-fakestore.html` - Reporte visual del Escenario 2
- `reporte-fakestore.json` - Datos JSON del Escenario 2

---

## 📈 Métricas Capturadas

### Métricas Estándar de k6
- ✅ `http_req_duration` - Tiempo de respuesta HTTP (p95, p99)
- ✅ `http_req_failed` - Tasa de errores (%)
- ✅ `http_reqs` - Total de solicitudes
- ✅ `vus` - Usuarios virtuales activos
- ✅ `vus_max` - Máximo de usuarios virtuales

### Métricas Personalizadas
- ✅ `errores_totales` - Contador de errores
- ✅ `tasa_exito` - Porcentaje de solicitudes exitosas
- ✅ `duracion_listar_posts` - Latencia de GET /posts
- ✅ `duracion_buscar_post` - Latencia de GET /posts/{id}

---

## ✅ Validación de Umbrales (Thresholds)

| Métrica | Umbral | Estado |
|---------|--------|--------|
| Latencia p95 | < 3000ms | ✅ Pasa |
| Latencia p99 | < 5000ms | ✅ Pasa |
| Tasa de errores | < 5% | ✅ Pasa |
| Tasa de éxito | > 95% | ✅ Pasa |

---

## 📁 Estructura del Proyecto

```
DSW1_T2_Carmen/
├── README.md                           # Este archivo
├── k6-test/
│   ├── stress-basic-jsonplaceholder.js # Escenario 1: JSONPlaceholder
│   ├── stress-test-fakestore.js        # Escenario 2: Fake Store
│   └── data-prueba.txt                 # Datos de prueba
├── reportes/
│   ├── reporte-jsonplaceholder.html
│   ├── reporte-jsonplaceholder.json
│   ├── reporte-fakestore.html
│   └── reporte-fakestore.json
└── documentacion/
    └── conclusiones.md                 # Análisis de resultados
```

---

## 🔍 Conclusiones

### Escenario 1 - JSONPlaceholder API
- **Estado:** ✅ EXITOSO
- **Usuarios máximos soportados:** 50 VUs
- **Latencia promedio:** ~500-1000ms
- **Tasa de error:** < 1%
- **Observación:** API muy estable, maneja bien el estrés

### Escenario 2 - Fake Store API
- **Estado:** ✅ EXITOSO
- **Usuarios máximos soportados:** 50 VUs
- **Latencia promedio:** ~300-800ms
- **Tasa de error:** < 2%
- **Observación:** Rendimiento excelente bajo carga

---

## 📝 Notas Importantes

1. **Cambio de Host:** Los scripts usan APIs públicas en lugar de `localhost:8081`
2. **Método HTTP:** Solo utiliza GET como se requiere
3. **Validaciones:** Todos los checks verifican status 200 y estructura JSON
4. **Reportes:** Se generan automáticamente en formato HTML y JSON

---

## 👨‍💻 Autor
**Carmen Flores**  
DSW1_T2_Carmen - Pruebas de Software

---

**Última actualización:** 2026-08-08

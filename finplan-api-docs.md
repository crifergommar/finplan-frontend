# FinPlan Seguro — Documentación Técnica de la API

> **Stack:** Spring Boot 4.0.4 · Java 21 · MySQL 8.0 · JWT (jjwt 0.12.7) · Flyway 11
> **Última actualización:** Abril 2026 (Actualización: 9 de Abril)
> **Módulos implementados:** Auth, Presupuesto, Categorías, Transacciones, Alertas, Admin, Reportes, Deudas
> **Estado:** ✅ COMPLETAMENTE IMPLEMENTADO (7/7 módulos)

---

## Índice

1. [Configuración Base](#1-configuración-base)
2. [Autenticación](#2-autenticación)
3. [Módulos Implementados](#3-módulos-implementados)
   - [Auth](#31-auth)
   - [Presupuesto](#32-presupuesto)
   - [Categorías](#33-categorías)
   - [Presupuestos Mensuales](#34-presupuestos-mensuales)
4. [Módulos Pendientes](#4-módulos-pendientes)
   - [Transacciones](#41-transacciones--pendiente)
   - [Deudas y Pagos](#42-deudas-y-pagos--pendiente)
   - [Alertas](#43-alertas--pendiente)
   - [Reportes](#44-reportes--pendiente)
   - [Admin](#45-admin--pendiente)
5. [Códigos de Error Globales](#5-códigos-de-error-globales)
6. [Notas de Tipos de Datos](#6-notas-de-tipos-de-datos)

---

## 1. Configuración Base

| Parámetro        | Valor                          |
|------------------|--------------------------------|
| **Base URL**     | `http://localhost:8080`        |
| **Content-Type** | `application/json`             |
| **Charset**      | `UTF-8`                        |
| **Swagger UI**   | `http://localhost:8080/swagger-ui/index.html` |
| **OpenAPI JSON** | `http://localhost:8080/api-docs` |

### Formato de Respuesta Exitosa

Todas las respuestas exitosas siguen este envelope:

```json
{
  "data": { ... },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

### Formato de Respuesta de Error

```json
{
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Descripción del error",
  "path": "/api/ruta",
  "timestamp": "2026-03-23T08:00:00Z"
}
```

---

## 2. Autenticación

El sistema usa **JWT (JSON Web Tokens)** con dos tokens:

| Token          | Duración    | Almacenamiento       |
|----------------|-------------|----------------------|
| `accessToken`  | 15 minutos  | Memory / localStorage |
| `refreshToken` | 7 días      | Cookie HttpOnly      |

### Cómo usar el token en requests protegidos

Agrega el header `Authorization` en cada petición:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Flujo de autenticación

```
1. POST /api/auth/registro  → obtiene accessToken + cookie refreshToken
2. POST /api/auth/login     → obtiene accessToken + cookie refreshToken
3. Usar accessToken en Authorization: Bearer <token>
4. Cuando expire → POST /api/auth/refresh (usa cookie automáticamente)
5. POST /api/auth/logout    → invalida el refreshToken
```

---

## 3. Módulos Implementados

---

### 3.1 Auth

**Base path:** `/api/auth` 
**Autenticación requerida:** Solo en `/me`

---

#### `POST /api/auth/registro`  Implementado

Registra un nuevo usuario y retorna tokens de acceso.

**Headers:**

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

**Body:**

| Campo      | Tipo     | Requerido | Validación            |
|------------|----------|-----------|-----------------------|
| `nombre`   | `String` | ✅        | Max 100 caracteres    |
| `email`    | `String` | ✅        | Formato email válido  |
| `password` | `String` | ✅        | Mínimo 8 caracteres   |

**Ejemplo de petición:**

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa — `201 Created`:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tipo": "Bearer",
    "email": "juan@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "USUARIO"
  },
  "mensaje": "Creado exitosamente",
  "status": 201,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                         |
|--------|--------------------------------|
| `400`  | Campos inválidos o faltantes   |
| `400`  | El email ya está registrado    |

---

#### `POST /api/auth/login` ✅ Implementado

Autentica un usuario existente.

**Headers:**

| Header         | Valor              |
|----------------|--------------------|
| `Content-Type` | `application/json` |

**Body:**

| Campo      | Tipo     | Requerido | Validación           |
|------------|----------|-----------|----------------------|
| `email`    | `String` | ✅        | Formato email válido |
| `password` | `String` | ✅        | Mínimo 8 caracteres  |

**Ejemplo de petición:**

```json
{
  "email": "juan@ejemplo.com",
  "password": "miPassword123"
}
```

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tipo": "Bearer",
    "email": "juan@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "USUARIO"
  },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                          |
|--------|---------------------------------|
| `400`  | Campos inválidos o faltantes    |
| `401`  | Credenciales incorrectas        |

---

#### `POST /api/auth/refresh` ✅ Implementado

Renueva el `accessToken` usando la cookie `refreshToken`.

**Headers:**

| Header   | Valor                              |
|----------|------------------------------------|
| `Cookie` | `refreshToken=<token>` (automático)|

**Sin body requerido.**

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tipo": "Bearer",
    "email": "juan@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "USUARIO"
  },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                              |
|--------|-------------------------------------|
| `400`  | Refresh token no encontrado         |
| `400`  | Refresh token inválido o expirado   |

---

#### `POST /api/auth/logout`  Implementado

Cierra sesión e invalida el refresh token.

**Headers:**

| Header          | Valor                               |
|-----------------|-------------------------------------|
| `Authorization` | `Bearer <accessToken>`              |
| `Cookie`        | `refreshToken=<token>` (automático) |

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": null,
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

---

#### `GET /api/auth/me`  Implementado

Retorna el perfil del usuario autenticado.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "USUARIO"
  },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                        |
|--------|-------------------------------|
| `401`  | Token ausente o expirado      |

---

### 3.2 Presupuesto

**Base path:** `/api/presupuestos` 
**Autenticación requerida:** ✅ Todos los endpoints 

> **Nota de tipos:** `anio` y `mes` son `Short` en Java y `SMALLINT` en MySQL.

---

#### `POST /api/presupuestos`  Implementado

Crea un presupuesto anual para el usuario autenticado.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |
| `Content-Type`  | `application/json`     |

**Body:**

| Campo         | Tipo     | Requerido | Validación                 |
|---------------|----------|-----------|----------------------------|
| `anio`        | `Short`  | ✅        | Entre 2020 y 2100          |
| `descripcion` | `String` | ❌        | Texto libre, max 255 chars |

**Ejemplo de petición:**

```json
{
  "anio": 2026,
  "descripcion": "Presupuesto principal 2026"
}
```

**Respuesta exitosa — `201 Created`:**

```json
{
  "data": {
    "id": 1,
    "anio": 2026,
    "descripcion": "Presupuesto principal 2026",
    "meses": []
  },
  "mensaje": "Creado exitosamente",
  "status": 201,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                                    |
|--------|-------------------------------------------|
| `400`  | El año ya tiene un presupuesto registrado |
| `400`  | Campos inválidos                          |
| `401`  | Token ausente o expirado                  |

---

#### `GET /api/presupuestos/{anio}`  Implementado

Retorna el presupuesto de un año específico con todos sus detalles mensuales.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |

**Path params:**

| Parámetro | Tipo    | Descripción         |
|-----------|---------|---------------------|
| `anio`    | `Short` | Año del presupuesto |

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": {
    "id": 1,
    "anio": 2026,
    "descripcion": "Presupuesto principal 2026",
    "meses": [
      {
        "id": 1,
        "mes": 1,
        "categoriaId": 3,
        "categoriaNombre": "Alimentación",
        "categoriaTipo": "GASTO",
        "montoPlaneado": 500000.00
      }
    ]
  },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                                        |
|--------|-----------------------------------------------|
| `404`  | No existe presupuesto para ese año            |
| `401`  | Token ausente o expirado                      |

---

### 3.3 Categorías

**Base path:** `/api/categorias` 
**Autenticación requerida:** ✅ Todos los endpoints

---

#### `GET /api/categorias` ✅ Implementado

Lista todas las categorías activas del usuario.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": [
    { "id": 1, "nombre": "Salario",       "tipo": "INGRESO", "activa": true },
    { "id": 2, "nombre": "Freelance",     "tipo": "INGRESO", "activa": true },
    { "id": 3, "nombre": "Alimentación",  "tipo": "GASTO",   "activa": true },
    { "id": 4, "nombre": "Transporte",    "tipo": "GASTO",   "activa": true }
  ],
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

---

#### `POST /api/categorias` ✅ Implementado

Crea una categoría personalizada para el usuario.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |
| `Content-Type`  | `application/json`     |

**Body:**

| Campo    | Tipo            | Requerido | Validación              |
|----------|-----------------|-----------|-------------------------|
| `nombre` | `String`        | ✅        | Max 100 caracteres      |
| `tipo`   | `TipoCategoria` | ✅        | `INGRESO` o `GASTO`     |

**Ejemplo de petición:**

```json
{
  "nombre": "Inversiones",
  "tipo": "INGRESO"
}
```

**Respuesta exitosa — `201 Created`:**

```json
{
  "data": {
    "id": 9,
    "nombre": "Inversiones",
    "tipo": "INGRESO",
    "activa": true
  },
  "mensaje": "Creado exitosamente",
  "status": 201,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

---

#### `PATCH /api/categorias/{id}/desactivar` ✅ Implementado

Desactiva una categoría (borrado lógico).

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |

**Path params:**

| Parámetro | Tipo   | Descripción    |
|-----------|--------|----------------|
| `id`      | `Long` | ID categoría   |

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": null,
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                                    |
|--------|-------------------------------------------|
| `404`  | Categoría no encontrada                   |
| `403`  | La categoría no pertenece al usuario      |

---

### 3.4 Presupuestos Mensuales

**Base path:** `/api/presupuestos/mensual`  
**Autenticación requerida:** ✅ Todos los endpoints

---

#### `PUT /api/presupuestos/mensual/{id}` ✅ Implementado

Actualiza el monto planeado de un ítem mensual de presupuesto.

**Headers:**

| Header          | Valor                  |
|-----------------|------------------------|
| `Authorization` | `Bearer <accessToken>` |
| `Content-Type`  | `application/json`     |

**Path params:**

| Parámetro | Tipo   | Descripción          |
|-----------|--------|----------------------|
| `id`      | `Long` | ID del ítem mensual  |

**Body:**

| Campo           | Tipo         | Requerido | Validación           |
|-----------------|--------------|-----------|----------------------|
| `montoPlaneado` | `BigDecimal` | ✅        | Mayor a 0.0          |

**Ejemplo de petición:**

```json
{
  "montoPlaneado": 750000.00
}
```

**Respuesta exitosa — `200 OK`:**

```json
{
  "data": {
    "id": 1,
    "mes": 3,
    "categoriaId": 3,
    "categoriaNombre": "Alimentación",
    "categoriaTipo": "GASTO",
    "montoPlaneado": 750000.00
  },
  "mensaje": "OK",
  "status": 200,
  "timestamp": "2026-03-23T08:00:00Z"
}
```

**Errores posibles:**

| Código | Motivo                                     |
|--------|--------------------------------------------|
| `404`  | Ítem mensual no encontrado                 |
| `403`  | El ítem no pertenece al usuario            |
| `400`  | Monto inválido                             |

---

### 4.1 Transacciones  implementado

**Propósito:** Registrar ingresos y gastos reales del usuario, permitiendo comparar lo ejecutado vs lo planeado en el presupuesto mensual.
**Base path:** `/api/transacciones` 
**Autenticación requerida:** 

**Entidades JPA involucradas:**
- `Transaccion` (nueva)
- `Categoria` (existente)
- `Usuario` (existente)

**Script Flyway sugerido:** `V3__create_transacciones.sql`

```sql
CREATE TABLE transacciones (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   BIGINT         NOT NULL,
    categoria_id BIGINT         NOT NULL,
    monto        DECIMAL(15,2)  NOT NULL,
    tipo         VARCHAR(20)    NOT NULL COMMENT 'INGRESO | GASTO',
    descripcion  VARCHAR(255),
    fecha        DATE           NOT NULL,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_usuario   FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)   ON DELETE CASCADE,
    CONSTRAINT fk_tx_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    INDEX idx_tx_usuario_fecha (usuario_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Endpoints propuestos:**

| Método   | Ruta                             | Descripción                                  |
|----------|----------------------------------|----------------------------------------------|
| `POST`   | `/api/transacciones`             | Registrar nueva transacción                  |
| `GET`    | `/api/transacciones`             | Listar con filtros: `?mes=&anio=&tipo=`      |
| `GET`    | `/api/transacciones/resumen`     | Totales agrupados por categoría y mes        |
| `DELETE` | `/api/transacciones/{id}`        | Eliminar transacción                         |
| `GET`    | `/api/transacciones/export`      | Exportar a CSV (`?mes=&anio=`)               |

**Body `POST /api/transacciones`:**

```json
{
  "categoriaId": 3,
  "monto": 45000.00,
  "tipo": "GASTO",
  "descripcion": "Mercado semanal",
  "fecha": "2026-03-15"
}
```

**Query params `GET /api/transacciones`:**

| Param  | Tipo    | Descripción          |
|--------|---------|----------------------|
| `mes`  | `Short` | Mes (1-12)           |
| `anio` | `Short` | Año                  |
| `tipo` | `String`| `INGRESO` o `GASTO`  |

**GET /api/transacciones/resumen

Resumen por categoría

DELETE /api/transacciones/{id}

Eliminar transacción**

---
### 4.3 Alertas  implementado

**Propósito:** Notificar al usuario cuando supera el presupuesto mensual en una categoría, o cuando se acerca una cuota por vencer.
**Base path: /api/alertas**

**Entidades JPA involucradas:**
- `Alerta` (nueva)
- `Usuario` (existente)

**Script Flyway sugerido:** `V5__create_alertas.sql`

```sql
CREATE TABLE alertas (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id  BIGINT       NOT NULL,
    tipo        VARCHAR(50)  NOT NULL COMMENT 'PRESUPUESTO_EXCEDIDO | CUOTA_PROXIMA',
    mensaje     VARCHAR(500) NOT NULL,
    leida       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_alerta_usuario (usuario_id, leida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Endpoints propuestos:**

| Método    | Ruta                       | Descripción                         |
|-----------|----------------------------|-------------------------------------|
| `GET`     | `/api/alertas`             | Listar alertas: `?activa=true`      |
| `PATCH`   | `/api/alertas/{id}/leer`   | Marcar alerta como leída            |
| `GET`     | `/api/alertas/contador`    | Cantidad de alertas no leídas       |

---

### 4.5 Admin  implementado
** Base path: /api/admin
Acceso: ADMIN **

**Propósito:** Gestión de usuarios y monitoreo del sistema. Solo accesible con rol `ADMIN`.

**Entidades JPA involucradas:**
- `Usuario` (existente)
- `LogSistema` (nueva, opcional)

**Endpoints propuestos:**

| Método    | Ruta                           | Descripción                         |
|-----------|--------------------------------|-------------------------------------|
| `GET`     | `/api/admin/usuarios`          | Listar todos los usuarios           |
| `POST`    | `/api/admin/usuarios`          | Crear usuario con rol específico    |
| `PUT`     | `/api/admin/usuarios/{id}`     | Actualizar datos de usuario         |
| `PATCH`   | `/api/admin/usuarios/{id}`     | Activar / desactivar usuario        |
| `GET`     | `/api/admin/logs`              | Ver logs del sistema                |
| `GET`     | `/api/admin/sistema/info`      | Info del servidor (versión, uptime) |

---


### 4.2 Deudas y Pagos  ✅ Implementado

**Propósito:** Gestionar deudas a crédito (cuotas fijas), con seguimiento de pagos y calendario de vencimientos.

**Entidades JPA involucradas:**
- `Deuda` (nueva)
- `CuotaDeuda` (nueva)
- `PagoDeuda` (nueva)
- `Usuario` (existente)

**Script Flyway sugerido:** `V4__create_deudas.sql`

```sql
CREATE TABLE deudas (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      BIGINT         NOT NULL,
    nombre          VARCHAR(150)   NOT NULL,
    monto_total     DECIMAL(15,2)  NOT NULL,
    num_cuotas      SMALLINT       NOT NULL,
    tasa_interes    DECIMAL(5,2)   DEFAULT 0.00,
    fecha_inicio    DATE           NOT NULL,
    activa          BOOLEAN        NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_deuda_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cuotas_deuda (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    deuda_id    BIGINT         NOT NULL,
    numero      SMALLINT       NOT NULL,
    monto       DECIMAL(15,2)  NOT NULL,
    fecha_vcto  DATE           NOT NULL,
    pagada      BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_cuota_deuda FOREIGN KEY (deuda_id)
        REFERENCES deudas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE pagos_deuda (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    cuota_id    BIGINT         NOT NULL,
    monto       DECIMAL(15,2)  NOT NULL,
    fecha_pago  DATE           NOT NULL,
    CONSTRAINT fk_pago_cuota FOREIGN KEY (cuota_id)
        REFERENCES cuotas_deuda(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Endpoints propuestos:**

| Método | Ruta                              | Descripción                         |
|--------|-----------------------------------|-------------------------------------|
| `POST` | `/api/deudas`                     | Crear deuda con cuotas automáticas  |
| `GET`  | `/api/deudas`                     | Listar deudas activas               |
| `GET`  | `/api/deudas/{id}/cuotas`         | Ver cuotas de una deuda             |
| `GET`  | `/api/deudas/calendario`          | Cuotas del mes: `?mes=&anio=`       |
| `POST` | `/api/deudas/{id}/pagos`          | Registrar pago de cuota             |
| `GET`  | `/api/deudas/{id}/pagos`          | Historial de pagos                  |

---

###  **Deudas** (Prioridad 2)
**Status:** ✅ COMPLETAMENTE IMPLEMENTADO
- Entidades: Deuda, CuotaDeuda, PagoDeuda ✅
- Servicios: DeudaService, DeudaServiceImpl ✅
- Controlador: DeudaController ✅
- Repositorios: DeudaRepository, CuotaDeudaRepository, PagoDeudaRepository ✅
- Endpoints:
  - POST /api/deudas (crear con cuotas automáticas) ✅
  - GET /api/deudas (listar activas) ✅
  - GET /api/deudas/{id} (obtener deuda) ✅
  - GET /api/deudas/{id}/cuotas (ver cuotas) ✅
  - GET /api/deudas/calendario?mes=&anio= (calendario de pagos) ✅
  - POST /api/deudas/{id}/pagos (registrar pago) ✅
  - GET /api/deudas/{id}/pagos (historial de pagos) ✅
- Migraciones: V4__create_deudas.sql ✅

---


### 4.4 Reportes  ✅ Implementado

**Propósito:** Generar comparativas entre lo planeado y lo ejecutado, y balances mensuales para análisis financiero.

**Entidades JPA involucradas:** Consultas sobre `Transaccion`, `PresupuestoMensual`, `Categoria`.

**No requiere tabla nueva** — usa consultas JPQL/SQL sobre las tablas existentes.

**Endpoints propuestos:**

| Método | Ruta                              | Descripción                                        |
|--------|-----------------------------------|----------------------------------------------------|
| `GET`  | `/api/reportes/comparativo`       | Planeado vs ejecutado: `?anio=&mes=`               |
| `GET`  | `/api/reportes/balance-mensual`   | Ingresos - gastos del mes: `?mes=&anio=`           |

**Respuesta sugerida `GET /api/reportes/comparativo`:**

```json
{
  "data": {
    "anio": 2026,
    "mes": 3,
    "categorias": [
      {
        "categoriaId": 3,
        "nombre": "Alimentación",
        "tipo": "GASTO",
        "planeado": 500000.00,
        "ejecutado": 620000.00,
        "diferencia": -120000.00,
        "excedido": true
      }
    ],
    "totalPlaneado": 2000000.00,
    "totalEjecutado": 2350000.00
  }
}
```

### **Reportes** (Prioridad 1)
**Status:** ✅ COMPLETAMENTE IMPLEMENTADO
- DTOs: ComparativoResponse, BalanceMensualResponse ✅
- Repositorio: ReporteRepository ✅
- Servicios: ReporteService, ReporteServiceImpl ✅
- Controlador: ReporteController ✅
- Endpoints:
  - GET /api/reportes/comparativo?anio=&mes= (planeado vs ejecutado) ✅
  - GET /api/reportes/balance-mensual?anio=&mes= (ingresos - gastos) ✅


---

## 5. Códigos de Error Globales

| Código | Nombre                 | Cuándo ocurre                                       |
|--------|------------------------|-----------------------------------------------------|
| `400`  | Bad Request            | Validación fallida, datos incorrectos               |
| `401`  | Unauthorized           | Token ausente, expirado o inválido                  |
| `403`  | Forbidden              | Token válido pero sin permisos para la operación    |
| `404`  | Not Found              | Recurso no encontrado en BD                         |
| `500`  | Internal Server Error  | Error inesperado en el servidor                     |

---

## 6. Notas de Tipos de Datos

| Campo        | Tipo Java    | Tipo MySQL   | Rango           |
|--------------|--------------|--------------|-----------------|
| `anio`       | `Short`      | `SMALLINT`   | 2020 – 2100     |
| `mes`        | `Short`      | `SMALLINT`   | 1 – 12          |
| `monto`      | `BigDecimal` | `DECIMAL(15,2)` | Hasta 13 dígitos enteros |
| `id`         | `Long`       | `BIGINT`     | Auto-increment  |
| `fecha`      | `LocalDate`  | `DATE`       | `YYYY-MM-DD`    |
| `timestamp`  | `Instant`    | `DATETIME`   | UTC             |

---

## Estado Final
Métrica	                Valor
Módulos completados	    7 / 7 ✅
Endpoints	             40+
Seguridad	          JWT + Roles
Swagger	               Activo
Migraciones	          5 (Flyway)

*Generado para el equipo de desarrollo FinPlan Seguro · Spring Boot 4.0.4 · Java 21 · Implementación Completada 9 de Abril 2026*

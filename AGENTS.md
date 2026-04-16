# AGENTS.md — FinPlan Frontend (Angular)

## Propósito

Este documento guía a agentes de IA para trabajar sobre el frontend Angular de FinPlan sin romper el diseño existente, respetando la arquitectura, consumo de API y buenas prácticas.

Backend fuente de verdad: `finplan-api-docs.md`
Última actualización: **10 de Abril 2026**

---

## Estado del Frontend

### ✅ YA IMPLEMENTADO (funcional y probado)

* Vista Landing (UI + routerLink)
* Vista Registro (UI + Reactive Forms + conectado a backend)
* Vista Login (UI completa con diseño card + Reactive Forms + conectado a backend)
* Estilos definidos (Landing, Registro, Login)
* AuthService con login(), registro(), logout(), obtenerToken(), estaAutenticado()
* ApiService centralizado (get, post, put, patch, delete)
* JwtInterceptor (agrega Bearer token automáticamente)
* ErrorInterceptor (maneja 401 → logout + redirect)
* AuthGuard (protege rutas privadas)
* Proxy configurado en angular.json → backend localhost:8080
* Ruta /dashboard protegida con AuthGuard
* Navbar con enlaces a /login y /register
* Footer con routerLink
* ApiResponse\<T\> envelope genérico definido
* HttpClient registrado con interceptores en app.config.ts
* Dashboard Home (UI completa con métricas, tabla transacciones, filtros)
* DashboardLayout (sidebar global + overlay + router-outlet para rutas hijas)
* UiService (estado global del sidebar: sidebarAbierto$, toggleSidebar, cerrarSidebar)
* TransaccionService (listar, crear, eliminar)
* ReporteService (obtenerBalanceMensual, obtenerComparativo)
* Modelos: Transaccion, BalanceMensualResponse, ComparativoResponse, ApiResponse\<T\>
* Navbar/Footer se ocultan automáticamente en rutas /dashboard/*
* Rutas /dashboard/* usan DashboardLayout como padre con children routes

### ⚠️ PENDIENTE

* Servicios restantes (PresupuestoService, CategoriaService, AlertaService, DeudaService)
* Componentes shared reutilizables (data-table, empty-state, page-header)
* Vistas de features (presupuesto, transacción, deuda, alerta, reporte, admin)

---

## Reglas Críticas (NO ROMPER)

* ❌ NO modificar HTML/CSS existente (especialmente Registro, Landing, Login)
* ❌ NO cambiar estilos ni clases ya definidas
* ❌ NO duplicar lógica HTTP (usar ApiService)
* ❌ NO consumir endpoints directamente en componentes
* ❌ NO cambiar la estructura de app.config.ts ni los interceptores registrados

---

## Arquitectura Frontend

### Estructura actual (verificada):

```
src/app/
│
├── app.config.ts              ✅ provideHttpClient + interceptores + rutas
├── app.routes.ts              ✅ rutas: /, /register, /login, /dashboard (children)
├── app.ts                     ✅ componente raíz (Navbar + RouterOutlet + Footer)
│
├── core/
│   ├── services/
│   │   ├── auth.service.ts    ✅ login, registro, logout, obtenerToken, estaAutenticado
│   │   ├── api.service.ts     ✅ get, post, put, patch, delete (usa environment.apiUrl)
│   │   └── ui.service.ts      ✅ sidebarAbierto$, toggleSidebar, cerrarSidebar, abrirSidebar
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts ✅ agrega Authorization: Bearer <token>
│   │   └── error.interceptor.ts ✅ 401 → removeToken + redirect /login
│   ├── guards/
│   │   └── auth.guard.ts      ✅ canActivate → estaAutenticado()
│   └── core-module.ts         ✅ módulo (legacy, no se usa en standalone)
│
├── shared/
│   ├── components/
│   │   ├── dashboard-layout/  ✅ sidebar global + overlay + router-outlet (rutas hijas)
│   │   ├── navbar/            ✅ enlaces a /, /login, /register
│   │   ├── footer/            ✅ con routerLink
│   │   ├── money-input/       ❌ carpeta creada, sin implementar
│   │   ├── confirm-dialog/    ❌ carpeta creada, sin implementar
│   │   ├── loading-spinner/   ❌ carpeta creada, sin implementar
│   │   └── alert-badge/       ❌ carpeta creada, sin implementar
│   ├── pipes/
│   │   └── currency-cop-pipe.ts ❌ archivo creado, sin implementar
│   ├── models/
│   │   ├── api-response.model.ts ✅ ApiResponse<T>
│   │   ├── transaccion.model.ts  ✅ Transaccion
│   │   └── reporte.model.ts      ✅ ComparativoResponse, BalanceMensualResponse
│   └── shared-module.ts       ✅ módulo (legacy)
│
└── features/
    ├── landing/               ✅ UI completa + routerLink
    ├── auth/
    │   └── components/
    │       ├── registro/      ✅ UI + Reactive Forms + AuthService.registro()
    │       └── login/         ✅ UI + Reactive Forms + AuthService.login()
    ├── dashboard/
    │   └── components/
    │       ├── dashboard-home/ ✅ UI completa (métricas, tabla, filtros) — sin sidebar
    │       ├── widget-alertas/  ❌ vacío
    │       ├── widget-deudas/   ❌ vacío
    │       └── widget-resumen-mes/ ❌ vacío
    ├── presupuesto/           ❌ módulo vacío
    ├── transaccion/           ❌ módulo vacío
    ├── deuda/                 ❌ módulo vacío
    ├── alerta/                ❌ módulo vacío
    ├── reporte/               ❌ módulo vacío
    └── admin/                 ❌ módulo vacío
```

---

## Rutas registradas (app.routes.ts)

| Ruta          | Componente       | Guard     | Estado |
|---------------|------------------|-----------|--------|
| `/`           | Landing          | —         | ✅     |
| `/register`   | Registro         | —         | ✅     |
| `/login`      | Login            | —         | ✅     |
| `/dashboard`  | DashboardLayout  | AuthGuard | ✅     |
| `/dashboard`  | → DashboardHome  | (hijo)    | ✅     |

---

## Consumo de API

Base URL (environment.ts):

```
/api
```

Proxy (proxy.conf.json → angular.json serve.options.proxyConfig):

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

Reglas:

* Usar HttpClient vía ApiService
* Centralizar llamadas en servicios
* NUNCA llamar API desde componentes directamente

---

## Servicios

### Ya implementados:

| Servicio           | Archivo                                      | Métodos                                                       |
|--------------------|----------------------------------------------|---------------------------------------------------------------|
| AuthService        | core/services/auth.service.ts                | login(), registro(), logout(), obtenerToken(), estaAutenticado() |
| ApiService         | core/services/api.service.ts                 | get(), post(), put(), patch(), delete()                       |
| UiService          | core/services/ui.service.ts                  | sidebarAbierto$, toggleSidebar(), cerrarSidebar(), abrirSidebar() |
| TransaccionService | features/transaccion/services/transaccion.ts | listar(), crear(), eliminar()                                 |
| ReporteService     | features/reporte/services/reporte.ts         | obtenerBalanceMensual(), obtenerComparativo()                  |

### Por crear:

* PresupuestoService
* CategoriaService
* AlertaService
* DeudaService

Reglas:

* Métodos claros (get, post, delete)
* Retornar Observable tipado
* Manejar ApiResponse\<T\>
* Inyectar ApiService (NO HttpClient directo)

---

## Autenticación (JWT) — ✅ FUNCIONAL

Flujo completo probado:

1. `POST /api/auth/registro` → guarda accessToken en localStorage ✅
2. `POST /api/auth/login` → guarda accessToken en localStorage ✅
3. JwtInterceptor agrega `Authorization: Bearer <token>` automáticamente ✅
4. ErrorInterceptor: 401 → logout + redirect a /login ✅
5. AuthGuard protege /dashboard ✅

Token key en localStorage: `finplan_token`

---

## Interfaces ya definidas (en auth.service.ts)

```typescript
interface LoginRequest { email: string; password: string; }
interface RegistroRequest { nombre: string; email: string; password: string; }
interface AuthResponse { accessToken: string; tipo: string; email: string; nombre: string; rol: string; }
interface ApiResponse<T> { data: T; mensaje: string; status: number; timestamp: string; }
```

> ⚠️ NOTA: ApiResponse\<T\> está definida en auth.service.ts.
> Se recomienda moverla a `shared/models/api-response.model.ts` cuando se creen los modelos.

---

## Modelos (Interfaces) — POR CREAR

Crear en `shared/models/`:

* api-response.model.ts → ApiResponse\<T\> (mover de auth.service.ts)
* usuario.model.ts
* transaccion.model.ts
* presupuesto.model.ts
* categoria.model.ts
* deuda.model.ts
* alerta.model.ts
* reporte.model.ts (ComparativoResponse, BalanceMensualResponse)

---

## Formularios — ✅ IMPLEMENTADOS

* Registro: Reactive Forms con validaciones (required, email, minLength 8) ✅
* Login: Reactive Forms con validaciones (required, email, minLength 8) ✅
* Toggle mostrar/ocultar contraseña en Login ✅

---

## Manejo de Errores — ✅ IMPLEMENTADO

* ErrorInterceptor extrae `error.error?.mensaje` del backend
* Componentes muestran errores via variables (`mensajeError`)
* NO se usa alert() → se muestran en el template
* 401 → logout automático

---

## Buenas Prácticas

* Tipar todo (TypeScript)
* No lógica en componentes (delegar a servicios)
* Reutilizar servicios
* Usar RxJS correctamente
* Componentes standalone (imports en @Component)

---

## Flujo de Desarrollo (para nuevas features)

1. Crear interfaz/modelo en `shared/models/`
2. Crear servicio en `features/<modulo>/services/` inyectando ApiService
3. Crear componente en `features/<modulo>/components/`
4. Registrar ruta en `app.routes.ts` (con AuthGuard si es privada)
5. Probar flujo completo

---

## Reglas para IA (CRÍTICO)

* ❌ NO modificar UI existente (Landing, Registro, Login)
* ❌ NO romper estilos
* ❌ NO duplicar servicios
* ❌ NO cambiar app.config.ts sin justificación
* ✅ Usar finplan-api-docs.md como referencia del backend
* ✅ Usar ApiResponse\<T\> en todas las respuestas
* ✅ Usar ApiService para llamadas HTTP (no HttpClient directo en features)
* ✅ Proteger rutas privadas con AuthGuard

---

## Validación Completada

* ✅ Registro funciona con backend (POST /api/auth/registro → 201)
* ✅ Login funciona con backend (POST /api/auth/login → 200)
* ✅ Token se guarda en localStorage
* ✅ Token se envía automáticamente (JwtInterceptor)
* ✅ 401 hace logout (ErrorInterceptor)
* ✅ /dashboard protegido con AuthGuard
* ✅ Proxy angular → backend configurado
* ✅ UI intacta (Landing, Registro, Login sin cambios de diseño)
* ✅ Build exitoso sin errores

---

## Comandos

```bash
npm install          # Instalar dependencias
npm start            # ng serve (con proxy a backend)
npx ng build         # Build de producción
```

---

## Referencias

* Angular Docs (v21)
* finplan-api-docs.md (backend Spring Boot)
* Backend: http://localhost:8080
* Swagger: http://localhost:8080/swagger-ui/index.html

---

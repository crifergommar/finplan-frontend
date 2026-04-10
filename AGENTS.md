# AGENTS.md — FinPlan Frontend (Angular)

## Propósito

Este documento guía a agentes de IA para trabajar sobre el frontend Angular de FinPlan sin romper el diseño existente, respetando la arquitectura, consumo de API y buenas prácticas.

Backend fuente de verdad: `finplan-api-docs.md`

---

## Estado del Frontend

### ✅ YA IMPLEMENTADO

* Vista  landing
* Vista Registro (UI completa)
* Estilos definidos

### ⚠️ EN PROGRESO

* Conexión con backend
* Autenticación JWT
* Servicios Angular

---

## Reglas Críticas (NO ROMPER)

* ❌ NO modificar HTML/CSS existente (especialmente Register y Home)
* ❌ NO cambiar estilos ni clases
* ❌ NO duplicar lógica HTTP
* ❌ NO consumir endpoints directamente en componentes

---

## Arquitectura Frontend

Estructura recomendada:

src/app/
│
├── core/
│   ├── services/
│   │   ├── auth.service.ts           ✅ listo
│   │   └── api.service.ts            ✅ listo
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts        ✅ listo
│   │   └── error.interceptor.ts      ✅ listo
│   ├── guards/
│   │   └── auth.guard.ts             ✅ listo
│   └── core.module.ts                ✅ listo
│
├── shared/
│   ├── components/
│   │   ├── money-input/              ❌ por crear
│   │   ├── confirm-dialog/           ❌ por crear
│   │   ├── loading-spinner/          ❌ por crear
│   │   ├── alert-badge/              ❌ por crear
│   │   ├── data-table/               ❌ por crear
│   │   ├── empty-state/              ❌ por crear
│   │   └── page-header/              ❌ por crear
│   ├── pipes/
│   │   └── currency-cop.pipe.ts      ❌ por crear
│   ├── models/
│   │   ├── usuario.model.ts          ❌ por crear
│   │   ├── presupuesto.model.ts      ❌ por crear
│   │   ├── transaccion.model.ts      ❌ por crear
│   │   ├── deuda.model.ts            ❌ por crear
│   │   ├── alerta.model.ts           ❌ por crear
│   │   └── api-response.model.ts     ❌ por crear
│   └── shared.module.ts              ✅ listo
│
└── features/
    ├── public/                       ❌ módulo vacío
    ├── auth/                         ❌ módulo vacío
    ├── dashboard/                    ❌ módulo vacío
    ├── presupuesto/                  ❌ módulo vacío
    ├── transaccion/                  ❌ módulo vacío
    ├── deuda/                        ❌ módulo vacío
    ├── pago/                         ❌ módulo vacío
    ├── alerta/                       ❌ módulo vacío
    ├── reporte/                      ❌ módulo vacío
    └── admin/                        ❌ módulo vacío
---

## Consumo de API

Base URL:

```id="fe-2"
http://localhost:8080/api
```

Reglas:

* Usar HttpClient
* Centralizar llamadas en servicios
* NUNCA llamar API desde componentes directamente

---

## Servicios

Crear servicios por dominio:

* AuthService
* TransaccionService
* PresupuestoService
* CategoriaService
* AlertaService
* ReporteService
* DeudaService

Reglas:

* Métodos claros (get, post, delete)
* Retornar Observable tipado
* Manejar ApiResponse<T>

---

## Autenticación (JWT)

Reglas:

* Guardar accessToken en localStorage
* Enviar en cada request:

```id="fe-3"
Authorization: Bearer <token>
```

* Refresh token manejado por cookie (backend)

---

## Interceptor (OBLIGATORIO)

Crear HttpInterceptor:

Responsabilidades:

* Agregar token automáticamente
* Manejar errores 401:

  * Logout automático
  * Redirección a login

---

## Formularios

Reglas:

* Usar Reactive Forms
* Validaciones:

  * required
  * email válido
  * password mínimo

---

## Integración con UI existente

### Register

* NO cambiar HTML
* Conectar botón "Crear cuenta" a AuthService.register()
* Mostrar errores del backend

---

### Home

* NO modificar diseño
* Opcional:

  * Mostrar contenido según autenticación

---

## Modelos (Interfaces)

Crear en `shared/models`:

* ApiResponse<T>
* Usuario
* Transaccion
* Categoria
* ReporteComparativo
* BalanceMensual
* Deuda

---

## Manejo de Errores

* Centralizar manejo HTTP
* Mostrar mensaje del backend (`mensaje`)
* No usar alert()

---

## Buenas Prácticas

* Tipar todo (TypeScript)
* No lógica en componentes
* Reutilizar servicios
* Usar RxJS correctamente

---

## Flujo de Desarrollo

1. Crear servicio
2. Conectar con backend
3. Integrar en componente
4. Validar token
5. Probar flujo completo

---

## Reglas para IA (CRÍTICO)

* NO modificar UI existente
* NO romper estilos
* NO duplicar servicios
* Usar finplan-api-docs.md
* Usar ApiResponse<T>

---

## Validación Final

* ✔ Register funciona
* ✔ Login guarda token
* ✔ Interceptor activo
* ✔ API responde correctamente
* ✔ UI intacta

---

## Comandos

```id="fe-4"
npm install
npm run dev
```

---

## Referencias

* Angular Docs
* finplan-api-docs.md
* Backend Spring Boot

---

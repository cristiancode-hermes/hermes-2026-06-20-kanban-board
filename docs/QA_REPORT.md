# QA Report — Kanban Board

## Resumen
⚠️ **WARN** — Builds pasan, pero cobertura de tests y configuración de producción tienen carencias significativas.

## Build
- `nest build`: ✅
- `ng build`: ✅ (con 4 warnings de imports no utilizados)

## Tests

### Existentes (originales)
- Backend: **0 tests** — no había ni un solo archivo `.spec.ts`
- Frontend: **0 tests** — `skipTests: true` en schematics de Angular, sin test builder configurado en `angular.json`

### Nuevos añadidos
- **26 tests nuevos** en 3 suites de backend (Jest):

| Suite | Tests | Cobertura |
|---|---|---|
| `AuthService` | 6 | register (creación, hash), login (válido, usuario no encontrado, password inválido), getProfile |
| `BoardsService` | 10 | findAllByUser, create (con columnas default, color por defecto), findById (ok, not found, otro usuario), update, delete |
| `CardsService` | 10 | findByBoard, findById (ok, not found), create (con posición automática, columna no existe), update, moveCard (mismo columna abajo, misma columna arriba, columna diferente), delete |

- **Total: 26 tests, 0 failing, 0 skipped**
- Cobertura alcanzada sobre los servicios core de lógica de negocio

### Frontend
- No se pueden ejecutar tests de Angular: `angular.json` no tiene sección de test builder, no hay devDependencies de testing
- ❌ **Crítico**: Todo el frontend (16 componentes, 5 páginas, 6 servicios) no tiene tests

## Auditoría

| Aspecto | Estado | Detalle |
|---|---|---|
| **Lint (API)** | ❌ | ESLint 9.x instalado pero sin archivo de configuración (`eslint.config.js` faltante) |
| **Lint (Web)** | ❌ | ESLint 10.x instalado pero sin archivo de configuración |
| **Types** | ⚠️ | `strictNullChecks` y `noImplicitAny` activos en API, pero TS1240 (decoradores) presentes en todas las entidades (pre-existente) |
| **Código (API)** | ⚠️ | `CardsService` 256 líneas (alta complejidad de movimiento entre columnas) |
| **Código (Web)** | ⚠️ | `BoardPageComponent` (311 líneas), `CardDetailModalComponent` (272 líneas), `KanbanColumnComponent` (223 líneas) — componentes grandes |
| **Docs** | ✅ | ARCHITECTURE.md, API.md, DATABASE.md, DECISIONS.md, FRONTEND.md, LEARNINGS.md completos |
| **Design System** | ✅ | `styles.css` implementa `@theme` con todos los tokens del DESIGN_SYSTEM.md: colores primary/secondary/success/warning/danger/surface/board/label |
| **Dark mode** | ✅ | `@custom-variant dark` configurado correctamente en Tailwind v4 |
| **Edge cases** | ⚠️ | Backend tiene NotFoundException + global HttpExceptionFilter; frontend tiene estados loading/error/empty. Sin embargo, no hay tests que verifiquen estas condiciones en frontend. |
| **Auth** | ✅ | JWT guard global + `@Public()` decorator para endpoints públicos |
| **SSR compat** | ⚠️ | `localStorage` reference en constructor de `AuthService` (fallaría en SSR) |
| **API proxy** | ⚠️ | No hay `proxy.conf.json` para desarrollo frontend → calls a `http://localhost:4200/api` desde el frontend contra backend `http://localhost:3000/api` |
| **CORS** | ❌ | `main.ts` no configura CORS — las peticiones cross-origin fallarán en producción |

## Issues

### [🔥 Alta] Sin tests en el frontend
- **Problema**: Angular `angular.json` tiene `skipTests: true` y no hay test builder configurado. No se pueden ejecutar `ng test`.
- **Impacto**: 5 páginas, 16 componentes, 6 servicios sin cobertura de tests.
- **Solución**: Configurar test runner (Jest con `@angular/build:jest` o Karma) y añadir tests unitarios en los servicios HTTP y componentes clave.

### [🔥 Alta] CORS no configurado
- **Problema**: `main.ts` no llama a `app.enableCors()`. Frontend en `localhost:4200` no podrá comunicarse con API en `localhost:3000`.
- **Impacto**: Bloqueante en desarrollo y producción cuando frontend y backend están en distintos orígenes.
- **Solución**: Añadir `app.enableCors({ origin: process.env.CORS_ORIGIN || 'http://localhost:4200', credentials: true })` en `main.ts`.

### [⚠️ Media] ESLint sin configuración
- **Problema**: Ambos proyectos tienen ESLint en devDependencies pero no hay `eslint.config.js`.
- **Impacto**: No se ejecuta lint automático, bugs de estilo y código no se detectan temprano.
- **Solución**: Generar configuración ESLint v9 plana con `npx eslint --init`.

### [⚠️ Media] Components grandes en frontend
- **Problema**: `BoardPageComponent` (311 líneas), `CardDetailModalComponent` (272 líneas), `KanbanColumnComponent` (223 líneas) mezclan template + lógica.
- **Impacto**: Dificultad de testing y mantenimiento.
- **Solución**: Extraer lógica a servicios o subcomponentes más pequeños.

### [⚠️ Media] Warnings de imports no utilizados (build ng)
- **Problema**: `DatePipe`, `RouterLink`, `LoadingSkeletonComponent` importados pero no usados en templates.
- **Impacto**: Código muerto, ligeramente mayor bundle size.
- **Solución**: Eliminar imports no utilizados de `CardDetailModalComponent`, `KanbanColumnComponent` y `BoardPageComponent`.

### [⚠️ Media] `synchronize: true` en TypeORM
- **Problema**: `TypeOrmModule.forRootAsync` usa `synchronize: true`.
- **Impacto**: En producción, cualquier cambio de schema elimina datos existentes.
- **Solución**: Usar migraciones en producción (`synchronize: false`, ejecutar migraciones con `typeorm migration:run`).

### [⚠️ Media] Labels almacenados como JSON string
- **Problema**: `Card.labels` es `string | null` con `JSON.stringify(labels)` al guardar.
- **Impacto**: No se pueden hacer queries directas por etiqueta en DB; propenso a errores de parseo.
- **Solución**: Usar una tabla de etiquetas con relación ManyToMany o array en PostgreSQL/Neon.

### [📝 Baja] JWT_SECRET placeholder en .env.example
- **Problema**: `.env.example` contiene `JWT_SECRET=your-super-secret-key-change-in-production`.
- **Impacto**: Podría desplegarse accidentalmente con secret débil.
- **Solución**: Añadir advertencia clara y generar secret aleatorio en producción.

### [📝 Baja] No hay proxy.conf.json
- **Problema**: Sin proxy, el frontend Angular en desarrollo necesita URL completa o configuración CORS extra.
- **Solución**: Añadir `proxy.conf.json` con destino `http://localhost:3000`.

## Tests nuevos

| Archivo | Tests | Qué prueba |
|---|---|---|
| `src/auth/auth.service.spec.ts` | 6 | Registro (creación, hash bcrypt), login (válido, usuario no existe, password erroneo), perfil |
| `src/boards/boards.service.spec.ts` | 10 | Listar por usuario, crear (con columnas default, color default), buscar por ID (ok, no encontrado, otro usuario), actualizar, eliminar |
| `src/cards/cards.service.spec.ts` | 10 | Buscar por board, buscar por ID, crear (posición automática, columna inexistente), actualizar, mover (misma columna abajo/arriba, columna distinta), eliminar |

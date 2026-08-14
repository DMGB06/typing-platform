# Context Pack (docs/contexto/) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 6 grounded context docs in `docs/contexto/` for the `typing-platform` monorepo (NestJS backend + Next.js frontend) by reading the actual repo, then wire them into a root `CLAUDE.md` so Claude Code loads them automatically.

**Architecture:** One task per doc (6 tasks), each task inspects a specific slice of the real repo (package.json, folder tree, Prisma schema, ESLint/Prettier config, git log, existing tests) and writes the doc following the user's exact template structure — no invented content, `[PENDIENTE: ...]` markers for anything not verifiable from the repo. A final task creates the root `CLAUDE.md` that references all 6 docs, and a closing review task cross-checks consistency and surfaces every `[PENDIENTE]` for the human to fill by hand.

**Tech Stack (confirmed from repo, 2026-08-13):**
- Backend (`apps/Backend`): NestJS 11, Prisma 5.22 (PostgreSQL), Passport + `@nestjs/jwt` (JWT auth), `class-validator`/`class-transformer`, Jest 30 (unit + e2e), ESLint 9 + Prettier 3 (`singleQuote: true`, `trailingComma: all`, `@typescript-eslint/no-explicit-any` is **off**).
- Frontend (`apps/Frontend`): Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, dev server on port 3001. No test runner configured (no `*.test.*`/`*.spec.*`/jest/vitest config found under `apps/Frontend`).
- Monorepo root: `C:\Users\denil\PROYECTOS\DMGB\typing-platform\typing-platform` (git repo, branch `main`, clean at plan time). No `docs/` or root `CLAUDE.md` exists yet.

**Spec:** No separate spec file — the spec is the 6 Markdown templates + generator prompt the user pasted directly in this conversation (Skool post "Pack de contexto para Claude Code"). This plan encodes that spec directly; there was no prior brainstorming doc to link.

## Global Constraints

- Base every doc SOLELY on what is verifiable in the repo (code, `package.json`, `schema.prisma`, `git log`, tests, READMEs). Never invent.
- Where information is insufficient, write `[PENDIENTE: <what's missing>]` instead of guessing.
- Each doc must be readable in under 2 minutes: concrete, brief, no filler.
- Follow the section structure of the user's 6 templates exactly — do not add or remove `##` sections.
- `decisiones.md` and `errores-conocidos.md` encode tacit knowledge that often isn't in the code. Mark clearly which entries are inferred from evidence (cite the file/commit) vs. which are `[PENDIENTE]` for the human.
- All file paths written into the docs must be real, existing paths in this repo — verify before writing.

---

## File Structure

- Create: `docs/contexto/arquitectura.md`
- Create: `docs/contexto/convenciones.md`
- Create: `docs/contexto/decisiones.md`
- Create: `docs/contexto/glosario.md`
- Create: `docs/contexto/flujo-de-trabajo.md`
- Create: `docs/contexto/errores-conocidos.md`
- Create: `CLAUDE.md` (repo root)

---

### Task 1: `docs/contexto/arquitectura.md`

**Files:**
- Create: `docs/contexto/arquitectura.md`

**Interfaces:**
- Produces: a doc with exactly 5 `##` sections (`En una frase`, `Stack`, `Mapa de carpetas`, `Flujo de datos`, `Lo que NO existe (y no hay que crear)`). Task 7 links to this file as `@docs/contexto/arquitectura.md`. Task 8 checks its folder-path claims against Tasks 2-6.

- [ ] **Step 1: Inspect the real structure**

Run (from repo root `apps/../..`, i.e. `typing-platform/typing-platform`):

```bash
find apps/Backend/src -maxdepth 3 -not -path "*/node_modules/*"
find apps/Frontend/src -maxdepth 3 -not -path "*/node_modules/*"
cat apps/Backend/prisma/schema.prisma
cat apps/Backend/README.md apps/Frontend/README.md
```

Confirm module list under `apps/Backend/src/modules` (expected at plan time: `admin`, `auth`, `text`, `typing-sessions`, `users`) and app-router routes under `apps/Frontend/src/app` (expected: `about`, `auth/login`, `auth/register`, `leaderboard`, `notifications`, `profile`, `settings`, root `page.tsx`). Note any drift from this list — the repo is the source of truth, not this plan.

- [ ] **Step 2: Write the doc**

```markdown
# Arquitectura

## En una frase
Plataforma de mecanografía (typing platform): backend NestJS con PostgreSQL/Prisma expone una API REST con auth JWT; frontend Next.js consume esa API para practicar textos de mecanografía, ver estadísticas y un leaderboard.

## Stack
- Lenguaje / runtime: TypeScript (Node.js) en ambas apps
- Framework principal: NestJS 11 (backend) · Next.js 16 App Router + React 19 (frontend, puerto dev 3001)
- Base de datos: PostgreSQL vía Prisma 5.22 (`apps/Backend/prisma/schema.prisma`)
- Auth: Passport + `@nestjs/jwt` (JWT), hashing con `bcrypt`
- Estilos frontend: Tailwind CSS 4
- Servicios externos: [PENDIENTE: no se detectan integraciones externas (email, storage, pagos, etc.) en package.json — confirmar si existen]

## Mapa de carpetas
- `apps/Backend/src/modules/` → módulos de dominio (uno por feature: `auth`, `users`, `text`, `typing-sessions`, `admin`)
- `apps/Backend/src/common/` → decoradores y guards compartidos (`current-user.decorator.ts`, `guards/`)
- `apps/Backend/src/Prisma/` → `PrismaModule`/`PrismaService`, cliente de base de datos compartido
- `apps/Backend/src/types/` → tipos compartidos (`express.d.ts`, `user.types.ts`)
- `apps/Backend/prisma/` → `schema.prisma` + `migrations/` + `seed.ts`
- `apps/Frontend/src/app/` → rutas (Next.js App Router): `auth/`, `about/`, `leaderboard/`, `notifications/`, `profile/`, `settings/`
- `apps/Frontend/src/components/` → componentes por dominio: `auth/`, `layout/`, `typing/`, `ui/`
- `apps/Frontend/src/hooks/` → hooks (`useAuth`, `useAuthForm`, `useCatalogs`)
- `apps/Frontend/src/lib/api/` → cliente HTTP y llamadas a la API backend (`client.ts`, `auth.ts`, `texts.ts`)
- `apps/Frontend/src/types/` → tipos compartidos del frontend

## Flujo de datos
El frontend (`apps/Frontend/src/lib/api/client.ts`) llama a la API NestJS. Las rutas protegidas pasan por un guard JWT (`apps/Backend/src/modules/auth/guards/`) que valida el token y expone el usuario vía `@current-user.decorator.ts`. Los controladores (`*.controller.ts`) delegan en servicios (`*.service.ts`), que usan `PrismaService` para leer/escribir en PostgreSQL. Catálogos (`Difficulty`, `Language`) y `Text` se filtran server-side antes de servirse a una `TypingSession`.

## Lo que NO existe (y no hay que crear)
- No hay capa de caché (Redis ni en memoria) — no la introduzcas sin que se decida explícitamente.
- No hay tests configurados en el frontend (`apps/Frontend`) — no asumas un `npm test` ahí.
- [PENDIENTE: confirmar si hay WebSockets/tiempo real para sesiones de mecanografía en vivo, o si todo es request/response]
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## " docs/contexto/arquitectura.md
```

Expected: `5`. Then spot-check every backtick-quoted path in the file actually exists (`apps/Backend/src/modules/auth`, `apps/Backend/prisma`, etc.) — any path that doesn't exist must be fixed or removed before committing.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/arquitectura.md
git commit -m "docs: add arquitectura.md context doc"
```

---

### Task 2: `docs/contexto/convenciones.md`

**Files:**
- Create: `docs/contexto/convenciones.md`

**Interfaces:**
- Produces: a doc with exactly 5 `##` sections (`Estilo`, `Patrones que SÍ usamos`, `Patrones PROHIBIDOS`, `Tests`, `Commits`).

- [ ] **Step 1: Inspect real conventions**

```bash
cat apps/Backend/.prettierrc
cat apps/Backend/eslint.config.mjs
cat apps/Frontend/eslint.config.mjs
git log --oneline -30
```

Already confirmed from `apps/Backend/eslint.config.mjs`: Prettier enforced via `eslint-plugin-prettier`, `singleQuote: true`, `trailingComma: all`, `endOfLine: auto`; `@typescript-eslint/no-explicit-any` is explicitly **off** (so `any` is allowed here, unlike many teams' defaults — do not claim it's prohibited). `no-floating-promises`, `no-unsafe-*` rules are set to `warn`, not `error`.

From `git log --oneline -30`: commit subjects are inconsistent — mix of `feat:`, `feat :`, `fix:`, `fixed:`, plain `fix`, some without a space after the colon, several written in Spanish, no scope convention. This is real signal for the "Commits" section — do not claim Conventional Commits is enforced; state what's actually observed.

- [ ] **Step 2: Write the doc**

```markdown
# Convenciones de código

## Estilo
- Formato: Prettier (backend: `.prettierrc` → `singleQuote: true`, `trailingComma: "all"`, `endOfLine: auto`); ESLint + `eslint-plugin-prettier` enforce it (`apps/Backend/eslint.config.mjs`). Frontend usa `eslint-config-next` (`apps/Frontend/eslint.config.mjs`) [PENDIENTE: confirmar si hay `.prettierrc` propio en Frontend o si solo hereda reglas de Next]
- Naming: módulos backend en `kebab-case` de carpeta + `PascalCase` de clase (`typing-sessions/typing-sessions.service.ts` → `TypingSessionsService`); componentes frontend en `PascalCase.tsx` (`AuthInput.tsx`, `LoginForm.tsx`)
- Imports: [PENDIENTE: no hay regla de ESLint para orden de imports ni alias configurados explícitamente — confirmar si se usan imports absolutos vía `tsconfig.json` paths]

## Patrones que SÍ usamos
- Módulos NestJS por dominio, cada uno con `*.module.ts` + `*.controller.ts` + `*.service.ts` (ver `apps/Backend/src/modules/*`)
- Guard JWT + decorador `@CurrentUser` para rutas autenticadas (`apps/Backend/src/common/decorators/`, `modules/auth/guards/`)
- `class-validator`/`class-transformer` para DTOs de entrada (`dto/` en cada módulo)
- Hooks personalizados en frontend para lógica compartida (`useAuth`, `useAuthForm`, `useCatalogs`)

## Patrones PROHIBIDOS
- `@typescript-eslint/no-explicit-any` está **desactivado** en el backend — `any` no está prohibido por lint, pero úsalo con criterio, no por defecto
- [PENDIENTE: no hay reglas ESLint que prohíban explícitamente patrones de negocio (p.ej. lógica de negocio en componentes) — confirmar con el autor si existe una convención tácita]

## Tests
- Dónde van: backend usa Jest, specs junto al código (`*.spec.ts` co-ubicado, p.ej. `auth.service.spec.ts` junto a `auth.service.ts`); e2e en `apps/Backend/test/` (`test:e2e` en `package.json`)
- Qué se testea sí o sí: [PENDIENTE: no hay política de cobertura mínima en `package.json` ni CI detectado — confirmar]
- Frontend: no hay test runner configurado (`apps/Frontend/package.json` no tiene `test` script ni jest/vitest instalado) — [PENDIENTE: confirmar si se planea añadir]

## Commits
- Formato: no hay Conventional Commits estricto. `git log --oneline -30` muestra mezcla de `feat:`, `fix:`, `fixed:`, `feaet:` (typo), mensajes en español, sin scope. Trata el prefijo `feat:`/`fix:` como convención informal, no como regla validada por herramienta.
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## " docs/contexto/convenciones.md
```

Expected: `5`.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/convenciones.md
git commit -m "docs: add convenciones.md context doc"
```

---

### Task 3: `docs/contexto/decisiones.md`

**Files:**
- Create: `docs/contexto/decisiones.md`

**Interfaces:**
- Produces: a doc with one `## [Fecha] · [Título]` entry per detected decision, each with `**Decisión:**`, `**Por qué:**`, `**Descartado:**`, `**Estado:**` bullets.

- [ ] **Step 1: Inspect for decision evidence**

```bash
git log --oneline --all | grep -iE "text-types|text_types|prisma|module"
find apps/Backend/prisma/migrations -maxdepth 1
sed -n '1,80p' apps/Backend/prisma/schema.prisma
```

Already found real evidence: two migrations named `remove_text_types` (`20260216051506_remove_text_types`, `20260216054113_remove_text_types`) exist, yet `schema.prisma` still defines a `TextType` model with a comment `// AGREGADO - Faltaba este modelo` and `type: TextType // ⭐ AGREGADO` on `Text`. This is a real, citable decision-in-progress (or reversal) — do not resolve the contradiction by guessing; document it as observed and mark the open question.

- [ ] **Step 2: Write the doc**

```markdown
# Decisiones tomadas

> Una entrada por decisión. Lo importante es el "por qué" y el "qué descartamos".

## [PENDIENTE: fecha exacta] · Autenticación vía JWT con Passport
- **Decisión:** usar `@nestjs/jwt` + `passport-jwt` para autenticación, con guard + `@CurrentUser` decorator
- **Por qué:** [PENDIENTE: no hay comentario ni commit que explique el porqué — confirmar con el autor]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron sesiones/cookies u otro esquema]
- **Estado:** vigente (código en `apps/Backend/src/modules/auth/` a fecha de este doc)

## [PENDIENTE: fecha exacta] · Modelo `TextType`: eliminado y luego re-agregado (estado ambiguo)
- **Decisión:** el historial de migraciones tiene dos migraciones `remove_text_types` (`20260216051506`, `20260216054113`), pero `apps/Backend/prisma/schema.prisma` actualmente SÍ define `model TextType` con comentarios `// AGREGADO - Faltaba este modelo` y `// ⭐ AGREGADO` en la relación de `Text`
- **Por qué:** [PENDIENTE: contradicción sin explicar en commits — requiere confirmación directa del autor sobre el estado real deseado]
- **Descartado:** [PENDIENTE]
- **Estado:** revisar — posible inconsistencia entre migraciones aplicadas y schema actual, confirmar antes de tocar este módulo

## [PENDIENTE: fecha exacta] · Monorepo con `apps/Backend` (NestJS) y `apps/Frontend` (Next.js)
- **Decisión:** separar backend y frontend como apps independientes dentro de un mismo repo, sin workspace tool visible (no hay `pnpm-workspace.yaml`/`turbo.json`/`nx.json` en la raíz)
- **Por qué:** [PENDIENTE: confirmar si es intencional o pendiente de tooling de monorepo]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron repos separados]
- **Estado:** vigente
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## \[" docs/contexto/decisiones.md
grep -c "\*\*Decisión:\*\*" docs/contexto/decisiones.md
```

Both counts must match (one `**Decisión:**` per `## [...]` entry). Confirm every entry also has `**Por qué:**`, `**Descartado:**`, `**Estado:**`.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/decisiones.md
git commit -m "docs: add decisiones.md context doc"
```

---

### Task 4: `docs/contexto/glosario.md`

**Files:**
- Create: `docs/contexto/glosario.md`

**Interfaces:**
- Produces: a doc with exactly 3 `##` sections (`Términos del dominio`, `Entidades principales`, `Siglas y nombres internos`). Entity names here must match the model names used in Task 1's `Flujo de datos` section.

- [ ] **Step 1: Inspect entities**

```bash
grep -n "^model \|^enum " apps/Backend/prisma/schema.prisma
```

Read the full `schema.prisma` (not just the first 120 lines already seen) to get every model and its key relations before writing — the file has more models below `UserStatsByDifficulty` (at least `UserTextHistory`, `TypingSession` per the folder/module names) that haven't been read yet.

- [ ] **Step 2: Write the doc**

```markdown
# Glosario y entidades

## Términos del dominio
- **Typing session** → una sesión de práctica de mecanografía de un usuario sobre un `Text` concreto (`apps/Backend/src/modules/typing-sessions/`)
- **Difficulty** → catálogo de dificultad asignado a un `Text` (`difficulties` en la base de datos)
- **Catálogo** → término usado en el código (`catalogs.controller.ts`) para los datos de referencia administrables: `Difficulty`, `Language` [PENDIENTE: confirmar si `TextType` sigue siendo catálogo vigente, ver `decisiones.md`]

## Entidades principales
- **User** → `id, username, email, passwordHash, role (USER|ADMIN), isActive`; relaciona con `TypingSession[]`, `UserStatsByDifficulty[]`, `UserTextHistory[]`, `createdTexts` (`apps/Backend/prisma/schema.prisma`)
- **Text** → `id, title, content, difficultyId, typeId, languageId, createdById, isActive`; texto de práctica con filtros indexados (`idx_text_filters` sobre difficulty/type/language)
- **Difficulty** → catálogo de dificultad, con `orderIndex` para ordenar en UI
- **Language** → catálogo de idiomas (`code`, `name`)
- [PENDIENTE: documentar `TypingSession`, `UserStatsByDifficulty`, `UserTextHistory` — leer el resto de `schema.prisma` más allá de la línea 120]

## Siglas y nombres internos
- **DTO** → Data Transfer Object, clases de validación de entrada bajo cada `modules/*/dto/` (con `class-validator`)
- [PENDIENTE: no se detectan siglas o nombres de módulo ambiguos adicionales — confirmar con el autor]
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## " docs/contexto/glosario.md
```

Expected: `3`. Cross-check every entity name listed here appears with the same name in `docs/contexto/arquitectura.md`'s "Flujo de datos" section.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/glosario.md
git commit -m "docs: add glosario.md context doc"
```

---

### Task 5: `docs/contexto/flujo-de-trabajo.md`

**Files:**
- Create: `docs/contexto/flujo-de-trabajo.md`

**Interfaces:**
- Produces: a doc with exactly 4 `##` sections (`Antes de tocar nada`, `Para hacer un cambio`, `Antes de dar algo por terminado`, `Deploy`).

- [ ] **Step 1: Inspect available scripts and CI**

```bash
grep -A6 '"scripts"' apps/Backend/package.json
grep -A6 '"scripts"' apps/Frontend/package.json
find . -maxdepth 2 -iname ".github" -o -iname "*.yml" 2>/dev/null | grep -v node_modules
```

No CI config or deploy scripts are known to exist yet at plan time — confirm during execution and mark `Deploy` as `[PENDIENTE]` if nothing turns up.

- [ ] **Step 2: Write the doc**

```markdown
# Flujo de trabajo

## Antes de tocar nada
1. Leer `docs/contexto/decisiones.md`, en particular la entrada sobre `TextType` (estado ambiguo) antes de tocar el módulo `text` o `admin`
2. Revisar en qué app estás: `apps/Backend` (NestJS) o `apps/Frontend` (Next.js) — tienen scripts y stacks independientes

## Para hacer un cambio
1. Backend: escribir/actualizar el `*.spec.ts` correspondiente antes o junto con el cambio (Jest, co-ubicado con el código)
2. Implementar el cambio
3. Backend: `npm run lint` (ESLint con `--fix`) y `npm run build` (`nest build`) en `apps/Backend`
4. Frontend: `npm run lint` en `apps/Frontend` — no hay `test` script, no hay paso de test automatizado que correr
5. Si el cambio toca `schema.prisma`: generar migración con Prisma antes de tocar código que dependa del nuevo esquema

## Antes de dar algo por terminado
- [ ] Backend: `npm run test` pasa en `apps/Backend`
- [ ] Backend: `npm run build` pasa en `apps/Backend`
- [ ] Frontend: `npm run build` pasa en `apps/Frontend`
- [ ] Backend: `npm run lint` sin errores nuevos (warnings de `no-floating-promises`/`no-unsafe-*` son aceptados hoy, no los conviertas en bloqueantes sin decidirlo aparte)
- [ ] No quedan `console.log` de depuración

## Deploy
[PENDIENTE: no se detectó configuración de CI/CD, Dockerfile, ni scripts de deploy en el repo a fecha de este doc — confirmar cómo se publica actualmente]
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## " docs/contexto/flujo-de-trabajo.md
```

Expected: `4`.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/flujo-de-trabajo.md
git commit -m "docs: add flujo-de-trabajo.md context doc"
```

---

### Task 6: `docs/contexto/errores-conocidos.md`

**Files:**
- Create: `docs/contexto/errores-conocidos.md`

**Interfaces:**
- Produces: a doc with one `## <síntoma>` entry per detected gotcha (each with `**Pasa cuando:**`, `**Causa real:**`, `**Solución:**`), plus a closing `## Cosas que parecen rotas pero son a propósito` section.

- [ ] **Step 1: Inspect for gotchas**

```bash
sed -n '1,50p' apps/Backend/prisma/schema.prisma
find apps/Backend -iname "*.backup"
cat apps/Backend/prisma.config.ts.backup 2>/dev/null | head -30
```

Already found two concrete gotchas: (1) the `TextType` model/migration contradiction from Task 3; (2) a stray `apps/Backend/prisma.config.ts.backup` file sitting next to `prisma/` — confirm during execution whether `prisma.config.ts` (no `.backup`) exists and is the active one, or whether this backup is dead weight that should eventually be removed (do not delete it in this task — just document it).

- [ ] **Step 2: Write the doc**

```markdown
# Errores conocidos (gotchas)

> Las trampas que ya te han mordido. Cada una ahorra una hora de Claude (y tuya).

## `TextType` parece eliminado pero sigue en el schema
- **Pasa cuando:** buscas por qué existen migraciones `remove_text_types` (dos, incluso) y aun así `Text.typeId`/`TextType` siguen activos en `schema.prisma`
- **Causa real:** [PENDIENTE: no confirmado — ver `docs/contexto/decisiones.md`, entrada "Modelo TextType"]
- **Solución:** antes de tocar el módulo `text`/`admin/text`, confirma con el autor si `TextType` debe seguir existiendo o si el schema quedó desincronizado de las migraciones aplicadas

## Hay un `prisma.config.ts.backup` junto a `prisma/`
- **Pasa cuando:** buscas la config de Prisma y encuentras `apps/Backend/prisma.config.ts.backup` en vez de (o además de) un `prisma.config.ts` activo
- **Causa real:** [PENDIENTE: confirmar si es un archivo de respaldo intencional o un resto de una migración de configuración a medio hacer]
- **Solución:** no asumas que `prisma.config.ts.backup` está en uso; verifica qué archivo de config lee realmente Prisma antes de depender de él

## Cosas que parecen rotas pero son a propósito
- `@typescript-eslint/no-explicit-any` está desactivado a propósito en `apps/Backend/eslint.config.mjs` — no lo "arregles" activándolo sin que se decida aparte
- El frontend no tiene tests configurados — no es un test suite roto, es que no existe; no lo reportes como fallo si `npm test` no existe en `apps/Frontend`
```

- [ ] **Step 3: Verify structure**

```bash
grep -c "^## Cosas que parecen rotas" docs/contexto/errores-conocidos.md
```

Expected: `1` (the closing section must be present exactly once). Confirm every non-closing `## ` entry has `**Pasa cuando:**`, `**Causa real:**`, `**Solución:**`.

- [ ] **Step 4: Commit**

```bash
git add docs/contexto/errores-conocidos.md
git commit -m "docs: add errores-conocidos.md context doc"
```

---

### Task 7: Root `CLAUDE.md` wiring

**Files:**
- Create: `CLAUDE.md` (repo root: `typing-platform/typing-platform/CLAUDE.md`)

**Interfaces:**
- Consumes: filenames from Tasks 1-6 (`docs/contexto/arquitectura.md`, `convenciones.md`, `decisiones.md`, `glosario.md`, `flujo-de-trabajo.md`, `errores-conocidos.md` — all must exist by this point).
- Produces: root `CLAUDE.md` that Claude Code loads automatically at session start in this repo.

- [ ] **Step 1: Confirm all 6 docs exist**

```bash
ls docs/contexto/
```

Expected: exactly `arquitectura.md convenciones.md decisiones.md errores-conocidos.md flujo-de-trabajo.md glosario.md`.

- [ ] **Step 2: Write root CLAUDE.md**

```markdown
# typing-platform

Monorepo: `apps/Backend` (NestJS + Prisma + PostgreSQL) y `apps/Frontend` (Next.js + React + Tailwind).

## Contexto del proyecto

- Arquitectura → @docs/contexto/arquitectura.md
- Convenciones → @docs/contexto/convenciones.md
- Decisiones → @docs/contexto/decisiones.md
- Glosario → @docs/contexto/glosario.md
- Flujo de trabajo → @docs/contexto/flujo-de-trabajo.md
- Errores conocidos → @docs/contexto/errores-conocidos.md

Actualiza solo el doc del eje que cambió cuando el proyecto evolucione. Un doc desactualizado miente con más confianza que uno que no existe.
```

- [ ] **Step 3: Verify references resolve**

```bash
grep -oP '@docs/contexto/\K[a-z-]+\.md' CLAUDE.md
```

For each filename printed, confirm `docs/contexto/<filename>` exists (`ls docs/contexto/<filename>`). All 6 must resolve.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: wire context pack into root CLAUDE.md"
```

---

### Task 8: Final cross-review

**Files:**
- Modify: any of the 6 docs under `docs/contexto/` if inconsistencies are found (no new files created).

**Interfaces:**
- Consumes: all 6 docs from Tasks 1-6 plus `CLAUDE.md` from Task 7.

- [ ] **Step 1: Consistency pass**

Read all 7 files together and check:
- Every folder/file path cited in `arquitectura.md`, `convenciones.md`, `flujo-de-trabajo.md` and `errores-conocidos.md` actually exists in the repo (spot-check with `ls`/`find` for anything not already verified in its own task).
- Entity names in `glosario.md` match the names used in `arquitectura.md`'s "Flujo de datos".
- The `TextType` gotcha is described consistently across `decisiones.md` and `errores-conocidos.md` (same facts, not contradicting claims).
- No section header deviates from the user's original 6 templates.

- [ ] **Step 2: Collect every `[PENDIENTE: ...]` marker for the user**

```bash
grep -rn "\[PENDIENTE" docs/contexto/ | sed 's/^/- /'
```

Paste this list back to the user as-is — per the user's own "Nota de uso honesta", `decisiones.md` and `errores-conocidos.md` in particular need human confirmation, not further guessing.

- [ ] **Step 3: Commit any fixes from Step 1**

```bash
git add docs/contexto/
git commit -m "docs: cross-review fixes for context pack"
```

Skip this commit if Step 1 found nothing to change.

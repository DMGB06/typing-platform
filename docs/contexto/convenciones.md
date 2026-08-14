# Convenciones de código

## Estilo
- Formato: Prettier (backend: `.prettierrc` → `singleQuote: true`, `trailingComma: "all"`, `endOfLine: auto`); ESLint + `eslint-plugin-prettier` enforce it (`apps/Backend/eslint.config.mjs`). Frontend usa `eslint-config-next` (`apps/Frontend/eslint.config.mjs`) [PENDIENTE: confirmar si hay `.prettierrc` propio en Frontend o si solo hereda reglas de Next]
- Naming: módulos backend en `kebab-case` de carpeta + `PascalCase` de clase (`typing-sessions/typing-sessions.service.ts` → `TypingSessionsService`); componentes frontend en `PascalCase.tsx` (`AuthInput.tsx`, `LoginForm.tsx`)
- Imports: Frontend usa alias `@/*` → `./src/*` (`apps/Frontend/tsconfig.json`, líneas 21-23); imports absolutos activamente usados en todo `src/` (p.ej. `useAuth.ts`, `Navbar.tsx`, `lib/api/auth.ts`). [PENDIENTE: no hay regla de ESLint explícita para orden de imports]

## Patrones que SÍ usamos
- Módulos NestJS por dominio, cada uno con `*.module.ts` + `*.controller.ts` + `*.service.ts` (ver `apps/Backend/src/modules/*`)
- Guard JWT + decorador `@CurrentUser` para rutas autenticadas (`apps/Backend/src/common/decorators/`, `modules/auth/guards/`)
- `class-validator`/`class-transformer` para DTOs de entrada (`dto/` en cada módulo)
- Hooks personalizados en frontend para lógica compartida (`useAuth`, `useAuthForm`, `useCatalogs`)

## Patrones PROHIBIDOS
- `@typescript-eslint/no-explicit-any` está **desactivado** en el backend - `any` no está prohibido por lint, pero úsalo con criterio, no por defecto
- [PENDIENTE: no hay reglas ESLint que prohíban explícitamente patrones de negocio (p.ej. lógica de negocio en componentes) - confirmar con el autor si existe una convención tácita]

## Tests
- Dónde van: backend usa Jest, specs junto al código (`*.spec.ts` co-ubicado, p.ej. `auth.service.spec.ts` junto a `auth.service.ts`); e2e en `apps/Backend/test/` (`test:e2e` en `package.json`)
- Qué se testea sí o sí: [PENDIENTE: no hay política de cobertura mínima en `package.json` ni CI detectado - confirmar]
- Frontend: no hay test runner configurado (`apps/Frontend/package.json` no tiene `test` script ni jest/vitest instalado). [PENDIENTE: confirmar si se planea añadir]

## Commits
- Formato: no hay Conventional Commits estricto. `git log --oneline -30` muestra mezcla de `feat:`, `fix:`, `fixed:`, `feaet:` (typo), mensajes en español, sin scope. Trata el prefijo `feat:`/`fix:` como convención informal, no como regla validada por herramienta.

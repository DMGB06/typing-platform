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

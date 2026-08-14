# Arquitectura

## En una frase
Plataforma de mecanografía (typing platform): backend NestJS con PostgreSQL/Prisma expone una API REST con auth JWT; frontend Next.js consume esa API para practicar textos de mecanografía, ver estadísticas y un leaderboard.

## Stack
- Lenguaje / runtime: TypeScript (Node.js) en ambas apps
- Framework principal: NestJS 11 (backend) · Next.js 16 App Router + React 19 (frontend, puerto dev 3001)
- Base de datos: PostgreSQL vía Prisma 5.22 (`apps/Backend/prisma/schema.prisma`)
- Auth: Passport + `@nestjs/jwt` (JWT), hashing con `bcrypt`
- Estilos frontend: Tailwind CSS 4
- Servicios externos: [PENDIENTE: no se detectan integraciones externas (email, storage, pagos, etc.) en package.json - confirmar si existen]
- Puertos: frontend en 3001 (dev), backend en 3000 por defecto (`process.env.PORT ?? 3000`, `apps/Backend/src/main.ts:23`)
- Gestores de paquetes: `apps/Backend` usa **pnpm** (`pnpm-lock.yaml` + `apps/.npmrc` con hoisting específico de pnpm/Prisma); `apps/Frontend` usa **npm** (`package-lock.json`). No ejecutes `npm install` dentro de `apps/Backend` - crearía un lockfile competidor y podría romper el hoisting de Prisma.
- Variables de entorno requeridas (no hay `.env.example` en el repo): `DATABASE_URL` (datasource de Prisma), `JWT_SECRET` (`auth.module.ts:14` cae a `'tu-secreto-muy-seguro'` si falta, `jwt.strategy.ts:19` cae a `''` si falta, `users.module.ts:11` sin fallback), `PORT` (backend, default 3000), `NEXT_PUBLIC_API_URL` (frontend, `lib/api/client.ts:5`, default `http://localhost:3000`)

## Mapa de carpetas
- `apps/Backend/src/modules/` → módulos de dominio (uno por feature: `auth`, `users`, `text`, `typing-sessions`, `admin`)
- `apps/Backend/src/common/` → decoradores y guards compartidos (`current-user.decorator.ts`, `guards/`)
- `apps/Backend/src/Prisma/` → `PrismaModule`/`PrismaService`, cliente de base de datos compartido
- `apps/Backend/src/types/` → tipos propios del backend (`express.d.ts`, `user.types.ts`), no compartidos con frontend
- `apps/Backend/prisma/` → `schema.prisma` + `migrations/` + `seed.ts`
- `apps/Frontend/src/app/` → rutas (Next.js App Router): `auth/`, `about/`, `leaderboard/`, `notifications/`, `profile/`, `settings/`
- `apps/Frontend/src/components/` → componentes por dominio: `auth/`, `layout/`, `typing/`, `ui/`
- `apps/Frontend/src/hooks/` → hooks (`useAuth`, `useAuthForm`, `useCatalogs`)
- `apps/Frontend/src/lib/api/` → cliente HTTP y llamadas a la API backend (`client.ts`, `auth.ts`, `texts.ts`)
- `apps/Frontend/src/types/` → tipos propios del frontend (no compartidos con backend)
- `apps/packages/shared/` → actualmente vacío (`types.ts` sin contenido); pensado como el lugar para tipos compartidos entre `Backend` y `Frontend`, pero aún no se usa

## Flujo de datos
El frontend (`apps/Frontend/src/lib/api/client.ts`) llama a la API NestJS. Las rutas protegidas pasan por un guard JWT (`apps/Backend/src/modules/auth/guards/`) que valida el token y expone el usuario vía `@current-user.decorator.ts`. Los controladores (`*.controller.ts`) delegan en servicios (`*.service.ts`), que usan `PrismaService` para leer/escribir en PostgreSQL. Catálogos (`Difficulty`, `Language`) y `Text` se filtran server-side antes de servirse a una `TypingSession`.

## Lo que NO existe (y no hay que crear)
- No hay capa de caché (Redis ni en memoria). No la introduzcas sin que se decida explícitamente.
- No hay tests configurados en el frontend (`apps/Frontend`). No asumas un `npm test` ahí.
- No hay WebSockets ni tiempo real (confirmado: sin `socket.io`, `@nestjs/websockets` ni ningún `WebSocketGateway` en `apps/Backend/src` o `package.json`). Todo es request/response.

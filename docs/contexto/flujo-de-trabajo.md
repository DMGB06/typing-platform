# Flujo de trabajo

## Antes de tocar nada
1. Revisar en qué app estás: `apps/Backend` (NestJS, pnpm) o `apps/Frontend` (Next.js, npm) - tienen scripts, stacks y gestores de paquetes independientes
2. El historial de migraciones de `TextType` tiene una migración con nombre engañoso (`20260216054113_remove_text_types` en realidad re-crea la tabla); no afecta el estado actual del schema, ver `docs/contexto/decisiones.md` si tienes curiosidad

## Para hacer un cambio
1. Backend: escribir/actualizar el `*.spec.ts` correspondiente antes o junto con el cambio (Jest, co-ubicado con el código)
2. Implementar el cambio
3. Backend (usa pnpm, no npm): `pnpm run lint` (ESLint con `--fix`) y `pnpm run build` (`nest build`) en `apps/Backend`
4. Frontend (usa npm): `npm run lint` en `apps/Frontend` - no hay `test` script, no hay paso de test automatizado que correr
5. Si el cambio toca `schema.prisma`: generar migración con `npx prisma migrate dev` antes de tocar código que dependa del nuevo esquema (requiere `prisma.config.ts` activo y `DATABASE_URL`, ver `docs/contexto/errores-conocidos.md`)

## Antes de dar algo por terminado
- [ ] Backend: `pnpm run test` pasa en `apps/Backend`
- [ ] Backend: `pnpm run build` pasa en `apps/Backend`
- [ ] Frontend: `npm run build` pasa en `apps/Frontend`
- [ ] Backend: `pnpm run lint` sin errores nuevos (warnings de `no-floating-promises`/`no-unsafe-*` son aceptados hoy, no los conviertas en bloqueantes sin decidirlo aparte)
- [ ] No quedan `console.log` de depuración

## Deploy
[PENDIENTE: no se detectó configuración de CI/CD, Dockerfile, ni scripts de deploy en el repo a fecha de este doc. Confirmar cómo se publica actualmente.]

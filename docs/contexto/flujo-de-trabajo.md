# Flujo de trabajo

## Antes de tocar nada
1. Leer `docs/contexto/decisiones.md`, en particular la entrada sobre `TextType` (estado ambiguo) antes de tocar el módulo `text` o `admin`
2. Revisar en qué app estás: `apps/Backend` (NestJS) o `apps/Frontend` - tienen scripts y stacks independientes

## Para hacer un cambio
1. Backend: escribir/actualizar el `*.spec.ts` correspondiente antes o junto con el cambio (Jest, co-ubicado con el código)
2. Implementar el cambio
3. Backend: `npm run lint` (ESLint con `--fix`) y `npm run build` (`nest build`) en `apps/Backend`
4. Frontend: `npm run lint` en `apps/Frontend` - no hay `test` script, no hay paso de test automatizado que correr
5. Si el cambio toca `schema.prisma`: generar migración con Prisma antes de tocar código que dependa del nuevo esquema

## Antes de dar algo por terminado
- [ ] Backend: `npm run test` pasa en `apps/Backend`
- [ ] Backend: `npm run build` pasa en `apps/Backend`
- [ ] Frontend: `npm run build` pasa en `apps/Frontend`
- [ ] Backend: `npm run lint` sin errores nuevos (warnings de `no-floating-promises`/`no-unsafe-*` son aceptados hoy, no los conviertas en bloqueantes sin decidirlo aparte)
- [ ] No quedan `console.log` de depuración

## Deploy
[PENDIENTE: no se detectó configuración de CI/CD, Dockerfile, ni scripts de deploy en el repo a fecha de este doc. Confirmar cómo se publica actualmente.]

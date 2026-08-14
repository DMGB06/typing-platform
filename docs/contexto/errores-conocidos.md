# Errores conocidos (gotchas)

> Las trampas que ya te han mordido. Cada una ahorra una hora de Claude (y tuya).

## `TextType` parece eliminado pero sigue en el schema
- **Pasa cuando:** buscas por qué existen migraciones `remove_text_types` (dos, incluso) y aun así `Text.typeId`/`TextType` siguen activos en `schema.prisma`
- **Causa real:** el historial de migraciones tiene dos migraciones `remove_text_types` (20260216051506 y 20260216054113), pero `apps/Backend/prisma/schema.prisma` actualmente SÍ define `model TextType` con comentarios `// AGREGADO - Faltaba este modelo` y `// ⭐ AGREGADO` en la relación de `Text`. Esto indica una posible inconsistencia entre las migraciones aplicadas y el schema actual (ver también `docs/contexto/decisiones.md`, entrada "Modelo TextType" para más detalles).
- **Solución:** antes de tocar el módulo `text`/`admin/text`, confirma con el autor si `TextType` debe seguir existiendo o si el schema quedó desincronizado de las migraciones aplicadas

## Solo existe `prisma.config.ts.backup`, no el archivo activo
- **Pasa cuando:** buscas la config de Prisma y encuentras `apps/Backend/prisma.config.ts.backup` pero NO existe un `prisma.config.ts` activo junto a él
- **Causa real:** solo existe el archivo de respaldo `prisma.config.ts.backup`, no un `prisma.config.ts` activo. [PENDIENTE: confirmar por qué existe solo el .backup y no el archivo activo - no hay evidencia clara en el repo de una migración de configuración a medio hacer]
- **Solución:** no asumas que `prisma.config.ts.backup` está en uso; verifica qué archivo de config lee realmente Prisma antes de depender de él. Este archivo es candidato para ser eliminado en el futuro si ya no se necesita.

## Cosas que parecen rotas pero son a propósito
- `@typescript-eslint/no-explicit-any` está desactivado a propósito en `apps/Backend/eslint.config.mjs` - no lo "arregles" activándolo sin que se decida aparte
- El frontend no tiene tests configurados - no es un test suite roto, es que no existe; no lo reportes como fallo si `npm test` no existe en `apps/Frontend`

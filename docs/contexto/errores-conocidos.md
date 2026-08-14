# Errores conocidos (gotchas)

> Las trampas que ya te han mordido. Cada una ahorra una hora de Claude (y tuya).

## No confíes en el nombre de una migración, lee su SQL
- **Pasa cuando:** buscas por qué existen dos migraciones `remove_text_types` y aun así `Text.typeId`/`TextType` siguen activos en `schema.prisma`, y asumes que el schema quedó desincronizado de las migraciones
- **Causa real:** `20260216051506_remove_text_types` sí elimina `text_types` (DROP TABLE + FK). Pero `20260216054113_remove_text_types` - con el mismo nombre - en realidad re-crea la tabla `text_types`, su índice único en `name` y la FK `texts.type_id → text_types.id` (además de un rename `created_by` → `created_by_id` sin relación). El nombre de la segunda migración se copió de la primera, pero su cuerpo hace lo contrario. Aplicadas en orden, el resultado coincide exactamente con `schema.prisma` (ver `docs/contexto/decisiones.md`, entrada "Modelo TextType").
- **Solución:** no infieras qué hace una migración a partir de su nombre de carpeta - lee el `migration.sql` directamente cuando investigues el historial de un modelo.

## Solo existe `prisma.config.ts.backup`, no el archivo activo
- **Pasa cuando:** buscas la config de Prisma y encuentras `apps/Backend/prisma.config.ts.backup` pero NO existe un `prisma.config.ts` activo junto a él
- **Causa real:** `apps/Backend/prisma/schema.prisma` no tiene `url` en su bloque `datasource db` (solo `provider = "postgresql"`). No existe ningún `.env`/`.env.*` en todo el repo. La única URL de datasource configurada vive en `apps/Backend/prisma.config.ts.backup` (`datasource: { url: process.env["DATABASE_URL"] }`), y Prisma no lee archivos `.backup`. Consecuencia: `prisma generate`, `prisma migrate` y `prisma db seed` fallan hoy con error de URL faltante.
- **Solución:** para que Prisma funcione, renombra `prisma.config.ts.backup` a `prisma.config.ts` y crea un `.env` con `DATABASE_URL` definido. No asumas que Prisma "simplemente funciona" en este repo tal como está.

## Cosas que parecen rotas pero son a propósito
- `@typescript-eslint/no-explicit-any` está desactivado a propósito en `apps/Backend/eslint.config.mjs` - no lo "arregles" activándolo sin que se decida aparte
- El frontend no tiene tests configurados - no es un test suite roto, es que no existe; no lo reportes como fallo si `npm test` no existe en `apps/Frontend`

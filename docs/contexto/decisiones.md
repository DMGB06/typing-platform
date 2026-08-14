# Decisiones tomadas

> Una entrada por decisión. Lo importante es el "por qué" y el "qué descartamos".

## [PENDIENTE: fecha exacta] · Autenticación vía JWT con Passport
- **Decisión:** usar `@nestjs/jwt` + `passport-jwt` para autenticación, con guard + `@CurrentUser` decorator
- **Por qué:** [PENDIENTE: no hay comentario ni commit que explique el porqué - confirmar con el autor]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron sesiones/cookies u otro esquema]
- **Estado:** vigente (código en `apps/Backend/src/modules/auth/` a fecha de este doc)

## [PENDIENTE: fecha exacta] · Modelo `TextType`: dos migraciones `remove_text_types`, una de ellas mal nombrada
- **Decisión:** el historial de migraciones tiene dos migraciones llamadas `remove_text_types` (`20260216051506`, `20260216054113`). La primera sí elimina `text_types` (DROP TABLE + DROP FOREIGN KEY). La segunda, pese al nombre, re-crea la tabla `text_types`, su índice único en `name` y la FK `texts.type_id → text_types.id` (y de paso hace un rename `created_by` → `created_by_id` sin relación con `TextType`). Aplicadas en orden, el resultado final coincide exactamente con `apps/Backend/prisma/schema.prisma`, que define `model TextType` con comentarios `// AGREGADO - Faltaba este modelo` y `// ⭐ AGREGADO` en la relación de `Text`. No hay desincronización entre migraciones y schema.
- **Por qué:** la segunda migración probablemente copió el nombre de la primera (o de un intento previo) pero su cuerpo hace lo contrario a lo que el nombre dice.
- **Descartado:** N/A
- **Estado:** vigente - nombre de migración engañoso, comportamiento correcto (verificado leyendo el SQL de ambas migraciones)

## [PENDIENTE: fecha exacta] · Monorepo con `apps/Backend` (NestJS) y `apps/Frontend` (Next.js)
- **Decisión:** separar backend y frontend como apps independientes dentro de un mismo repo, sin workspace tool formal (no hay `pnpm-workspace.yaml`/`turbo.json`/`nx.json` en la raíz). No es totalmente "sin tooling": `apps/.npmrc` sí configura hoisting específico de pnpm (`shamefully-hoist=true`, `public-hoist-pattern[]=*prisma*`, `public-hoist-pattern[]=@prisma/*`) para el backend.
- **Por qué:** [PENDIENTE: confirmar si es intencional o pendiente de tooling de monorepo]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron repos separados]
- **Estado:** vigente

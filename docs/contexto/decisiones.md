# Decisiones tomadas

> Una entrada por decisión. Lo importante es el "por qué" y el "qué descartamos".

## [PENDIENTE: fecha exacta] · Autenticación vía JWT con Passport
- **Decisión:** usar `@nestjs/jwt` + `passport-jwt` para autenticación, con guard + `@CurrentUser` decorator
- **Por qué:** [PENDIENTE: no hay comentario ni commit que explique el porqué - confirmar con el autor]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron sesiones/cookies u otro esquema]
- **Estado:** vigente (código en `apps/Backend/src/modules/auth/` a fecha de este doc)

## [PENDIENTE: fecha exacta] · Modelo `TextType`: eliminado y luego re-agregado (estado ambiguo)
- **Decisión:** el historial de migraciones tiene dos migraciones `remove_text_types` (`20260216051506`, `20260216054113`), pero `apps/Backend/prisma/schema.prisma` actualmente SÍ define `model TextType` con comentarios `// AGREGADO - Faltaba este modelo` y `// ⭐ AGREGADO` en la relación de `Text`
- **Por qué:** [PENDIENTE: contradicción sin explicar en commits - requiere confirmación directa del autor sobre el estado real deseado]
- **Descartado:** [PENDIENTE]
- **Estado:** revisar - posible inconsistencia entre migraciones aplicadas y schema actual, confirmar antes de tocar este módulo

## [PENDIENTE: fecha exacta] · Monorepo con `apps/Backend` (NestJS) y `apps/Frontend` (Next.js)
- **Decisión:** separar backend y frontend como apps independientes dentro de un mismo repo, sin workspace tool visible (no hay `pnpm-workspace.yaml`/`turbo.json`/`nx.json` en la raíz)
- **Por qué:** [PENDIENTE: confirmar si es intencional o pendiente de tooling de monorepo]
- **Descartado:** [PENDIENTE: confirmar si se evaluaron repos separados]
- **Estado:** vigente

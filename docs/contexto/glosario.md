# Glosario y entidades

## Términos del dominio
- **Typing session** - una sesión de práctica de mecanografía de un usuario sobre un `Text` concreto (`apps/Backend/src/modules/typing-sessions/`)
- **Difficulty** - catálogo de dificultad asignado a un `Text` (`difficulties` en la base de datos)
- **Catálogo** - término usado en el código (`catalogs.controller.ts`) para los datos de referencia administrables: `Difficulty`, `Language`, `TextType`
- **WPM** - Words Per Minute. Métrica de velocidad en mecanografía.
- **Accuracy** - Porcentaje de palabras escritas correctamente en una sesión.

## Entidades principales
- **User** - `id, username, email, passwordHash, role (USER|ADMIN), isActive, createdAt`. Relaciona con `TypingSession[]`, `UserStatsByDifficulty[]`, `UserTextHistory[]`, `createdTexts` (`apps/Backend/prisma/schema.prisma`).
- **Text** - `id, title, content, difficultyId, typeId, languageId, createdById, isActive, createdAt`. Texto de práctica con filtros indexados (`idx_text_filters` sobre difficulty/type/language).
- **Difficulty** - `id, name, description, orderIndex, isActive, createdAt`. Catálogo de dificultad con orden para presentación en UI.
- **Language** - `id, code, name, isActive, createdAt`. Catálogo de idiomas con código ISO y nombre.
- **TextType** - `id, name, description, isActive, createdAt`. Catálogo de tipos de texto (e.g. "Poetry", "Prose", "Code").
- **TypingSession** - `id, userId, textId, wpm, accuracy, timeSeconds, errorRate, improvementRate, createdAt`. Registra una sesión de práctica completa de un usuario sobre un `Text`. Relaciona con `User`, `Text`, `TypingError[]`.
- **UserStatsByDifficulty** - `id, userId, difficultyId, bestWpm, avgWpm, avgAccuracy, totalSessions, totalTimeSeconds, avgErrorRate`. Estadísticas agregadas de un usuario por nivel de dificultad. Relaciona con `User` y `Difficulty`.
- **UserTextHistory** - `id, userId, textId, lastAttemptAt, totalAttempts, bestWpm, bestAccuracy`. Historial de intentos de un usuario en un `Text` específico. Relaciona con `User` y `Text`.
- **TypingError** - `id, sessionId, wrongWord, correctWord, position`. Registra errores cometidos en una `TypingSession`.

## Siglas y nombres internos
- **DTO** - Data Transfer Object. Clases de validación de entrada bajo cada `modules/*/dto/` (con `class-validator`).
- **Guard** - Middleware de autorización en NestJS bajo `apps/Backend/src/modules/auth/guards/`. Valida JWT y expone usuario vía `@current-user.decorator.ts`.
- **JWT** - JSON Web Token. Mecanismo de autenticación sin estado usado por Passport en el backend.
- **Prisma** - ORM usado para acceso a PostgreSQL. Esquema en `apps/Backend/prisma/schema.prisma`.

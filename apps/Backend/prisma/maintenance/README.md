# Operación de base de datos

## Seed de demostración

Desde `apps/Backend`, aplica las migraciones en una base local desechable y ejecuta `npm run db:seed` con `NODE_ENV=development` o `test`, `ALLOW_DEMO_SEED=true` y `DEMO_ADMIN_PASSWORD`, `DEMO_ALICE_PASSWORD`, `DEMO_BOB_PASSWORD` y `DEMO_CARLOS_PASSWORD`. Usa cuatro contraseñas distintas, de al menos 12 caracteres y como máximo 72 bytes UTF-8. Inyéctalas como secretos del entorno. El seed conserva las contraseñas de las cuentas existentes y reconstruye los agregados a partir de las sesiones.

En cada entorno compartido donde se ejecutó el seed anterior, cruza los registros de operación con los correos históricos `admin@typingplatform.com`, `alice@example.com`, `bob@example.com` y `carlos@example.com`. Confirma sus IDs y propietarios antes de desactivar las cuentas de demostración mediante el flujo administrativo. Para una cuenta reutilizada, cambia su contraseña mientras sigue desactivada. La validación de JWT consulta `is_active` en cada solicitud y el logout borra la cookie del navegador. Si el entorno carece de revocación individual, espera la vigencia máxima de los JWT emitidos antes de la desactivación (hasta 30 días con «recordarme») antes de reactivar la cuenta. Verifica el acceso de una cuenta normal y de un administrador ajenos al seed y guarda el registro de la revisión.

## Inventario y recuperación de TextType

Toma un respaldo verificable y registra el estado por base antes del despliegue. Consulta las filas de ambas migraciones de `TextType` y conserva sus fechas y checksums. Una fila con `finished_at` informado y sin `rolled_back_at` indica una aplicación exitosa. Investiga una fila sin ambas marcas antes de decidir cómo reconciliarla.

```sql
SELECT migration_name, checksum, started_at, finished_at, rolled_back_at, applied_steps_count
FROM public._prisma_migrations
WHERE migration_name IN ('20260216051506_remove_text_types', '20260216054113_remove_text_types')
ORDER BY started_at;
```

Usa `npx prisma migrate deploy` en una base nueva o con ambas migraciones completas. Para una base poblada antes o durante esas migraciones, ensaya en una copia y verifica la tabla `text_types`, su secuencia, las columnas `texts.created_by` y `texts.created_by_id` y las claves foráneas reales antes de ejecutar Prisma. Si el primer SQL eliminó el catálogo, recupera todas las filas originales y los valores `last_value` e `is_called` de `text_types_id_seq` desde un respaldo anterior verificable. Obtén la aprobación de un mapeo de cada `text_id` a un `user_id` existente.

Pausa las escrituras. Abre una sesión de `psql` contra la base prevista y ejecuta los siguientes comandos desde `apps/Backend`. Los CSV llevan cabecera. Las tablas temporales y la recuperación usan la misma transacción. Si hay un error, abandona la sesión o ejecuta `ROLLBACK`.

```text
\i prisma/maintenance/stage-text-type-recovery.sql
\copy recovery_authors(text_id, user_id) FROM 'approved-authors.csv' WITH (FORMAT csv, HEADER true)
\copy recovery_text_types(id, name, description, is_active, created_at) FROM 'verified-types.csv' WITH (FORMAT csv, HEADER true)
\copy recovery_type_sequence(last_value, is_called) FROM 'verified-type-sequence.csv' WITH (FORMAT csv, HEADER true)
\i prisma/maintenance/recover-text-types.sql
```

Carga los dos CSV del catálogo cuando la tabla original falte. Si la tabla original está intacta, el procedimiento conserva las filas y la secuencia existentes. Si falta un tipo referenciado, un autor o el estado de la secuencia en un catálogo perdido, completa los insumos antes de continuar. Si encuentras un estado parcial distinto al del ensayo, registra las diferencias y concilia la copia antes de actualizar la base compartida.

Verifica los conteos, IDs, relaciones y próximo valor de la secuencia en la copia. Comprueba que el esquema de TextType, el índice único y ambas claves foráneas de `texts` correspondan al resultado de las migraciones históricas. Compara también el esquema completo de la copia después de las migraciones restantes con una base limpia usando `npx prisma migrate diff --from-url "$CLEAN_URL" --to-url "$COPY_URL" --exit-code` en un entorno sin historial de comandos que exponga credenciales.

Registra como aplicadas únicamente las migraciones históricas pendientes cuyo estado final se comprobó, en este orden:

```sh
npx prisma migrate resolve --applied 20260216051506_remove_text_types
npx prisma migrate resolve --applied 20260216054113_remove_text_types
npx prisma migrate deploy
```

Si una migración figura como fallida y la recuperación completó sus cambios, registra esa evidencia y usa `--applied` para reconciliarla. Usa `--rolled-back` solo después de restaurar y verificar su estado previo, y continúa según corresponda al estado real. Una migración ya aplicada conserva su registro.

## Corte y reconciliación

1. Ensaya el despliegue, el backfill y la verificación de datos en una copia representativa. Aplica las migraciones de esquema aditivas antes de habilitar el nuevo contrato.
2. Pausa y drena las escrituras de sesiones. Desde `apps/Backend`, ejecuta `psql "$PG_CONNECTION_URL" -X -f prisma/maintenance/rebuild-session-aggregates.sql` con una URL de PostgreSQL para `psql`. El script recalcula el historial y las estadísticas de forma transaccional y se puede ejecutar de nuevo. Las sesiones históricas se asignan a la dificultad que tenga el texto cuando se ejecute el backfill. Las sesiones nuevas conservan la dificultad registrada en su intento.
3. Publica backend y frontend en la misma ventana y reanuda las escrituras cuando estén activos ambos. Los clientes anteriores deben recargar la página. Comprueba una sesión completa, la consulta desde el historial y que las marcas históricas sigan en el historial. Los rankings comienzan a poblarse con las sesiones del nuevo flujo.
4. Vigila códigos de error y reintentos de finalización, conflictos agotados, latencia de rankings y fallos de notificación. Inspecciona ambos rankings con `EXPLAIN (ANALYZE, BUFFERS)` en la copia representativa y compara los tiempos tras el corte. Si reviertes la aplicación, conserva las migraciones aditivas y las sesiones ya confirmadas. Mantén pausadas las escrituras hasta que ambos clientes del contrato vuelvan a ser compatibles.

Las pruebas de recuperación requieren una base de prueba ya migrada, un rol con permiso de crear bases temporales y `psql`. Ejecuta `bash test/text-type-recovery.sh` con `DATABASE_URL` apuntando a la base de prueba. Para las pruebas HTTP con PostgreSQL, configura `TEST_DATABASE_URL` en una base de prueba migrada y ejecuta `npm run test:e2e -- --runInBand`.

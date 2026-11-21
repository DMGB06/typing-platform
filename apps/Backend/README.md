# Backend


## Intentos de mecanografía y paginación

- `POST /typing-sessions/start` requiere autenticación y `{ textId }`. Devuelve `{ attemptId, startedAt, expiresAt }` y abre un intento válido durante 30 minutos.
- `POST /typing-sessions` recibe `{ attemptId, events }`. Cada elemento de `events` es un carácter Unicode o `"Backspace"`. El servidor comprueba la finalización y calcula las métricas. El mismo usuario puede reenviar los mismos eventos y recibir el resultado original. Usar otros eventos para un intento guardado devuelve `409`.
- `GET /typing-sessions/text/:textId` y `GET /users/admin/all` aceptan `page` y `limit` como enteros positivos, con valores por defecto de 1 y 20 y un límite máximo de 100. Responden `{ data, pagination: { page, limit, total, totalPages } }`. Los parámetros inválidos devuelven `400` y las páginas posteriores a la última devuelven `data: []`. El historial se ordena por fecha e ID descendentes y los usuarios por ID ascendente. `GET /typing-sessions` sigue devolviendo el array de sesiones recientes.

Consulta la [guía de operación](prisma/maintenance/README.md) para configurar el seed, recuperar bases antiguas y reconstruir los agregados en el despliegue.

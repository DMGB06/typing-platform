This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Carga inicial de la práctica

La portada pide `GET /api/practice/bootstrap` en Vercel. La ruta lee
`GET /practice/bootstrap` en el backend indicado por `PRACTICE_API_ORIGIN`
o, por defecto, `NEXT_PUBLIC_API_URL`. La respuesta contiene catálogos
públicos, filtros, hasta cinco textos y una fecha de vencimiento. Vercel
aplica la etiqueta `practice-bootstrap`. El navegador revalida y elige uno
de los textos. Los intentos autenticados comprueban la huella del texto
que vio el usuario antes de iniciar.

Para desplegar, publica el backend primero y valida el frontend en una
vista previa de Vercel. Haz dos GET consecutivos desde la misma región
y comprueba `x-vercel-cache` para ver `MISS` y luego `HIT`. Desactiva un
texto de prueba y verifica que desaparezca de las cargas nuevas en un
máximo de 60 segundos. Ante un retiro urgente, borra del CDN las entradas
con la etiqueta `practice-bootstrap` desde el panel.

Mide cinco cargas de portada con `HIT` y cinco con `MISS` en condiciones
equivalentes. Registra por separado el tiempo hasta el primer texto y
la latencia de Iniciar y Guardar. La meta de portada con `HIT` es una
mediana inferior a un segundo. Un `MISS` consulta Render y puede esperar
su arranque. Si el cambio falla en producción, borra la etiqueta y
restaura el despliegue anterior del frontend.

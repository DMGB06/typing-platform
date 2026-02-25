import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // DIFFICULTIES
  // ============================================
  const difficulties = await Promise.all([
    prisma.difficulty.upsert({
      where: { name: 'Principiante' },
      update: {},
      create: {
        name: 'Principiante',
        description: 'Textos cortos con vocabulario básico y frases simples.',
        orderIndex: 1,
      },
    }),
    prisma.difficulty.upsert({
      where: { name: 'Intermedio' },
      update: {},
      create: {
        name: 'Intermedio',
        description: 'Textos de longitud moderada con vocabulario variado.',
        orderIndex: 2,
      },
    }),
    prisma.difficulty.upsert({
      where: { name: 'Avanzado' },
      update: {},
      create: {
        name: 'Avanzado',
        description: 'Textos largos con vocabulario técnico y estructuras complejas.',
        orderIndex: 3,
      },
    }),
    prisma.difficulty.upsert({
      where: { name: 'Experto' },
      update: {},
      create: {
        name: 'Experto',
        description: 'Textos muy largos y desafiantes, incluyendo símbolos y puntuación avanzada.',
        orderIndex: 4,
      },
    }),
  ]);
  console.log(`✅ Difficulties seeded: ${difficulties.map((d) => d.name).join(', ')}`);

  // ============================================
  // TEXT TYPES
  // ============================================
  const textTypes = await Promise.all([
    prisma.textType.upsert({
      where: { name: 'Párrafo' },
      update: {},
      create: {
        name: 'Párrafo',
        description: 'Texto en prosa general para mejorar la velocidad de escritura.',
      },
    }),
    prisma.textType.upsert({
      where: { name: 'Código' },
      update: {},
      create: {
        name: 'Código',
        description: 'Fragmentos de código de programación con símbolos especiales.',
      },
    }),
    prisma.textType.upsert({
      where: { name: 'Cita' },
      update: {},
      create: {
        name: 'Cita',
        description: 'Frases y citas célebres de personajes históricos o literarios.',
      },
    }),
    prisma.textType.upsert({
      where: { name: 'Artículo' },
      update: {},
      create: {
        name: 'Artículo',
        description: 'Fragmentos de artículos periodísticos o académicos.',
      },
    }),
  ]);
  console.log(`✅ TextTypes seeded: ${textTypes.map((t) => t.name).join(', ')}`);

  // ============================================
  // LANGUAGES
  // ============================================
  const languages = await Promise.all([
    prisma.language.upsert({
      where: { code: 'es' },
      update: {},
      create: { code: 'es', name: 'Español' },
    }),
    prisma.language.upsert({
      where: { code: 'en' },
      update: {},
      create: { code: 'en', name: 'English' },
    }),
    prisma.language.upsert({
      where: { code: 'fr' },
      update: {},
      create: { code: 'fr', name: 'Français' },
    }),
    prisma.language.upsert({
      where: { code: 'pt' },
      update: {},
      create: { code: 'pt', name: 'Português' },
    }),
  ]);
  console.log(`✅ Languages seeded: ${languages.map((l) => l.name).join(', ')}`);

  // ============================================
  // USERS
  // ============================================
  const saltRounds = 10;

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@typingplatform.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@typingplatform.com',
      passwordHash: await bcrypt.hash('Admin1234!', saltRounds),
      role: UserRole.ADMIN,
    },
  });

  const regularUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        username: 'alice',
        email: 'alice@example.com',
        passwordHash: await bcrypt.hash('Alice1234!', saltRounds),
        role: UserRole.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        username: 'bob',
        email: 'bob@example.com',
        passwordHash: await bcrypt.hash('Bob1234!', saltRounds),
        role: UserRole.USER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos@example.com' },
      update: {},
      create: {
        username: 'carlos',
        email: 'carlos@example.com',
        passwordHash: await bcrypt.hash('Carlos1234!', saltRounds),
        role: UserRole.USER,
      },
    }),
  ]);
  console.log(
    `✅ Users seeded: ${[adminUser, ...regularUsers].map((u) => u.username).join(', ')}`,
  );

  // ============================================
  // TEXTS
  // ============================================
  const [beginner, intermediate, advanced, expert] = difficulties;
  const [paragraph, code, quote, article] = textTypes;
  const [spanish, english] = languages;

  const textsData = [
    // Principiante - Párrafo - Español
    {
      title: 'El gato y el ratón',
      content:
        'El gato dormía tranquilo sobre el sofá. El ratón aprovechó para salir de su agujero y buscar algo de comer. Fue hasta la cocina y encontró un trozo de queso. Lo tomó con cuidado y regresó rápido a su escondite.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    // Principiante - Cita - Español
    {
      title: 'Cita de Cervantes',
      content:
        'La pluma es la lengua del alma. Miguel de Cervantes Saavedra, autor del ingenioso hidalgo Don Quijote de la Mancha.',
      difficultyId: beginner.id,
      typeId: quote.id,
      languageId: spanish.id,
    },
    // Intermedio - Párrafo - Español
    {
      title: 'La revolución digital',
      content:
        'La revolución digital ha transformado profundamente la manera en que las personas se comunican, trabajan y acceden al conocimiento. En pocas décadas, internet pasó de ser una herramienta exclusiva para investigadores a convertirse en un espacio de interacción global que conecta a millones de personas en tiempo real.',
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    // Intermedio - Artículo - Español
    {
      title: 'Beneficios del ejercicio físico',
      content:
        'Según numerosos estudios científicos, la práctica regular de ejercicio físico reduce significativamente el riesgo de enfermedades cardiovasculares, mejora la salud mental y aumenta la esperanza de vida. Los expertos recomiendan al menos 150 minutos de actividad moderada por semana para obtener beneficios tangibles.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    // Avanzado - Párrafo - Español
    {
      title: 'Filosofía y existencialismo',
      content:
        'El existencialismo, corriente filosófica surgida a mediados del siglo XX, postula que la existencia precede a la esencia; es decir, el ser humano primero existe, se encuentra en el mundo, y solo después se define a sí mismo mediante sus actos y decisiones. Jean-Paul Sartre, uno de sus principales exponentes, argumentaba que esta libertad radical conlleva una responsabilidad ineludible frente a uno mismo y frente a la humanidad entera.',
      difficultyId: advanced.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    // Avanzado - Código - Español
    {
      title: 'Algoritmo de búsqueda binaria',
      content:
        'function binarySearch(arr: number[], target: number): number {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
      difficultyId: advanced.id,
      typeId: code.id,
      languageId: spanish.id,
    },
    // Experto - Artículo - Español
    {
      title: 'Inteligencia artificial y ética',
      content:
        'El avance exponencial de los sistemas de inteligencia artificial plantea interrogantes filosóficos, jurídicos y sociales de enorme calado. La capacidad de los modelos de aprendizaje profundo para generar contenido indistinguible del producido por humanos, tomar decisiones autónomas en contextos críticos y procesar cantidades ingentes de datos personales obliga a replantear los marcos regulatorios vigentes. La Unión Europea, pionera en la materia, publicó en 2024 el primer reglamento integral sobre inteligencia artificial, estableciendo clasificaciones de riesgo y obligaciones de transparencia que marcan el camino para otras jurisdicciones.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    // Principiante - Párrafo - English
    {
      title: 'A sunny day',
      content:
        'The sun was shining bright in the clear blue sky. The children played happily in the park while their parents sat on the benches. A gentle breeze made the trees sway softly. It was a perfect afternoon.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: english.id,
    },
    // Intermedio - Cita - English
    {
      title: 'Quote by Einstein',
      content:
        'Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution. — Albert Einstein.',
      difficultyId: intermediate.id,
      typeId: quote.id,
      languageId: english.id,
    },
    // Avanzado - Código - English
    {
      title: 'Debounce function',
      content:
        'function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {\n  let timer: ReturnType<typeof setTimeout>;\n  return ((...args: unknown[]) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  }) as T;\n}',
      difficultyId: advanced.id,
      typeId: code.id,
      languageId: english.id,
    },
  ];

  const createdTexts: { id: number }[] = [];
  for (const textData of textsData) {
    const text = await prisma.text.upsert({
      where: {
        // Use a composite of title + languageId as a logical unique key via findFirst
        id: (
          (await prisma.text.findFirst({
            where: { title: textData.title, languageId: textData.languageId },
          })) ?? { id: -1 }
        ).id,
      },
      update: {},
      create: {
        ...textData,
        createdById: adminUser.id,
      },
    });
    createdTexts.push(text);
  }
  console.log(`✅ Texts seeded: ${createdTexts.length} texts`);

  // ============================================
  // TYPING SESSIONS & ERRORS (sample data)
  // ============================================
  const [alice, bob] = regularUsers;

  const sessionsData = [
    { userId: alice.id, textId: createdTexts[0].id, wpm: 45, accuracy: 97.5, timeSeconds: 30, errorRate: 2.5, improvementRate: null },
    { userId: alice.id, textId: createdTexts[0].id, wpm: 52, accuracy: 98.2, timeSeconds: 26, errorRate: 1.8, improvementRate: 15.6 },
    { userId: alice.id, textId: createdTexts[2].id, wpm: 48, accuracy: 95.0, timeSeconds: 80, errorRate: 5.0, improvementRate: null },
    { userId: bob.id,   textId: createdTexts[0].id, wpm: 38, accuracy: 92.0, timeSeconds: 37, errorRate: 8.0, improvementRate: null },
    { userId: bob.id,   textId: createdTexts[3].id, wpm: 42, accuracy: 94.5, timeSeconds: 90, errorRate: 5.5, improvementRate: null },
    { userId: bob.id,   textId: createdTexts[5].id, wpm: 35, accuracy: 88.0, timeSeconds: 120, errorRate: 12.0, improvementRate: null },
  ];

  const createdSessions: { id: number }[] = [];
  for (const s of sessionsData) {
    const session = await prisma.typingSession.create({ data: s });
    createdSessions.push(session);
  }
  console.log(`✅ TypingSessions seeded: ${createdSessions.length} sessions`);

  // Some typing errors for the first two sessions
  await prisma.typingError.createMany({
    data: [
      { sessionId: createdSessions[0].id, wrongWord: 'trnaquilo', correctWord: 'tranquilo', position: 4 },
      { sessionId: createdSessions[0].id, wrongWord: 'sofá',     correctWord: 'sofá',      position: 7 },
      { sessionId: createdSessions[3].id, wrongWord: 'dormia',   correctWord: 'dormía',    position: 2 },
    ],
  });
  console.log('✅ TypingErrors seeded');

  // ============================================
  // USER STATS BY DIFFICULTY
  // ============================================
  const statsData = [
    {
      userId: alice.id,
      difficultyId: beginner.id,
      bestWpm: 52,
      avgWpm: 48.5,
      avgAccuracy: 97.85,
      totalSessions: 2,
      totalTimeSeconds: 56,
      avgErrorRate: 2.15,
    },
    {
      userId: alice.id,
      difficultyId: intermediate.id,
      bestWpm: 48,
      avgWpm: 48.0,
      avgAccuracy: 95.0,
      totalSessions: 1,
      totalTimeSeconds: 80,
      avgErrorRate: 5.0,
    },
    {
      userId: bob.id,
      difficultyId: beginner.id,
      bestWpm: 38,
      avgWpm: 38.0,
      avgAccuracy: 92.0,
      totalSessions: 1,
      totalTimeSeconds: 37,
      avgErrorRate: 8.0,
    },
    {
      userId: bob.id,
      difficultyId: intermediate.id,
      bestWpm: 42,
      avgWpm: 42.0,
      avgAccuracy: 94.5,
      totalSessions: 1,
      totalTimeSeconds: 90,
      avgErrorRate: 5.5,
    },
    {
      userId: bob.id,
      difficultyId: advanced.id,
      bestWpm: 35,
      avgWpm: 35.0,
      avgAccuracy: 88.0,
      totalSessions: 1,
      totalTimeSeconds: 120,
      avgErrorRate: 12.0,
    },
  ];

  for (const stat of statsData) {
    await prisma.userStatsByDifficulty.upsert({
      where: { userId_difficultyId: { userId: stat.userId, difficultyId: stat.difficultyId } },
      update: stat,
      create: stat,
    });
  }
  console.log(`✅ UserStatsByDifficulty seeded: ${statsData.length} records`);

  // ============================================
  // USER TEXT HISTORY
  // ============================================
  const historyData = [
    {
      userId: alice.id,
      textId: createdTexts[0].id,
      lastAttemptAt: new Date(),
      totalAttempts: 2,
      bestWpm: 52,
      bestAccuracy: 98.2,
    },
    {
      userId: alice.id,
      textId: createdTexts[2].id,
      lastAttemptAt: new Date(),
      totalAttempts: 1,
      bestWpm: 48,
      bestAccuracy: 95.0,
    },
    {
      userId: bob.id,
      textId: createdTexts[0].id,
      lastAttemptAt: new Date(),
      totalAttempts: 1,
      bestWpm: 38,
      bestAccuracy: 92.0,
    },
    {
      userId: bob.id,
      textId: createdTexts[3].id,
      lastAttemptAt: new Date(),
      totalAttempts: 1,
      bestWpm: 42,
      bestAccuracy: 94.5,
    },
    {
      userId: bob.id,
      textId: createdTexts[5].id,
      lastAttemptAt: new Date(),
      totalAttempts: 1,
      bestWpm: 35,
      bestAccuracy: 88.0,
    },
  ];

  for (const h of historyData) {
    await prisma.userTextHistory.upsert({
      where: { userId_textId: { userId: h.userId, textId: h.textId } },
      update: { lastAttemptAt: h.lastAttemptAt, totalAttempts: h.totalAttempts, bestWpm: h.bestWpm, bestAccuracy: h.bestAccuracy },
      create: h,
    });
  }
  console.log(`✅ UserTextHistory seeded: ${historyData.length} records`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\nCredentials:');
  console.log('  Admin  → admin@typingplatform.com  / Admin1234!');
  console.log('  Alice  → alice@example.com          / Alice1234!');
  console.log('  Bob    → bob@example.com            / Bob1234!');
  console.log('  Carlos → carlos@example.com         / Carlos1234!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

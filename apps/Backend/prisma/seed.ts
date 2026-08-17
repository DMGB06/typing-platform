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

    // ============================================
    // PRINCIPIANTE (10 adicionales)
    // ============================================
    {
      title: 'El perro en el parque',
      content:
        'Cada mañana, Luca sale a caminar con su perro por el parque cercano. El perro corre feliz detrás de las palomas mientras Luca lo sigue con una sonrisa. Después de un rato, ambos se sientan bajo un árbol a descansar.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'La lluvia de otoño',
      content:
        'Las hojas caían lentamente mientras la lluvia mojaba las calles vacías. Marta miraba por la ventana con una taza de té caliente entre las manos. El otoño siempre le traía calma y ganas de leer un buen libro.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Cita de Helen Keller',
      content:
        'El optimismo es la fe que conduce al logro. Nada se puede hacer sin esperanza y confianza. Helen Keller, escritora y activista estadounidense.',
      difficultyId: beginner.id,
      typeId: quote.id,
      languageId: spanish.id,
    },
    {
      title: 'El mercado de los sábados',
      content:
        'Todos los sábados, la plaza del pueblo se llena de puestos de frutas y verduras frescas. Los vecinos caminan entre los pasillos eligiendo tomates rojos y manzanas dulces. El aroma a pan recién horneado se mezcla con el bullicio de la gente.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Cita de Mark Twain',
      content: 'El secreto para salir adelante es comenzar. Mark Twain, escritor y humorista estadounidense.',
      difficultyId: beginner.id,
      typeId: quote.id,
      languageId: spanish.id,
    },
    {
      title: 'Un día en la playa',
      content:
        'El sol brillaba sobre la arena caliente mientras las olas rompían suavemente en la orilla. Los niños construían castillos de arena y reían sin parar. Al atardecer, el cielo se pintó de naranja y rosa.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'La biblioteca del barrio',
      content:
        'La biblioteca del barrio abre todos los días a las nueve de la mañana. Ana va allí después de clases para leer cuentos y hacer la tarea en silencio. Le gusta el olor de los libros viejos.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Cita de Confucio',
      content: 'El hombre que mueve una montaña comienza cargando pequeñas piedras. Confucio, filósofo chino.',
      difficultyId: beginner.id,
      typeId: quote.id,
      languageId: spanish.id,
    },
    {
      title: 'El jardín de mi abuela',
      content:
        'En el jardín de mi abuela crecen rosas rojas y girasoles altos. Ella riega las plantas todas las tardes y canta mientras trabaja. Los pájaros llegan a comer las semillas que ella deja sobre una piedra.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'El tren de las siete',
      content:
        'Todas las mañanas, Pedro toma el tren de las siete para ir al trabajo. Se sienta cerca de la ventana y observa cómo la ciudad despierta poco a poco. El viaje dura veinte minutos.',
      difficultyId: beginner.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },

    // ============================================
    // INTERMEDIO (10 adicionales)
    // ============================================
    {
      title: 'El auge de las energías renovables',
      content:
        'En los últimos años, la energía solar y eólica han dejado de ser alternativas costosas para convertirse en soluciones competitivas frente a los combustibles fósiles. Países como Alemania y China lideran la inversión en paneles solares y turbinas eólicas, reduciendo significativamente sus emisiones de carbono mientras generan empleo en un sector en constante crecimiento.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'La ciencia detrás del sueño',
      content:
        'Dormir bien no es un lujo, sino una necesidad biológica esencial para el funcionamiento del cerebro. Durante el sueño profundo, el cerebro consolida recuerdos, elimina toxinas acumuladas y regula el sistema inmunológico. Los expertos recomiendan entre siete y nueve horas de sueño para adultos, evitando pantallas al menos una hora antes de acostarse.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Historia breve del café',
      content:
        'El café tiene sus orígenes en Etiopía, donde según la leyenda un pastor descubrió sus efectos al observar a sus cabras comer los frutos de un arbusto. Desde entonces, la bebida se expandió por el mundo árabe, Europa y América, convirtiéndose en una de las bebidas más consumidas del planeta y un motor económico para millones de agricultores.',
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'El ajedrez como entrenamiento mental',
      content:
        'Practicar ajedrez de forma regular mejora la memoria, la concentración y la capacidad de planificación estratégica. Numerosos estudios sugieren que los niños que aprenden ajedrez desde temprana edad desarrollan mejores habilidades matemáticas y de resolución de problemas, además de aprender a manejar la frustración ante la derrota.',
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Redes sociales y salud mental',
      content:
        'El uso excesivo de redes sociales se ha vinculado con mayores niveles de ansiedad y comparación social, especialmente entre adolescentes. Sin embargo, cuando se utilizan de forma consciente, estas plataformas también permiten mantener el contacto con seres queridos y acceder a comunidades de apoyo que antes eran difíciles de encontrar.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'El turismo sostenible',
      content:
        'Cada vez más viajeros buscan experiencias que respeten el medio ambiente y las comunidades locales. El turismo sostenible propone reducir la huella ecológica, apoyar la economía local y preservar el patrimonio cultural, transformando la manera en que exploramos el mundo sin agotar sus recursos naturales.',
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'La robótica en la industria moderna',
      content:
        'Los brazos robóticos y los sistemas automatizados han revolucionado las líneas de producción, aumentando la precisión y reduciendo los tiempos de fabricación. Aunque algunos temen la pérdida de empleos, muchos expertos sostienen que la automatización también crea nuevas oportunidades laborales en programación y mantenimiento.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Beneficios de la lectura diaria',
      content:
        'Leer al menos veinte minutos al día mejora el vocabulario, reduce el estrés y fortalece la capacidad de concentración. Además, sumergirse en historias ajenas desarrolla la empatía, permitiendo comprender perspectivas y experiencias distintas a las propias.',
      difficultyId: intermediate.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'El impacto de la música en el cerebro',
      content:
        'Escuchar música activa múltiples regiones cerebrales relacionadas con la memoria, las emociones y el movimiento. Estudios recientes demuestran que aprender a tocar un instrumento musical durante la infancia mejora el desarrollo cognitivo y la coordinación motora a largo plazo.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'La importancia de la alimentación balanceada',
      content:
        'Una dieta rica en frutas, verduras y proteínas de calidad es fundamental para mantener niveles de energía estables durante el día. Los nutricionistas recomiendan reducir el consumo de azúcares procesados y priorizar alimentos frescos para prevenir enfermedades crónicas a largo plazo.',
      difficultyId: intermediate.id,
      typeId: article.id,
      languageId: spanish.id,
    },

    // ============================================
    // AVANZADO (10 adicionales)
    // ============================================
    {
      title: 'Neurociencia de la toma de decisiones',
      content:
        'La corteza prefrontal desempeña un papel determinante en los procesos de toma de decisiones, integrando información sensorial, emocional y memoria a largo plazo para evaluar posibles cursos de acción. Investigaciones en neuroeconomía han demostrado que factores como el estrés y la fatiga alteran significativamente la capacidad de ponderar riesgos y beneficios, lo cual explica por qué las decisiones tomadas bajo presión tienden a priorizar recompensas inmediatas sobre beneficios a largo plazo.',
      difficultyId: advanced.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Función quicksort',
      content:
        'function quickSort(arr: number[]): number[] {\n  if (arr.length <= 1) return arr;\n  const pivot = arr[Math.floor(arr.length / 2)];\n  const left = arr.filter((x) => x < pivot);\n  const mid = arr.filter((x) => x === pivot);\n  const right = arr.filter((x) => x > pivot);\n  return [...quickSort(left), ...mid, ...quickSort(right)];\n}',
      difficultyId: advanced.id,
      typeId: code.id,
      languageId: spanish.id,
    },
    {
      title: 'El legado del boom latinoamericano',
      content:
        'Durante las décadas de 1960 y 1970, un grupo de escritores latinoamericanos revolucionó la literatura mundial con el llamado realismo mágico, una técnica narrativa que entrelaza lo cotidiano con elementos fantásticos como si fueran parte natural de la realidad. Gabriel García Márquez, Julio Cortázar y Mario Vargas Llosa, entre otros, lograron que el continente ocupara un lugar central en el panorama literario internacional.',
      difficultyId: advanced.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Arquitectura de microservicios',
      content:
        'La arquitectura de microservicios propone descomponer una aplicación monolítica en servicios independientes, cada uno responsable de una función específica del negocio y comunicados entre sí mediante APIs. Este enfoque facilita la escalabilidad horizontal y permite que distintos equipos trabajen de forma autónoma, aunque introduce complejidad adicional en la gestión de la comunicación entre servicios y la consistencia de los datos distribuidos.',
      difficultyId: advanced.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Manejo de promesas asíncronas',
      content:
        "async function fetchUserData(id: string): Promise<User> {\n  try {\n    const response = await fetch(`/api/users/${id}`);\n    if (!response.ok) throw new Error('Usuario no encontrado');\n    return await response.json();\n  } catch (error) {\n    console.error('Error al obtener usuario:', error);\n    throw error;\n  }\n}",
      difficultyId: advanced.id,
      typeId: code.id,
      languageId: spanish.id,
    },
    {
      title: 'Fundamentos de la física cuántica',
      content:
        'La mecánica cuántica describe el comportamiento de partículas subatómicas mediante principios que desafían la intuición cotidiana, como la superposición de estados y el entrelazamiento cuántico. Werner Heisenberg formuló el principio de incertidumbre, según el cual resulta imposible conocer simultáneamente con precisión absoluta la posición y el momento de una partícula, estableciendo un límite fundamental para la medición en el universo físico.',
      difficultyId: advanced.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Geopolítica de los recursos hídricos',
      content:
        'El acceso al agua dulce se ha convertido en una fuente creciente de tensión geopolítica entre naciones que comparten cuencas hidrográficas transfronterizas. Ríos como el Nilo, el Éufrates y el Mekong son objeto de disputas diplomáticas donde intervienen factores de seguridad alimentaria, generación energética y crecimiento demográfico, obligando a los estados a negociar tratados complejos de gestión compartida.',
      difficultyId: advanced.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Biología molecular del envejecimiento',
      content:
        'El acortamiento progresivo de los telómeros, estructuras que protegen los extremos de los cromosomas, se asocia directamente con el proceso de envejecimiento celular. Cada división celular reduce ligeramente su longitud hasta que la célula alcanza un estado de senescencia, dejando de dividirse. Comprender este mecanismo ha abierto nuevas líneas de investigación en medicina regenerativa y prevención de enfermedades relacionadas con la edad.',
      difficultyId: advanced.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'El sistema financiero global',
      content:
        'Los mercados financieros internacionales están profundamente interconectados a través de flujos de capital, instrumentos derivados y políticas monetarias coordinadas entre bancos centrales. Una crisis originada en una economía particular puede propagarse rápidamente al resto del sistema mediante mecanismos de contagio financiero, como quedó evidenciado durante la crisis hipotecaria de 2008, que tuvo repercusiones económicas en prácticamente todo el planeta.',
      difficultyId: advanced.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Estructura de datos: árbol binario',
      content:
        'class TreeNode {\n  value: number;\n  left: TreeNode | null = null;\n  right: TreeNode | null = null;\n  constructor(value: number) {\n    this.value = value;\n  }\n  insert(value: number): void {\n    if (value < this.value) {\n      this.left ? this.left.insert(value) : (this.left = new TreeNode(value));\n    } else {\n      this.right ? this.right.insert(value) : (this.right = new TreeNode(value));\n    }\n  }\n}',
      difficultyId: advanced.id,
      typeId: code.id,
      languageId: spanish.id,
    },

    // ============================================
    // EXPERTO (10 adicionales)
    // ============================================
    {
      title: 'Criptografía asimétrica y blockchain',
      content:
        'Los sistemas de criptografía asimétrica —basados en pares de claves pública y privada— constituyen el fundamento matemático sobre el cual operan las tecnologías de blockchain contemporáneas. Cada transacción se firma digitalmente mediante la clave privada del emisor, permitiendo que cualquier nodo de la red verifique su autenticidad usando la clave pública correspondiente, sin revelar jamás la clave privada original. Este mecanismo, combinado con funciones hash criptográficas (como SHA-256) y estructuras de datos encadenadas e inmutables, garantiza la integridad del registro distribuido incluso en ausencia de una autoridad central de confianza.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Algoritmo de Dijkstra',
      content:
        'function dijkstra(graph: Map<string, Map<string, number>>, start: string): Map<string, number> {\n  const distances = new Map<string, number>();\n  const visited = new Set<string>();\n  for (const node of graph.keys()) distances.set(node, Infinity);\n  distances.set(start, 0);\n  while (visited.size < graph.size) {\n    const [current] = [...distances.entries()]\n      .filter(([node]) => !visited.has(node))\n      .sort((a, b) => a[1] - b[1])[0];\n    visited.add(current);\n    for (const [neighbor, weight] of graph.get(current) ?? []) {\n      const newDist = distances.get(current)! + weight;\n      if (newDist < (distances.get(neighbor) ?? Infinity)) distances.set(neighbor, newDist);\n    }\n  }\n  return distances;\n}',
      difficultyId: expert.id,
      typeId: code.id,
      languageId: spanish.id,
    },
    {
      title: 'Política monetaria y macroeconomía',
      content:
        'Cuando un banco central decide modificar la tasa de interés de referencia, desencadena una cascada de efectos sobre el consumo, la inversión y el tipo de cambio que puede tardar entre doce y veinticuatro meses en manifestarse plenamente —el llamado "rezago de la política monetaria"—. Un incremento de tasas, orientado a contener la inflación, encarece el crédito hipotecario y empresarial, desincentivando el gasto; sin embargo, si la intervención es demasiado agresiva, puede inducir una contracción económica no deseada, razón por la cual los bancos centrales deben calibrar sus decisiones con extrema cautela, monitoreando indicadores como el IPC, la tasa de desempleo y las expectativas de mercado.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Filosofía del lenguaje: Wittgenstein',
      content:
        'En su obra tardía, Ludwig Wittgenstein abandonó la idea de que el lenguaje funciona como un sistema lógico-representacional exacto, proponiendo en su lugar el concepto de "juegos del lenguaje": el significado de una palabra no reside en una correspondencia fija con un objeto del mundo, sino en su uso concreto dentro de una práctica social determinada. Esta ruptura con el atomismo lógico de su primera etapa —expuesto en el Tractatus Logico-Philosophicus— transformó radicalmente la filosofía analítica del siglo XX, influyendo en disciplinas tan diversas como la lingüística, la antropología y las ciencias cognitivas.',
      difficultyId: expert.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Medicina genómica de precisión',
      content:
        'La secuenciación masiva del genoma humano, cuyo costo se ha reducido más de un 99% desde el año 2003, permite hoy identificar variantes genéticas asociadas a enfermedades específicas y diseñar tratamientos personalizados según el perfil molecular de cada paciente. En oncología, por ejemplo, el análisis del ADN tumoral posibilita seleccionar terapias dirigidas que atacan mutaciones concretas (como EGFR o BRCA1/2), incrementando notablemente las tasas de respuesta clínica frente a los protocolos de quimioterapia convencional, aunque persisten importantes desafíos éticos relacionados con la privacidad de los datos genéticos y el acceso equitativo a estas tecnologías.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Astrofísica: agujeros negros supermasivos',
      content:
        'En el centro de la mayoría de las galaxias masivas —incluida la Vía Láctea— reside un agujero negro supermasivo cuya masa puede equivaler a millones o incluso miles de millones de veces la del Sol. La primera imagen directa de uno de estos objetos, capturada en 2019 por el Event Horizon Telescope en la galaxia M87, confirmó predicciones fundamentales de la relatividad general de Einstein, revelando un anillo de luz curvada alrededor del horizonte de sucesos: el punto de no retorno más allá del cual ni siquiera la luz puede escapar.',
      difficultyId: expert.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Ciberseguridad y vectores de ataque',
      content:
        'Los ataques de tipo "cadena de suministro" (supply chain attacks) han cobrado relevancia crítica en el panorama de ciberseguridad actual, dado que comprometen dependencias de software legítimas y ampliamente confiables —bibliotecas, paquetes npm, actualizaciones automáticas— para infiltrar código malicioso en miles de sistemas simultáneamente sin necesidad de vulnerar directamente al objetivo final. Casos como SolarWinds (2020) demostraron que incluso organizaciones con infraestructuras de seguridad robustas permanecen expuestas cuando la confianza depositada en terceros no se somete a auditorías rigurosas y continuas.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Derecho constitucional comparado',
      content:
        'El control de constitucionalidad —mecanismo mediante el cual un tribunal evalúa la compatibilidad de una norma con la Constitución— adopta modelos sustancialmente distintos según la tradición jurídica de cada país: el sistema difuso, característico de Estados Unidos, permite que cualquier juez ordinario declare la inaplicabilidad de una ley en un caso concreto; en cambio, el sistema concentrado, predominante en Europa continental y gran parte de Latinoamérica, reserva esa facultad exclusivamente a un tribunal constitucional especializado, cuyas sentencias suelen tener efectos generales (erga omnes) sobre la totalidad del ordenamiento jurídico.',
      difficultyId: expert.id,
      typeId: paragraph.id,
      languageId: spanish.id,
    },
    {
      title: 'Geopolítica energética del siglo XXI',
      content:
        'La transición hacia fuentes de energía renovable no solo redefine la matriz eléctrica global, sino que también reconfigura el mapa geopolítico tradicionalmente dominado por los países exportadores de petróleo y gas natural. Naciones que concentran reservas estratégicas de litio, cobalto y tierras raras —minerales indispensables para baterías y tecnologías limpias— como Chile, la República Democrática del Congo y Australia, emergen como nuevos actores de peso en las negociaciones internacionales, mientras que las potencias tradicionales del petróleo enfrentan el desafío de diversificar sus economías ante la previsible caída de la demanda de combustibles fósiles a mediano plazo.',
      difficultyId: expert.id,
      typeId: article.id,
      languageId: spanish.id,
    },
    {
      title: 'Ética aplicada a sistemas autónomos',
      content:
        'El denominado "problema del tranvía", clásico dilema de la filosofía moral, ha resurgido con fuerza inusitada en el diseño de vehículos autónomos: ¿debe un automóvil sin conductor priorizar la vida de sus ocupantes o la de los peatones en un escenario de colisión inevitable? A diferencia del experimento mental original, estas decisiones ya no permanecen en el terreno puramente hipotético, sino que deben codificarse explícitamente en algoritmos de toma de decisiones, obligando a ingenieros, legisladores y filósofos a colaborar en la construcción de marcos normativos que, hasta el momento, carecen de consenso universal.',
      difficultyId: expert.id,
      typeId: paragraph.id,
      languageId: spanish.id,
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

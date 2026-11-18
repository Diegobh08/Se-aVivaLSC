import type { LscSign, QuizQuestion, SyntaxChallenge } from '../types/lsc';

export const CURATED_GRAMMAR_QUESTIONS: QuizQuestion[] = [
  {
    id: 'gq-nosotros',
    lessonId: 1,
    signId: 'l1-nosotros',
    showImageDuringQuestion: true,
    prompt: '¿Cómo varía el círculo de NOSOTROS si las personas están ausentes?',
    options: [
      'El círculo que describen los dedos se hace más cerrado junto al pecho',
      'Se cambia la seña por un señalamiento con ambas palmas abiertas hacia arriba',
      'Se repite el círculo tres veces encima de la cabeza',
      'No varía: siempre se hace del mismo tamaño sin importar la presencia',
    ],
    correctIndex: 0,
    explanation:
      'Según la Lección 1, cuando las personas están presentes el círculo es amplio abarcándolas; cuando están ausentes el círculo se realiza más cerrado.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-interrogativos',
    lessonId: 5,
    signId: 'l5-que',
    showImageDuringQuestion: true,
    prompt: '¿Qué rasgo no manual acompaña obligatoriamente a los pronombres interrogativos?',
    options: [
      'Expresión facial y corporal interrogativa (cejas fruncidas/elevadas e inclinación leve)',
      'Inflar ambas mejillas mientras se mantiene la mirada fija hacia abajo',
      'Asentimiento rápido y repetido de cabeza durante toda la frase',
      'Cerrar completamente los ojos al iniciar cada pregunta',
    ],
    correctIndex: 0,
    explanation:
      'En la Lección 5 se enfatiza que todos los interrogativos llevan expresión facial y corporal; muchas veces la expresión facial sola es suficiente para preguntar.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-nombre-vs-sena',
    lessonId: 1,
    signId: 'l1-tu-sena',
    showImageDuringQuestion: true,
    prompt: '¿Cuál es la diferencia entre ¿TU NOMBRE? y ¿TU SEÑA?',
    options: [
      '¿TU NOMBRE? pide el nombre en español (dactilología) y ¿TU SEÑA? pide la seña personal en la comunidad sorda',
      '¿TU NOMBRE? se usa solo para profesores y ¿TU SEÑA? solo para familiares',
      'Ambas significan exactamente lo mismo y solo cambia el uso de la mano izquierda',
      '¿TU NOMBRE? se hace sin expresión facial y ¿TU SEÑA? se deletrea letra por letra',
    ],
    correctIndex: 0,
    explanation:
      'En la comunidad sorda, ¿TU NOMBRE? refiere al nombre escrito en español (alfabeto dactilológico), mientras ¿TU SEÑA? pregunta por el apodo visual personal.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-posesivos',
    lessonId: 2,
    signId: 'l2-mi',
    showImageDuringQuestion: true,
    prompt: '¿Cómo se diferencia un pronombre posesivo (MI, TUYO, SUYO) de un pronombre personal (YO, TÚ, ÉL)?',
    options: [
      'Al señalar al sujeto, el signo posesivo se realiza de forma más fuerte e intensa',
      'El pronombre posesivo se hace siempre detrás de la espalda',
      'El pronombre posesivo requiere usar la letra P en ambas manos',
      'No existe diferencia manual ni de intensidad entre ambos',
    ],
    correctIndex: 0,
    explanation:
      'La Lección 2 indica que el signo posesivo se diferencia del personal porque al señalar al sujeto el movimiento es más firme, fuerte e intenso.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-adjetivo-grado',
    lessonId: 4,
    signId: 'l4-lindisimo',
    showImageDuringQuestion: true,
    prompt: '¿Cómo se expresa el grado superior (ej. LINDÍSIMO, RIQUÍSIMO) en LSC?',
    options: [
      'Se exagera la expresión facial y el movimiento del signo se hace más lento',
      'Se hace el signo dos veces lo más rápido posible con rostro neutro',
      'Se acompaña siempre del pronombre USTEDES al final de la frase',
      'Se deletrea la terminación "-ÍSIMO" después de la seña base',
    ],
    correctIndex: 0,
    explanation:
      'Según la Lección 4, para expresar superioridad de una cualidad se exagera la expresión facial y se ralentiza el movimiento del signo.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-adjetivo-boca',
    lessonId: 4,
    signId: 'l4-grande',
    showImageDuringQuestion: true,
    prompt: 'En la estructura básica del adjetivo en LSC, ¿qué ocurre con adjetivos como GRANDE o PEQUEÑO junto a un sustantivo?',
    options: [
      'Pueden realizarse simultáneamente con el sustantivo mediante la boca y la expresión facial, o ir después del nombre',
      'Siempre van antes del sustantivo y sin ningún gesto facial',
      'Se colocan únicamente al inicio de la oración antes del sujeto',
      'Se reemplazan siempre por números dactilológicos',
    ],
    correctIndex: 0,
    explanation:
      'La Lección 4 explica que el adjetivo en LSC se expresa mayoritariamente con la boca y rostro de forma simultánea (ej. CASA PEQUEÑA) o después del sustantivo.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-negacion-cabeza',
    lessonId: 6,
    signId: 'l6-no',
    showImageDuringQuestion: true,
    prompt: '¿Cómo se comporta el adverbio de negación NO al iniciar una respuesta negativa?',
    options: [
      'Se realiza primero con movimiento de cabeza y puede continuar simultáneamente con el dedo',
      'Se prohíbe mover la cabeza y solo se permite mover el meñique',
      'Se realiza únicamente con ambos puños cerrados hacia arriba',
      'Siempre va antes del sujeto sin expresión facial',
    ],
    correctIndex: 0,
    explanation:
      'La Lección 6 explica que el adverbio NO muchas veces solo requiere movimiento de cabeza, y al iniciar respuestas (NO YO IR NO) comienza con la cabeza y continúa con el dedo.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-afirmacion',
    lessonId: 6,
    signId: 'l6-si-manual',
    showImageDuringQuestion: true,
    prompt: '¿Cuándo se utiliza el signo manual de SÍ en lugar de usar únicamente la cabeza?',
    options: [
      'Cuando se requiere expresar mayor énfasis en la afirmación',
      'Únicamente cuando se habla de animales o colores',
      'Cuando la respuesta es negativa o dudosa',
      'Solo al saludar por la mañana',
    ],
    correctIndex: 0,
    explanation:
      'Según la Lección 6, SÍ siempre se expresa con la cabeza y expresión facial; se acude al signo manual SÍ cuando se quiere mayor énfasis.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-linea-temporal',
    lessonId: 7,
    signId: 'l7-ayer',
    showImageDuringQuestion: true,
    prompt: 'En la línea espacial del tiempo en LSC, ¿hacia dónde se realizan las señas del pasado como AYER o ANTES?',
    options: [
      'Hacia atrás en dirección al hombro o espalda',
      'Hacia adelante estirando ambos brazos al frente',
      'Directamente hacia el suelo con los ojos cerrados',
      'Girando alrededor de la muñeca izquierda',
    ],
    correctIndex: 0,
    explanation:
      'La línea temporal en LSC sitúa el pasado detrás del cuerpo (hombro atrás), el presente frente al torso y el futuro hacia adelante.',
    isGrammarOrCulture: true,
  },
  {
    id: 'gq-ausentes',
    lessonId: 1,
    signId: 'l1-el-ella',
    showImageDuringQuestion: true,
    prompt: 'Si hablas de una persona (ÉL / ELLA) que NO está presente en la habitación, ¿dónde realizas el señalamiento?',
    options: [
      'Hacia un punto imaginario en el espacio donde estaría esa persona',
      'Señalando directamente tu propio pecho dos veces',
      'Apuntando hacia el techo sobre tu cabeza',
      'No se puede usar pronombre personal si la persona no está presente',
    ],
    correctIndex: 0,
    explanation:
      'La Lección 1 establece que si la persona no se encuentra presente, el signo se realiza hacia un punto imaginario asignado en el espacio.',
    isGrammarOrCulture: true,
  },
];

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function interleaveByLesson(signs: LscSign[]): LscSign[] {
  const buckets = new Map<number, LscSign[]>();
  for (const s of shuffleArray(signs)) {
    const arr = buckets.get(s.lessonId) ?? [];
    arr.push(s);
    buckets.set(s.lessonId, arr);
  }
  const lessonIds = shuffleArray(Array.from(buckets.keys()));
  const result: LscSign[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const lid of lessonIds) {
      const bucket = buckets.get(lid);
      if (bucket && bucket.length > 0) {
        result.push(bucket.pop()!);
        added = true;
      }
    }
  }
  return result;
}

export function buildBlitzQuestions(
  poolSigns: LscSign[],
  allSigns: LscSign[],
  onlyReviewMode: boolean,
  pureRandomImageMode = false
): QuizQuestion[] {
  const poolLessonIds = new Set(poolSigns.map((s) => s.lessonId));
  const poolSignIds = new Set(poolSigns.map((s) => s.id));

  const relevantGrammar = pureRandomImageMode
    ? []
    : shuffleArray(
        CURATED_GRAMMAR_QUESTIONS.filter((gq) => {
          if (onlyReviewMode) {
            return gq.signId ? poolSignIds.has(gq.signId) : poolLessonIds.has(gq.lessonId);
          }
          return poolLessonIds.has(gq.lessonId);
        })
      ).slice(0, 2);

  const vocabQuestions: QuizQuestion[] = [];
  const sampledSigns = pureRandomImageMode
    ? interleaveByLesson(poolSigns).slice(0, 55)
    : shuffleArray(poolSigns).slice(0, 45);

  for (const sign of sampledSigns) {
    const distractorCandidates = shuffleArray(
      allSigns.filter((candidate) => candidate.id !== sign.id)
    ).slice(0, 3);

    if (distractorCandidates.length < 3) continue;

    const askType = Math.random();
    if (askType < (pureRandomImageMode ? 0.55 : 0.5)) {
      const optionsWithMeta = shuffleArray([
        { text: sign.word, isCorrect: true },
        ...distractorCandidates.map((d) => ({ text: d.word, isCorrect: false })),
      ]);
      vocabQuestions.push({
        id: `vq-word-${sign.id}-${Math.random().toString(36).slice(2, 6)}`,
        lessonId: sign.lessonId,
        signId: sign.id,
        showImageDuringQuestion: true,
        maskBottomLabel: true,
        prompt: pureRandomImageMode
          ? 'Observa esta ilustración: ¿a qué seña corresponde?'
          : `Observa esta ilustración (Lección ${sign.lessonId}): ¿qué seña está realizando?`,
        options: optionsWithMeta.map((o) => o.text),
        correctIndex: optionsWithMeta.findIndex((o) => o.isCorrect),
        explanation: `${sign.word} (Lección ${sign.lessonId}): ${sign.mnemonic}`,
      });
    } else if (pureRandomImageMode || askType < 0.9) {
      const optionsWithMeta = shuffleArray([
        { id: sign.id, text: sign.word, isCorrect: true },
        ...distractorCandidates.map((d) => ({ id: d.id, text: d.word, isCorrect: false })),
      ]);
      vocabQuestions.push({
        id: `vq-pick-img-${sign.id}-${Math.random().toString(36).slice(2, 6)}`,
        lessonId: sign.lessonId,
        signId: sign.id,
        showImageDuringQuestion: false,
        maskBottomLabel: true,
        optionSignIds: optionsWithMeta.map((o) => o.id),
        prompt: `¿Cuál de estas ilustraciones corresponde a la seña "${sign.word}"?`,
        options: optionsWithMeta.map((o) => o.text),
        correctIndex: optionsWithMeta.findIndex((o) => o.isCorrect),
        explanation: `${sign.word} (Lección ${sign.lessonId}): ${sign.handshape}. ${sign.movement}`,
      });
    } else {
      const paramOptions = shuffleArray([
        { text: `${sign.handshape} — ${sign.movement}`, isCorrect: true },
        ...distractorCandidates.map((d) => ({
          text: `${d.handshape} — ${d.movement}`,
          isCorrect: false,
        })),
      ]);
      const uniqueParamTexts = new Set(paramOptions.map((o) => o.text));
      if (uniqueParamTexts.size === 4) {
        vocabQuestions.push({
          id: `vq-param-${sign.id}-${Math.random().toString(36).slice(2, 6)}`,
          lessonId: sign.lessonId,
          signId: sign.id,
          showImageDuringQuestion: true,
          maskBottomLabel: false,
          prompt: `Observa la seña "${sign.word}" (Lección ${sign.lessonId}): ¿qué descripción de forma de mano y movimiento la explica mejor?`,
          options: paramOptions.map((o) => o.text),
          correctIndex: paramOptions.findIndex((o) => o.isCorrect),
          explanation: `Ubicación: ${sign.location} · Expresión facial: ${sign.facialExpression}`,
        });
      }
    }
  }

  return pureRandomImageMode
    ? vocabQuestions
    : shuffleArray([...relevantGrammar, ...vocabQuestions]);
}

export const SYNTAX_CHALLENGES: SyntaxChallenge[] = [
  {
    id: 'syn-1',
    lessonId: 1,
    spanishMeaning: 'Yo soy estudiante y estoy aprendiendo LSC.',
    glossTokens: ['YO', 'ESTUDIANTE', 'LSC', 'APRENDER'],
    grammarRule:
      'En LSC se omiten los verbos copulativos ("ser/estar") y el verbo principal suele ubicarse al final (estructura Sujeto - Objeto - Verbo).',
    nonManualNote: 'Expresión facial atenta y asentimiento suave al finalizar.',
  },
  {
    id: 'syn-2',
    lessonId: 6,
    spanishMeaning: 'Nada, no tengo nada de plata.',
    glossTokens: ['NADA', 'PLATA', 'YO', 'NADA'],
    grammarRule:
      'Estructura negativa enfática de la Lección 6: el adverbio NADA abre y cierra la oración rodeando el objeto y el sujeto.',
    nonManualNote: 'Negación clara y continua con la cabeza acompañada de labios apretados.',
  },
  {
    id: 'syn-3',
    lessonId: 6,
    spanishMeaning: '¿Mañana vienes a mi casa?',
    glossTokens: ['MAÑANA', 'VENIR', 'CASA?'],
    grammarRule:
      'Marcador temporal al inicio (MAÑANA). El pronombre "mí" ya está incluido en la direccionalidad del verbo VENIR hacia ti.',
    nonManualNote: 'Cejas elevadas o fruncidas en expresión interrogativa sobre toda la frase.',
  },
  {
    id: 'syn-4',
    lessonId: 4,
    spanishMeaning: 'La casa grande.',
    glossTokens: ['CASA', 'GRANDE'],
    grammarRule:
      'En LSC los artículos ("el/la") se omiten y el adjetivo va después del sustantivo o se expresa simultáneamente.',
    nonManualNote: 'Mejillas ligeramente infladas y ojos abiertos para amplificar el tamaño.',
  },
  {
    id: 'syn-5',
    lessonId: 6,
    spanishMeaning: '¿Ya vino el profesor?',
    glossTokens: ['PROFESOR', 'VENIR', 'YA?'],
    grammarRule:
      'Sujeto (PROFESOR) + Acción (VENIR) + Marcador aspectual/interrogativo al final (YA?).',
    nonManualNote: 'Cejas interrogativas e inclinación breve de cabeza hacia adelante en "YA?".',
  },
  {
    id: 'syn-6',
    lessonId: 6,
    spanishMeaning: '¿Tú tienes plata?',
    glossTokens: ['TU', 'TENER', 'PLATA', 'TU?'],
    grammarRule:
      'La repetición del pronombre TÚ al inicio y al final refuerza la pregunta dirigida directamente al interlocutor.',
    nonManualNote: 'Mirada fija al interlocutor con cejas interrogativas.',
  },
  {
    id: 'syn-7',
    lessonId: 6,
    spanishMeaning: 'No, yo no voy.',
    glossTokens: ['NO', 'YO', 'IR', 'NO'],
    grammarRule:
      'Doble negación característica: inicia negando con cabeza + dedo y cierra reafirmando el NO al final.',
    nonManualNote: 'El NO inicial comienza primero con la cabeza y continúa simultáneamente con el dedo.',
  },
  {
    id: 'syn-8',
    lessonId: 6,
    spanishMeaning: '¿Tú quieres jugar?',
    glossTokens: ['TU', 'JUGAR', 'QUERER', 'TU?'],
    grammarRule:
      'Estructura de pregunta cerrada con verbo modal al final tras la acción y cierre pronominal.',
    nonManualNote: 'Expresión facial de pregunta directa esperando respuesta SÍ/NO.',
  },
  {
    id: 'syn-9',
    lessonId: 4,
    spanishMeaning: 'Yo soy más bonita que ella.',
    glossTokens: ['YO', 'BONITA', 'QUE'],
    grammarRule:
      'Estructura comparativa de superioridad (Lección 4): Sujeto + Cualidad + signo comparativo QUE dirigido hacia la otra persona.',
    nonManualNote: 'Énfasis aprobatorio en la cualidad y mirada hacia el punto de la otra persona en QUE.',
  },
  {
    id: 'syn-10',
    lessonId: 7,
    spanishMeaning: 'A mí me gusta levantarme temprano.',
    glossTokens: ['YO', 'LEVANTARSE', 'TEMPRANO', 'GUSTAR'],
    grammarRule:
      'Tópico (levantarse temprano) seguido de la valoración personal (GUSTAR) o sujeto al frente.',
    nonManualNote: 'Expresión facial agradable en GUSTAR.',
  },
];

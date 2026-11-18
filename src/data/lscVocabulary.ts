
import type { LscLessonMeta, LscSign } from '../types/lsc';
import { LSC_SIGNS_1_TO_4 } from './lscLessons1to4';
import { LSC_SIGNS_5_TO_8 } from './lscLessons5to8';
import { LSC_SIGNS_9_TO_11 } from './lscLessons9to11';

export const LSC_LESSONS: LscLessonMeta[] = [
  {
    id: 1,
    title: 'Pronombres y Bases',
    subtitle: 'Pronombres personales, cortesía inicial y comunidad sorda',
    accentHex: '#0D9488',
    pdfPath: '/assets/aistudio/LECCI_N_1_0557af09.pdf',
    grammarTip:
      'Si la persona está ausente, señala hacia un punto imaginario en el espacio. En NOSOTROS, el círculo es amplio si están presentes y cerrado si están ausentes.',
  },
  {
    id: 2,
    title: 'Familia y Aula',
    subtitle: 'Posesivos, parentesco, estados civiles y términos de clase',
    accentHex: '#0284C7',
    pdfPath: '/assets/aistudio/LECCI_N_2_e71624e0.pdf',
    grammarTip:
      'Los pronombres posesivos (MI, MÍO, TUYO, SUYO, NUESTRO) se distinguen de los personales porque el movimiento hacia el sujeto se realiza de forma más fuerte e intensa.',
  },
  {
    id: 3,
    title: 'Cortesía y Estados',
    subtitle: 'Expresiones sociales, estados de ánimo y verbos cotidianos',
    accentHex: '#059669',
    pdfPath: '/assets/aistudio/Lecci_n_3_3685ef00.pdf',
    grammarTip:
      'En estados emocionales (TRISTE, CONFUSO, CANSADO, PACIENCIA) la expresión facial transmite la intensidad real del mensaje.',
  },
  {
    id: 4,
    title: 'Adjetivos y Grados',
    subtitle: 'Tamaño, comparativos, superlativos y acciones de estudio',
    accentHex: '#D97706',
    pdfPath: '/assets/aistudio/LECCI_N_4_9f4e097f.pdf',
    grammarTip:
      'El adjetivo suele realizarse simultáneamente con el sustantivo mediante la boca y expresión facial, o ir después del nombre (CASA GRANDE). El grado superior se hace más lento y con rostro exagerado.',
  },
  {
    id: 5,
    title: 'Interrogativos',
    subtitle: 'Preguntas clave, deseo, obligación y estados',
    accentHex: '#2563EB',
    pdfPath: '/assets/aistudio/LECCI_N_5_93bb4645.pdf',
    grammarTip:
      'Todos los interrogativos van acompañados obligatoriamente de expresión facial y corporal interrogativa. Muchas veces la expresión facial sola ya convierte una oración en pregunta.',
  },
  {
    id: 6,
    title: 'Negación y Afirmación',
    subtitle: 'Adverbios de negación/afirmación y verbos de acción',
    accentHex: '#DC2626',
    pdfPath: '/assets/aistudio/LECCI_N_6_5240ce23.pdf',
    grammarTip:
      'La negación suele ubicarse al final o reforzar ambos extremos (NADA PLATA YO NADA). El adverbio NO casi siempre se acompaña del movimiento lateral de la cabeza, y SÍ con asentimiento.',
  },
  {
    id: 7,
    title: 'Tiempo y Rutinas',
    subtitle: 'Línea temporal, saludos del día y verbos modales',
    accentHex: '#7C3AED',
    pdfPath: '/assets/aistudio/LECCI_N_7_e683dac9.pdf',
    grammarTip:
      'En LSC el tiempo se ubica en el espacio corporal: el pasado va hacia atrás sobre el hombro (AYER, ANTES, HACE TIEMPO), el presente justo frente a ti (HOY, AHORA) y el futuro hacia adelante (MAÑANA, DESPUÉS).',
  },
  {
    id: 8,
    title: 'Calendario y Fechas',
    subtitle: 'Meses del año, días de la semana y unidades de tiempo',
    accentHex: '#0F766E',
    pdfPath: '/assets/aistudio/Lecci_n_8_67c91705.pdf',
    grammarTip:
      'La mayoría de días y meses parten de la inicial dactilológica acompañada de un movimiento específico (como la Z en MARZO o la S en SEPTIEMBRE).',
  },
  {
    id: 9,
    title: 'Alimentos y Sabores',
    subtitle: 'Comidas típicas colombianas, bebidas, frutas y sensaciones',
    accentHex: '#EA580C',
    pdfPath: '/assets/aistudio/Lecci_n_9_-_Alimentos__2f0761b3.pdf',
    grammarTip:
      'Muchas señas gastronómicas representan la acción física de preparar o comer el alimento (moldear la AREPA, batir CHOCOLATE con molinillo, pelar BANANO).',
  },
  {
    id: 10,
    title: 'Reino Animal',
    subtitle: 'Animales domésticos, salvajes, acuáticos, aves e insectos',
    accentHex: '#16A34A',
    pdfPath: '/assets/aistudio/Lecci_n_10_-_Animales_4680d19d.pdf',
    grammarTip:
      'Las señas de animales destacan su rasgo visual distintivo: orejas (CONEJO, BURRO), bigotes (GATO), trompa (ELEFANTE), aleta (TIBURÓN) o desplazamiento (PEZ, CULEBRA).',
  },
  {
    id: 11,
    title: 'Ropa y Colores',
    subtitle: 'Prendas de vestir, calzado, colores y matices visuales',
    accentHex: '#DB2777',
    pdfPath: '/assets/aistudio/Lecci_n_11_-_Prendas_de_vestirColores__bafb9580.pdf',
    grammarTip:
      'Las prendas se señan ubicándolas sobre la parte del cuerpo donde se visten. Varios colores se anclan en referentes del rostro (ROJO en labios, BLANCO en dientes, NEGRO en ceja).',
  },
];

export const ALL_LSC_SIGNS: LscSign[] = [
  ...LSC_SIGNS_1_TO_4,
  ...LSC_SIGNS_5_TO_8,
  ...LSC_SIGNS_9_TO_11,
].map((sign) => ({
  ...sign,
  imageUrl:
    sign.imageUrl ??
    `${import.meta.env.BASE_URL}assets/signs/${sign.id}.jpg`,
}));

export function getLessonMeta(lessonId: number): LscLessonMeta {
  return LSC_LESSONS.find((l) => l.id === lessonId) ?? LSC_LESSONS[0];
}

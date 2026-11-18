export type MasteryStatus = 'unseen' | 'review' | 'learned';

export type LessonId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type QuizScope = LessonId | 'all' | 'review' | 'random_mix';

export interface LscSign {
  id: string;
  word: string;
  lessonId: LessonId;
  category: string;
  handshape: string;
  location: string;
  movement: string;
  facialExpression: string;
  mnemonic: string;
  iconKey: string;
  imageUrl: string;
}

export type LscSignSeed = Omit<LscSign, 'imageUrl'> & {
  imageUrl?: string;
};

export interface LscLessonMeta {
  id: LessonId;
  title: string;
  subtitle: string;
  accentHex: string;
  pdfPath: string;
  grammarTip: string;
}

export interface UserProgressState {
  xp: number;
  xpByDate: Record<string, number>;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  statuses: Record<string, MasteryStatus>;
  quizzesCompleted: number;
  bestQuizScore: number;
  syntaxSolvedIds: string[];
}

export interface QuizQuestion {
  id: string;
  lessonId: LessonId;
  signId?: string;
  showImageDuringQuestion?: boolean;
  maskBottomLabel?: boolean;
  optionSignIds?: string[];
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isGrammarOrCulture?: boolean;
}

export interface SyntaxChallenge {
  id: string;
  lessonId: LessonId;
  spanishMeaning: string;
  glossTokens: string[];
  grammarRule: string;
  nonManualNote: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface LscSearchResponse {
  answer: string;
  sources: GroundingSource[];
}

export interface ChatSpace {
  name: string;
  displayName?: string;
  spaceType?: string;
}

export interface ChatMessage {
  name: string;
  text?: string;
  createTime?: string;
  sender?: {
    name?: string;
    displayName?: string;
    type?: string;
  };
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface GrammarTest {
  id: string;
  title: string;
  subtitle: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export type AppView = 'level-select' | 'quiz' | 'results';

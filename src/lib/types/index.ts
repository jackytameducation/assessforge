// Question types
export type QuestionType = 'MCQ' | 'EMQ' | 'SAQ';
export type ParseMode = 'auto' | 'mixed' | QuestionType;

export interface Option {
  letter: string;
  text: string;
}

export interface BaseQuestion {
  itemId: string;
  type: QuestionType;
  title: string;
  text: string;
  htmlContent?: string;
  metadata?: QuestionMetadata;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'MCQ';
  options: Option[];
  correctAnswer: string;
}

export interface EMQQuestion extends BaseQuestion {
  type: 'EMQ';
  optionsId?: string;
  referenceId?: string;
  options: Option[];
  correctAnswer: string;
  sharedContext?: string;
  parentItemId?: string;
}

export interface SAQSubQuestion {
  part: string;
  question: string;
  marks: number;
}

export interface SAQQuestion extends BaseQuestion {
  type: 'SAQ';
  totalMarks: number;
  answerKey: string;
  subQuestions?: SAQSubQuestion[];
  sharedContext?: string;
  parentItemId?: string;
}

export type Question = MCQQuestion | EMQQuestion | SAQQuestion;

// Metadata interfaces
export interface ProfileMetadata {
  difficultyLevel?: number;
  discriminationIndex?: number;
  specialty?: string;
  discipline?: string;
  taxonomy?: string;
  system?: string;
  process?: string;
  [key: string]: any;
}

export interface UsageStatistics {
  difficultyLevel?: number;
  discriminationIndex?: number;
  lastUsed?: string;
  usageCount?: number;
  examinationYear?: string;
}

export interface QuestionMetadata {
  profile: ProfileMetadata;
  lastUseStatistics?: UsageStatistics;
  backgroundInfo?: string;
  [key: string]: any;
}

// QTI Generation Options
export interface QTIGenerationOptions {
  includeAnswerKey?: boolean;
  shuffleOptions?: boolean;
  timeLimit?: number;
  maxAttempts?: number;
}

// Parse Results
export interface ParseResult {
  success: boolean;
  message: string;
  totalQuestions: number;
  files: Array<{
    filename: string;
    questionType: string;
    questionCount: number;
  }>;
  questions: Question[];
}

// Convert Results
export interface ConvertResult {
  success: boolean;
  message: string;
  package?: {
    manifest: string;
    assessment: string;
    items: Array<{
      filename: string;
      item: string;
    }>;
  };
}

// Error interfaces
export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Document section interfaces
export interface DocumentSection {
  type: QuestionType;
  content: string;
  startIndex: number;
  endIndex: number;
}

export interface MixedDocument {
  sections: DocumentSection[];
  totalQuestions: number;
}

// EMQ specific types
export interface EMQOption {
  letter: string;
  text: string;
}

export interface MCQOption {
  letter: string;
  text: string;
}

// Core question types
export interface Question {
  itemId: string;
  type: QuestionType;
  title: string;
  text: string;
  htmlContent?: string;
  answer?: string;
  metadata?: QuestionMetadata;
}

export interface MCQQuestion extends Question {
  type: 'MCQ';
  options: MCQOption[];
  correctAnswer: string;
  questionType: string; // e.g., "A type: 3-5 options"
  source?: string;
}

export interface EMQQuestion extends Question {
  type: 'EMQ';
  optionsId?: string;
  options: EMQOption[];
  referenceId?: string;
  correctAnswer: string;
  questionType: string; // e.g., "R type (Extended Matching)"
  sharedContext?: string; // Shared context for sub-questions (used for generating separate Document XML)
  parentItemId?: string; // Original item ID when this is a sub-question
}

export interface SAQQuestion extends Question {
  type: 'SAQ';
  subQuestions: SAQSubQuestion[];
  answerKey: string;
  totalMarks: number;
  sharedContext?: string; // Shared context for sub-questions (used for generating separate Document XML)
  parentItemId?: string; // Original item ID when this is a sub-question
}

export interface MCQOption {
  letter: string;
  text: string;
}

export interface EMQOption {
  letter: string;
  text: string;
}

export interface SAQSubQuestion {
  part: string; // e.g., "(a)", "(b)"
  question: string;
  marks: number;
}

export type QuestionType = 'MCQ' | 'EMQ' | 'SAQ';
export type ParseMode = 'MCQ' | 'EMQ' | 'SAQ' | 'MIXED' | 'auto';

// Mixed document types for papers containing multiple question types
export interface MixedDocument {
  sections: DocumentSection[];
  totalQuestions: number;
  questionTypeCounts: { [key in QuestionType]: number };
}

export interface DocumentSection {
  type: QuestionType;
  title?: string;
  questions: Question[];
  startIndex: number;
  endIndex: number;
}

// Question metadata and statistics
export interface QuestionMetadata {
  profile: ProfileMetadata;
  lastUseStatistics?: UsageStatistics;
  secondLastUseStatistics?: UsageStatistics;
  backgroundInfo: string;
  parentItemId?: string;
  subQuestionPart?: string;
  subQuestionNumber?: number;
}

export interface ProfileMetadata {
  transition: string;
  system: string;
  discipline: string;
  process: string;
  taxonomy: string;
  gender: string;
  ageGroup: string;
  affiliation: string;
  specialty: string;
  status: string;
  originatingDept: string;
  levelProgram: string;
  mesh1: string;
  mesh2: string;
}

export interface UsageStatistics {
  examinationYear?: string;
  level?: string;
  institution?: string;
  difficultyLevel?: number;
  discriminationIndex?: number;
  ptBiserial?: number;
  numberInGroup?: number;
  testNumber?: string;
  questionNumber?: number;
  percentageSelections?: { [key: string]: number };
}

// Parsing and conversion types
export interface ParsedDocument {
  questions: Question[];
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  fileName: string;
  fileType: 'docx' | 'txt';
  totalQuestions: number;
  questionTypes: { [key in QuestionType]: number };
  parseMode: ParseMode;
  hasMixedContent: boolean;
  sections?: DocumentSection[];
}

// QTI generation types
export interface QTIGenerationOptions {
  title: string;
  identifier: string;
  includeMetadata: boolean;
  shuffleAnswers: boolean;
}

export interface QTIItem {
  identifier: string;
  title: string;
  body: string;
  responseDeclaration: QTIResponseDeclaration;
  outcomeDeclaration?: QTIOutcomeDeclaration;
  responseProcessing: QTIResponseProcessing;
  metadata?: QTIMetadata;
}

export interface QTIResponseDeclaration {
  identifier: string;
  cardinality: 'single' | 'multiple';
  baseType: string;
  correctResponse?: QTICorrectResponse;
}

export interface QTICorrectResponse {
  value: string | string[];
}

export interface QTIOutcomeDeclaration {
  identifier: string;
  cardinality: 'single';
  baseType: string;
}

export interface QTIResponseProcessing {
  template?: string;
  responseRules?: QTIResponseRule[];
}

export interface QTIResponseRule {
  responseCondition: QTIResponseCondition;
}

export interface QTIResponseCondition {
  responseIf: QTIResponseIf;
  responseElse?: QTIResponseElse;
}

export interface QTIResponseIf {
  match: QTIMatch;
  setOutcomeValue: QTISetOutcomeValue;
}

export interface QTIResponseElse {
  setOutcomeValue: QTISetOutcomeValue;
}

export interface QTIMatch {
  variable: QTIVariable;
  correct: QTICorrect;
}

export interface QTIVariable {
  identifier: string;
}

export interface QTICorrect {
  identifier: string;
}

export interface QTISetOutcomeValue {
  identifier: string;
  baseValue: QTIBaseValue;
}

export interface QTIBaseValue {
  baseType: string;
  value: string | number;
}

export interface QTIMetadata {
  [key: string]: string | number | undefined;
}

// API request/response types
export interface UploadRequest {
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
  questionType: QuestionType;
}

export interface UploadResponse {
  success: boolean;
  data?: ParsedDocument;
  error?: string;
}

export interface ConvertRequest {
  questions: Question[];
  options: QTIGenerationOptions;
}

export interface ConvertResponse {
  success: boolean;
  data?: {
    xml: string;
    filename: string;
  };
  error?: string;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ParseError extends Error implements AppError {
  statusCode = 422;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

export class ConversionError extends Error implements AppError {
  statusCode = 500;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ConversionError';
  }
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, FileText, CheckCircle, Eye, EyeOff, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import Footer from '@/components/Footer';

interface Question {
  itemId: string;
  type: string;
  title: string;
  text: string;
  options?: Array<{ letter: string; text: string }>;
  correctAnswer?: string;
  metadata: {
    profile: {
      difficultyLevel?: number;
      discriminationIndex?: number;
      specialty?: string;
      discipline?: string;
      [key: string]: any;
    };
    lastUseStatistics?: {
      difficultyLevel?: number;
      discriminationIndex?: number;
    };
    [key: string]: any;
  };
}

interface ParsedFile {
  filename: string;
  questionType: string;
  questions: Question[];
  questionCount: number;
  error?: string;
}

interface ParseResult {
  success: boolean;
  message: string;
  totalQuestions: number;
  files: ParsedFile[];
  questions: Question[];
}

export default function PreviewPage() {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set()); // Default: all collapsed
  const [expandedMetadata, setExpandedMetadata] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false); // Default: section collapsed
  const router = useRouter();

  useEffect(() => {
    // Load parse results from sessionStorage
    const storedResult = sessionStorage.getItem('parseResult');
    
    if (!storedResult) {
      router.push('/upload');
      return;
    }
    
    setParseResult(JSON.parse(storedResult));
  }, [router]);

  const toggleQuestionExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleMetadataExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedMetadata);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedMetadata(newExpanded);
  };

  const expandAllQuestions = () => {
    const allQuestionIds = parseResult?.questions.map(q => q.itemId) || [];
    setExpandedQuestions(new Set(allQuestionIds));
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions(new Set());
  };

  const handleNext = () => {
    if (parseResult?.success && parseResult.totalQuestions > 0) {
      // Set flag for auto-conversion
      sessionStorage.setItem('autoStartConversion', 'true');
      router.push('/convert');
    }
  };

  const handleBack = () => {
    router.push('/upload');
  };

  const getDifficultyLabel = (difficulty?: number) => {
    if (!difficulty) return 'Unknown';
    if (difficulty < 30) return 'Easy';
    if (difficulty < 70) return 'Medium';
    return 'Hard';
  };

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    if (difficulty < 30) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (difficulty < 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  if (!parseResult) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Review Your Questions</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Verify your parsed questions before generating the QTI package
        </p>
      </div>

      {/* Summary */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <h2 className="text-base sm:text-lg font-semibold text-card-foreground">Parsing Complete</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-lg text-card-foreground">{parseResult.totalQuestions}</span>
            <span className="text-muted-foreground">{parseResult.totalQuestions === 1 ? 'Question' : 'Questions'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {parseResult.files.map((file, index) => (
            <div key={index} className="bg-secondary rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-secondary-foreground truncate">{file.filename}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Type:</span>
                  <span className="font-medium text-secondary-foreground">{file.questionType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Questions:</span>
                  <span className="font-medium text-secondary-foreground">{file.questionCount}</span>
                </div>
              </div>
              {file.error && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                  {file.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Questions Section */}
      <div className="bg-card rounded-lg shadow-sm border border-border mb-6 sm:mb-8">
        <div className="p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-card-foreground">
              Question Details ({parseResult.totalQuestions})
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {showDetails && (
                <>
                  <button
                    onClick={expandAllQuestions}
                    className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAllQuestions}
                    className="text-xs sm:text-sm px-3 py-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    Collapse All
                  </button>
                </>
              )}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Hide Details</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Show Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {showDetails ? (
          <div className="p-6 space-y-4">
            {parseResult.questions.map((question) => (
          <div key={question.itemId} className="bg-card rounded-lg shadow-sm border border-border">
            {/* Question Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                    {question.type}
                  </span>
                  <span className="text-sm font-medium text-card-foreground">
                    ID: {question.itemId}
                  </span>
                  {question.metadata?.lastUseStatistics?.difficultyLevel && (
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getDifficultyColor(question.metadata.lastUseStatistics.difficultyLevel)}`}>
                      {getDifficultyLabel(question.metadata.lastUseStatistics.difficultyLevel)} ({question.metadata.lastUseStatistics.difficultyLevel}%)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => toggleQuestionExpanded(question.itemId)}
                  className="p-1 text-muted-foreground hover:text-card-foreground"
                >
                  {expandedQuestions.has(question.itemId) ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Question Content */}
            <div className="p-4">
              <div className="mb-4">
                <h3 className="font-medium text-card-foreground mb-2">{question.title}</h3>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {expandedQuestions.has(question.itemId) ? 
                    question.text : 
                    question.text.substring(0, 200) + (question.text.length > 200 ? '...' : '')
                  }
                </div>
              </div>

              {/* Options for MCQ/EMQ */}
              {question.options && question.options.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-card-foreground mb-2">Options:</h4>
                  <div className="space-y-1">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex} 
                        className={`text-sm p-2 rounded border ${
                          option.letter === question.correctAnswer 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100' 
                            : 'bg-muted/50 dark:bg-muted/20 border-border text-foreground'
                        }`}
                      >
                        <span className="font-medium">{option.letter}.</span> {option.text}
                        {option.letter === question.correctAnswer && (
                          <span className="ml-2 text-green-600 dark:text-green-400 text-xs">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Toggle */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={() => toggleMetadataExpanded(question.itemId)}
                  className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expandedMetadata.has(question.itemId) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>Question Configuration</span>
                </button>

                {expandedMetadata.has(question.itemId) && (
                  <div className="mt-3 bg-muted/50 dark:bg-muted/20 rounded p-3 text-xs border border-border/50 text-foreground">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {question.metadata.profile?.specialty && (
                        <div>
                          <span className="font-medium">Specialty:</span> {question.metadata.profile.specialty}
                        </div>
                      )}
                      {question.metadata.profile?.discipline && (
                        <div>
                          <span className="font-medium">Discipline:</span> {question.metadata.profile.discipline}
                        </div>
                      )}
                      {question.metadata.lastUseStatistics?.discriminationIndex && (
                        <div>
                          <span className="font-medium">Discrimination:</span> {question.metadata.lastUseStatistics.discriminationIndex}%
                        </div>
                      )}
                      {question.metadata.profile?.taxonomy && (
                        <div>
                          <span className="font-medium">Taxonomy:</span> {question.metadata.profile.taxonomy}
                        </div>
                      )}
                      {question.metadata.profile?.system && (
                        <div>
                          <span className="font-medium">System:</span> {question.metadata.profile.system}
                        </div>
                      )}
                      {question.metadata.profile?.process && (
                        <div>
                          <span className="font-medium">Process:</span> {question.metadata.profile.process}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-4 border border-border/50">
              <h3 className="text-lg font-medium text-card-foreground mb-3">Question Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parseResult.files.map((file, index) => (
                  <div key={index} className="bg-background rounded-lg p-3 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{file.filename}</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Type: <span className="font-medium">{file.questionType}</span></div>
                      <div>Questions: <span className="font-medium">{file.questionCount}</span></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Click &quot;Show Details&quot; above to view individual questions and their content.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium text-foreground bg-background border border-border hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Back to Upload
        </button>

        <button
          onClick={handleNext}
          disabled={!parseResult?.success || parseResult.totalQuestions === 0}
          className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${
            parseResult?.success && parseResult.totalQuestions > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Generate QTI Package
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}

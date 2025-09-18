'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, FileText, CheckCircle, XCircle, Eye, EyeOff, Edit, ChevronDown, ChevronRight } from 'lucide-react';
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
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [expandedMetadata, setExpandedMetadata] = useState<Set<string>>(new Set());
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

  const handleNext = () => {
    if (parseResult?.success && parseResult.totalQuestions > 0) {
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
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Preview Questions</h1>
        <p className="text-muted-foreground">
          Review and verify your questions before converting to QTI format
        </p>
      </div>

      {/* Summary */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <h2 className="text-lg font-semibold text-card-foreground">Parse Results</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Questions: <span className="font-semibold text-card-foreground">{parseResult.totalQuestions}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {parseResult.files.map((file, index) => (
            <div key={index} className="bg-secondary rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-secondary-foreground">{file.filename}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <div>Type: {file.questionType}</div>
                <div>Questions: {file.questionCount}</div>
              </div>
              {file.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {file.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-8">
        {parseResult.questions.map((question, index) => (
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
                        className={`text-sm p-2 rounded ${
                          option.letter === question.correctAnswer 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-muted/50 dark:bg-muted/20 border border-border/50'
                        }`}
                      >
                        <span className="font-medium">{option.letter}.</span> {option.text}
                        {option.letter === question.correctAnswer && (
                          <span className="ml-2 text-green-600 text-xs">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Toggle */}
              <div className="border-t border-gray-100 pt-4">
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

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Upload</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!parseResult?.success || parseResult.totalQuestions === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          <span>Continue to Convert</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}

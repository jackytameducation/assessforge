'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

interface ParsedFile {
  filename: string;
  questionType: string;
  questions: any[];
  questionCount: number;
  error?: string;
}

interface ParseResult {
  success: boolean;
  message: string;
  totalQuestions: number;
  files: ParsedFile[];
  questions: any[];
}

export default function ParsePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [questionType, setQuestionType] = useState<string>('auto');
  const router = useRouter();

  useEffect(() => {
    // Load files from sessionStorage
    const storedFiles = sessionStorage.getItem('uploadedFiles');
    const storedQuestionType = sessionStorage.getItem('questionType');
    
    if (!storedFiles) {
      router.push('/upload');
      return;
    }
    
    setFiles(JSON.parse(storedFiles));
    setQuestionType(storedQuestionType || 'auto');
  }, [router]);

  const handleParse = async () => {
    setIsLoading(true);
    setParseResult(null);

    try {
      const formData = new FormData();
      
      // Reconstruct files from stored data
      files.forEach((fileInfo, index) => {
        const storedFileData = sessionStorage.getItem(`file_${index}`);
        const storedFileType = sessionStorage.getItem(`file_${index}_type`);
        if (storedFileData) {
          // Convert base64 back to blob
          const binaryString = atob(storedFileData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: storedFileType || fileInfo.type });
          const file = new File([blob], fileInfo.name, { type: storedFileType || fileInfo.type });
          formData.append('document', file);
        }
      });
      
      formData.append('questionType', questionType);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const result: ParseResult = await response.json();
      setParseResult(result);
      
      // Store parse results for next step
      if (result.success) {
        sessionStorage.setItem('parseResult', JSON.stringify(result));
      }

    } catch (error) {
      console.error('Error parsing files:', error);
      setParseResult({
        success: false,
        message: 'Failed to parse files',
        totalQuestions: 0,
        files: [],
        questions: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (parseResult?.success && parseResult.totalQuestions > 0) {
      router.push('/convert');
    }
  };

  const handleBack = () => {
    router.push('/upload');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Parse Documents</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Extract and validate questions from your uploaded documents
        </p>
      </div>

      {/* Files to Parse */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-3 sm:mb-4">Files to Parse</h3>
        <div className="space-y-2 sm:space-y-3">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-secondary rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-secondary-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {questionType === 'auto' ? 'Auto-detect' : questionType}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6">
          <button
            onClick={handleParse}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>Parsing Documents...</span>
              </>
            ) : (
              'Parse Documents'
            )}
          </button>
        </div>
      </div>

      {/* Parse Results */}
      {parseResult && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            {parseResult.success ? (
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 flex-shrink-0" />
            )}
            <h3 className="text-base sm:text-lg font-medium text-card-foreground">Parse Results</h3>
          </div>

          <div className={`p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 ${
            parseResult.success ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30' : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
          }`}>
            <p className={`text-xs sm:text-sm ${parseResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
              {parseResult.message}
            </p>
            {parseResult.success && (
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 mt-1">
                Total questions found: {parseResult.totalQuestions}
              </p>
            )}
          </div>

          {/* File Results */}
          <div className="space-y-2 sm:space-y-3">
            {parseResult.files.map((file, index) => (
              <div key={index} className="border border-border rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h4 className="text-sm sm:text-base font-medium text-card-foreground truncate">{file.filename}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    file.error ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {file.error ? 'Error' : `${file.questionCount} questions`}
                  </span>
                </div>
                {file.error ? (
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{file.error}</p>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Successfully parsed {file.questionCount} {file.questionType} question(s)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium text-foreground bg-background border border-border hover:bg-accent"
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
          Continue to Convert
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}

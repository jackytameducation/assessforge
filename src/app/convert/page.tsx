'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Zap, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import Footer from '@/components/Footer';

interface ConvertResult {
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

export default function ConvertPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [parseResult, setParseResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Load parse results from sessionStorage
    const storedParseResult = sessionStorage.getItem('parseResult');
    
    if (!storedParseResult) {
      router.push('/preview');
      return;
    }
    
    setParseResult(JSON.parse(storedParseResult));
  }, [router]);

  const handleConvert = async () => {
    if (!parseResult) return;

    setIsLoading(true);
    setConvertResult(null);

    try {
      // Get the original filename for the ZIP output
      const originalFilename = parseResult.files[0]?.filename || 'questions';
      const baseFilename = originalFilename.replace(/\.[^/.]+$/, ''); // Remove extension
      
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: parseResult.questions,
          questionType: parseResult.files[0]?.questionType || 'MCQ',
          originalFilename: baseFilename
        }),
      });

      const result: ConvertResult = await response.json();
      setConvertResult(result);
      
      // Store convert results for download step
      if (result.success) {
        sessionStorage.setItem('convertResult', JSON.stringify(result));
      }

    } catch (error) {
      console.error('Error converting to QTI:', error);
      setConvertResult({
        success: false,
        message: 'Failed to convert to QTI format'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (convertResult?.success) {
      router.push('/download');
    }
  };

  const handleBack = () => {
    router.push('/preview');
  };

  if (!parseResult) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Convert to QTI</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Generate QTI 2.1 compliant packages from your parsed questions
        </p>
      </div>

      {/* Conversion Summary */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-3 sm:mb-4">Conversion Summary</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{parseResult.totalQuestions}</div>
            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Questions</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{parseResult.files.length}</div>
            <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Files</div>
          </div>
          <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">QTI 2.1</div>
            <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Format</div>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {parseResult.files.map((file: any, index: number) => (
            <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-secondary rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-secondary-foreground truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {file.questionCount} {file.questionType} questions ready for conversion
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6">
          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                <span>Converting to QTI...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Convert to QTI Format</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversion Results */}
      {convertResult && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            {convertResult.success ? (
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 dark:text-red-400 flex-shrink-0" />
            )}
            <h3 className="text-base sm:text-lg font-medium text-card-foreground">Conversion Results</h3>
          </div>

          <div className={`p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 ${
            convertResult.success 
              ? 'bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800/30' 
              : 'bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
          }`}>
            <p className={`text-xs sm:text-sm ${
              convertResult.success 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-red-800 dark:text-red-300'
            }`}>
              {convertResult.message}
            </p>
          </div>

          {convertResult.success && convertResult.package && (
            <div className="space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-medium text-card-foreground">Generated QTI Package Contents:</h4>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-secondary-foreground">imsmanifest.xml</p>
                    <p className="text-xs text-muted-foreground">Package manifest file</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 p-3 bg-secondary rounded-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-secondary-foreground">assessment.xml</p>
                    <p className="text-xs text-muted-foreground">Assessment configuration</p>
                  </div>
                </div>
                
                {convertResult.package.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 sm:gap-3 p-3 bg-secondary rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-secondary-foreground truncate">{item.filename}</p>
                      <p className="text-xs text-muted-foreground">Question item file</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium text-foreground bg-background border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Back to Parse
        </button>

        <button
          onClick={handleNext}
          disabled={!convertResult?.success}
          className={`inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-colors ${
            convertResult?.success
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Continue to Download
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}

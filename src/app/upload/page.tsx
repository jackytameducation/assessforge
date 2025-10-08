'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ArrowRight, FileText, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [questionType, setQuestionType] = useState<'MCQ' | 'EMQ' | 'SAQ' | 'auto'>('auto');
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const router = useRouter();

  // Constants for file size limits
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const WARNING_THRESHOLD = 0.8; // Warn at 80% of limit (16MB)

  // Calculate total file size
  const getTotalFileSize = () => {
    return files.reduce((acc, file) => acc + file.size, 0);
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get warning level based on file size
  const getSizeWarningLevel = () => {
    const totalSize = getTotalFileSize();
    const percentage = totalSize / MAX_FILE_SIZE;
    
    if (percentage >= 1) return 'error';
    if (percentage >= WARNING_THRESHOLD) return 'warning';
    return 'normal';
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.name.endsWith('.docx') || file.name.endsWith('.txt')
    );
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseFiles = async () => {
    setIsProcessing(true);
    setUploadProgress('Preparing files...');
    
    try {
      // Check total file size before uploading
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const maxTotalSize = 20 * 1024 * 1024; // 20MB total
      
      if (totalSize > maxTotalSize) {
        alert(`Total file size (${(totalSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxTotalSize / 1024 / 1024}MB. Please reduce file size or upload fewer files.`);
        setIsProcessing(false);
        setUploadProgress('');
        return;
      }

      setUploadProgress('Uploading files...');
      const formData = new FormData();
      
      // Add files directly to FormData - no need to store in sessionStorage
      files.forEach((file) => {
        formData.append('document', file);
      });
      
      formData.append('questionType', questionType);

      setUploadProgress('Processing documents...');
      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to parse files';
        
        if (response.status === 413) {
          errorMessage = 'File(s) too large. Please reduce file size or split into smaller files (max 20MB total).';
        } else {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `Server error: ${response.status}`;
          }
        }
        
        alert(errorMessage);
        setIsProcessing(false);
        setUploadProgress('');
        return;
      }

      setUploadProgress('Parsing questions...');
      const result = await response.json();
      
      // Store parse results for preview step
      if (result.success) {
        sessionStorage.setItem('parseResult', JSON.stringify(result));
        setUploadProgress('Complete! Redirecting...');
        router.push('/preview');
      } else {
        alert('Failed to parse files: ' + result.message);
        setIsProcessing(false);
        setUploadProgress('');
      }

    } catch (error) {
      console.error('Error parsing files:', error);
      alert(`Network error: ${(error as Error).message}. Please check your connection and try again.`);
      setIsProcessing(false);
      setUploadProgress('');
    }
  };

  const handleNext = async () => {
    if (files.length === 0) return;
    
    // Store basic file info for reference (not the actual file data)
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    sessionStorage.setItem('uploadedFiles', JSON.stringify(fileData));
    sessionStorage.setItem('questionType', questionType);
    
    // Parse files directly without storing them in sessionStorage
    await parseFiles();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Upload Documents</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Upload your educational documents to begin the QTI transformation process
        </p>
      </div>

      {/* File Upload Area */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
        {isProcessing && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
              <p className="text-sm font-medium">{uploadProgress}</p>
            </div>
          </div>
        )}
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center cursor-pointer transition-colors ${
            isProcessing 
              ? 'opacity-50 cursor-not-allowed border-border' 
              : isDragActive
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
              : 'border-border hover:border-blue-400 dark:hover:border-blue-400'
          }`}
        >
          <input {...getInputProps()} disabled={isProcessing} />
          <Upload className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
          {isDragActive ? (
            <p className="text-base sm:text-lg text-blue-600 dark:text-blue-400">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-base sm:text-lg text-card-foreground mb-2">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Supports .docx and .txt files (max 20MB total)
              </p>
            </div>
          )}
        </div>

        {/* Question Type Selector */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-xs sm:text-sm font-medium text-card-foreground mb-2">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as any)}
            disabled={isProcessing}
            className="block w-full px-3 py-2 text-sm sm:text-base border border-border rounded-md shadow-sm bg-background text-foreground focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="auto">Auto-detect</option>
            <option value="MCQ">Multiple Choice Questions (MCQ)</option>
            <option value="EMQ">Extended Matching Questions (EMQ)</option>
            <option value="SAQ">Short Answer Questions (SAQ)</option>
          </select>
        </div>

        {/* Format Guide */}
        <div className="mt-4 sm:mt-6 bg-secondary rounded-lg p-3 sm:p-4">
          <button 
            onClick={() => setShowFormatGuide(!showFormatGuide)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-xs sm:text-sm font-medium text-secondary-foreground flex items-center gap-2">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Text File Format Requirements</span>
            </h3>
            <span className="text-muted-foreground text-lg">{showFormatGuide ? '−' : '+'}</span>
          </button>
          {showFormatGuide && (
          <div className="text-xs text-secondary-foreground space-y-2 mt-3">
            <div>
              <span className="font-medium">MCQ Format:</span>
              <pre className="mt-1 bg-background border border-border p-2 rounded text-xs overflow-x-auto">
{`Item ID: 12345    A type: 3-5 options

What is 2+2?

A. 3
B. 4
C. 5
D. 6

Answer: B`}
              </pre>
            </div>
            <div>
              <span className="font-medium">EMQ Format:</span>
              <pre className="mt-1 bg-background border border-border p-2 rounded text-xs overflow-x-auto">
{`Item ID: 30036    R type (Extended Matching)

Options ID: 1840
A. Option A
B. Option B
C. Option C

Sub-Question 1: Question text here?
Answer: A`}
              </pre>
            </div>
            <div>
              <span className="font-medium">SAQ Format:</span>
              <pre className="mt-1 bg-background border border-border p-2 rounded text-xs overflow-x-auto">
{`Item ID: 19500    Short Answer

Question text here?

Answer: Expected answer here`}
              </pre>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              💡 Tip: .docx files are automatically parsed and don&apos;t need this specific format
            </p>
          </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-card-foreground">Uploaded Files</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Visual Size Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-card-foreground">
                Total Size: {formatFileSize(getTotalFileSize())} / {formatFileSize(MAX_FILE_SIZE)}
              </span>
              <span className={`text-xs sm:text-sm font-medium ${
                getSizeWarningLevel() === 'error' ? 'text-red-600 dark:text-red-400' :
                getSizeWarningLevel() === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {((getTotalFileSize() / MAX_FILE_SIZE) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  getSizeWarningLevel() === 'error' ? 'bg-red-600' :
                  getSizeWarningLevel() === 'warning' ? 'bg-amber-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min((getTotalFileSize() / MAX_FILE_SIZE) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Size Warning */}
          {(() => {
            const totalSize = files.reduce((acc, file) => acc + file.size, 0);
            const maxSize = 20 * 1024 * 1024;
            const percentage = (totalSize / maxSize) * 100;
            
            if (percentage >= 100) {
              return (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        File size limit exceeded
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Total size is {formatFileSize(totalSize)}. Please reduce file size or remove some files to stay within the 20MB limit.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (percentage >= 80) {
              return (
                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Approaching size limit
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        You&apos;re using {percentage.toFixed(1)}% of the 20MB limit. Consider reducing file size if upload fails.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
          
          <div className="space-y-2 sm:space-y-3">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-secondary-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-2 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex flex-col items-center sm:items-end gap-2">
        <button
          onClick={handleNext}
          disabled={files.length === 0 || isProcessing || getSizeWarningLevel() === 'error'}
          className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-colors w-full sm:w-auto ${
            files.length === 0 || isProcessing || getSizeWarningLevel() === 'error'
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              Continue to Parse
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </>
          )}
        </button>
        {getSizeWarningLevel() === 'error' && files.length > 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center sm:text-right">
            Remove files to proceed
          </p>
        )}
      </div>

      {/* Large File Tips */}
      {files.length > 0 && getSizeWarningLevel() !== 'normal' && (
        <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            Tips for Large Files
          </h3>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 ml-5 list-disc">
            <li>Split large documents into smaller files (e.g., by topic or question type)</li>
            <li>Remove unnecessary images or embedded content from .docx files</li>
            <li>Convert .docx to .txt format for smaller file size</li>
            <li>Process files in batches if you have many documents</li>
            <li>For very large assessments, consider uploading separately and combining QTI output</li>
          </ul>
        </div>
      )}
      </div>
      <Footer />
    </div>
  );
}

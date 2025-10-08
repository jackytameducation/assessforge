'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentIcon, ArrowUpTrayIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

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

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [questionType, setQuestionType] = useState<'MCQ' | 'EMQ' | 'SAQ' | 'MIXED' | 'auto'>('auto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [qtiResult, setQtiResult] = useState<any>(null);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

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
    },
    multiple: true
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setParseResult(null);
    setQtiResult(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('document', file);
      });
      formData.append('questionType', questionType);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const result: ParseResult = await response.json();
      setParseResult(result);

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
      setIsProcessing(false);
    }
  };

  const convertToQTI = async () => {
    if (!parseResult || parseResult.questions.length === 0) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questions: parseResult.questions,
          assessmentTitle: 'QTI Assessment',
        }),
      });

      const result = await response.json();
      setQtiResult(result);

    } catch (error) {
      console.error('Error converting to QTI:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQTI = () => {
    if (!qtiResult || !qtiResult.success) return;

    // Create download for manifest
    const manifestBlob = new Blob([qtiResult.package.manifest], { type: 'application/xml' });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    const manifestLink = document.createElement('a');
    manifestLink.href = manifestUrl;
    manifestLink.download = 'imsmanifest.xml';
    manifestLink.click();
    URL.revokeObjectURL(manifestUrl);

    // Create download for assessment
    const assessmentBlob = new Blob([qtiResult.package.assessment], { type: 'application/xml' });
    const assessmentUrl = URL.createObjectURL(assessmentBlob);
    const assessmentLink = document.createElement('a');
    assessmentLink.href = assessmentUrl;
    assessmentLink.download = 'assessment.xml';
    assessmentLink.click();
    URL.revokeObjectURL(assessmentUrl);

    // Create downloads for individual items
    qtiResult.package.items.forEach((item: any, index: number) => {
      const itemBlob = new Blob([item.item], { type: 'application/xml' });
      const itemUrl = URL.createObjectURL(itemBlob);
      const itemLink = document.createElement('a');
      itemLink.href = itemUrl;
      itemLink.download = item.filename;
      itemLink.click();
      URL.revokeObjectURL(itemUrl);
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QTI Transformer</h1>
        <p className="text-gray-600">Convert educational documents to QTI 2.1 format</p>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports .docx and .txt files (max 20MB total)
              </p>
            </div>
          )}
        </div>

        {/* Question Type Selector */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as any)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="auto">Auto-detect</option>
            <option value="MCQ">Multiple Choice Questions (MCQ)</option>
            <option value="EMQ">Extended Matching Questions (EMQ)</option>
            <option value="SAQ">Short Answer Questions (SAQ)</option>
            <option value="MIXED">Mixed Questions (MCQ + EMQ + SAQ)</option>
          </select>
        </div>

        {/* Format Examples */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <button 
            onClick={() => setShowFormatGuide(!showFormatGuide)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-sm font-medium text-gray-700">Text File Format Requirements</h3>
            <span className="text-gray-500">{showFormatGuide ? '−' : '+'}</span>
          </button>
          {showFormatGuide && (
          <div className="text-xs text-gray-600 space-y-2 mt-3">
            <div>
              <span className="font-medium">MCQ Format:</span>
              <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
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
              <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
{`Item ID: 30036    R type (Extended Matching)

Options ID: 1840
A. Option A
B. Option B
C. Option C

Sub-Question 1: Question text here?
Answer: A

Sub-Question 2: Another question?
Answer: B`}
              </pre>
            </div>
            <div>
              <span className="font-medium">SAQ Format:</span>
              <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
{`Item ID: 19500    Short Answer

Question text here?

Answer: Expected answer here`}
              </pre>
            </div>
            <div>
              <span className="font-medium">Mixed Format (MCQ + EMQ + SAQ):</span>
              <pre className="mt-1 bg-white p-2 rounded border text-xs overflow-x-auto">
{`Item ID: 12345    A type: 3-5 options
What is 2+2?
A. 3
B. 4
Answer: B

Item ID: 30036    R type (Extended Matching)
Options ID: 1840
A. Option A
B. Option B
Question text here?
Answer: A

Item ID: 19500    Short Answer
Question text here?
Answer: Expected answer here`}
              </pre>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Tip: .docx files are automatically parsed and don&apos;t need this specific format
            </p>
            <p className="text-xs text-green-600 mt-1">
              🎯 Mixed documents: Usually exam papers contain MCQ + EMQ, while SAQ is typically a separate exam paper
            </p>
          </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parse Button */}
        {files.length > 0 && (
          <div className="mt-6">
            <button
              onClick={parseFiles}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Parse ${files.length} File(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Parse Results */}
      {parseResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            {parseResult.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold">Parse Results</h2>
          </div>

          <div className="mb-4">
            <p className={`text-sm ${parseResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {parseResult.message}
            </p>
            {parseResult.success && (
              <p className="text-sm text-gray-600 mt-1">
                Total questions found: {parseResult.totalQuestions}
              </p>
            )}
          </div>

          {/* File Results */}
          <div className="space-y-3">
            {parseResult.files.map((file, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{file.filename}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    file.error 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {file.error ? 'Error' : `${file.questionCount} questions`}
                  </span>
                </div>
                {file.error && (
                  <p className="text-sm text-red-600 mt-2">{file.error}</p>
                )}
              </div>
            ))}
          </div>

          {/* Convert to QTI Button */}
          {parseResult.success && parseResult.totalQuestions > 0 && (
            <div className="mt-6">
              <button
                onClick={convertToQTI}
                disabled={isProcessing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Converting...' : 'Convert to QTI Format'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* QTI Results */}
      {qtiResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            {qtiResult.success ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
            ) : (
              <XCircleIcon className="h-6 w-6 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-semibold">QTI Conversion Results</h2>
          </div>

          <div className="mb-4">
            <p className={`text-sm ${qtiResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {qtiResult.message}
            </p>
          </div>

          {qtiResult.success && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Package Contents</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Manifest file (imsmanifest.xml)</li>
                  <li>• Assessment test (assessment.xml)</li>
                  <li>• {qtiResult.package.items.length} question item(s)</li>
                </ul>
              </div>

              <button
                onClick={downloadQTI}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
              >
                Download QTI Package Files
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

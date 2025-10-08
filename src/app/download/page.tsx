'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, CheckCircle, Package, FileArchive, ChevronDown, ChevronRight } from 'lucide-react';
import JSZip from 'jszip';
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

export default function DownloadPage() {
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showIndividualFiles, setShowIndividualFiles] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load convert results from sessionStorage
    const storedConvertResult = sessionStorage.getItem('convertResult');
    
    if (!storedConvertResult) {
      router.push('/convert');
      return;
    }
    
    setConvertResult(JSON.parse(storedConvertResult));
  }, [router]);

  const handleDownloadZip = async () => {
    if (!convertResult?.package) return;

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      
      // Add manifest file
      zip.file('imsmanifest.xml', convertResult.package.manifest);
      
      // Add assessment file
      zip.file('assessment.xml', convertResult.package.assessment);
      
      // Add individual item files
      convertResult.package.items.forEach((item) => {
        zip.file(item.filename, item.item);
      });

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Create download link with original filename
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      const filename = (convertResult as any).filename || 'questions';
      link.download = `${filename}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error creating ZIP file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadIndividual = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/upload');
  };

  const handleBack = () => {
    router.push('/convert');
  };

  if (!convertResult) {
    return <div className="text-center py-12 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Download Your QTI Package</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your assessment is ready to import into Inspera
        </p>
      </div>

      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-green-900 dark:text-green-100 mb-1">✨ Success!</h3>
            <p className="text-sm sm:text-base text-green-700 dark:text-green-200 mb-2">
              Your QTI 2.1 package has been generated and is ready to download.
            </p>
            <p className="text-green-600 dark:text-green-300 text-xs sm:text-sm">
              💡 <strong>Next step:</strong> Import this package directly into{' '}
              <a href="https://hku.inspera.com/admin" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-green-700 dark:hover:text-green-200">
                Inspera Assessment
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Download Options */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-medium text-card-foreground mb-4 sm:mb-6">Download Options</h3>

        {/* ZIP Package Download */}
        <div className="border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 bg-blue-50 dark:bg-blue-950/20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg flex-shrink-0">
              <FileArchive className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 w-full">
              <h4 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Complete QTI Package (Recommended)</h4>
              <p className="text-sm sm:text-base text-blue-700 dark:text-blue-200 mb-4">
                Download all files in a single ZIP package - ready to upload to your LMS
              </p>
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="text-sm sm:text-base">Creating ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Download ZIP Package</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Individual Files */}
        <div className="border border-border rounded-lg p-4 sm:p-6">
          <button
            onClick={() => setShowIndividualFiles(!showIndividualFiles)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">Individual Files</h4>
              <p className="text-sm sm:text-base text-muted-foreground">
                Download files individually if needed for debugging or manual processing
              </p>
            </div>
            <div className="flex-shrink-0 ml-4">
              {showIndividualFiles ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>
          
          {showIndividualFiles && (
            <div className="space-y-2 sm:space-y-3 mt-4">
            {/* Manifest File */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-secondary-foreground text-sm sm:text-base truncate">imsmanifest.xml</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Package manifest and metadata</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadIndividual('imsmanifest.xml', convertResult.package?.manifest || '')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
              >
                Download
              </button>
            </div>

            {/* Assessment File */}
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <FileArchive className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-secondary-foreground text-sm sm:text-base truncate">assessment.xml</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Assessment configuration</p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadIndividual('assessment.xml', convertResult.package?.assessment || '')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
              >
                Download
              </button>
            </div>

            {/* Item Files */}
            {convertResult.package?.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <FileArchive className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-secondary-foreground text-sm sm:text-base truncate">{item.filename}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Question item {index + 1}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadIndividual(item.filename, item.item)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs sm:text-sm font-medium ml-2 flex-shrink-0"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Package Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-4 sm:mb-6">
        <button
          onClick={() => setShowPackageInfo(!showPackageInfo)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-base sm:text-lg font-medium text-card-foreground">Package Information</h3>
          <div className="flex-shrink-0 ml-4">
            {showPackageInfo ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>
        
        {showPackageInfo && (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <div>
            <dt className="text-xs sm:text-sm font-medium text-muted-foreground">QTI Version</dt>
            <dd className="text-sm sm:text-base text-card-foreground">2.1</dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Total Files</dt>
            <dd className="text-sm sm:text-base text-card-foreground">
              {2 + (convertResult.package?.items.length || 0)} files
            </dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Package Format</dt>
            <dd className="text-sm sm:text-base text-card-foreground">IMS Common Cartridge</dd>
          </div>
          <div>
            <dt className="text-xs sm:text-sm font-medium text-muted-foreground">Compatibility</dt>          <dd className="text-sm sm:text-base text-card-foreground">Inspera, Moodle, Canvas, Blackboard</dd>
        </div>
      </dl>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium text-foreground bg-background border border-border hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          Back to Convert
        </button>

        <button
          onClick={handleStartOver}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Start New Conversion
        </button>
      </div>
      </div>
      <Footer />
    </div>
  );
}

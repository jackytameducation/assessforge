'use client';

import { usePathname } from 'next/navigation';
import { CheckCircle, Circle } from 'lucide-react';

const steps = [
  { name: 'Upload', path: '/upload', description: 'Upload documents' },
  { name: 'Preview', path: '/preview', description: 'Review questions' },
  { name: 'Convert', path: '/convert', description: 'Generate QTI' },
  { name: 'Download', path: '/download', description: 'Get package' },
];

export default function ProgressIndicator() {
  const pathname = usePathname();
  
  const getCurrentStepIndex = () => {
    const currentStep = steps.findIndex(step => step.path === pathname);
    return currentStep === -1 ? -1 : currentStep;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Don't show progress indicator on home page
  if (pathname === '/') return null;

  return (
    <div className="bg-background border-b border-border px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto">
        <nav aria-label="Progress">
          {/* Mobile view - horizontal scrollable */}
          <div className="sm:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {steps.map((step, index) => {
                const isComplete = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.name} className="flex items-center space-x-2 flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                    ) : isCurrent ? (
                      <div className="h-6 w-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{index + 1}</span>
                      </div>
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                    )}
                    <div className={`text-xs font-medium whitespace-nowrap ${
                      isComplete ? 'text-green-700 dark:text-green-400' : 
                      isCurrent ? 'text-blue-700 dark:text-blue-400' : 
                      'text-muted-foreground'
                    }`}>
                      {step.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop view */}
          <ol className="hidden sm:flex items-center justify-between">
            {steps.map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <li key={step.name} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {isComplete ? (
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 dark:text-green-400" />
                      ) : isCurrent ? (
                        <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs sm:text-sm font-medium">{index + 1}</span>
                        </div>
                      ) : (
                        <Circle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 dark:text-gray-600" />
                      )}
                      <div className="ml-2 sm:ml-3">
                        <div className={`text-xs sm:text-sm font-medium ${
                          isComplete ? 'text-green-700 dark:text-green-400' : 
                          isCurrent ? 'text-blue-700 dark:text-blue-400' : 
                          'text-muted-foreground'
                        }`}>
                          {step.name}
                        </div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{step.description}</div>
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div className={`h-0.5 ${
                        isComplete ? 'bg-green-500 dark:bg-green-400' : 'bg-border'
                      }`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WorkflowState {
  files: File[];
  questionType: string;
  parseResult: any;
  convertResult: any;
}

interface WorkflowContextType {
  state: WorkflowState;
  setFiles: (files: File[]) => void;
  setQuestionType: (type: string) => void;
  setParseResult: (result: any) => void;
  setConvertResult: (result: any) => void;
  clearWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkflowState>({
    files: [],
    questionType: 'auto',
    parseResult: null,
    convertResult: null,
  });

  const setFiles = (files: File[]) => {
    setState(prev => ({ ...prev, files }));
  };

  const setQuestionType = (questionType: string) => {
    setState(prev => ({ ...prev, questionType }));
  };

  const setParseResult = (parseResult: any) => {
    setState(prev => ({ ...prev, parseResult }));
  };

  const setConvertResult = (convertResult: any) => {
    setState(prev => ({ ...prev, convertResult }));
  };

  const clearWorkflow = () => {
    setState({
      files: [],
      questionType: 'auto',
      parseResult: null,
      convertResult: null,
    });
  };

  return (
    <WorkflowContext.Provider
      value={{
        state,
        setFiles,
        setQuestionType,
        setParseResult,
        setConvertResult,
        clearWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

import { NextRequest, NextResponse } from 'next/server';
import { QTIGenerator } from '@/lib/services/qti-generator';
import { Question, QTIGenerationOptions } from '@/lib/types';

// Configure route for larger payloads
export const runtime = 'nodejs';
export const maxDuration = 60; // Maximum execution time in seconds
export const dynamic = 'force-dynamic';

// Configure body size limit (20MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
    responseLimit: '20mb',
  },
};

interface ConvertRequest {
  questions: Question[];
  assessmentTitle?: string;
  options?: QTIGenerationOptions;
  originalFilename?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConvertRequest = await request.json();
    const { questions, assessmentTitle, options, originalFilename } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid questions data'
      }, { status: 400 });
    }

    if (questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No questions provided for conversion'
      }, { status: 400 });
    }

    // Generate QTI package
    const qtiPackage = await QTIGenerator.generateQTIPackage(
      questions, 
      assessmentTitle || originalFilename || 'Assessment',
      options || {}
    );

    return NextResponse.json({
      success: true,
      message: `Successfully converted ${questions.length} question(s) to QTI format`,
      package: qtiPackage,
      questions: questions,
      filename: originalFilename || 'questions'
    });

  } catch (error) {
    console.error('Convert API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to convert questions to QTI format',
      error: (error as Error).message
    }, { status: 500 });
  }
}

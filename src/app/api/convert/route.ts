import { NextRequest, NextResponse } from 'next/server';
import { QTIGenerator } from '@/lib/services/qti-generator';
import { Question, QTIGenerationOptions } from '@/lib/types';

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

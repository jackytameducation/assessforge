import { NextRequest, NextResponse } from 'next/server';
import { DocxParser } from '@/lib/services/docx-parser';
import { QuestionParser } from '@/lib/services/question-parser';
import { QuestionType, ParseMode } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('document') as File[];
    const questionType = formData.get('questionType') as (QuestionType | 'auto' | 'MIXED') || 'auto';

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No files uploaded'
      }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        // Validate file type
        if (!file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
          results.push({
            filename: file.name,
            questionType: questionType,
            error: 'Only .docx and .txt files are allowed',
            questions: [],
            questionCount: 0
          });
          continue;
        }

        // Extract text content with validation
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        let textContent: string;
        
        // Validate file size
        if (buffer.length === 0) {
          throw new Error('File is empty');
        }
        
        if (file.name.endsWith('.txt')) {
          textContent = buffer.toString('utf-8');
          if (!textContent.trim()) {
            throw new Error('Text file contains no content');
          }
        } else if (file.name.endsWith('.docx')) {
          try {
            textContent = await DocxParser.extractText(buffer);
          } catch (docxError) {
            
            // If DOCX extraction fails, provide specific guidance
            const errorMessage = (docxError as Error).message;
            if (errorMessage.includes('corrupted') || errorMessage.includes('End of data reached')) {
              throw new Error(`DOCX file appears to be corrupted. Please try: 1) Re-saving the document in Word, 2) Converting to a different format and back, or 3) Using a .txt file instead.`);
            }
            throw docxError;
          }
        } else {
          throw new Error('Unsupported file format. Only .docx and .txt files are supported.');
        }

        // Validate extracted content
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('No text content could be extracted from the file');
        }

        // Parse questions
        const questions = await QuestionParser.parseQuestions(textContent, questionType, file.name);

        results.push({
          filename: file.name,
          questionType: questionType,
          questions: questions,
          questionCount: questions.length
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        
        // Provide specific guidance based on error type
        let errorMessage = `Failed to process: ${(fileError as Error).message}`;
        
        if (file.name.endsWith('.txt')) {
          errorMessage += '. For text files, ensure they start with "Item ID:" followed by question type (e.g., "Item ID: 12345 A type: 3-5 options").';
        } else if ((fileError as Error).message.includes('No text content')) {
          errorMessage += '. The file appears to be empty or corrupted.';
        }
        
        results.push({
          filename: file.name,
          questionType: questionType,
          error: errorMessage,
          questions: [],
          questionCount: 0
        });
      }
    }

    // Combine all questions
    const allQuestions = results.reduce((acc, result) => {
      return acc.concat(result.questions || []);
    }, [] as any[]);

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} file(s)`,
      totalQuestions: allQuestions.length,
      files: results,
      questions: allQuestions
    });

  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to parse documents',
      error: (error as Error).message
    }, { status: 500 });
  }
}

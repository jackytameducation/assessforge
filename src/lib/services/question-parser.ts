import { v4 as uuidv4 } from 'uuid';
import { 
    Question, 
    MCQQuestion, 
    EMQQuestion, 
    SAQQuestion, 
    QuestionType,
    ParseMode,
    DocumentSection,
    MixedDocument,
    QuestionMetadata,
    ProfileMetadata,
    UsageStatistics,
    MCQOption,
    EMQOption,
    ParseError,
    ValidationError
} from '../types/index';

export class QuestionParser {
    /**
     * Parse questions from text content supporting multiple question types
     */
    static async parseQuestions(
        textContent: string, 
        questionType: QuestionType | 'auto' | 'MIXED' = 'auto', 
        filename: string = '',
        htmlContent: string = ''
    ): Promise<Question[]> {
        if (!textContent || textContent.trim().length === 0) {
            throw new ParseError('No text content provided');
        }

        const cleanedText = this.cleanText(textContent);
        
        // Auto-detect question type or parsing mode
        let parseMode: QuestionType | 'MIXED';
        if (questionType === 'auto') {
            parseMode = this.detectParseMode(cleanedText, filename);
        } else if (questionType === 'MIXED') {
            parseMode = 'MIXED';
        } else {
            parseMode = questionType;
        }

        let questions: Question[] = [];

        if (parseMode === 'MIXED') {
            questions = this.parseMixedDocument(cleanedText);
        } else {
            switch (parseMode.toLowerCase()) {
                case 'mcq':
                    questions = this.parseMCQ(cleanedText);
                    break;
                case 'emq':
                    questions = this.parseEMQ(cleanedText);
                    break;
                case 'saq':
                    questions = this.parseSAQ(cleanedText);
                    break;
                default:
                    throw new ParseError(`Unsupported question type: ${parseMode}`);
            }
        }

        // Add HTML content to questions if available
        if (htmlContent && htmlContent.trim()) {
            questions.forEach(question => {
                question.htmlContent = htmlContent;
            });
        }

        // Validate parsed questions
        const validatedQuestions = this.validateQuestions(questions);
        
        return validatedQuestions;
    }

    /**
     * Clean and normalize text content
     */
    static cleanText(text: string): string {
        if (!text) return '';

        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]{2,}/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();
    }

    /**
     * Auto-detect question type from content
     */
    static detectQuestionType(text: string, filename: string): QuestionType {
        const lowerText = text.toLowerCase();
        const lowerFilename = filename.toLowerCase();

        // Check filename hints first
        if (lowerFilename.includes('mcq')) return 'MCQ';
        if (lowerFilename.includes('emq')) return 'EMQ';  
        if (lowerFilename.includes('saq')) return 'SAQ';

        // Count indicators in text
        const mcqCount = (text.match(/A type:|A\.|B\.|C\.|D\./g) || []).length;
        const emqCount = (text.match(/R type|Extended Matching|Options ID:|With reference to/g) || []).length;
        const saqCount = (text.match(/Short Answer|\(a\)|\(b\)|\(c\)|marks?\)/g) || []).length;

        // Return the type with highest count
        if (emqCount > mcqCount && emqCount > saqCount) return 'EMQ';
        if (saqCount > mcqCount && saqCount > emqCount) return 'SAQ';
        return 'MCQ'; // Default to MCQ
    }

    /**
     * Detect whether document contains mixed question types or single type
     */
    static detectParseMode(text: string, filename: string): QuestionType | 'MIXED' {
        const lowerText = text.toLowerCase();
        const lowerFilename = filename.toLowerCase();

        // Check if filename indicates mixed content
        if (lowerFilename.includes('mixed') || lowerFilename.includes('exam') || lowerFilename.includes('paper')) {
            return 'MIXED';
        }

        // Count different question type indicators
        const mcqCount = (text.match(/A type:|(?:^|\n)\s*A\.\s+|(?:^|\n)\s*B\.\s+|(?:^|\n)\s*C\.\s+|(?:^|\n)\s*D\.\s+/gm) || []).length;
        const emqCount = (text.match(/R type|Extended Matching|Options ID:|With reference to|Choose the MOST appropriate|options below/gi) || []).length;
        const saqCount = (text.match(/Short Answer|\(a\)|\(b\)|\(c\)|\d+\s*marks?/gi) || []).length;

        // Count different question type sections
        const itemIdCount = (text.match(/Item ID:/g) || []).length;
        const sectionCount = [
            mcqCount > 0 ? 1 : 0,
            emqCount > 0 ? 1 : 0,
            saqCount > 0 ? 1 : 0
        ].reduce((a, b) => a + b, 0);

        // If multiple types detected with significant counts, treat as mixed
        if (sectionCount >= 2) {
            const total = mcqCount + emqCount + saqCount;
            if (mcqCount > total * 0.2 && emqCount > total * 0.2) return 'MIXED';
            if (mcqCount > total * 0.2 && saqCount > total * 0.2) return 'MIXED';
            if (emqCount > total * 0.2 && saqCount > total * 0.2) return 'MIXED';
        }

        // Fall back to single type detection
        return this.detectQuestionType(text, filename);
    }

    /**
     * Parse document containing mixed question types
     */
    static parseMixedDocument(text: string): Question[] {
        const allQuestions: Question[] = [];
        
        // Split by Item ID to get individual items
        const items = text.split(/(?=Item ID:)/g).filter(item => item.trim());
        
        if (items.length === 0) {
            throw new ParseError('No items found. Mixed documents must contain items starting with "Item ID:"');
        }

        // Track shared EMQ options across items
        let sharedOptions: EMQOption[] = [];
        let optionsId = '';

        for (const item of items) {
            try {
                const itemType = this.detectItemType(item);
                let parsedQuestions: Question[] = [];

                switch (itemType) {
                    case 'MCQ':
                        const mcqQuestion = this.parseSingleMCQ(item);
                        if (mcqQuestion) parsedQuestions.push(mcqQuestion);
                        break;
                    case 'EMQ':
                        // Check if this item has sub-questions (Sub-Question 1:, Sub-Question 2:, etc.)
                        const hasSubQuestions = /Sub-Question\s+\d+:/i.test(item);
                        
                        if (hasSubQuestions) {
                            // Use sub-question splitting for items with "Sub-Question X:" format
                            const emqQuestions = this.parseSingleEMQWithSubQuestions(item);
                            if (emqQuestions && Array.isArray(emqQuestions)) {
                                parsedQuestions.push(...emqQuestions);
                            }
                        } else {
                            // Use single EMQ parsing for individual Item IDs with shared options
                            const emqQuestion = this.parseSingleEMQ(item, sharedOptions, optionsId);
                            if (emqQuestion) {
                                // Update shared options if this item has new options
                                if (emqQuestion.optionsId && emqQuestion.optionsId !== optionsId) {
                                    sharedOptions = emqQuestion.options || [];
                                    optionsId = emqQuestion.optionsId;
                                } else if (emqQuestion.options && emqQuestion.options.length > 0) {
                                    sharedOptions = emqQuestion.options;
                                    optionsId = emqQuestion.optionsId || '';
                                }
                                parsedQuestions.push(emqQuestion);
                            }
                        }
                        break;
                    case 'SAQ':
                        const saqQuestions = this.parseSingleSAQWithSubQuestions(item);
                        if (saqQuestions && Array.isArray(saqQuestions)) {
                            parsedQuestions.push(...saqQuestions);
                        }
                        break;
                    default:
                        console.warn(`Unknown item type for item: ${item.substring(0, 100)}...`);
                }

                allQuestions.push(...parsedQuestions);
            } catch (error) {
                console.warn(`Failed to parse mixed document item: ${(error as Error).message}`);
            }
        }

        if (allQuestions.length === 0) {
            throw new ParseError('No valid questions found in mixed document. Please check the format and try again.');
        }

        return allQuestions;
    }

    /**
     * Detect the type of a single item
     */
    static detectItemType(itemText: string): QuestionType {
        const lowerText = itemText.toLowerCase();
        
        // Check for explicit type indicators
        if (lowerText.includes('a type:') || lowerText.includes('b type:') || lowerText.includes('c type:')) {
            return 'MCQ';
        }
        if (lowerText.includes('r type') || lowerText.includes('extended matching')) {
            return 'EMQ';
        }
        if (lowerText.includes('short answer') || lowerText.includes('saq')) {
            return 'SAQ';
        }

        // Count characteristic patterns
        const hasMultipleChoiceOptions = /(?:^|\n)\s*[A-J]\.\s+/m.test(itemText);
        const hasSubQuestions = /\([a-z]\)/g.test(itemText);
        const hasMarksIndicator = /\d+\s*marks?/i.test(itemText);
        const hasOptionsId = /options? id:/i.test(itemText);
        const hasReference = /with reference to|choose.*most appropriate/i.test(itemText);

        // Decision logic
        if (hasOptionsId || hasReference) return 'EMQ';
        if (hasSubQuestions && hasMarksIndicator) return 'SAQ';
        if (hasMultipleChoiceOptions) return 'MCQ';
        
        // Default fallback
        return 'MCQ';
    }

    /**
     * Parse MCQ questions
     */
    static parseMCQ(text: string): MCQQuestion[] {
        const questions: MCQQuestion[] = [];
        const items = text.split(/(?=Item ID:)/g).filter(item => item.trim());

        if (items.length === 0) {
            throw new ParseError('No items found. Text files must start with "Item ID:" followed by the question type.');
        }

        for (const item of items) {
            try {
                const mcqQuestion = this.parseSingleMCQ(item);
                if (mcqQuestion) {
                    questions.push(mcqQuestion);
                }
            } catch (error) {
                console.warn(`Failed to parse MCQ item: ${(error as Error).message}`);
            }
        }

        if (questions.length === 0) {
            throw new ParseError('No valid MCQ questions found. Please check the format and try again.');
        }

        return questions;
    }

    /**
     * Parse a single MCQ question
     */
    static parseSingleMCQ(text: string): MCQQuestion | null {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return null;

        // Extract Item ID and type
        const itemIdMatch = lines[0].match(/Item ID:\s*(\d+)\s+(.+)/);
        if (!itemIdMatch) return null;
        
        const itemId = itemIdMatch[1];
        const questionType = itemIdMatch[2];

        // Find question text and options
        let questionText = '';
        const options: MCQOption[] = [];
        let answer = '';
        let currentSection = 'question';
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('Answer:')) {
                answer = line.replace('Answer:', '').trim();
                currentSection = 'metadata';
                continue;
            }
            
            if (line.startsWith('Profile:') || line.startsWith('Last Use Statistics:')) {
                break;
            }
            
            if (currentSection === 'question') {
                const optionMatch = line.match(/^([A-J])\.\s+(.+)/);
                if (optionMatch) {
                    options.push({
                        letter: optionMatch[1],
                        text: optionMatch[2].trim() // Remove unnecessary spacing
                    });
                } else if (!line.startsWith('Source:')) {
                    questionText += (questionText ? ' ' : '') + line;
                }
            }
        }

        // Extract metadata
        const metadata = this.extractMetadata(text);

        return {
            itemId,
            type: 'MCQ',
            title: `Question ${itemId}`,
            text: questionText,
            questionType,
            options,
            correctAnswer: answer,
            answer,
            metadata
        };
    }

    /**
     * Parse EMQ questions
     */
    static parseEMQ(text: string): EMQQuestion[] {
        const questions: EMQQuestion[] = [];
        const items = text.split(/(?=Item ID:)/g).filter(item => item.trim());

        let sharedOptions: EMQOption[] = [];
        let optionsId = '';

        for (const item of items) {
            try {
                // Check if this item has sub-questions (Sub-Question 1:, Sub-Question 2:, etc.)
                const hasSubQuestions = /Sub-Question\s+\d+:/i.test(item);
                
                if (hasSubQuestions) {
                    // Use sub-question splitting for items with "Sub-Question X:" format
                    const emqQuestions = this.parseSingleEMQWithSubQuestions(item);
                    if (emqQuestions && emqQuestions.length > 0) {
                        questions.push(...emqQuestions);
                    }
                } else {
                    // Use single EMQ parsing for individual Item IDs
                    const result = this.parseSingleEMQ(item, sharedOptions, optionsId);
                    if (result) {
                        // If this item has a different Options ID, reset shared options
                        if (result.optionsId && result.optionsId !== optionsId) {
                            sharedOptions = result.options || [];
                            optionsId = result.optionsId;
                        } else if (result.options && result.options.length > 0) {
                            // Only update shared options if it's the same Options ID or no previous Options ID
                            sharedOptions = result.options;
                            optionsId = result.optionsId || '';
                        }
                        questions.push(result);
                    }
                }
            } catch (error) {
                console.warn(`Failed to parse EMQ item: ${(error as Error).message}`);
            }
        }

        return questions;
    }

    /**
     * Parse a single EMQ question
     */
    static parseSingleEMQ(text: string, sharedOptions: EMQOption[] = [], sharedOptionsId: string = ''): EMQQuestion | null {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return null;

        // Extract Item ID and type
        const itemIdMatch = lines[0].match(/Item ID:\s*(\d+)\s+(.+)/);
        if (!itemIdMatch) return null;
        
        const itemId = itemIdMatch[1];
        const questionType = itemIdMatch[2];

        let questionText = '';
        let options: EMQOption[] = [];
        let optionsId = '';
        let referenceId = '';
        let answer = '';
        let currentSection = 'question';
        let hasNewOptionsId = false;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for Options ID
            if (line.startsWith('Options ID:')) {
                optionsId = line.replace('Options ID:', '').trim();
                options = []; // Reset options for new Options ID
                hasNewOptionsId = true;
                currentSection = 'options';
                continue;
            }
            
            // Check for reference
            if (line.includes('With reference to the previous Options')) {
                const refMatch = line.match(/ID:\s*(\d+)/);
                if (refMatch) {
                    referenceId = refMatch[1];
                    // Use shared options only if they match the referenced Options ID
                    if (sharedOptionsId === refMatch[1]) {
                        options = [...sharedOptions];
                        optionsId = sharedOptionsId;
                    }
                }
                currentSection = 'question';
                continue;
            }
            
            if (line.startsWith('Answer:')) {
                answer = line.replace('Answer:', '').trim();
                currentSection = 'metadata';
                continue;
            }
            
            if (line.startsWith('Profile:') || line.startsWith('Last Use Statistics:')) {
                break;
            }
            
            if (currentSection === 'options') {
                const optionMatch = line.match(/^([A-J])\.\s+(.+)/);
                if (optionMatch) {
                    options.push({
                        letter: optionMatch[1],
                        text: optionMatch[2].trim() // Remove unnecessary spacing
                    });
                } else if (!line.match(/^[A-J]\./) && !line.startsWith('Options ID:') && !line.includes('With reference to') && !line.startsWith('Answer:') && !line.startsWith('Profile:')) {
                    questionText += (questionText ? ' ' : '') + line;
                }
            } else if (currentSection === 'question') {
                // Include all non-option lines as question text, even for referenced questions
                if (!line.match(/^[A-J]\./) && !line.startsWith('Options ID:') && !line.includes('With reference to') && !line.startsWith('Answer:') && !line.startsWith('Profile:') && !line.startsWith('Last Use Statistics:')) {
                    questionText += (questionText ? ' ' : '') + line;
                }
            }
        }

        // Extract metadata
        const metadata = this.extractMetadata(text);

        return {
            itemId,
            type: 'EMQ',
            title: `Question ${itemId}`,
            text: questionText,
            questionType,
            optionsId,
            options,
            referenceId,
            correctAnswer: answer,
            answer,
            metadata
        };
    }

    /**
     * Parse SAQ questions
     */
    static parseSAQ(text: string): SAQQuestion[] {
        const questions: SAQQuestion[] = [];
        const items = text.split(/(?=Item ID:)/g).filter(item => item.trim());

        for (const item of items) {
            try {
                const saqQuestions = this.parseSingleSAQWithSubQuestions(item);
                if (saqQuestions && saqQuestions.length > 0) {
                    questions.push(...saqQuestions);
                }
            } catch (error) {
                console.warn(`Failed to parse SAQ item: ${(error as Error).message}`);
            }
        }

        return questions;
    }

    /**
     * Parse a single SAQ question
     */
    static parseSingleSAQ(text: string): SAQQuestion | null {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return null;

        // Extract Item ID and type
        const itemIdMatch = lines[0].match(/Item ID:\s*(\d+)\s+(.+)/);
        if (!itemIdMatch) return null;
        
        const itemId = itemIdMatch[1];
        const questionType = itemIdMatch[2];

        let questionText = '';
        let answerKey = '';
        let currentSection = 'question';
        const subQuestions: Array<{part: string; question: string; marks: number}> = [];
        let totalMarks = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('Answer:')) {
                answerKey = line.replace('Answer:', '').trim();
                currentSection = 'answer';
                continue;
            }
            
            if (line.startsWith('Profile:') || line.startsWith('Last Use Statistics:')) {
                break;
            }
            
            if (currentSection === 'question') {
                // Check for sub-questions with marks
                const subQuestionMatch = line.match(/^\(([a-z])\)\s+(.+?)\s*\((\d+)\s+marks?\)/i);
                if (subQuestionMatch) {
                    const marks = parseInt(subQuestionMatch[3]);
                    subQuestions.push({
                        part: `(${subQuestionMatch[1]})`,
                        question: subQuestionMatch[2],
                        marks: marks
                    });
                    totalMarks += marks;
                } else {
                    questionText += (questionText ? ' ' : '') + line;
                }
            } else if (currentSection === 'answer') {
                answerKey += (answerKey ? ' ' : '') + line;
            }
        }

        // If no sub-questions found, try to extract marks from the main question text
        if (subQuestions.length === 0 && totalMarks === 0) {
            const marksMatch = questionText.match(/\((\d+)\s+marks?\)/i);
            if (marksMatch) {
                totalMarks = parseInt(marksMatch[1]);
            }
        }

        // Extract metadata
        const metadata = this.extractMetadata(text);

        return {
            itemId,
            type: 'SAQ',
            title: `Question ${itemId}`,
            text: questionText,
            subQuestions,
            answerKey,
            totalMarks,
            answer: answerKey,
            metadata
        };
    }

    /**
     * Parse SAQ questions and split sub-questions into separate questions
     */
    static parseSingleSAQWithSubQuestions(text: string): SAQQuestion[] {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return [];

        // Extract Item ID and type
        const itemIdMatch = lines[0].match(/Item ID:\s*(\d+)\s+(.+)/);
        if (!itemIdMatch) return [];
        
        const itemId = itemIdMatch[1];
        const questionType = itemIdMatch[2];

        let sharedContext = '';
        let currentSection = 'context';
        const subQuestions: Array<{part: string; question: string; marks: number}> = [];
        const subAnswers: {[key: string]: string} = {};
        let currentAnswerPart = '';
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.startsWith('Answer:')) {
                currentSection = 'answer';
                const answerContent = line.replace('Answer:', '').trim();
                if (answerContent) {
                    // Check if answer starts with a part identifier like "(a)"
                    const answerPartMatch = answerContent.match(/^\(([a-z])\)/i);
                    if (answerPartMatch) {
                        currentAnswerPart = answerPartMatch[1].toLowerCase();
                        subAnswers[currentAnswerPart] = answerContent;
                    } else {
                        // No part identifier, might be a single answer
                        subAnswers['general'] = answerContent;
                    }
                }
                continue;
            }
            
            if (line.startsWith('Profile:') || line.startsWith('Last Use Statistics:')) {
                break;
            }
            
            if (currentSection === 'context') {
                // Check for sub-questions with marks (including multiple marks patterns)
                const subQuestionMatch = line.match(/^\(([a-z])\)\s+(.+)/i);
                if (subQuestionMatch) {
                    const part = subQuestionMatch[1].toLowerCase();
                    const questionText = subQuestionMatch[2];
                    
                    // Extract all marks from the question text
                    const marksMatches = questionText.match(/\((\d+)\s+marks?\)/gi);
                    let totalMarks = 0;
                    if (marksMatches) {
                        totalMarks = marksMatches.reduce((sum, match) => {
                            const marksMatch = match.match(/(\d+)/);
                            if (marksMatch) {
                                const marks = parseInt(marksMatch[1]);
                                return sum + marks;
                            }
                            return sum;
                        }, 0);
                    }
                    
                    subQuestions.push({
                        part: part,
                        question: questionText,
                        marks: totalMarks
                    });
                } else {
                    // This is part of the shared context
                    sharedContext += (sharedContext ? '\n' : '') + line;
                }
            } else if (currentSection === 'answer') {
                // Parse answers for each sub-question
                const answerPartMatch = line.match(/^\(([a-z])\)/i);
                if (answerPartMatch) {
                    currentAnswerPart = answerPartMatch[1].toLowerCase();
                    subAnswers[currentAnswerPart] = line;
                } else if (currentAnswerPart) {
                    // Continue current answer part
                    subAnswers[currentAnswerPart] += '\n' + line;
                }
            }
        }

        // Extract metadata
        const metadata = this.extractMetadata(text);

        // If no sub-questions found, return the original single question
        if (subQuestions.length === 0) {
            const singleQuestion = this.parseSingleSAQ(text);
            return singleQuestion ? [singleQuestion] : [];
        }

        // Create separate SAQ questions for each sub-question
        const questions: SAQQuestion[] = [];
        
        for (const subQ of subQuestions) {
            const subQuestionId = `${itemId}_${subQ.part}`;
            const answerKey = subAnswers[subQ.part] || '';

            // Now only include the specific sub-question text, NOT the shared context
            const subQuestionText = `(${subQ.part}) ${subQ.question}`;

            questions.push({
                itemId: subQuestionId,
                type: 'SAQ',
                title: `Question ${itemId} (${subQ.part})`,
                text: subQuestionText, // Only the sub-question part
                subQuestions: [{
                    part: `(${subQ.part})`,
                    question: subQ.question,
                    marks: subQ.marks
                }],
                answerKey: answerKey,
                totalMarks: subQ.marks,
                answer: answerKey,
                // Add shared context information for QTI generation
                sharedContext: sharedContext.trim() || undefined,
                parentItemId: itemId,
                metadata: metadata ? {
                    ...metadata,
                    parentItemId: itemId,
                    subQuestionPart: subQ.part
                } : undefined
            });
        }

        return questions;
    }

    /**
     * Parse EMQ questions and split sub-questions into separate questions
     */
    static parseSingleEMQWithSubQuestions(text: string): EMQQuestion[] {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length === 0) return [];

        // Extract Item ID and type
        const itemIdMatch = lines[0].match(/Item ID:\s*(\d+)\s+(.+)/);
        if (!itemIdMatch) return [];
        
        const itemId = itemIdMatch[1];
        const questionType = itemIdMatch[2];

        let sharedContext = '';
        let options: EMQOption[] = [];
        let optionsId = '';
        let currentSection = 'context';
        const subQuestions: Array<{number: number; question: string; answer: string}> = [];
        let currentSubQuestionNumber = 0;
        let pendingSubQuestion: {number: number; question: string} | null = null;
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for Options ID
            if (line.startsWith('Options ID:')) {
                optionsId = line.replace('Options ID:', '').trim();
                currentSection = 'options';
                continue;
            }
            
            // Check for answer lines
            if (line.startsWith('Answer:')) {
                const answerContent = line.replace('Answer:', '').trim();
                if (pendingSubQuestion) {
                    // Complete the pending sub-question with this answer
                    subQuestions.push({
                        number: pendingSubQuestion.number,
                        question: pendingSubQuestion.question,
                        answer: answerContent
                    });
                    pendingSubQuestion = null;
                }
                continue;
            }
            
            if (line.startsWith('Profile:') || line.startsWith('Last Use Statistics:')) {
                break;
            }
            
            if (currentSection === 'context' || currentSection === 'options' || currentSection === 'subquestions') {
                // Check for EMQ sub-questions
                const subQuestionMatch = line.match(/^Sub-Question\s+(\d+):\s*(.+)/i);
                if (subQuestionMatch) {
                    const questionNumber = parseInt(subQuestionMatch[1]);
                    const questionText = subQuestionMatch[2];
                    
                    // If there was a previous pending sub-question, complete it without answer
                    if (pendingSubQuestion) {
                        subQuestions.push({
                            number: pendingSubQuestion.number,
                            question: pendingSubQuestion.question,
                            answer: ''
                        });
                    }
                    
                    // Set this as the new pending sub-question
                    pendingSubQuestion = {
                        number: questionNumber,
                        question: questionText
                    };
                    currentSection = 'subquestions';
                } else if (currentSection === 'options') {
                    // Parse option lines (A. Option text, B. Option text, etc.)
                    const optionMatch = line.match(/^([A-Z])\.\s*(.+)/);
                    if (optionMatch) {
                        options.push({
                            letter: optionMatch[1],
                            text: optionMatch[2]
                        });
                    }
                } else if (currentSection === 'context') {
                    // This is part of the shared context/instructions
                    sharedContext += (sharedContext ? '\n' : '') + line;
                }
            }
        }

        // Complete any remaining pending sub-question
        if (pendingSubQuestion) {
            subQuestions.push({
                number: pendingSubQuestion.number,
                question: pendingSubQuestion.question,
                answer: ''
            });
        }

        // Extract metadata
        const metadata = this.extractMetadata(text);

        // If no sub-questions found, return the original single question
        if (subQuestions.length === 0) {
            const singleQuestion = this.parseSingleEMQ(text);
            return singleQuestion ? [singleQuestion] : [];
        }

        // Create separate EMQ questions for each sub-question
        const questions: EMQQuestion[] = [];
        
        for (const subQ of subQuestions) {
            const subQuestionId = `${itemId}_${subQ.number}`;

            questions.push({
                itemId: subQuestionId,
                type: 'EMQ',
                title: `Question ${itemId} (Sub-Question ${subQ.number})`,
                text: subQ.question,
                questionType,
                optionsId,
                options,
                referenceId: '',
                correctAnswer: subQ.answer,
                answer: subQ.answer,
                // Add shared context information for QTI generation
                sharedContext: sharedContext.trim() || undefined,
                parentItemId: itemId,
                metadata: metadata ? {
                    ...metadata,
                    parentItemId: itemId,
                    subQuestionNumber: subQ.number
                } : undefined
            });
        }

        return questions;
    }

    /**
     * Extract metadata from question text
     */
    static extractMetadata(text: string): QuestionMetadata | undefined {
        const lines = text.split('\n');
        let profile: Partial<ProfileMetadata> = {};
        let lastUseStats: Partial<UsageStatistics> = {};
        let backgroundInfo = '';

        let currentSection = '';
        
        for (const line of lines) {
            if (line.startsWith('Profile:')) {
                currentSection = 'profile';
                const profileText = line.replace('Profile:', '').trim();
                profile = this.parseProfileData(profileText);
                continue;
            }
            
            if (line.startsWith('Last Use Statistics:')) {
                currentSection = 'stats';
                continue;
            }
            
            if (line.startsWith('Background Info:')) {
                currentSection = 'background';
                backgroundInfo = line.replace('Background Info:', '').trim();
                continue;
            }
            
            if (line.startsWith('End-of-Item')) {
                break;
            }
            
            if (currentSection === 'stats') {
                Object.assign(lastUseStats, this.parseStatisticsData(line));
            } else if (currentSection === 'background') {
                backgroundInfo += (backgroundInfo ? ' ' : '') + line;
            }
        }

        if (Object.keys(profile).length === 0) {
            return undefined;
        }

        return {
            profile: profile as ProfileMetadata,
            lastUseStatistics: Object.keys(lastUseStats).length > 0 ? lastUseStats as UsageStatistics : undefined,
            backgroundInfo
        };
    }

    /**
     * Parse profile metadata
     */
    static parseProfileData(profileText: string): Partial<ProfileMetadata> {
        const profile: Partial<ProfileMetadata> = {};
        
        const patterns: Array<[string, RegExp]> = [
            ['transition', /<transition>([^<]+)/],
            ['system', /<system>([^<]+)/],
            ['discipline', /<discipline>([^<]+)/],
            ['process', /<process>([^<]+)/],
            ['taxonomy', /<taxonomy>([^<]+)/],
            ['gender', /<gender>([^<]+)/],
            ['ageGroup', /<ageGroup>([^<]+)/],
            ['affiliation', /<affiliation>([^<]+)/],
            ['specialty', /<specialty>([^<]+)/],
            ['status', /<Status>([^<]+)/],
            ['originatingDept', /<Originating Dept\.>([^<]+)/],
            ['levelProgram', /<Level\/Program>([^<]+)/],
            ['mesh1', /<MeSH 1>([^<]+)/],
            ['mesh2', /<MeSH 2>([^<]+)/]
        ];

        for (const [key, pattern] of patterns) {
            const match = profileText.match(pattern);
            if (match) {
                (profile as Record<string, any>)[key] = match[1].trim();
            }
        }

        return profile;
    }

    /**
     * Parse statistics data
     */
    static parseStatisticsData(line: string): Partial<UsageStatistics> {
        const stats: Partial<UsageStatistics> = {};
        
        if (line.includes('Examination Year:')) {
            const match = line.match(/Examination Year:\s*([^\s]+)/);
            if (match) stats.examinationYear = match[1];
        }
        
        if (line.includes('Difficulty Level:')) {
            const match = line.match(/Difficulty Level:\s*(\d+)/);
            if (match) stats.difficultyLevel = parseInt(match[1]);
        }
        
        if (line.includes('Discrimination Index:')) {
            const match = line.match(/Discrimination Index:\s*(\d+)/);
            if (match) stats.discriminationIndex = parseInt(match[1]);
        }

        return stats;
    }

    /**
     * Validate parsed questions
     */
    static validateQuestions(questions: Question[]): Question[] {
        const validQuestions: Question[] = [];
        
        for (const question of questions) {
            try {
                this.validateSingleQuestion(question);
                validQuestions.push(question);
            } catch (error) {
                console.warn(`Question validation failed: ${(error as Error).message}`);
            }
        }
        
        return validQuestions;
    }

    /**
     * Validate a single question
     */
    static validateSingleQuestion(question: Question): void {
        if (!question.itemId) {
            throw new ValidationError('Question must have an itemId');
        }
        
        if (!question.text) {
            // Allow EMQ questions with empty text if they reference previous options
            if (question.type === 'EMQ' && (question as EMQQuestion).referenceId) {
                // EMQ sub-questions can have empty text when referencing previous options
            } else {
                throw new ValidationError('Question must have text content');
            }
        }
        
        if (question.type === 'MCQ') {
            const mcq = question as MCQQuestion;
            if (!mcq.options || mcq.options.length === 0) {
                throw new ValidationError('MCQ must have options');
            }
            if (!mcq.correctAnswer) {
                throw new ValidationError('MCQ must have a correct answer');
            }
        }
        
        if (question.type === 'EMQ') {
            const emq = question as EMQQuestion;
            if (!emq.options || emq.options.length === 0) {
                throw new ValidationError('EMQ must have options');
            }
            if (!emq.correctAnswer) {
                throw new ValidationError('EMQ must have a correct answer');
            }
        }
        
        if (question.type === 'SAQ') {
            const saq = question as SAQQuestion;
            if (!saq.answerKey) {
                throw new ValidationError('SAQ must have an answer key');
            }
        }
    }
}

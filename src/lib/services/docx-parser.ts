import mammoth from 'mammoth';

interface StructuredTextResult {
    rawText: string;
    htmlContent: string;
    textMessages: any[];
    htmlMessages: any[];
}

interface DocumentMetadata {
    wordCount: number;
    characterCount: number;
    lineCount: number;
    estimatedQuestions: number;
}

export class DocxParser {
    /**
     * Extract text content from a .docx file buffer
     */
    static async extractText(buffer: Buffer): Promise<string> {
        try {
            // First, validate the buffer
            if (!buffer || buffer.length === 0) {
                throw new Error('Empty or invalid buffer provided');
            }

            // Check if it's a valid ZIP file (DOCX files are ZIP archives)
            const zipSignature = buffer.slice(0, 4);
            const isValidZip = zipSignature[0] === 0x50 && zipSignature[1] === 0x4B;
            
            if (!isValidZip) {
                throw new Error('File does not appear to be a valid DOCX file (invalid ZIP signature)');
            }

            const result = await mammoth.extractRawText({ buffer: buffer });
            
            if (result.messages && result.messages.length > 0) {
                console.warn('Mammoth warnings:', result.messages);
                // Check for critical errors
                const criticalErrors = result.messages.filter(msg => msg.type === 'error');
                if (criticalErrors.length > 0) {
                    console.error('Critical mammoth errors:', criticalErrors);
                }
            }
            
            // Check if we got any text content
            if (!result.value || result.value.trim().length === 0) {
                throw new Error('No text content could be extracted from the document');
            }
            
            return result.value;
        } catch (error) {
            console.error('Error extracting text from docx:', error);
            
            // Provide more specific error messages
            if ((error as Error).message.includes('End of data reached')) {
                throw new Error('Document appears to be corrupted or truncated. Please try re-saving the document and uploading again.');
            } else if ((error as Error).message.includes('Corrupted zip')) {
                throw new Error('Document file is corrupted. Please check the file and try again.');
            } else if ((error as Error).message.includes('invalid ZIP signature')) {
                throw new Error('File is not a valid DOCX document. Please ensure you are uploading a .docx file.');
            }
            
            throw new Error(`Failed to extract text from document: ${(error as Error).message}`);
        }
    }

    /**
     * Extract HTML content from a .docx file buffer (preserves some formatting)
     */
    static async extractHTML(buffer: Buffer): Promise<string> {
        try {
            const options = {
                buffer: buffer,
                convertImage: mammoth.images.imgElement((image: any) => {
                    return image.read("base64").then((imageBuffer: any) => {
                        return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                        };
                    });
                }),
                styleMap: [
                    "p[style-name='Heading 1'] => h1:fresh",
                    "p[style-name='Heading 2'] => h2:fresh",
                    "p[style-name='Heading 3'] => h3:fresh",
                    "r[style-name='Strong'] => strong",
                    "r[style-name='Emphasis'] => em"
                ]
            };
            
            const result = await mammoth.convertToHtml(options);
            
            if (result.messages && result.messages.length > 0) {
                console.warn('Mammoth warnings:', result.messages);
                // Check for critical errors
                const criticalErrors = result.messages.filter(msg => msg.type === 'error');
                if (criticalErrors.length > 0) {
                    console.error('Critical mammoth errors:', criticalErrors);
                }
            }
            
            return result.value;
        } catch (error) {
            console.error('Error extracting HTML from docx:', error);
            
            // Provide more specific error messages for HTML extraction
            if ((error as Error).message.includes('End of data reached')) {
                throw new Error('Document appears to be corrupted or truncated. Please try re-saving the document and uploading again.');
            } else if ((error as Error).message.includes('Corrupted zip')) {
                throw new Error('Document file is corrupted. Please check the file and try again.');
            }
            
            throw new Error(`Failed to extract HTML from document: ${(error as Error).message}`);
        }
    }

    /**
     * Extract text with enhanced formatting preservation
     */
    static async extractStructuredText(buffer: Buffer): Promise<StructuredTextResult> {
        try {
            // Extract both raw text and HTML for better parsing
            const [textResult, htmlResult] = await Promise.all([
                mammoth.extractRawText({ buffer: buffer }),
                mammoth.convertToHtml({ buffer: buffer })
            ]);

            return {
                rawText: textResult.value,
                htmlContent: htmlResult.value,
                textMessages: textResult.messages || [],
                htmlMessages: htmlResult.messages || []
            };
        } catch (error) {
            console.error('Error extracting structured text from docx:', error);
            throw new Error(`Failed to extract structured text from document: ${(error as Error).message}`);
        }
    }

    /**
     * Clean and normalize extracted text
     */
    static cleanText(text: string): string {
        if (!text) return '';

        return text
            // Remove excessive whitespace
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]{2,}/g, ' ')
            // Remove invisible characters
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            // Trim each line
            .split('\n')
            .map(line => line.trim())
            .join('\n')
            .trim();
    }

    /**
     * Split text into sections based on common patterns
     */
    static splitIntoSections(text: string): string[] {
        const cleanedText = this.cleanText(text);
        
        // Split by common section indicators
        const sections: string[] = [];
        const lines = cleanedText.split('\n');
        let currentSection: string[] = [];

        for (const line of lines) {
            // Check if this line indicates a new section
            if (this.isSectionBreak(line)) {
                if (currentSection.length > 0) {
                    sections.push(currentSection.join('\n').trim());
                    currentSection = [];
                }
            }
            
            if (line.trim()) {
                currentSection.push(line);
            }
        }

        // Add the last section
        if (currentSection.length > 0) {
            sections.push(currentSection.join('\n').trim());
        }

        return sections.filter(section => section.length > 0);
    }

    /**
     * Check if a line indicates a section break
     */
    static isSectionBreak(line: string): boolean {
        const trimmedLine = line.trim();
        
        // Common patterns that indicate new sections
        const sectionPatterns = [
            /^Item ID:/i,
            /^Question \d+/i,
            /^Q\d+/i,
            /^\d+\./,
            /^[A-Z]\)\s+/,
            /^sub-Question \d+/i,
            /^Big Question/i,
            /^EMQ \d+/i,
            /^MCQ \d+/i,
            /^SAQ \d+/i,
            /^End-of-Item/i
        ];

        return sectionPatterns.some(pattern => pattern.test(trimmedLine));
    }

    /**
     * Extract metadata from document
     */
    static async extractMetadata(buffer: Buffer): Promise<DocumentMetadata> {
        try {
            const textContent = await this.extractText(buffer);
            
            return {
                wordCount: textContent.split(/\s+/).length,
                characterCount: textContent.length,
                lineCount: textContent.split('\n').length,
                estimatedQuestions: this.estimateQuestionCount(textContent)
            };
        } catch (error) {
            console.error('Error extracting metadata:', error);
            return {
                wordCount: 0,
                characterCount: 0,
                lineCount: 0,
                estimatedQuestions: 0
            };
        }
    }

    /**
     * Estimate the number of questions in the text
     */
    static estimateQuestionCount(text: string): number {
        if (!text) return 0;

        // Count various question indicators
        const questionPatterns = [
            /^Item ID:/gim,
            /^Question \d+/gim,
            /^Q\d+/gim,
            /^\d+\./gm,
            /^sub-Question \d+/gim
        ];

        let totalMatches = 0;
        questionPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                totalMatches += matches.length;
            }
        });

        return totalMatches;
    }
}

/**
 * File validation utilities for document uploads
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  suggestions?: string[];
}

export class FileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_EXTENSIONS = ['.docx', '.txt'];
  private static readonly DOCX_MIME_TYPES = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream' // Sometimes .docx files are detected as this
  ];

  /**
   * Validate a file before upload
   */
  static async validateFile(file: File): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      warnings: [],
      suggestions: []
    };

    // Check file size
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'File is empty',
        suggestions: ['Please select a file with content']
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (20MB)`,
        suggestions: [
          'Try compressing the file',
          'Remove unnecessary images or content',
          'Split into multiple smaller files'
        ]
      };
    }

    // Check file extension
    const extension = this.getFileExtension(file.name);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      return {
        isValid: false,
        error: `File type "${extension}" is not supported`,
        suggestions: [
          'Convert to .docx format using Microsoft Word',
          'Save as .txt file for simple text format',
          'Supported formats: .docx, .txt'
        ]
      };
    }

    // Additional validation for DOCX files
    if (extension === '.docx') {
      const docxValidation = await this.validateDocxFile(file);
      if (!docxValidation.isValid) {
        return docxValidation;
      }
      
      if (docxValidation.warnings) {
        result.warnings!.push(...docxValidation.warnings);
      }
    }

    // Additional validation for TXT files
    if (extension === '.txt') {
      const txtValidation = await this.validateTxtFile(file);
      if (!txtValidation.isValid) {
        return txtValidation;
      }
      
      if (txtValidation.warnings) {
        result.warnings!.push(...txtValidation.warnings);
      }
    }

    return result;
  }

  /**
   * Validate DOCX file structure
   */
  private static async validateDocxFile(file: File): Promise<FileValidationResult> {
    try {
      // Read the first few bytes to check ZIP signature
      const buffer = await file.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Check for ZIP signature (DOCX files are ZIP archives)
      const isValidZip = bytes[0] === 0x50 && bytes[1] === 0x4B;
      
      if (!isValidZip) {
        return {
          isValid: false,
          error: 'File does not appear to be a valid DOCX document',
          suggestions: [
            'Ensure the file was saved in DOCX format',
            'Try re-saving the document in Microsoft Word',
            'Check if the file is corrupted'
          ]
        };
      }

      // Check MIME type
      if (!this.DOCX_MIME_TYPES.includes(file.type) && file.type !== '') {
        return {
          isValid: true,
          warnings: ['File MIME type may not be correctly detected'],
          suggestions: ['This usually doesn\'t affect processing']
        };
      }

      return { isValid: true };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to validate DOCX file structure',
        suggestions: [
          'File may be corrupted',
          'Try re-saving the document',
          'Convert to .txt format as alternative'
        ]
      };
    }
  }

  /**
   * Validate TXT file content
   */
  private static async validateTxtFile(file: File): Promise<FileValidationResult> {
    try {
      const text = await file.text();
      
      if (!text.trim()) {
        return {
          isValid: false,
          error: 'Text file is empty or contains only whitespace',
          suggestions: ['Add some content to the file']
        };
      }

      // Check if it looks like it has the required format
      const hasItemId = text.includes('Item ID:');
      if (!hasItemId) {
        return {
          isValid: true,
          warnings: ['Text file may not follow the expected format'],
          suggestions: [
            'Text files should start with "Item ID:" for best results',
            'Check the format guide for examples'
          ]
        };
      }

      return { isValid: true };
      
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to read text file content',
        suggestions: [
          'File may be corrupted',
          'Try opening and re-saving the file'
        ]
      };
    }
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot === -1 ? '' : filename.substring(lastDot).toLowerCase();
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

import { v4 as uuidv4 } from 'uuid';
import { Question, MCQQuestion, EMQQuestion, SAQQuestion, QTIGenerationOptions } from '../types/index';

interface QTIPackage {
    manifest: string;
    assessment: string;
    items: QTIItem[];
}

interface QTIItem {
    item: string;
    filename: string;
    identifier: string;
}

interface StimulusGroup {
    stimulusItem: QTIItem | null;
    questions: QTIItem[];
}

export class QTIGenerator {
    /**
     * Generate complete QTI package
     */
    static async generateQTIPackage(
        questions: Question[], 
        assessmentTitle: string = 'Assessment', 
        options: Partial<QTIGenerationOptions> = {}
    ): Promise<QTIPackage> {
        const qtiPackage: QTIPackage = {
            manifest: '',
            assessment: '',
            items: []
        };

        // Keep track of shared contexts and EMQ options we've already generated
        const generatedContexts = new Set<string>();
        const generatedEMQStimuli = new Set<string>();

        // Generate individual item files first to get consistent identifiers
        for (const question of questions) {
            if (question.type === 'EMQ') {
                const emqQuestion = question as EMQQuestion;
                
                // Generate EMQ stimulus if options exist and haven't been generated yet
                if (emqQuestion.optionsId && emqQuestion.options && emqQuestion.options.length > 0 && !generatedEMQStimuli.has(emqQuestion.optionsId)) {
                    const emqStimulus = this.generateEMQStimulus(emqQuestion.optionsId, emqQuestion.options, emqQuestion.sharedContext);
                    qtiPackage.items.push(emqStimulus);
                    generatedEMQStimuli.add(emqQuestion.optionsId);
                }
                
                const emqItems = this.generateEMQItems(emqQuestion);
                qtiPackage.items.push(...emqItems);
            } else if (question.type === 'SAQ') {
                const saqQuestion = question as SAQQuestion;
                
                // Generate shared context document if it exists and hasn't been generated yet
                if (saqQuestion.sharedContext && saqQuestion.parentItemId && !generatedContexts.has(saqQuestion.parentItemId)) {
                    const contextDocument = this.generateContextDocument(saqQuestion.parentItemId, saqQuestion.sharedContext);
                    qtiPackage.items.push(contextDocument);
                    generatedContexts.add(saqQuestion.parentItemId);
                }
                
                // Generate the SAQ item itself
                const item = this.generateQuestionItem(question);
                if (item) {
                    qtiPackage.items.push(item);
                }
            } else {
                const item = this.generateQuestionItem(question);
                if (item) {
                    qtiPackage.items.push(item);
                }
            }
        }

        // Now generate manifest and assessment with consistent references
        qtiPackage.manifest = this.generateManifestFromItems(qtiPackage.items, assessmentTitle);
        qtiPackage.assessment = this.generateAssessmentTestFromItems(qtiPackage.items, assessmentTitle);

        return qtiPackage;
    }

    /**
     * Generate manifest from QTI items
     */
    static generateManifestFromItems(items: QTIItem[], assessmentTitle: string = 'Assessment'): string {
        const manifestId = `manifest_${uuidv4()}`;
        const assessmentId = `assessment_${uuidv4()}`;

        let resourcesXML = '';
        let dependencyXML = '';

        // Generate resources for each item
        items.forEach(item => {
            resourcesXML += this.generateResourceXML(item.identifier, item.filename);
            dependencyXML += `      <dependency identifierref="${item.identifier}"/>\n`;
        });

        return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" 
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2"
          xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_v2p1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imscp_v1p1.xsd http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsmd_v1p2p2.xsd http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <metadata>
    <schema>QTI Package</schema>
    <schemaversion>2.1</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:string language="en">${this.escapeXML(assessmentTitle)}</imsmd:string>
        </imsmd:title>
      </imsmd:general>
    </imsmd:lom>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${assessmentId}" type="imsqti_test_xmlv2p1" href="assessment.xml">
      <file href="assessment.xml"/>
${dependencyXML}    </resource>
${resourcesXML}  </resources>
</manifest>`;
    }

    /**
     * Generate resource XML for manifest
     */
    static generateResourceXML(identifier: string, href: string): string {
        return `    <resource identifier="${identifier}" type="imsqti_item_xmlv2p1" href="${href}">
      <file href="${href}"/>
    </resource>
`;
    }

    /**
     * Group items by their stimulus relationship
     */
    static groupItemsByStimulus(items: QTIItem[]): StimulusGroup[] {
        const groups: StimulusGroup[] = [];
        const stimulusItems = new Map<string, QTIItem>();
        const questionItems: QTIItem[] = [];
        
        // Separate stimulus items from question items
        items.forEach(item => {
            if (item.identifier.includes('stimulus_') || item.identifier.includes('context_')) {
                // Extract the parent ID from the stimulus identifier
                const parentId = item.identifier.replace(/^(stimulus_|context_)/, '').replace(/_[a-f0-9-]+$/, '');
                stimulusItems.set(parentId, item);
            } else {
                questionItems.push(item);
            }
        });
        
        // Group questions by their parent stimulus
        const stimulusQuestionMap = new Map<string, QTIItem[]>();
        const orphanQuestions: QTIItem[] = [];
        
        questionItems.forEach(item => {
            // Try to find parent ID from item comments or identifier
            let parentId: string | null = null;
            
            // Check if item XML contains parent reference
            if (item.item.includes('<!-- Options ID:') || item.item.includes('<!-- Item ID:')) {
                const optionsMatch = item.item.match(/<!-- Options ID: ([^-\s]+)/);
                const itemMatch = item.item.match(/<!-- Item ID: ([^-\s]+)/);
                
                if (optionsMatch && optionsMatch[1] && optionsMatch[1] !== 'N/A') {
                    parentId = optionsMatch[1];
                } else if (itemMatch && itemMatch[1]) {
                    // Extract base parent ID (e.g., "1001" from "1001_a")
                    const fullItemId = itemMatch[1];
                    const baseParentId = fullItemId.split('_')[0];
                    if (stimulusItems.has(baseParentId)) {
                        parentId = baseParentId;
                    }
                }
            }
            
            if (parentId && stimulusItems.has(parentId)) {
                if (!stimulusQuestionMap.has(parentId)) {
                    stimulusQuestionMap.set(parentId, []);
                }
                stimulusQuestionMap.get(parentId)!.push(item);
            } else {
                orphanQuestions.push(item);
            }
        });
        
        // Create stimulus groups
        stimulusQuestionMap.forEach((questions, parentId) => {
            const stimulusItem = stimulusItems.get(parentId);
            if (stimulusItem) {
                groups.push({
                    stimulusItem,
                    questions: questions.sort((a, b) => a.identifier.localeCompare(b.identifier))
                });
            }
        });
        
        // Add orphan questions as individual groups
        if (orphanQuestions.length > 0) {
            groups.push({
                stimulusItem: null,
                questions: orphanQuestions.sort((a, b) => a.identifier.localeCompare(b.identifier))
            });
        }
        
        return groups;
    }

    /**
     * Generate assessment test XML from items with proper stimulus grouping
     */
    static generateAssessmentTestFromItems(items: QTIItem[], title: string): string {
        const testId = `test_${uuidv4()}`;
        
        // Group items by stimulus
        const stimulusGroups = this.groupItemsByStimulus(items);
        
        let sectionsXML = '';
        let sectionCounter = 1;
        
        for (const group of stimulusGroups) {
            const sectionId = `section_${sectionCounter}_${uuidv4()}`;
            let sectionTitle = group.stimulusItem ? 
                `Section ${sectionCounter} - Questions with Stimulus` : 
                `Section ${sectionCounter} - Individual Questions`;
            
            sectionsXML += `    <assessmentSection identifier="${sectionId}" title="${sectionTitle}" visible="true">\n`;
            
            // Add stimulus first if exists
            if (group.stimulusItem) {
                sectionsXML += `      <assessmentItemRef identifier="${group.stimulusItem.identifier}" href="${group.stimulusItem.filename}" category="stimulus" fixed="true"/>\n`;
            }
            
            // Add related questions
            group.questions.forEach((item: QTIItem) => {
                sectionsXML += `      <assessmentItemRef identifier="${item.identifier}" href="${item.filename}"/>\n`;
            });
            
            sectionsXML += `    </assessmentSection>\n`;
            sectionCounter++;
        }

        return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest identifier="${testId}" title="${this.escapeXML(title)}" 
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <testPart identifier="testPart" navigationMode="nonlinear" submissionMode="simultaneous">
${sectionsXML}  </testPart>
</assessmentTest>`;
    }

    /**
     * Generate question item based on type
     */
    static generateQuestionItem(question: Question): QTIItem | null {
        switch (question.type) {
            case 'MCQ':
                return this.generateMCQItem(question as MCQQuestion);
            case 'SAQ':
                return this.generateSAQItem(question as SAQQuestion);
            default:
                console.warn(`Unsupported question type: ${question.type}`);
                return null;
        }
    }

    /**
     * Generate MCQ item
     */
    static generateMCQItem(question: MCQQuestion): QTIItem {
        const itemId = `item_${question.itemId}_${uuidv4()}`;
        const responseId = `RESPONSE_${uuidv4()}`;
        
        let choicesXML = '';
        question.options.forEach(option => {
            choicesXML += `        <simpleChoice identifier="choice_${option.letter}" fixed="true">${this.escapeXML(option.text)}</simpleChoice>\n`;
        });

        const itemXML = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem identifier="${itemId}" title="${this.escapeXML(question.title)}" adaptive="false" timeDependent="false"
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <!-- Item ID: ${question.itemId} -->
  <responseDeclaration identifier="${responseId}" cardinality="single" baseType="identifier">
    <correctResponse>
      <value>choice_${question.correctAnswer}</value>
    </correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>1</value>
    </defaultValue>
  </outcomeDeclaration>
  <itemBody>
    <div>
${this.formatQuestionContent(question)}    </div>
    <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="1">
      <prompt>Choose the correct answer:</prompt>
${choicesXML}    </choiceInteraction>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>`;

        return {
            item: itemXML,
            filename: `${itemId}.xml`,
            identifier: itemId
        };
    }

    /**
     * Generate EMQ items
     */
    static generateEMQItems(question: EMQQuestion): QTIItem[] {
        const items: QTIItem[] = [];
        const itemId = `item_${question.itemId}_${uuidv4()}`;
        const responseId = `RESPONSE_${uuidv4()}`;

        // Generate options XML for the interaction
        let choicesXML = '';
        question.options.forEach(option => {
            choicesXML += `        <simpleChoice identifier="choice_${option.letter}" fixed="true">${this.escapeXML(option.text)}</simpleChoice>\n`;
        });

        // For EMQ, the question content should ONLY show the specific question (e.g., "Dengue")
        // The stimulus (topic, options, instructions) is in a separate stimulus document
        // DO NOT duplicate the stimulus content here
        let questionContentXML = '';
        if (question.text && question.text.trim()) {
            questionContentXML = `    <div class="question">
      <p><strong>${this.escapeXML(question.text)}</strong></p>
    </div>\n`;
        }

        const itemXML = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem identifier="${itemId}" title="${this.escapeXML(question.title)}" adaptive="false" timeDependent="false"
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <!-- Item ID: ${question.itemId} -->
  <!-- Options ID: ${question.optionsId || 'N/A'} -->
  <responseDeclaration identifier="${responseId}" cardinality="single" baseType="identifier">
    <correctResponse>
      <value>choice_${question.correctAnswer}</value>
    </correctResponse>
  </responseDeclaration>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>1</value>
    </defaultValue>
  </outcomeDeclaration>
  <itemBody>
${questionContentXML}    <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="1">
      <prompt>Select your answer:</prompt>
${choicesXML}    </choiceInteraction>
  </itemBody>
  <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
</assessmentItem>`;

        items.push({
            item: itemXML,
            filename: `${itemId}.xml`,
            identifier: itemId
        });

        return items;
    }

    /**
     * Generate SAQ item
     */
    static generateSAQItem(question: SAQQuestion): QTIItem {
        const itemId = `item_${question.itemId}_${uuidv4()}`;
        const responseId = `RESPONSE_${uuidv4()}`;

        // Generate sub-questions if they exist (without redundant marks)
        let subQuestionsXML = '';
        if (question.subQuestions && question.subQuestions.length > 0) {
            question.subQuestions.forEach((subQ, index) => {
                // Remove marks from the question text as it's redundant now
                const cleanQuestionText = subQ.question.replace(/\(\d+\s+marks?\)/gi, '').trim();
                subQuestionsXML += `      <p><strong>${subQ.part}</strong> ${this.escapeXML(cleanQuestionText)}</p>\n`;
            });
        }

        const itemXML = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem identifier="${itemId}" title="${this.escapeXML(question.title)}" adaptive="false" timeDependent="false"
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <!-- Item ID: ${question.itemId} -->
  <!-- Total Marks: ${question.totalMarks} -->
  <templateDeclaration baseType="float" cardinality="single" identifier="SCORE_ALL_CORRECT">
    <defaultValue><value>${question.totalMarks}</value></defaultValue>
  </templateDeclaration>
  <responseDeclaration identifier="${responseId}" cardinality="single" baseType="string"/>
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <outcomeDeclaration identifier="MAXSCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>${question.totalMarks}</value>
    </defaultValue>
  </outcomeDeclaration>
  <modalFeedback outcomeIdentifier="SCORE" identifier="correct" showHide="show">
    <p>Answer Key: ${this.escapeXML(question.answerKey)}</p>
  </modalFeedback>
  <itemBody>
    <div>
${subQuestionsXML.length > 0 ? subQuestionsXML : this.formatQuestionContent(question)}    </div>
    <extendedTextInteraction responseIdentifier="${responseId}" expectedLength="500">
      <prompt>Provide your answer:</prompt>
    </extendedTextInteraction>
  </itemBody>
  <responseProcessing>
    <setOutcomeValue identifier="SCORE">
      <baseValue baseType="float">0</baseValue>
    </setOutcomeValue>
    <setOutcomeValue identifier="MAXSCORE">
      <baseValue baseType="float">${question.totalMarks}</baseValue>
    </setOutcomeValue>
  </responseProcessing>
</assessmentItem>`;

        return {
            item: itemXML,
            filename: `${itemId}.xml`,
            identifier: itemId
        };
    }

    /**
     * Generate QTI Stimulus XML for shared context (SAQ)
     */
    static generateContextDocument(parentItemId: string, sharedContext: string): QTIItem {
        const stimulusId = `stimulus_${parentItemId}_${uuidv4()}`;

        const documentXML = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem identifier="${stimulusId}" title="Stimulus for Question ${parentItemId}" adaptive="false" timeDependent="false"
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <!-- Stimulus Document for Item ID: ${parentItemId} -->
  <itemBody>
    <div class="stimulus">
      <p><strong>Context:</strong></p>
      <p>${this.escapeXML(sharedContext)}</p>
    </div>
  </itemBody>
</assessmentItem>`;

        return {
            item: documentXML,
            filename: `${stimulusId}.xml`,
            identifier: stimulusId
        };
    }

    /**
     * Generate QTI Stimulus XML for EMQ shared context and options
     */
    static generateEMQStimulus(optionsId: string, options: any[], sharedContext?: string): QTIItem {
        const stimulusId = `stimulus_${optionsId}_${uuidv4()}`;

        let stimulusContent = '';
        
        // Parse sharedContext to extract topic header, options, and instructions
        if (sharedContext) {
            const lines = sharedContext.split('\n').filter(line => line.trim());
            let topicHeader = '';
            let optionsLines: string[] = [];
            let instructions = '';
            
            // First line is typically the topic header
            if (lines.length > 0) {
                topicHeader = lines[0];
            }
            
            // Extract options lines (A., B., C., etc.)
            const optionLineRegex = /^[A-J]\.\s/;
            for (let i = 1; i < lines.length; i++) {
                if (optionLineRegex.test(lines[i])) {
                    optionsLines.push(lines[i]);
                } else if (lines[i].toLowerCase().includes('select') || 
                          lines[i].toLowerCase().includes('choose') || 
                          lines[i].toLowerCase().includes('match') ||
                          lines[i].toLowerCase().includes('may be used') ||
                          lines[i].toLowerCase().includes('for each')) {
                    // This is instruction text
                    instructions = lines.slice(i).join(' ');
                    break;
                }
            }
            
            // Build stimulus content: Topic Header + Options + Instructions
            if (topicHeader) {
                stimulusContent += `<p><strong>${this.escapeXML(topicHeader)}</strong></p>\n`;
            }
            
            // Add options WITH letters
            if (optionsLines.length > 0) {
                optionsLines.forEach(line => {
                    stimulusContent += `<p>${this.escapeXML(line)}</p>\n`;
                });
            }
            
            if (instructions) {
                stimulusContent += `<p>${this.escapeXML(instructions)}</p>\n`;
            }
        }

        const documentXML = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentItem identifier="${stimulusId}" title="Stimulus for EMQ Options ${optionsId}" adaptive="false" timeDependent="false"
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <!-- EMQ Stimulus Document for Options ID: ${optionsId} -->
  <itemBody>
    <div class="stimulus">
      ${stimulusContent}
    </div>
  </itemBody>
</assessmentItem>`;

        return {
            item: documentXML,
            filename: `${stimulusId}.xml`,
            identifier: stimulusId
        };
    }

    /**
     * Format question content, converting HTML tables to QTI format if available
     */
    static formatQuestionContent(question: Question): string {
        if (question.htmlContent && question.htmlContent.trim()) {
            // Convert HTML content with tables to QTI format
            const qtiContent = this.convertTablesToQTI(question.htmlContent);
            return `      ${qtiContent}\n`;
        } else {
            // Fallback to plain text
            return `      <p>${this.escapeXML(question.text)}</p>\n`;
        }
    }

    /**
     * Convert HTML tables to QTI table format
     */
    static convertTablesToQTI(htmlContent: string): string {
        if (!htmlContent) return '';

        // Replace HTML tables with QTI table format
        return htmlContent.replace(/<table[^>]*>(.*?)<\/table>/gs, (match, tableContent) => {
            // Extract table rows
            const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
            
            let qtiTable = '<table>\n';
            rows.forEach((row: string, rowIndex: number) => {
                const cells = row.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gs) || [];
                const isHeader = row.includes('<th');
                
                qtiTable += '  <tr>\n';
                cells.forEach((cell: string) => {
                    const cellContent = cell.replace(/<t[hd][^>]*>(.*?)<\/t[hd]>/s, '$1').trim();
                    const tag = isHeader ? 'th' : 'td';
                    qtiTable += `    <${tag}>${this.escapeXML(cellContent)}</${tag}>\n`;
                });
                qtiTable += '  </tr>\n';
            });
            qtiTable += '</table>';
            
            return qtiTable;
        });
    }

    /**
     * Escape XML special characters
     */
    static escapeXML(text: string): string {
        if (!text) return '';
        // Trim and normalize whitespace before escaping
        const normalizedText = text
            .trim()
            .replace(/\s+/g, ' '); // Replace multiple spaces with single space
        
        return normalizedText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Legacy method: Generate QTI manifest file (backward compatibility)
     */
    static generateManifest(questions: Question[], assessmentTitle: string = 'Assessment'): string {
        const manifestId = `manifest_${uuidv4()}`;
        const assessmentId = `assessment_${uuidv4()}`;

        let resourcesXML = '';
        let dependencyXML = '';

        // Generate resources for each question
        questions.forEach(question => {
            if (question.type === 'EMQ') {
                // EMQ questions might have multiple sub-questions
                const emqQuestion = question as EMQQuestion;
                const itemId = `item_${question.itemId}_${uuidv4()}`;
                resourcesXML += this.generateResourceXML(itemId, `${itemId}.xml`);
                dependencyXML += `      <dependency identifierref="${itemId}"/>\n`;
            } else {
                const itemId = `item_${question.itemId}_${uuidv4()}`;
                resourcesXML += this.generateResourceXML(itemId, `${itemId}.xml`);
                dependencyXML += `      <dependency identifierref="${itemId}"/>\n`;
            }
        });

        return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifestId}" 
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:imsmd="http://www.imsglobal.org/xsd/imsmd_v1p2"
          xmlns:imsqti="http://www.imsglobal.org/xsd/imsqti_v2p1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imscp_v1p1.xsd http://www.imsglobal.org/xsd/imsmd_v1p2 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsmd_v1p2p2.xsd http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <metadata>
    <schema>QTI Package</schema>
    <schemaversion>2.1</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:title>
          <imsmd:string language="en">${this.escapeXML(assessmentTitle)}</imsmd:string>
        </imsmd:title>
      </imsmd:general>
    </imsmd:lom>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="${assessmentId}" type="imsqti_test_xmlv2p1" href="assessment.xml">
      <file href="assessment.xml"/>
${dependencyXML}    </resource>
${resourcesXML}  </resources>
</manifest>`;
    }

    /**
     * Legacy method: Generate assessment test XML (backward compatibility)
     */
    static generateAssessmentTest(questions: Question[], title: string): string {
        const testId = `test_${uuidv4()}`;
        const sectionId = `section_${uuidv4()}`;
        
        let itemRefsXML = '';
        questions.forEach(question => {
            const itemId = `item_${question.itemId}_${uuidv4()}`;
            itemRefsXML += `      <assessmentItemRef identifier="${itemId}" href="${itemId}.xml"/>\n`;
        });

        return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest identifier="${testId}" title="${this.escapeXML(title)}" 
                xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" 
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd">
  <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
    <defaultValue>
      <value>0</value>
    </defaultValue>
  </outcomeDeclaration>
  <testPart identifier="testPart" navigationMode="linear" submissionMode="individual">
    <assessmentSection identifier="${sectionId}" title="Questions" visible="true">
${itemRefsXML}    </assessmentSection>
  </testPart>
</assessmentTest>`;
    }
}

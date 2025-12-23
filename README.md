# AssessForge - QTI Transformer for HKU Medicine

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![QTI Compliant](https://img.shields.io/badge/QTI-2.1_Compliant-blue?style=for-the-badge)](https://www.imsglobal.org/question/)
[![Inspera Ready](https://img.shields.io/badge/Inspera-Ready-green?style=for-the-badge)](https://hku.inspera.com)

</div>

---

**A modern, production-ready Next.js application for HKU Medicine to transform educational documents into QTI 2.1 format for the Inspera assessment platform.**

Built with Next.js 15, React 19, TypeScript, and Tailwind CSS for seamless document processing and assessment creation.

</div>

## 🚀 Features

### 📚 **Educational Content Processing**
- **Multi-step Workflow**: Upload → Preview → Download (3 simple steps)
- **Question Type Support**: MCQ (Multiple Choice), EMQ (Extended Matching), SAQ (Short Answer)
- **Auto-detection**: Intelligent question type recognition
- **Mixed Document Support**: Parse documents with multiple question types
- **File Format Support**: .docx and .txt files with robust parsing
- **EMQ Stimulus Handling**: Correct QTI structure with shared options and instructions

### 🎨 **Modern User Experience**
- **Drag-and-Drop Upload**: Intuitive file handling with visual feedback
- **Theme Support**: Light, dark, and auto modes with system preference detection
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Progress Tracking**: Visual indicators for each workflow step
- **Expand/Collapse**: Collapsible question sections for better navigation
- **HKU Branding**: Custom styling for HKU LKS Faculty of Medicine

### ⚡ **Technical Excellence**
- **Next.js 15**: Latest App Router with Server Components and Turbopack
- **React 19**: Modern React features with TypeScript 5 for type safety
- **Tailwind CSS 4**: Utility-first styling with dark mode support
- **QTI 2.1 Compliance**: Valid XML generation with proper scoring and sectioning
- **Inspera Integration**: Direct compatibility with HKU's Inspera platform
- **Clean Output**: Properly formatted options without extra whitespace
- **EMQ Stimulus**: Correct structure with topic header, options (A., B., C.), and instructions

## 🛠️ Technology Stack

<table>
<tr>
<td><b>Frontend</b></td>
<td>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
</td>
</tr>
<tr>
<td><b>Styling</b></td>
<td>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Lucide_React-0.544-FF6B6B?style=flat-square" alt="Lucide React">
</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/API_Routes-Next.js-black?style=flat-square" alt="API Routes">
</td>
</tr>
<tr>
<td><b>File Processing</b></td>
<td>
  <img src="https://img.shields.io/badge/Mammoth.js-DOCX-orange?style=flat-square" alt="Mammoth">
  <img src="https://img.shields.io/badge/React_Dropzone-File_Upload-green?style=flat-square" alt="React Dropzone">
</td>
</tr>
<tr>
<td><b>Standards</b></td>
<td>
  <img src="https://img.shields.io/badge/QTI-2.1-blue?style=flat-square" alt="QTI 2.1">
  <img src="https://img.shields.io/badge/XML-Valid-brightgreen?style=flat-square" alt="XML">
</td>
</tr>
</table>

## ⚙️ Configuration & Environment

### Prerequisites

<table>
<tr>
<td><img src="https://img.shields.io/badge/Node.js-18.17.0+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"></td>
<td>JavaScript runtime environment</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/npm-9.0+-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm"></td>
<td>Package manager (or yarn/pnpm)</td>
</tr>
<tr>
<td><img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"></td>
<td>Type checking and compilation</td>
</tr>
</table>

### Environment Setup

This project uses Next.js with zero-configuration setup. No additional environment variables are required for basic functionality.

**Optional Environment Variables:**
```bash
# .env.local (create if needed)
NEXT_PUBLIC_APP_NAME="QTI Transformer"
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB default
NODE_ENV=development
```

## 🚀 Quick Start

### 📦 Installation

```bash
# Navigate to project directory
cd qti-transformer-nextjs

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser (with basePath)
open http://localhost:3000/assessforge
```

### ⚙️ Configuration

The app is configured to run under the `/assessforge` basePath. This means:
- **Local**: `http://localhost:3000/assessforge`
- **Production**: `https://yourdomain.com/assessforge`

All routes, API endpoints, and assets are automatically prefixed.

### 🔧 Available Scripts

| Command | Description | Badge |
|---------|-------------|-------|
| `npm run dev` | Start development server | ![Dev](https://img.shields.io/badge/Dev-Server-green?style=flat-square) |
| `npm run build` | Build for production | ![Build](https://img.shields.io/badge/Build-Production-blue?style=flat-square) |
| `npm run start` | Start production server | ![Start](https://img.shields.io/badge/Start-Production-orange?style=flat-square) |
| `npm run lint` | Run ESLint | ![Lint](https://img.shields.io/badge/Lint-ESLint-purple?style=flat-square) |
| `npm run type-check` | Check TypeScript types | ![Types](https://img.shields.io/badge/Types-Check-red?style=flat-square) |

## 📝 Usage Guide

### 🔄 **3-Step Workflow**

#### 1. **Upload Documents**
- **Drag & Drop**: Simply drag .docx or .txt files onto the upload area
- **Click to Select**: Use the file browser for manual selection
- **Question Type**: Choose MCQ, EMQ, SAQ, or use auto-detection (recommended)
- **Mixed Documents**: Supports files with multiple question types
- **Format Guide**: Built-in examples for text file formatting

#### 2. **Preview & Review**
- **Auto-parsing**: Documents are automatically parsed upon upload
- **Question Preview**: Review all detected questions with expand/collapse functionality
- **Summary View**: See question count and scoring at a glance
- **Default Collapsed**: Questions are collapsed by default for easier navigation
- **Expand All/Collapse All**: Quick controls for all questions
- **Verify Content**: Check question text, options, and correct answers

#### 3. **Download Package**
- **ZIP Package**: Complete QTI 2.1 package ready for LMS upload
- **Inspera Ready**: Optimized for HKU's Inspera assessment platform
- **Individual Files**: Includes manifest, test XML, and item XMLs
- **Valid QTI**: All output validated against QTI 2.1 standards

### 📋 Question Type Details

#### MCQ (Multiple Choice Questions)
- **Format**: Item ID, question text, options (A-J), correct answer
- **Output**: Standard QTI choice interaction
- **Scoring**: Single correct answer with 1 point per question

#### EMQ (Extended Matching Questions)
- **Format**: Options ID, topic header, shared options, instructions, individual questions
- **Output**: Separate stimulus document + individual question items
- **Stimulus**: Topic header, options WITH letters (A., B., C.), and instructions
- **Questions**: Each question references the shared stimulus
- **Scoring**: Single correct answer per question

#### SAQ (Short Answer Questions)
- **Format**: Item ID, question text, sub-questions with marks, answer key
- **Output**: Extended text interaction for free-form responses
- **Scoring**: Configurable marks per sub-question
- **Context**: Shared context rendered as Document type stimulus

### 🎯 Recent Improvements

#### Question Sequencing & Font Formatting (December 2025)
- ✅ **Question Sequence Preserved** - Items maintain original file order when imported to Inspera
- ✅ **Numeric Sequence Prefix** - Item IDs prefixed with 4-digit numbers (e.g., `0001_item_xxx`)
- ✅ **Title Sequencing** - Question titles include sequence numbers for easy reference
- ✅ **Font Formatting Support** - Bold, italic, underline, superscript, subscript preserved from DOCX
- ✅ **Reduced Whitespace** - Minimized XML whitespace to avoid extra line breaks in Inspera
- ✅ **Blank Prompts** - All question types use empty `<prompt></prompt>` as required

#### Stimulus & Document Type (December 2025)
- ✅ **Document Type** - EMQ and SAQ stimuli use `<assessmentStimulus>` with `class="document"` for correct Inspera type
- ✅ **Clean Context** - Removed "Context:" label from SAQ stimulus
- ✅ **No Expected Length** - Removed `expectedLength` attribute from SAQ `<extendedTextInteraction>`

#### Large File Upload Support (October 2025)
- ✅ **20MB file upload limit** (increased from 5MB)
- ✅ **Visual size indicator** with color-coded progress bar (green/amber/red)
- ✅ **Smart warnings** at 80% and 100% thresholds
- ✅ **Proactive prevention** - button disabled when over limit
- ✅ **Optimization tips** - auto-shows when approaching limit
- ✅ **Helper functions** - real-time size calculation and formatting
- ✅ **Vercel configured** - 1GB memory, 60s timeout for large files

#### EMQ Handling (October 2025)
- ✅ **Fixed Stimulus Options**: Options now display as "A. Aerosol" (not "24762. A. Aerosol")
- ✅ **No Duplication**: Question content no longer repeats the stimulus
- ✅ **Clean Whitespace**: Removed excessive whitespace from all option text
- ✅ **Correct Structure**: Stimulus contains topic header, options with letters, and instructions

These improvements ensure robust handling of large files, proper question sequencing, and correct QTI 2.1 structure for all question types in Inspera and other LMS platforms.

### ⚠️ Known Limitations

- **Font Formatting**: While bold, italic, underline, superscript, and subscript are supported, the extraction depends on how the DOCX was created. Non-standard formatting may not be captured.
- **Extra Line Break in Inspera**: After editing a question in Inspera and clicking "Save", an extra line break may be added. This appears to be Inspera platform behavior and may not be fully avoidable through QTI output changes.

## 🔌 API Documentation

### Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/parse` | POST | Parse documents and extract questions | ![API](https://img.shields.io/badge/API-Active-green?style=flat-square) |
| `/api/convert` | POST | Convert parsed questions to QTI format | ![API](https://img.shields.io/badge/API-Active-green?style=flat-square) |

### Example API Usage

```bash
# Parse a document
curl -X POST http://localhost:3000/api/parse \
  -F "file=@MCQ.docx" \
  -F "questionType=mcq"

# Convert to QTI format
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"questions": [...], "questionType": "mcq"}'
```

## 🧪 Development & Testing

### Running Tests
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### Quality Assurance
- ✅ **Type Safety**: 100% TypeScript coverage
- ✅ **Code Quality**: ESLint with strict rules
- ✅ **File Validation**: Comprehensive input validation
- ✅ **QTI Compliance**: Validated against QTI 2.1 standards
- ✅ **Cross-browser**: Tested on modern browsers
- ✅ **No Build Errors**: Clean production builds

## 🏗️ Architecture

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── parse/         # Document parsing
│   │   └── convert/       # QTI conversion
│   ├── upload/            # Upload workflow step
│   ├── preview/           # Question preview step
│   ├── convert/           # QTI conversion step
│   ├── download/          # Package download step
│   ├── layout.tsx         # Root layout with theme
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── ProgressIndicator.tsx
│   ├── ThemeToggle.tsx    # Light/dark mode
│   └── ClientLayout.tsx   # Client-side wrapper
├── contexts/              # React contexts
│   └── WorkflowContext.tsx
└── lib/                   # Core libraries
    ├── services/          # Business logic
    │   ├── question-parser.ts
    │   └── qti-generator.ts
    └── types/             # TypeScript definitions
```

### Key Features
- 🎨 **Modern UI**: Tailwind CSS with semantic color system
- 🌙 **Theme Support**: Light, dark, and system auto-detection
- 📱 **Responsive**: Mobile-first design approach
- ⚡ **Performance**: Next.js App Router with Turbopack
- 🔒 **Type Safety**: Full TypeScript integration
- 📦 **State Management**: Session-based workflow state
- 🎯 **Accessibility**: ARIA labels and semantic HTML
- ✅ **QTI Compliance**: Validated against QTI 2.1 specification
- ✅ **Cross-browser**: Tested on modern browsers

## 🏗️ Development & Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Support (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Performance & Monitoring
- **Bundle Analysis**: `npm run build` includes bundle analysis
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint with Next.js recommended rules
- **File Size Limits**: 10MB default for document uploads

## ⚠️ Technical Notes

### File Upload Limitations
- **Maximum file size**: 20MB total (single or multiple files)
- **Individual file limit**: No individual limit, but total must be under 20MB
- **Supported formats**: .docx (Microsoft Word), .txt (Plain text)
- **Browser compatibility**: Modern browsers with ES2022+ support
- **Concurrent uploads**: Multiple files supported simultaneously
- **Visual feedback**: Color-coded progress bar showing size usage
- **Smart warnings**: Alerts at 80% (warning) and 100% (error) thresholds

### Performance Characteristics
- **Build time**: ~0.8 seconds with Turbopack
- **Development startup**: ~0.5 seconds hot reload
- **Bundle size**: Optimized with Next.js 15 chunking
- **TypeScript**: Full type safety with zero compilation errors
- **API timeout**: 60 seconds for large file processing
- **Memory allocation**: 1GB on Vercel for file processing
- **File processing**: Supports up to 20MB total upload size

### Deployment Configuration

#### Vercel Settings
```json
{
  "functions": {
    "src/app/api/*/route.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "regions": ["hkg1"]
}
```

#### Next.js Configuration
- **basePath**: `/assessforge` - All routes prefixed automatically
- **Body size limit**: 20MB for API routes and server actions
- **Runtime**: Node.js for API routes (not Edge)
- **Compression**: Enabled for smaller bundle sizes

#### Environment Variables
```bash
# .env.local (optional)
NEXT_PUBLIC_APP_NAME="AssessForge"
NEXT_PUBLIC_MAX_FILE_SIZE=20971520  # 20MB
NODE_ENV=development
```

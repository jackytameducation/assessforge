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

# Open in browser
open http://localhost:3000
```

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

### 🎯 Recent Improvements

#### EMQ Handling (October 2025)
- ✅ **Fixed Stimulus Options**: Options now display as "A. Aerosol" (not "24762. A. Aerosol")
- ✅ **No Duplication**: Question content no longer repeats the stimulus
- ✅ **Clean Whitespace**: Removed excessive whitespace from all option text
- ✅ **Correct Structure**: Stimulus contains topic header, options with letters, and instructions

These fixes ensure that EMQ questions are properly structured according to QTI 2.1 standards and display correctly in Inspera and other LMS platforms.

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
- **Maximum file size**: 10MB per file (configurable)
- **Supported formats**: .docx (Microsoft Word), .txt (Plain text)
- **Browser compatibility**: Modern browsers with ES2022+ support
- **Concurrent uploads**: Multiple files supported simultaneously

### Performance Characteristics
- **Build time**: ~0.8 seconds with Turbopack
- **Development startup**: ~0.5 seconds hot reload
- **Bundle size**: Optimized with Next.js 15 chunking
- **TypeScript**: Full type safety with zero compilation errors

### QTI Compliance Notes
- **QTI Version**: 2.1 (IMS Global standard)
- **Assessment Platform**: Optimized for Inspera Assessment
- **Compatibility**: Moodle, Canvas, Blackboard supported
- **XML Validation**: All output validated against QTI schema

## 🎯 Migration Status

### ✅ **Completed (September 18, 2025)**
- [x] Full migration from Node.js/Express to Next.js 15
- [x] Modern React 19 with TypeScript 5 implementation
- [x] Complete dark mode support across all pages
- [x] HKU Medicine branding and Inspera integration
- [x] Multi-step workflow with session management
- [x] QTI 2.1 compliant output with proper scoring
- [x] Comprehensive testing and validation

### 🚀 **Ready for Production**
The application is fully functional and ready for deployment to production environments.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

<div align="center">

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🎯 Project Status & Changelog

<div align="center">

![Development Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Last Updated](https://img.shields.io/badge/Last_Updated-Oct_2025-orange?style=for-the-badge)

</div>

### ✅ Completed Features
- [x] **Full TypeScript Migration**: Express backend → Next.js 15 with TypeScript
- [x] **Modern UI/UX**: Streamlined 3-step workflow with improved navigation
- [x] **Question Type Support**: MCQ, EMQ, SAQ parsing and conversion
- [x] **Mixed Document Support**: Parse files with multiple question types
- [x] **File Format Support**: .docx and .txt document processing
- [x] **QTI 2.1 Compliance**: Valid XML generation with proper structure
- [x] **EMQ Stimulus Fix**: Correct option formatting and no duplication
- [x] **Whitespace Fix**: Clean option text without excess spacing
- [x] **Theme Support**: Light, dark, and system auto-detection
- [x] **Mobile Responsive**: Full-screen sidebar and mobile-optimized layouts
- [x] **API Routes**: `/api/parse` and `/api/convert` endpoints
- [x] **Error Handling**: Comprehensive validation and error reporting
- [x] **Type Safety**: 100% TypeScript coverage with zero compilation errors
- [x] **Build System**: Production-ready builds with Turbopack
- [x] **Documentation**: Comprehensive README and inline documentation

### 🔄 Recent Updates (October 2025)

#### UI/UX Improvements
- Streamlined workflow from 4 steps to 3 steps (removed redundant convert page)
- Auto-conversion on navigation for seamless experience
- Default collapsed questions in preview with expand/collapse all controls
- Improved light/dark mode readability and contrast
- Full-screen mobile sidebar for better navigation
- Enhanced button clarity and visual hierarchy

#### EMQ & Parsing Fixes
- **Fixed EMQ stimulus options**: Options now show as "A. Aerosol" instead of "24762. A. Aerosol"
- **Removed stimulus duplication**: EMQ question content now only shows the specific question
- **Fixed whitespace**: Removed excessive spacing in all option text
- **Improved mixed document detection**: Better handling of files with multiple question types
- **Enhanced validation**: All questions now parse correctly with proper error handling

#### Technical Improvements
- Updated theme system with semantic CSS variables
- Improved TypeScript type definitions
- Enhanced file validation and error messages
- Better ESLint configuration
- Optimized build performance

### 📊 Migration Summary
- **From**: JavaScript/Express backend + separate frontend
- **To**: Next.js 15 full-stack application with TypeScript
- **Status**: ✅ Complete and production-ready
- **Improvements**: Better type safety, modern UI, integrated API, enhanced DX
- **Preserved**: All original functionality, file parsing logic, QTI generation

### 🎯 Future Enhancements (Optional)
- [ ] User authentication and session management
- [ ] Batch processing for large document sets
- [ ] Database integration for question banks
- [ ] Advanced QTI features and customization options
- [ ] Question editing interface
- [ ] Analytics and usage tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Maintain 100% type coverage
- Write clean, documented code
- Test thoroughly before submitting
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for HKU Medicine using Next.js, TypeScript, and modern web technologies.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<sub>Made with 🚀 for the educational technology community</sub>

</div>

# Changelog

All notable changes to AssessForge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-18

### Added
- **Initial Release** - AssessForge application for HKU Medicine
- **Multi-step Workflow**: Upload → Preview → Convert → Download
- **Question Type Support**: MCQ (Multiple Choice), EMQ (Extended Matching), SAQ (Short Answer)
- **File Format Support**: .docx and .txt files with robust parsing
- **QTI 2.1 Compliance**: Industry-standard assessment format generation
- **Modern UI/UX**: 
  - Responsive design for desktop and mobile
  - Light/dark theme support with system preference detection
  - HKU Medicine branding and styling
  - Interactive drag-and-drop file upload
- **Technical Stack**:
  - Next.js 15 with App Router and Turbopack
  - React 19 with TypeScript 5
  - Tailwind CSS 4 for styling
  - Comprehensive type safety
- **API Endpoints**:
  - `/api/parse` - Document parsing and question extraction
  - `/api/convert` - QTI 2.1 format generation
- **Sample Files**: Included MCQ, EMQ, and SAQ examples
- **Documentation**: Comprehensive README with setup instructions
- **CI/CD**: GitHub Actions workflow for automated testing
- **Accessibility**: ARIA labels and semantic HTML structure

### Changed
- **Rebranded** from "QTI Transformer" to "AssessForge"
- **Complete Migration** from Node.js/Express to Next.js full-stack
- **Enhanced Parsing** with improved question detection algorithms
- **Optimized Performance** with Next.js 15 and Turbopack

### Technical Details
- **Build System**: Production-ready builds with zero compilation errors
- **Type Safety**: 100% TypeScript coverage
- **Performance**: Sub-second build times with hot reload
- **Standards Compliance**: QTI 2.1 validated output
- **Cross-platform**: Tested on modern browsers and devices

### Security
- **Input Validation**: Comprehensive file and data validation
- **File Size Limits**: Configurable upload restrictions (10MB default)
- **Type Safety**: TypeScript prevents common runtime errors
- **Dependencies**: Regular security audits with npm audit

---

## Development Notes

### Migration Summary
- **From**: Separate frontend/backend architecture
- **To**: Unified Next.js full-stack application
- **Benefits**: Better DX, type safety, performance, maintainability
- **Preserved**: All original functionality and QTI compliance

### Future Roadmap
- [ ] Database integration for question banking
- [ ] User authentication and permissions
- [ ] Batch processing capabilities
- [ ] Advanced QTI features and customization
- [ ] Integration with additional LMS platforms
- [ ] Real-time collaboration features

---

**For detailed technical specifications, see [TECHNICAL_SPECIFICATION.md](TECHNICAL_SPECIFICATION.md)**

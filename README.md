
# QTI Transformer - HKU Medicine
<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![QTI Compliant](https://img.shields.io/badge/QTI-2.1_Compliant-blue?style=for-the-badge)](https://www.imsglobal.org/question/)
[![Inspera Ready](https://img.shields.io/badge/Inspera-Ready-green?style=for-the-badge)](https://hku.inspera.com)

</div>


-----

**A modern, full-stack Next.js application for HKU Medicine to transform educational documents into QTI 2.1 format for the Inspera assessment platform.**

Built with Next.js 15, React 19, TypeScript, and Tailwind CSS for seamless document processing and assessment creation.

## 🚀 Features

### 📚 **Educational Content Processing**

  - **Multi-step Workflow**: Upload → Preview → Convert → Download
  - **Question Type Support**: MCQ (Multiple Choice), EMQ (Extended Matching), SAQ (Short Answer)
  - **Auto-detection**: Intelligent question type recognition from mixed-format files.
  - **File Format Support**: `.docx` and `.txt` files with robust parsing.

-----

### 🎨 **Modern User Experience**

  - **Drag-and-Drop Upload**: Intuitive file handling with visual feedback.
  - **Theme Support**: Light, dark, and auto modes with consistent styling.
  - **Responsive Design**: Works seamlessly on desktop and mobile devices, featuring a full-screen mobile menu.
  - **Efficient Review**: Default collapsed question view with "Show/Hide Details" controls to manage large question sets easily.
  - **HKU Branding**: Custom styling for HKU LKS Faculty of Medicine.

-----

### ⚡ **Technical Excellence**

  - **Next.js 15**: Latest App Router with Server Components and Turbopack.
  - **React 19**: Modern React features with TypeScript 5 for type safety.
  - **Tailwind CSS 4**: Utility-first styling with a fully implemented dark mode.
  - **QTI 2.1 Compliance**: Valid XML generation with corrected EMQ stimulus and structure.
  - **Inspera Integration**: Direct compatibility with HKU's Inspera platform.

-----

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
  <img src="https://img.shields.io/badge/Lucide_React-Icons-FF6B6B?style=flat-square" alt="Lucide React">
</td>
</tr>
<tr>
<td><b>Backend</b></td>
<td>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
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

-----

## 🚀 Quick Start

### Prerequisites

  - Node.js v20.x or later
  - npm v9.x or later

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/jackytameducation/assessforge.git

# 2. Navigate to the project directory
cd assessforge

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev

# 5. Open your browser to http://localhost:3000
```

### Available Scripts

| Command         | Description                               |
| --------------- | ----------------------------------------- |
| `npm run dev`   | Starts the development server (with HMR). |
| `npm run build` | Builds the application for production.    |
| `npm run start` | Starts the production server.             |
| `npm run lint`  | Runs ESLint to check for code quality.    |

-----

## 📝 Usage Guide

The application follows a simple, four-step workflow:

1.  **Upload**: Drag and drop your `.docx` or `.txt` file. The system will automatically detect the question types.
2.  **Preview**: Review the parsed questions. The list is collapsed by default for a clean overview. Use "Show Details" to inspect individual items.
3.  **Convert**: Click "Proceed to Convert". The conversion to QTI 2.1 format starts automatically.
4.  **Download**: Download the complete `.zip` package, ready for import into Inspera.

-----

## 🎯 Project Status

### ✅ **Completed (September 19, 2025)**

  - [x] **Full Migration to Next.js 15**: Successfully migrated from a separate Node.js/Express backend to a modern, full-stack Next.js architecture.
  - [x] **Modern UI/UX**: Implemented a fully responsive design with complete light/dark mode support and HKU Medicine branding.
  - [x] **Robust Question Parsing**: Enhanced the parser to correctly handle mixed MCQ/EMQ files and complex EMQ stimulus structures.
  - [x] **Streamlined Workflow**: Introduced auto-conversion and a collapsible question preview for a more efficient user experience.
  - [x] **QTI 2.1 Compliance**: Ensured all generated packages are valid and optimized for the Inspera platform.
  - [x] **Comprehensive Documentation**: Updated `README.md` and `CHANGELOG.md` to reflect the final state of the project.

### 🚀 **Ready for Production**

The application is fully functional, tested, and ready for deployment to production environments.

-----

## 🤝 Contributing

Contributions are welcome\! Please feel free to submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

-----

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/jackytameducation/assessforge/blob/v1.0/LICENSE) file for details.

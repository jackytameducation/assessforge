# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-09-19

This release finalizes the application for deployment, focusing on major workflow enhancements, UI polish, and critical bug fixes for QTI generation.

### Added

-   **Auto-Conversion**: The conversion process now starts automatically when navigating from the "Preview" to the "Convert" page, streamlining the user workflow.
-   **Section Expand/Collapse**: Added "Show/Hide Details" functionality on the "Preview" page to toggle the visibility of the entire question list section.

### Changed

-   **Default Collapsed Questions**: On the "Preview" page, the question list is now collapsed by default to provide a clean overview and reduce scrolling.
-   **Full-Screen Mobile Menu**: The sidebar navigation on mobile devices now opens as a full-screen overlay for an improved user experience.
-   **Improved Readability**: Enhanced the color contrast and typography in the light theme to significantly improve text readability.
-   **UI Refinements**:
    -   Fixed the "Preview" icon visibility on the home page for the light theme.
    -   Adjusted the "AssessForge" title gradient to ensure all letters are clearly visible.
    -   Removed the redundant "Start Conversion" button from the "Convert" page.
-   **Navigation Flow**: The "Back" button on the "Convert" page now correctly navigates to the "Preview" page.

### Fixed

-   **EMQ Stimulus Generation**: Corrected the QTI generation logic for Extended Matching Questions (EMQs) to ensure the correct order of stimulus components (Topic, Options, Instructions) and prevent redundant content.

### Removed

-   **Unused Parse Page**: Removed the obsolete `/parse` page and its references to simplify the application structure.

---

## [0.9.0] - 2025-09-18

This release focused on resolving all outstanding dark mode issues and overhauling project documentation.

### Added

-   **Download Page Collapse/Expand**: Added collapse/expand functionality to the "Individual Files" and "Package Info" sections on the Download page, defaulting to collapsed.

### Changed

-   **Theme Consistency**: Resolved all remaining dark mode rendering issues on the Convert and Download pages by replacing hardcoded colors with semantic theme variables.
-   **Improved Dark Mode Contrast**: Enhanced styling for MCQ options and other UI elements for better readability in dark mode.

### Documentation

-   **README Overhaul**: Completely updated the `README.md` with new branding, comprehensive feature documentation, a detailed workflow guide, and project architecture information.

### Housekeeping

-   **Deployment Preparation**: Added a comprehensive `.gitignore` file to exclude build artifacts, local dependencies, environment files, and sample/test files from the Git repository.
-   **Project Cleanup**: Removed obsolete test scripts

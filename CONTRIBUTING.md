# Contributing to QTI Transformer

We love your input! We want to make contributing to QTI Transformer as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issue tracker](https://github.com/yourusername/qti-transformer-nextjs/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/qti-transformer-nextjs/issues/new); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Make your changes
5. Test your changes: `npm run lint` and `npm run type-check`
6. Build for production: `npm run build`

## Coding Style

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Tailwind CSS for styling
- Follow the existing file structure and naming conventions
- Write clear, descriptive commit messages

## Question Types Support

When adding support for new question types:

1. Update the parser in `src/lib/services/question-parser.ts`
2. Update the QTI generator in `src/lib/services/qti-generator.ts`
3. Add type definitions in `src/lib/types/index.ts`
4. Create sample files in the `samples/` directory
5. Update the README with documentation

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/master/CONTRIBUTING.md)

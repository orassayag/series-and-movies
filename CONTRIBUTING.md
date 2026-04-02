# Contributing to Series and Movies Manager

First off, thank you for considering contributing to Series and Movies Manager! It's people like you that make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by a simple principle: **Be respectful and constructive**. By participating, you are expected to uphold this standard.

## Getting Started

- Make sure you have [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/) installed
- Fork the repository on GitHub
- Clone your fork locally
- Create a branch for your contribution

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (file content, CLI interactions, error messages)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, Node version, pnpm version)
- **Attach sample files** if relevant (remove sensitive data)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **A clear and descriptive title**
- **A detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Provide examples** of how it would work
- **Consider the scope**: Should it be a core feature or optional configuration?

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to documentation
- `enhancement` - New features or improvements

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/series-and-movies.git
   cd series-and-movies
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run tests**
   ```bash
   pnpm test
   ```

5. **Run linting**
   ```bash
   pnpm lint
   ```

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript** for all code
- **Explicit typing** - Avoid `any` unless absolutely necessary
- **Functional approach** - Prefer pure functions and immutability
- **Clear naming** - Use descriptive variable and function names
- **Error handling** - Always handle errors gracefully with proper error messages

### Code Style

- **Formatting** - Run `pnpm prettier:fix` before committing
- **Linting** - Run `pnpm lint:fix` to fix linting issues
- **No console.log** - Use `console.log` only for user-facing output, `console.error` for errors
- **Minimal comments** - Code should be self-documenting; add comments only for non-obvious logic
- **No empty lines inside functions** - Keep functions compact and readable
- **Avoid single-line functions** unless they're reused extensively

### File Organization

```
src/
├── main.ts           # Entry point/router
├── settings.ts       # Configuration
├── scripts/          # Script implementations (add, sync)
├── core/             # Core business logic
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── __tests__/        # Test files (colocated with source)
```

### Example Code Style

```typescript
export function extractName(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) {
    return '';
  }
  const lastOpenParen = trimmed.lastIndexOf('(');
  const lastCloseParen = trimmed.lastIndexOf(')');
  if (lastOpenParen === -1 || lastCloseParen === -1) {
    return trimmed;
  }
  return trimmed.substring(0, lastOpenParen).trim();
}
```

## Testing Guidelines

### Writing Tests

- **Test files** - Place in `__tests__` directories next to source files
- **Naming** - Use `.test.ts` suffix (e.g., `parseUtils.test.ts`)
- **Coverage** - Aim for high test coverage of business logic
- **Unit tests** - Test individual functions in isolation
- **Mock external dependencies** - Use Vitest mocks for file system operations
- **No over-mocking** - Don't mock the function being tested
- **Minimal assertions** - Test behavior, not implementation details

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { extractName, extractSeasons } from '../parseUtils';

describe('parseUtils', () => {
  describe('extractName', () => {
    it('should extract name before Hebrew parentheses', () => {
      const result = extractName('Black Mirror: 7 (מראה שחורה)');
      expect(result).toBe('Black Mirror');
    });

    it('should handle entries without parentheses', () => {
      const result = extractName('Breaking Bad');
      expect(result).toBe('Breaking Bad');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test parseUtils.test.ts
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```
feat(add): implement bulk addition workflow

Added ability to add multiple entries in a single session with
interactive "add more?" prompts and grouped summary display.

Closes #45
```

```
fix(sync): correct season overlap removal logic

Fixed bug where overlapping seasons were not properly removed
from lower priority sections when syncing series entries.

Fixes #78
```

## Pull Request Process

### Before Submitting

1. **Update tests** - Add/update tests for your changes
2. **Run the test suite** - `pnpm test`
3. **Run linting** - `pnpm lint:fix`
4. **Run formatting** - `pnpm prettier:fix`
5. **Update documentation** - If you changed functionality
6. **Test manually** - Run both `add` and `sync` scripts with your changes

### Submitting

1. **Push your branch** to your fork
2. **Open a Pull Request** against the `main` branch
3. **Fill in the PR template** with all relevant details
4. **Link related issues** using "Fixes #123" or "Closes #456"

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added/updated tests
- [ ] Tested manually with sample files
- [ ] Tested both add and sync scripts

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

- **Code review** - Maintainers will review your PR
- **Feedback** - Address any requested changes
- **Approval** - Once approved, your PR will be merged
- **Credit** - You'll be credited in the release notes!

## Development Tips

### Testing Locally

```bash
# Configure test files
# 1. Edit src/settings.ts and point to your test data files
# 2. Run the add script
pnpm run add

# Test sync script
pnpm run sync

# Check output in dist/ folder
ls -la dist/
```

### Debugging

```bash
# Run with debugging
node --inspect-brk node_modules/.bin/tsx src/main.ts add
```

### Working with Text Files

The tool expects text files with this structure:

```
TO SEE:
=======
Black Mirror: 7 (מראה שחורה)

SEEN:
=====
Dark: 1, 2, 3 (אפל)
```

Create sample test files to experiment with different scenarios.

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing!

## Recognition

Contributors will be recognized in:
- Release notes
- README.md (if significant contribution)
- GitHub contributors page

Thank you for making Series and Movies Manager better! 🎉

# Contributing to TTS CLI

Thank you for your interest in contributing to TTS CLI! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone git@github.com:YOUR_USERNAME/tts-cli.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes following our commit conventions
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Maintenance tasks
- `perf:` Performance improvements

Example: `feat: add support for custom voice profiles`

## 🧪 Testing

Before submitting a PR, ensure:

```bash
# Run tests
bun test

# Check code quality
bunx biome check src/

# Check types
bunx tsc --noEmit

# Run all pre-push checks
bun run test:coverage
```

## 🔄 Pull Request Process

1. **Branch Protection**: All changes must go through a pull request
2. **Automated Review**: Claude Code will automatically review your PR
3. **CI Checks**: All tests and quality checks must pass
4. **Code Review**: Wait for maintainer review and approval

## 🏗️ Development Workflow

```bash
# Install dependencies
bun install

# Run in development
bun run src/index.ts "test message"

# Build executable
bun run build

# Format code
bunx biome format --write src/
```

## 📦 Release Process

Releases are automated through GitHub Actions:

1. Update version in `package.json`
2. Commit and push to main (through PR)
3. GitHub Actions automatically:
   - Creates a new release
   - Builds executables for all platforms
   - Updates README download links

## 🐛 Reporting Issues

When reporting issues, please include:

- Your operating system and version
- Bun version (`bun --version`)
- Steps to reproduce the issue
- Expected vs actual behavior
- Any error messages or logs

## 💡 Feature Requests

We welcome feature requests! Please:

- Check existing issues first
- Provide clear use cases
- Explain the expected behavior
- Consider submitting a PR if you can implement it

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## 🤝 Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming and inclusive community.

## ❓ Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Start a discussion in the GitHub Discussions tab

Thank you for contributing to TTS CLI! 🎉
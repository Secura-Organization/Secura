# Contributing to Secura Vault

First off, thank you for considering contributing! 🎉  
We welcome contributions of any kind: bug fixes, new features, documentation improvements, UI enhancements, or security suggestions.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)  
- [How to Contribute](#how-to-contribute)  
  - [Reporting Issues](#reporting-issues)  
  - [Feature Requests](#feature-requests)  
  - [Pull Requests](#pull-requests)  
- [Development Setup](#development-setup)  
- [Coding Guidelines](#coding-guidelines)  
- [Commit Messages](#commit-messages)  

---

## Code of Conduct

All contributors are expected to follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/).  
Be respectful, collaborative, and professional in all interactions.

---

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists.  
2. Open a new issue with a descriptive title and detailed steps to reproduce.  
3. Include screenshots or logs if relevant.  

**Labels:** Use the appropriate label like `bug`, `enhancement`, or `documentation`.

---

### Feature Requests

To propose a new feature:

1. Open an issue with the `[Feature Request]` prefix.  
2. Describe the problem and why it’s important.  
3. Suggest a solution or approach if possible.  

---

### Pull Requests

We use Pull Requests (PRs) for all contributions.

1. **Fork the repository** and create a branch:

```bash
git checkout -b feature/my-new-feature
```
2. Make your changes and ensure they follow coding guidelines.
3. Run tests to make sure nothing is broken.
4. Commit your changes with a clear message:
```bash
git commit -m "feat: add new secret type handling"
```
5. Push your branch to your fork:
```bash
git push origin feature/my-new-feature
```
6. Open a PR against the main branch of this repository.

`PR Template: Please follow the included PR template to provide context and motivation.`

---

## Development Setup

### Prerequisites
- Node.js >= 18
- npm or yarn
- Electron-compatible OS

### Installation
```bash
git clone https://github.com/yourusername/secura.git
cd secura
npm install
```

### Running
```bash
npm run dev
```

### Building
```bash
npm run build
npm run package
```

---

## Coding Guidelines
- Language & Frameworks: TypeScript, React, Electron, TailwindCSS, Radix UI
- File Naming: PascalCase.tsx for components, camelCase.ts for utils
- Formatting: Prettier + ESLint enforced
- State Management: Use Zustand for app state
- IPC & Vault Calls: Always use window.vault.* or ipcRenderer.invoke via preload

---

## Commit Messages
We follow the [Conventional Commits](https://www.conventionalcommits.org/) style:

| Type     | Description                      |
| -------- | -------------------------------- |
| feat     | new feature                      |
| fix      | bug fix                          |
| docs     | documentation only               |
| style    | formatting, missing semi-colons  |
| refactor | code change without new features |
| test     | adding or updating tests         |
| chore    | build process, dependencies      |

Example:
```bash
feat: add password strength meter to AddSecretModal
```

---

Thank you for helping make Secura Vault better and more secure!

# XLang Contributing Guide

Hi! Thanks for your interest in contributing to XLang. Before submitting a contribution, please take a moment to read through the following guidelines.

- [Code of Conduct](#code-of-conduct)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Code of Conduct

Be respectful. Disagreements about design and implementation are welcome — personal attacks are not.

## Issue Reporting Guidelines

- Search existing issues before opening a new one.
- For bugs, include a minimal `.html` reproduction — a small file with the interpreter imported and the smallest XLang snippet that shows the problem. "It doesn't work" without a reproduction will likely be closed.
- For feature requests, explain the use case, not just the tag you want. If it changes the language's syntax or behavior, open the issue first — don't start with a PR. Syntax changes affect everyone using XLang, so they're worth discussing before any code is written.

## Pull Request Guidelines

- PRs are made directly against `main`. There's no separate `dev` branch — for a project this size, an extra branch just adds sync overhead without a real benefit yet. If you're unsure whether your idea fits, open a discussion issue first.
- Small changes (bug fixes, documentation, examples) can go straight to a PR.
- Changes to language syntax or parsing (a new tag, a change in how an existing tag behaves) should have an approved issue first. This avoids wasted work if the direction turns out to be different from what's needed.
- Keep PRs focused — one fix or one feature per PR. Multiple small commits are fine; they don't need to be squashed manually.
- Describe what changed and why in the PR description. If it's a bug fix, link the issue.

### Manual testing

There's no automated test suite yet, so testing is manual. This is a known limitation — contributions to help set up a test runner are very welcome!

- Open the changed or added `.html` example directly in a browser.
- Confirm the XLang code runs and produces the expected output, with no errors in the console.
- If you touched the interpreter itself, re-run every example under `examples/` to make sure nothing else broke — the interpreter is small enough that this is fast today, but this step will move to automated tests as the test suite grows.

## Development Setup

XLang has no build step and no dependencies to install. Clone the repo and open any `.html` file directly in a browser, or serve the folder with any static file server if you need `fetch`-based imports (`<from xlang import ... />`) to work — some browsers restrict `fetch` on `file://` URLs. If you have ideas for a better dev server or automation setup, contributions are welcome.

```
$ git clone https://github.com/adilson889/Xlang.git
$ cd Xlang
$ npx serve .   # or any other static file server, e.g. python -m http.server
```

## Project Structure

- **`xlang-interpreter.js`**: the interpreter itself — parsing, scopes, expression evaluation, tag execution.
- **`xlang-bootstrap.js`**: resolves and loads modules referenced by `<from xlang import ... />`.
- **`xlang-modules.json`**: registry mapping module names (`math`, etc.) to their script URL. Add an entry here when introducing a new built-in module.
- **`docs/`**: the free, public documentation (`api.md`, `tags.md`). Keep these in sync with the interpreter's current syntax — outdated docs are worse than no docs.
- **`examples/`**: small, complete `.html`-adjacent `.md` walkthroughs (calculator, task list, login, classes) used both as documentation and as manual test cases.
- **`modules/`**: built-in modules that register functions via `XLangRegistry` (e.g. `xlang-math.js`).
- **`img/`**: static assets (logo, screenshots).

## Credits

Thank you to everyone who contributes to XLang.

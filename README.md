# XLang

**Programming using HTML tags themselves.**

<p align="center">
  <img src="https://raw.githubusercontent.com/adilson889/Xlang/main/img/xlang.jpg" alt="XLang" width="400" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.2-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/status-active-brightgreen" alt="Status" />
  <img src="https://img.shields.io/badge/no_build-required-orange" alt="No Build" />
</p>

---

## Introduction

The web was built on HTML — a language meant to describe content. Over time, making that content interactive required learning JavaScript, frameworks, build tools, and an ever-growing list of abstractions.

XLang brings programming back to HTML itself. With XLang, you write logic using simple, readable tags that live alongside your markup. No JavaScript required. No build step. No compiler.

---

## What is XLang?

XLang is a programming language whose syntax is HTML tags themselves — logic and markup share the same document, the same rules, the same mental model.

**Philosophy: start from what already exists in HTML.**

HTML already has structure, nesting, attributes, and a parser every browser understands. Instead of inventing a new syntax on top of it, XLang builds directly on that foundation — a `<var>` tag behaves the way you'd expect an HTML tag to behave, a `<for>` tag nests the way `<div>` nests. Nothing about it should feel foreign to someone who already writes HTML.

---

## Security

XLang is designed to run untrusted-looking content — user input rendered through `{variable}` — without becoming an XSS vector. A short summary of the protections built into the interpreter:

- **Automatic escaping** — every `{variable}` interpolation is HTML-escaped before rendering; injected `<script>` renders as visible text, never executes.
- **Tag whitelist in `<print>`** — only semantic/formatting tags are allowed (`b`, `p`, `table`, `h1`-`h6`, etc.); dangerous tags like `script`, `iframe`, `img`, `a`, `object` are stripped.
- **Attribute whitelist** — only safe attributes pass through (`class`, `style`, `title`, `lang`, ...); all `on*` handlers, `href`, `src`, and `style` with `url()`/`expression()` are removed.
- **Inert sanitization** — HTML is cleaned inside a `<template>` element, which never executes scripts or loads resources before sanitization runs.
- **`textContent` for DOM binding** — non-input bindings write with `textContent`, never `innerHTML`.
- **Sandboxed expressions** — no access to `window`, `document`, or `globalThis`; only declared identifiers and a strict character whitelist are allowed; unknown functions error out.
- **No dynamic `eval`** — expressions run through a controlled `Function` call with sanitized, whitelisted input, never arbitrary code.
- **Escaped error messages** — even error output inside `<print>` is escaped before rendering.
- **No browser API exposure** — no `fetch`, `localStorage`, `document.cookie`, or similar; only what the language explicitly defines.

For the full technical breakdown of each protection, see the security section of the documentation.

---

## Why Use XLang?

- **HTML you already know** — no new syntax to learn
- **Zero build step** — works directly in the browser
- **Tags for logic** — variables, functions, loops, classes
- **Safe by default** — output is sanitized, variables are escaped
- **Lightweight** — one file, no dependencies
- **Reactive** — lists, tables, and inputs update automatically

---

## How to Use

1. Import the interpreter via CDN.
2. Write your program using XLang tags.
3. Open the `.html` file in a browser.

For the complete technical reference — all tags, OOP, arrays, security, and real-world use cases — read the full documentation.

**[Read the full documentation](https://github.com/adilson889/Xlang/tree/main/docs)**

---

## Community

Join the XLang community — ask questions, share projects, and learn together.

- **[GitHub Discussions](https://github.com/adilson889/Xlang/discussions)**
- **[WhatsApp Group](https://chat.whatsapp.com/IYKUFRfOg8O4HpYHavYg3u)**
- **[Google Chat](https://chat.google.com/room/AAQALZSWrOg?cls=5)**

---

## License

*(See the LICENSE file)*

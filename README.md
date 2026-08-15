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

## What is XLang?

<p align="center">
  <img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" alt="Code" width="500" />
</p>

No new syntax to learn, no external compiler, no build step. If you already know HTML, you already know 90% of XLang — the rest is just a handful of new tags that behave exactly as you would expect.

Runs directly in the browser. No npm, no bundler, no transpilation. It's HTML — and HTML is already your interface.

---

## Quick Example

```html
<script type="text/xlang">
  <program>
    <var name="a" value="5" />
    <var name="b" value="3" />
    <print>Sum: {a + b}</print>
  </program>
</script>
```

---

## Why XLang?

<p align="center">
  <img src="https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif" alt="Simple" width="500" />
</p>

Most languages separate "what you see" from "what runs". XLang does not separate them — the `<program>` lives inside the page itself, reads and writes directly to the elements that are already there (`id`, `<input>`, `<div>`), with no translation layer in between.

---

## Get Started

<p align="center">
  <img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" alt="Get Started" width="500" />
</p>

### 1. Import the interpreter

```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
```

### 2. Write your program

```html
<script type="text/xlang">
  <program>
    <var name="name" value="'World'" />
    <print>Hello, {name}!</print>
  </program>
</script>
```

### 3. Open the .html file in a browser. Done.

---

## Complete Guide

The README covers the essentials to get started. For the complete technical reference — all tags, OOP in detail, arrays, real-world use cases, best practices — check the complete guide.

**[github.com/adilson889/Xlang/tree/main/examples](https://github.com/adilson889/Xlang/tree/main/examples)**

---

## Feedback

**[adilsonrafael847@gmail.com](mailto:adilsonrafael847@gmail.com)**

---

## License

*(See the LICENSE file)*

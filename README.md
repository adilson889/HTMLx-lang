
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

<table>
  <tr>
    <td width="60%">
      <p>No new syntax to learn, no external compiler, no build step. If you already know HTML, you already know 90% of XLang — the rest is just a handful of new tags that behave exactly as you would expect.</p>
      <p>Runs directly in the browser. No npm, no bundler, no transpilation. It's HTML — and HTML is already your interface.</p>
    </td>
    <td width="40%">
      <img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" alt="Code" width="100%" />
    </td>
  </tr>
</table>

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

<table>
  <tr>
    <td width="40%">
      <img src="https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif" alt="Simple" width="100%" />
    </td>
    <td width="60%">
      <p>Most languages separate "what you see" from "what runs". XLang does not separate them — the <code>&lt;program&gt;</code> lives inside the page itself, reads and writes directly to the elements that are already there (<code>id</code>, <code>&lt;input&gt;</code>, <code>&lt;div&gt;</code>), with no translation layer in between.</p>
    </td>
  </tr>
</table>

---

## Get Started

<table>
  <tr>
    <td width="60%">
      <h3>1. Import the interpreter</h3>
      <pre><code>&lt;script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"&gt;&lt;/script&gt;</code></pre>
      <h3>2. Write your program</h3>
      <pre><code>&lt;script type="text/xlang"&gt;
  &lt;program&gt;
    &lt;var name="name" value="'World'" /&gt;
    &lt;print&gt;Hello, {name}!&lt;/print&gt;
  &lt;/program&gt;
&lt;/script&gt;</code></pre>
      <h3>3. Open the .html file in a browser. Done.</h3>
    </td>
    <td width="40%">
      <img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" alt="Get Started" width="100%" />
    </td>
  </tr>
</table>

---

## Complete Guide

The README covers the essentials to get started. For the complete technical reference — all tags, OOP in detail, arrays, real-world use cases, best practices — check the complete guide.


**[Read the complete guide](https://github.com/adilson889/Xlang/tree/main/examples)**
---

## Feedback

*https://adilsonrafael847@gmail.com*

---

## License

*(See the LICENSE file)*
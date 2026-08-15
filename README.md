<div align="center">

# &lt;XLang/&gt;

### Programming using HTML tags themselves.

<img src="https://raw.githubusercontent.com/adilson889/Xlang/main/img/xlang.jpg" alt="XLang" width="360" />

<br>

![Version](https://img.shields.io/badge/version-0.1.0-ff8a5c?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-7ec9a3?style=flat-square)
![Status](https://img.shields.io/badge/status-active-brightgreen?style=flat-square)
![No Build](https://img.shields.io/badge/no_build-required-e8c88a?style=flat-square)

</div>

<br>

```html
<program>
  <var name="you" value="'developer'" />
  <print>Hello, {you}</print>
</program>
```

<br>

## What is XLang?

No new syntax to learn, no external compiler, no build step. If you already know HTML, you already know 90% of XLang — the rest is just a handful of new tags that behave exactly as you'd expect.

It runs directly in the browser. No npm, no bundler, no transpilation. It's HTML — and HTML is already your interface.

<br>

## Quick example

```html
<script type="text/xlang">
  <program>
    <var name="a" value="5" />
    <var name="b" value="3" />
    <print>Sum: {a + b}</print>
  </program>
</script>
```

```
console > Sum: 8
```

<br>

## Why XLang?

Most languages separate *what you see* from *what runs*. XLang doesn't.

The `<program>` lives inside the page itself — it reads and writes straight to the elements already sitting there: an `id`, an `<input>`, a `<div>`. There's no translation layer between your markup and your logic, because they were never two separate things to begin with.

```html
<on event="click" target="btn" call="greet" />
```

That single tag wires a real DOM element to real XLang logic. No `addEventListener`, no build step — just a tag that says what it does.

<br>

## Get started

**1. Import the interpreter**

```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
```

**2. Write your program**

```html
<script type="text/xlang">
  <program>
    <var name="name" value="'World'" />
    <print>Hello, {name}!</print>
  </program>
</script>
```

**3. Open the `.html` file in a browser. Done.**

<br>

## Complete guide

This README covers the essentials to get started. For the complete technical reference — every tag, OOP in detail, arrays, real-world use cases, best practices — check the complete guide:

**[github.com/adilson889/Xlang/tree/main/examples](https://github.com/adilson889/Xlang/tree/main/examples)**

<br>

## Feedback

**[adilsonrafael847@gmail.com](mailto:adilsonrafael847@gmail.com)**

<br>

## License

See the [LICENSE](./LICENSE) file.

<div align="center">

<br>

`</XLang>`

</div>

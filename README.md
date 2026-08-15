
# XLang

**Programming using HTML tags themselves.**

<p align="center">
  <img src="https://raw.githubusercontent.com/adilson889/Xlang/main/img/xlang.jpg" alt="XLang" width="400" />
</p>

No new syntax to learn, no external compiler, no build step. If you already know HTML, you already know 90% of XLang — the rest is just a handful of new tags (`<var>`, `<if>`, `<loop>`, `<fun>`...) that behave exactly as you would expect.

```html
<script type="text/xlang">
  <program>
    <var name="a" value="5" />
    <var name="b" value="3" />
    <print>Sum: {a + b}</print>
  </program>
</script>
```

Runs directly in the browser. No npm, no bundler, no transpilation. It's HTML — and HTML is already your interface.

---

## Why XLang

Most languages separate "what you see" from "what runs". XLang does not separate them — the `<program>` lives inside the page itself, reads and writes directly to the elements that are already there (`id`, `<input>`, `<div>`), with no translation layer in between.

```html
<input type="number" id="age" />
<div id="result"></div>

<script type="text/xlang">
  <program>
    <val name="age" value="<input type='number' />" />
    <print id="result"> You are {age} years old </print>
  </program>
</script>
```

---

## Get Started

1. Import the interpreter:
```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
```

2. Write your program inside `<script type="text/xlang">`:
```html
<script type="text/xlang">
  <program>
    <var name="name" value="'World'" />
    <print>Hello, {name}!</print>
  </program>
</script>
```

3. Open the `.html` file in a browser. Done.

---

## Complete Guide

The README covers the essentials to get started. For the complete technical reference — all tags, OOP in detail, arrays, real-world use cases, best practices — check the complete guide.

 **[https://github.com/adilson889/Xlang/tree/main/examples]**
---
## Feedback 
**[https://adilsonrafael847@gmail.com]**
---

## License

*(See the LICENSE file)*
```
# Installation

HTMLx-lang has no build step. There's nothing to `npm install`, nothing to
compile. You just load one script, and `<script type="text/xlang">` blocks
on your page start working.

## Option 1 — Load from a CDN (fastest way to start)

Add this inside your `<head>`, before anything that uses `text/xlang`:

```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
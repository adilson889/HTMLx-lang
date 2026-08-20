
# Introduction

Welcome! This guide teaches you HTMLx-lang from zero, as if we were sitting
together going through it step by step. By the end, you'll understand not
just the syntax, but *why* it works the way it does.

## What is HTMLx-lang, really?

Here's the core idea: normally, HTML is just structure (what's on the page)
and JavaScript is logic (what happens on the page). HTMLx-lang collapses that
separation — your logic is *written as HTML tags*. A variable isn't
`let x = 10`, it's `<var name="x" value="10">`.

Why would you want that? Because it means your logic lives right next to
your markup, reads top-to-bottom like a story, and — since it's just tags —
anyone who knows HTML can read it, even without knowing JavaScript.

The way you tell the browser "this part is HTMLx-lang, not plain HTML" is a
single container:

```html
<div data-xlang>
    <!-- everything in here is HTMLx-lang code -->
</div>
```

That's it. No <script> tag, no special file extension. Just a <div>
with the data-xlang attribute. When the page loads, the interpreter finds
every <div data-xlang> on the page, reads what's inside, runs it, and
replaces the div with whatever output your code produced.

One rule to always keep in mind: every HTMLx-lang tag closes explicitly.
Even if a tag looks empty, you still write </var>, </print>, </if>.
This isn't optional the way it sometimes is in plain HTML — the interpreter
depends on seeing that closing tag to know where a block ends.

```html
<div data-xlang>
    <var name="x" value="10"></var>
    <print>Hello {x}</print>
</div>
```

Run this, and the whole <div data-xlang>...</div> block gets replaced by
a new element containing "Hello 10".

What you'll need

· Any text editor
· A browser to open your .html file in
· No build step, no npm install, no compiler — HTMLx-lang runs directly in the
  browser once the interpreter script is loaded (see Installation)

Where to go next

· Installation — get xlang-interpreter.js loaded on your page
· First Program — write and run your very first <div data-xlang> block
· Project Structure — how to organize files as your project grows
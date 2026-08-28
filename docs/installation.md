
# Installation

HTMLx-lang has no build step. There's nothing to `npm install`, nothing to
compile. You just load one script, and `<script type="text/xlang">` blocks
on your page start working.

## Option 1 — Load from a CDN (fastest way to start)

Add this inside your `<head>`, before anything that uses `text/xlang`:

```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
```

This always pulls whatever is currently on the main branch of the
repository. It's the quickest way to try HTMLx-lang, but keep in mind: since
main can change, a CDN cache might occasionally serve a slightly older
copy for a few hours. For anything you're actively developing, that's
rarely a problem — but see the note on pinning a version below if you want
full control.

## Option 2 — Download and host it yourself

If you'd rather not depend on an external CDN (for production sites, or if
you want to be 100% sure which version is running):

1. Download `xlang-interpreter.js` from the repository
2. Put it in the same folder as your HTML file (or a `js/` subfolder)
3. Reference it locally:

```html
<script src="xlang-interpreter.js"></script>
```

or, if it's in a subfolder:

```html
<script src="js/xlang-interpreter.js"></script>
```

## Pinning an exact version (recommended for production)

Instead of `@main` (which can change over time), you can point at an exact
commit so the file you load never changes underneath you:

```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@<commit-hash>/xlang-interpreter.js"></script>
```

Grab the short commit hash (7 characters is enough) from the repository's
commit history whenever you want to lock in a specific, known-working
version.

## Verifying it's working

Once the script tag is in place, add a minimal test block anywhere in your
`<body>`:

```html
<script type="text/xlang">
    <program>
        <print>HTMLx-lang is working!</print>
    </program>
</script>
```

Open the page in a browser. If you see the text "HTMLx-lang is working!"
appear where the script block was processed, you're set up correctly.

## Next step

Head to **First Program** to write something a little more interesting
than a static print statement.
```
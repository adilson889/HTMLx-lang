
# Security Policy

## Supported Versions

HTMLx-lang is under active development. Security fixes are made against the latest version on `main`; there is no support for older tagged versions.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or the community chat.** A public report before a fix is available gives potential attackers a head start.

Instead, report it privately by email:

**adilsonrafael847@gmail.com**

Include, as far as you're able to:

- A description of the vulnerability and its potential impact
- Steps to reproduce it — a minimal `.html` example is ideal, the same as a bug report
- Which part of the interpreter is affected (expression evaluation, `<print>` sanitization, DOM binding, etc.), if known

You should expect an initial response within a few days. Once a fix is ready, it will be released and credited to you in the release notes, unless you'd prefer to remain anonymous — just let us know in your report.

## Scope

Relevant reports include (but aren't limited to):

- Ways to bypass the `<print>` tag/attribute whitelist or the interpolation escaping
- Ways to execute arbitrary JavaScript from HTMLx-lang expressions or tag attributes
- Ways to break out of the expression sandbox (accessing `window`, `document`, `globalThis`, or anything not explicitly exposed to HTMLx-lang)
- Prototype pollution or similar issues in the array/object handling

Out of scope: issues that require the page author to intentionally write unsafe code (e.g. manually passing `innerHTML` of untrusted content into the DOM outside of HTMLx-lang's own tags) — HTMLx-lang can't protect against unsafe use of plain HTML/JS around it.
```
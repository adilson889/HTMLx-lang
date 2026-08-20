
# Project Structure

HTMLx-lang doesn't force any particular folder layout — since there's no build
step, "project structure" really just means "how you organize your own
HTML and JS files." Here's a layout that works well as a project grows
past a single page.

## A small project

For a single-page tool or demo, everything can live in one file:

```

my-project/
└── index.html          (HTML + <div data-xlang> blocks + the <script src>)

```

This is exactly what the examples in **First Program** look like — totally
fine for something small.

## A multi-page project

Once you have more than one page, it's worth pulling the interpreter out
so every page references the same copy instead of duplicating logic:

```

my-project/
├── xlang-interpreter.js   (downloaded once, shared by every page)
├── index.html
├── login.html
├── dashboard.html
└── style.css              (optional, plain CSS shared across pages)

```

Every HTML page references the interpreter the same way:

```html
<script src="xlang-interpreter.js"></script>
```

Because the path is relative, this only works cleanly if all your HTML
files sit in the same folder as xlang-interpreter.js (or you adjust the
path — e.g. ../xlang-interpreter.js if the script lives one level up).

Organizing by feature (larger projects)

If a project keeps growing, group related HTML pages into folders, but
keep the interpreter itself at the root so the relative path stays short
and consistent:

```
my-project/
├── xlang-interpreter.js
├── index.html
├── auth/
│   ├── login.html
│   └── register.html
├── dashboard/
│   ├── home.html
│   └── settings.html
└── shared/
    └── style.css
```

From auth/login.html, you'd reference the interpreter one level up:

```html
<script src="../xlang-interpreter.js"></script>
```

What HTMLx-lang doesn't need

Because there's no compilation step, you won't find (and don't need):

· a node_modules/ folder
· a dist/ or build/ output folder
· a bundler config file

Whatever you write in your <div data-xlang> blocks is exactly what runs
in the browser — there's no intermediate build artifact to keep track of.

Next step

With the basics and structure covered, head into the language itself
starting with Variables.

```
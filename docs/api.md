
# HTMLx-lang API Reference

## Core Interpreter

### `new XLangInterpreter(outputDiv)`
Creates a new interpreter instance.

### `interpreter.run(code)`
Executes HTMLx-lang code. Returns a Promise.

### `interpreter.callFunction(name, args, scope)`
Calls a public function.

### `interpreter.instantiate(className, args)`
Creates a class instance.

## Global Objects

### `window.XLang`
Bridge for HTML/JS to call HTMLx-lang functions.

```javascript
XLang.call('functionName', arg1, arg2)
```

### `window.XLangRegistry`
Registry for modules to register functions.

```javascript
XLangRegistry.register('name', fn)
XLangRegistry.has('name')
XLangRegistry.get('name')
```

### `window.XLangBootstrap`
Resolves and loads modules.

```javascript
XLangBootstrap.resolve(from, name)
XLangBootstrap.setModulesJsonUrl(url)
```

## Root Structure

HTMLx-lang code lives inside `<script type="text/xlang"><program>`. The interpreter reads the block, executes it, and replaces it with the result in the DOM.

```html
<script type="text/xlang">
<program>
    <var name="x" value="10"></var>
    <print>Ola {x}</print>
</program>
</script>
```

All HTMLx-lang tags close explicitly — `</var>`, `</print>`, `</if>`, and so on.

## Tags

### Variables

- `<var name="x" value="5"></var>` — mutable
- `<val name="x" value="5"></val>` — immutable
- `<set name="x" value="10"></set>` — update an existing variable

### Binding to HTML — `<bind>`

HTML holds the elements; HTMLx-lang binds to them. Two-way for form elements (`.value`), read/write for text elements (`.textContent`).

```html
<input id="nome" type="text" />

<script type="text/xlang">
<program>
    <bind target="nome" as="nome"></bind>
    <print>Ola, {nome}!</print>
</program>
</script>
```

| Element | Bound via |
|---|---|
| `<input>`, `<textarea>`, `<select>` | `.value` |
| `<div>`, `<span>`, `<p>`, etc. | `.textContent` |

### Reactive lists and tables

Bind an array directly to a container element — it re-renders automatically as the array changes.

```html
<ul id="lista"></ul>

<script type="text/xlang">
<program>
    <array name="frutas" value="['Maca', 'Banana']"></array>
    <bind target="lista" source="frutas"></bind>
</program>
</script>
```

| Container | Renders as |
|---|---|
| `<ul>` / `<ol>` | each item becomes an `<li>` |
| `<table>` | each item becomes a `<tr>`; objects become one `<td>` per field |
| anything else | each item becomes a `<span>` |

`<thead>` is generated automatically for tables bound to arrays of objects.

### Output

- `<print>Text {var}</print>`
- `<print id="target">Text</print>`

`{variable}` interpolation inside `<print>` is escaped automatically, and any raw HTML in the output passes through a tag/attribute whitelist — see the Security section of the full documentation for details.

### Control Flow

- `<if condition="x > 5">`
- `<elseif condition="x > 3">`
- `<else>`
- `<switch value="x">`
- `<case value="1">`
- `<default>`

### Loops

- `<loop>`
- `<for var="i" from="0" to="10" step="1">`
- `<foreach var="item" in="array">`
- `<break></break>`
- `<continue></continue>`

### Functions

- `<fun name="name" params="a, b">`
- `<private fun name="name" params="a">`
- `<override fun name="name" params="a">`
- `<return value="expr"></return>`
- `<call name="fn" args="1, 2"></call>`
- `<call target="obj" name="method" args="1"></call>`

### Arrays

- `<array name="arr" value="[1, 2, 3]"></array>`
- `<push name="arr" value="4"></push>`
- `<pop name="arr"></pop>`
- `<shift name="arr"></shift>`
- `<unshift name="arr" value="0"></unshift>`
- `<indexOf name="idx" target="arr" value="2"></indexOf>`
- `<remove name="arr" index="1"></remove>`
- `<length name="len" target="arr"></length>`

### Classes

- `<class name="ClassName" extends="ParentClass">`
- `<init params="a, b">`
- `<super args="a, b"></super>`
- `<var name="field" value="default"></var>` — instance field

Instantiate with `<new class='ClassName' args='arg1, arg2'>`:

```html
<script type="text/xlang">
<program>
    <var name="p" value="<new class='Pessoa' args='Ana, 30'"></var>
    <print>{p.cumprimentar()}</print>
</program>
</script>
```

### DOM

- `<on event="click" target="id" call="fn"></on>`
- `<show target="id"></show>`
- `<hide target="id"></hide>`
- `<add-class target="id" class="name"></add-class>`
- `<remove-class target="id" class="name"></remove-class>`
- `<toggle-class target="id" class="name"></toggle-class>`
- `<set-style target="id" property="css" value="val"></set-style>`

### Storage

- `<storage-set key="name" value="'Ana'"></storage-set>` — save a value to localStorage
- `<storage-get key="name" as="savedName"></storage-get>` — load a value from localStorage
- `<storage-get key="theme" as="theme" default="'light'"></storage-get>` — load a value, or use a default if missing
- `<storage-remove key="name"></storage-remove>` — remove one key
- `<storage-clear></storage-clear>` — remove all HTMLx-lang keys

**Storage notes:**

- Keys are automatically prefixed with `htmlx:` internally.
- Values are stored and retrieved with JSON serialization.
- `storage-clear` only removes keys created by HTMLx-lang.
- `key` accepts dynamic expressions, for example `key="'user_' + userId"`.

### Calling HTMLx-lang from plain HTML/JS

```html
<button onclick="XLang.call('incrementar')">+1</button>
```

Calls a public function (`<fun>`, not `<private fun>`) from outside the interpreter.

### Error Handling

- `<try>`
- `<catch>` — the caught error is available as `{error}`

```html
<script type="text/xlang">
<program>
    <try>
        <var name="resultado" value="10 / valorInvalido"></var>
    </try>
    <catch>
        <print>Algo correu mal: {error}</print>
    </catch>
</program>
</script>
```

### Imports

- `<from xlang import math>` — single import
- `<from xlang import="math, validation, state">` — multiple imports at once
- `<import from="xlang" name="math"></import>`
- `<import modules="xlang.math"></import>`

## Native Functions

### String

- `upper(text)`
- `lower(text)`
- `trim(text)`
- `split(text, sep)`
- `replace(text, from, to)`
- `includes(text, part)`

### Math

- `round(num)`
- `floor(num)`
- `ceil(num)`
- `abs(num)`
- `random(min, max)`
```
**Perfeito!** API só do núcleo, sem libs!


# XLang API Reference

## Core Interpreter

### `new XLangInterpreter(outputDiv)`
Creates a new interpreter instance.

### `interpreter.run(code)`
Executes XLang code. Returns a Promise.

### `interpreter.callFunction(name, args, scope)`
Calls a public function.

### `interpreter.instantiate(className, args)`
Creates a class instance.

## Global Objects

### `window.XLang`
Bridge for HTML/JS to call XLang functions.

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

## Tags

### Variables
- `<var name="x" value="5" />`
- `<val name="x" value="5" />`
- `<set name="x" value="10" />`

### Output
- `<print>Text {var}</print>`
- `<print id="target">Text</print>`

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
- `<break />`
- `<continue />`

### Functions
- `<fun name="name" params="a, b">`
- `<private fun name="name" params="a">`
- `<override fun name="name" params="a">`
- `<return value="expr" />`
- `<call name="fn" args="1, 2" />`
- `<call target="obj" name="method" args="1" />`

### Arrays
- `<array name="arr" value="[1, 2, 3]" />`
- `<push name="arr" value="4" />`
- `<pop name="arr" />`
- `<shift name="arr" />`
- `<unshift name="arr" value="0" />`
- `<indexOf name="idx" target="arr" value="2" />`
- `<remove name="arr" index="1" />`
- `<length name="len" target="arr" />`

### Classes
- `<class name="ClassName" extends="ParentClass">`
- `<init params="a, b">`
- `<super args="a, b" />`
- `<var name="field" value="default" />`

### DOM
- `<on event="click" target="id" call="fn" />`
- `<show target="id" />`
- `<hide target="id" />`
- `<add-class target="id" class="name" />`
- `<remove-class target="id" class="name" />`
- `<toggle-class target="id" class="name" />`
- `<set-style target="id" property="css" value="val" />`

### Error Handling
- `<try>`
- `<catch>`

### Imports
- `<from xlang import math />`
- `<from xlang import="math, string" />`

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
# Functions

A function is a reusable block of code — you give it a name, define what it does once, and then call it as many times as you need.

## Declaring a function

```html
<script type="text/xlang">
<program>
    <fun name="greet">
        <print>Hello!</print>
    </fun>

    <call name="greet"></call>
</program>
</script>
```

`<fun>` defines the function. `<call>` runs it. This prints "Hello!" once.

## Functions with parameters

A parameter is an input — a value you pass in when you call the function.

```html
<script type="text/xlang">
<program>
    <fun name="greet" params="name">
        <print>Hello, {name}!</print>
    </fun>

    <call name="greet" args="'Alice'"></call>
    <call name="greet" args="'Bob'"></call>
</program>
</script>
```

`params="name"` says the function takes one input called name. `args="'Alice'"` passes the value 'Alice' when you call it.

Multiple parameters are separated by commas:

```html
<script type="text/xlang">
<program>
    <fun name="add" params="a, b">
        <var name="result" value="a + b"></var>
        <print>{result}</print>
    </fun>

    <call name="add" args="5, 3"></call>
</program>
</script>
```

This prints 8.

## Returning a value

`<return>` sends a value back out of the function, so the caller can use it:

```html
<script type="text/xlang">
<program>
    <fun name="add" params="a, b">
        <return value="a + b"></return>
    </fun>

    <var name="result" value="<call name='add' args='5, 3'></call>"></var>
    <print>{result}</print>
</program>
</script>
```

Notice the syntax: `<call ...></call>` wraps in the value attribute, not `<call ... />`. This works because `<call>` returns something.

## Private functions

By default, a function defined with `<fun>` can be called from outside HTMLx-lang (via `XLang.call()`). If you want a function to be internal only, use `<private fun>`:

```html
<script type="text/xlang">
<program>
    <private fun name="internal">
        <print>This can only be called from inside this program</print>
    </private>

    <fun name="public">
        <call name="internal"></call>
    </fun>
</program>
</script>
```

`internal` can only be called by `public` or other code inside the program.

## A complete example — a calculator

```html
<input id="a" type="number" placeholder="First number" />
<input id="b" type="number" placeholder="Second number" />
<button id="btnAdd">Add</button>
<button id="btnSubtract">Subtract</button>
<div id="result"></div>

<script type="text/xlang">
<program>
    <bind target="a" as="numA"></bind>
    <bind target="b" as="numB"></bind>

    <fun name="add">
        <var name="sum" value="numA + numB"></var>
        <print id="result">{sum}</print>
    </fun>

    <fun name="subtract">
        <var name="diff" value="numA - numB"></var>
        <print id="result">{diff}</print>
    </fun>

    <on event="click" target="btnAdd" call="add"></on>
    <on event="click" target="btnSubtract" call="subtract"></on>
</program>
</script>
```

Each button calls a different function. Both functions read from the same bound inputs.

## Overriding functions

If you need to override (replace) a function from an imported module, use `<override fun>`:

```html
<script type="text/xlang">
<program>
    <import name="xlang.math"></import>

    <override fun name="round" params="num">
        <return value="num * 2"></return>
    </override>
</program>
</script>
```

This replaces the round function from the imported module with your own version.

## Summary

- `<fun name="..." params="...">` — define a function
- `<private fun>` — a function only callable from inside the program
- `<call name="..." args="...">` — run a function
- `<return value="...">` — send a value back from a function
- `<override fun>` — replace an imported function with your own

Next step

Head to **Classes** to organize code into objects with their own methods and state.

# Functions

A function is a named block of code you can run whenever you need it,
optionally feeding it different values each time. This is how you avoid
repeating the same logic in multiple places.

## Declaring a function

```html
<fun name="add" params="a, b">
    <return value="a + b"></return>
</fun>
```

`params="a, b"` defines what inputs the function expects. `<return>` sends
a value back out and immediately exits the function — any code after it in
the same block never runs.

## Calling a function

There are two styles — pick whichever fits the context:

```html
<print>{add(5, 3)}</print>

<call name="add" args="5, 3"></call>
```

Use the first style when you want the function's *return value* used
somewhere (like inside a `<print>`). Use `<call>` when you just want the
function to run for its side effects, and you don't need the result — for
example, a function that updates the page but doesn't return anything
useful.

## Modifiers

Sometimes you want a function that can *only* be called from inside its
own class (`private`), or you want to replace a function that already
exists with a new version (`override`):

```html
<private fun name="_helper" params="x">
    <return value="x * 2"></return>
</private>

<override fun name="add" params="a, b">
    <return value="a + b + 1"></return>
</override>
```

`<private fun>` becomes relevant mainly in the context of classes (helper
methods only the class itself should call). `<override>` replaces an
existing function of the same name — useful when a class needs to redefine
behavior it inherited.

## Recursion

Functions can call themselves — this is how you solve problems that break
down into smaller versions of themselves:

```html
<fun name="fib" params="n">
    <if condition="n <= 1">
        <return value="n"></return>
    </if>
    <return value="fib(n - 1) + fib(n - 2)"></return>
</fun>
```

Each call to `fib` either returns immediately (the *base case*, when
`n <= 1`) or calls `fib` again with smaller values, until it eventually
hits that base case.

## A practical example

Combining a function with a click event (see **DOM Manipulation** for more
on `<on>`):

```html
<button id="btnCalc">Calculate</button>
<div id="result"></div>

<div data-xlang>
    <fun name="calculate">
        <print id="result">Result: {add(5, 3)}</print>
    </fun>

    <fun name="add" params="a, b">
        <return value="a + b"></return>
    </fun>

    <on event="click" target="btnCalc" call="calculate"></on>
</div>
```

Clicking the button runs `calculate`, which itself calls `add` and prints
the result into `#result`.

## Next step

Head to **Arrays** to work with ordered collections of values.

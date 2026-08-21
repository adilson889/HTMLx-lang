
# Timers

The timers child adds two new tags to HTMLx-lang:

- `<after>` — run a function once after a delay
- `<every>` — run a function repeatedly at an interval

These are equivalent to `setTimeout` and `setInterval` in JavaScript, but
written as HTMLx-lang tags.

---

## Loading

Timers are a child, not a library.

Children are loaded automatically with the interpreter. You do not need to
use `<import>`.

---

## `<after>`

Runs a function once after a delay.

### Syntax

```html
<after ms="2000" call="mostrar"></after>
```

Attributes

Attribute Required Description
ms Yes Delay in milliseconds
call Yes Function name to run

Example

```html
<div data-xlang>
    <fun name="mostrar">
        <print id="msg">Executado!</print>
    </fun>

    <after ms="3000" call="mostrar"></after>
</div>
```

After 3 seconds, the function mostrar runs.

---

<every>

Runs a function repeatedly at an interval.

Syntax

```html
<every ms="1000" call="incrementar"></every>
```

Attributes

Attribute Required Description
ms Yes Interval in milliseconds
call Yes Function name to run

Example

```html
<div data-xlang>
    <var name="contador" value="0"></var>

    <fun name="incrementar">
        <set name="contador" value="contador + 1"></set>
        <print id="resultado">Contador: {contador}</print>
    </fun>

    <every ms="1000" call="incrementar"></every>
</div>
```

The counter increments every second.

---

Notes

· Both tags close explicitly: <after ...></after>, <every ...></every>

· The interval starts immediately when the page loads
· To control the interval, use a variable and a condition inside the function
· Errors inside the called function are logged to the console

---

Summary

· <after> — setTimeout

· <every> — setInterval
· Both use ms and call
· Both are children, loaded automatically
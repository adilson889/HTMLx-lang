
# Variables

Think of a variable as a labeled box. You put a value in it, give it a
name, and later you can read it back — or, if you used the right tag,
change what's inside.

HTMLx-lang gives you three tools for this, and picking the right one matters:

| Tag     | Can it change later? | Example |
|---------|----------------------|---------|
| `<var>` | Yes                  | `<var name="counter" value="0"></var>` |
| `<val>` | No — it's a constant | `<val name="pi" value="3.14"></val>` |
| `<set>` | Changes an existing `<var>` | `<set name="counter" value="20"></set>` |

## `<var>` — a value that can change

```html
<var name="x" value="10"></var>
<set name="x" value="20"></set>
```

After this runs, x holds 20. <set> doesn't redeclare the variable —
it just updates the box that already exists.

<val> — a value that never changes

Use <val> whenever a value shouldn't change — it protects you from
accidentally overwriting something important:

```html
<val name="pi" value="3.14"></val>
```

If you try to <set> a <val>, HTMLx-lang stops you with an error. That's a
feature, not an annoyance: it catches bugs before they happen, like
accidentally resetting a constant somewhere deep in a function.

Connecting to HTML — <bind>

Here's a very common situation: you have a real <input> on the page, and
you want your HTMLx-lang code to read what the user typed, or write into a
<div> to show a result. <bind> is the bridge that connects an HTMLx-lang
variable to a real HTML element.

Think of it as plugging a wire into the DOM: once bound, reading the
variable reads the live value from that element, and writing to the
variable updates the element directly.

Binding to an input

```html
<input id="name" type="text" />

<div data-xlang>
    <bind target="name" as="name"></bind>
    <print>Hello, {name}!</print>
</div>
```

target="name" says "find the HTML element with id name." as="name"
says "and from now on, I'll refer to it inside HTMLx-lang as name." (You could
give it a different HTMLx-lang-side name if you wanted — as="userName", for
example — but keeping them the same is usually clearest.)

Binding to a text element

Inputs aren't the only thing you can bind. A <div>, <span>, or <p>
works too — the difference is where the value lives:

```html
<div id="status">Waiting</div>

<div data-xlang>
    <bind target="status" as="status"></bind>

    <fun name="markReady">
        <set name="status" value="'Ready!'"></set>
    </fun>
</div>
```

The rule for which property gets read/written:

Element type Reads/writes via
<input>, <textarea>, <select> .value
<div>, <span>, <p>, etc. .textContent

You don't need to remember this consciously while writing code — <bind>
figures it out automatically based on the tag. Just know it's happening
under the hood.

Next step

Now that you can store and connect values, move on to Control Flow to
start making decisions based on them.

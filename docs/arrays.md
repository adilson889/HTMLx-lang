# Arrays

An array holds a list of values in order, and you can add to it, remove
from it, or inspect it, using a small set of dedicated tags.

## Declaring an array

```html
<array name="fruits" value="['Apple', 'Banana', 'Orange']"></array>
<print>{fruits[0]}</print>
```

`fruits[0]` reads the first item — arrays start counting at 0, so `[0]` is
"Apple," `[1]` is "Banana," and so on.

## The array API

| Tag | What it does |
|-----|---------------|
| `<array name="x" value="[...]"></array>` | declares the array |
| `<push name="x" value="v"></push>` | adds `v` to the end |
| `<pop name="x"></pop>` | removes the last item |
| `<unshift name="x" value="v"></unshift>` | adds `v` to the start |
| `<shift name="x"></shift>` | removes the first item |
| `<indexOf name="pos" target="x" value="v"></indexOf>` | finds the position of `v` |
| `<remove name="x" index="i"></remove>` | removes whatever is at position `i` |
| `<length name="n" target="x"></length>` | stores the array's size into `n` |

```html
<array name="nums" value="[10, 20, 30]"></array>
<push name="nums" value="40"></push>

<indexOf name="pos" target="nums" value="30"></indexOf>
<print>index of 30: {pos}</print>

<length name="n" target="nums"></length>
<print>size: {n}</print>
```

## Looping over an array

`<foreach>` (covered in **Loops**) walks every item without needing to
track an index manually:

```html
<foreach var="item" in="fruits">
    <print>{item}</print>
</foreach>
```

## Reactive lists and tables — binding an array to the page

This is where arrays get more powerful: instead of manually printing each
item, you can `<bind>` a whole array to a list or table element. Whenever
the array changes — you push an item, remove one, whatever — the HTML
updates itself automatically. You never manually redraw anything.

### A list

```html
<ul id="list"></ul>

<div data-xlang>
    <array name="fruits" value="['Apple', 'Banana']"></array>
    <bind target="list" source="fruits"></bind>
</div>
```

Notice the attribute is `source`, not `as` — that's the signal that you're
binding a whole array, not a single value.

### A table

```html
<table id="table"></table>

<div data-xlang>
    <array name="users" value="[]"></array>
    <bind target="table" source="users"></bind>
</div>
```

How XLang decides what to render depends on the container tag:

| Element         | Rendering |
|------------------|-----------|
| `<ul>` / `<ol>`  | each item becomes an `<li>` |
| `<table>`        | each item becomes a `<tr>`; if the item is an object, each field becomes a `<td>` |
| anything else    | each item becomes a `<span>` |

For tables specifically, if your array holds objects (like
`{name: 'Ana', age: 30}`), XLang even generates the `<thead>` row
automatically, using the object's keys as column headers. You don't write
any table-building code — you just keep the array updated with `<push>`,
`<remove>`, and so on, and the page follows along.

## Replacing all the contents at once — `<set-array>`

`<push>`, `<pop>`, and friends are great for changing an array one item at
a time. But sometimes you need to replace the *entire* contents in one
shot — for example, after loading a saved list from storage, or after
fetching a fresh set of results. Your first instinct might be to declare
the array again:

```html
<!-- Don't do this -->
<array name="tasks" value="[]"></array>
<bind target="taskList" source="tasks"></bind>

<fun name="reload">
    <storage-get key="savedTasks" as="loaded" default="[]"></storage-get>
    <array name="tasks" value="loaded"></array>
</fun>
```

This looks reasonable, but it silently breaks the connection to the page.
Re-declaring `tasks` with `<array>` creates a **brand new** array behind
the scenes — and the `<bind>` you set up earlier is still watching the
*old* one. The list on screen simply stops updating, with no error to tell
you why.

`<set-array>` solves this by replacing the *contents* of the array that
already exists, instead of creating a new one. The binding stays attached,
because the array itself never changes — only what's inside it does.

```html
<ul id="taskList"></ul>

<div data-xlang>
    <array name="tasks" value="[]"></array>
    <bind target="taskList" source="tasks"></bind>

    <fun name="reload">
        <storage-get key="savedTasks" as="loaded" default="[]"></storage-get>
        <set-array name="tasks" value="loaded"></set-array>
    </fun>
</div>
```

Now `reload` can run as many times as you like — the list updates cleanly
every time, with no duplicates and no broken binding.

```html
<array name="scores" value="[10, 20]"></array>
<set-array name="scores" value="[99, 100, 101]"></set-array>
<print>{scores[0]}, {scores[1]}, {scores[2]}</print>
```

This prints `99, 100, 101` — the original two values are gone, fully
replaced by the three new ones. `value` must evaluate to an array; passing
anything else raises an error, so a typo doesn't quietly wipe your list
with `undefined`.

## Reading an array from existing HTML — `array value="#id"`

Sometimes the data you want isn't stored in XLang at all — it's already
sitting on the page as plain HTML, typed directly into the markup. You can
turn that into a real array using the same `#id` convention used
elsewhere in XLang for reading existing elements:

```html
<ul id="staticList">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>

<div data-xlang>
    <array name="items" value="#staticList"></array>

    <foreach var="item" in="items">
        <print>{item}</print>
    </foreach>
</div>
```

`value="#staticList"` tells XLang: "find the element with this id, and
build an array out of its children." Each child's text becomes one array
item — here, `items` ends up as `['Item 1', 'Item 2', 'Item 3']`.

This is a **one-time read**, taken at the moment the `<array>` tag runs.
If the `<ul>` changes later through some other means, the array doesn't
automatically follow along — re-run `<array>` (or read it again into a
fresh variable) if you need the latest content. It's also a *flat* read:
each child's full text becomes one string item, so it fits simple lists
well; a multi-column `<table>` with several cells per row isn't turned
back into structured objects by this tag.

## Saving and restoring an array with storage

Arrays declared with `<array>` only live for as long as the page is open —
refresh the page, and they're gone. To make a list persist across visits,
combine arrays with the storage tags:

```html
<button id="btnSave">Save list</button>
<button id="btnLoad">Load list</button>
<ul id="cart"></ul>

<div data-xlang>
    <array name="items" value="['Apple', 'Bread']"></array>
    <bind target="cart" source="items"></bind>

    <fun name="save">
        <storage-set key="cart" value="items"></storage-set>
    </fun>

    <fun name="load">
        <storage-get key="cart" as="saved" default="[]"></storage-get>
        <set-array name="items" value="saved"></set-array>
    </fun>

    <on event="click" target="btnSave" call="save"></on>
    <on event="click" target="btnLoad" call="load"></on>
</div>
```

Notice `load` uses `<set-array>`, not `<array>` — this is exactly the
situation described above. Using `<array>` here would silently disconnect
the list from the page the moment someone clicks "Load."

## Next step

Head to **DOM Manipulation** to trigger this kind of update from real user
interaction — clicks, typing, and more.

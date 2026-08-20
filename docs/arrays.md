# Arrays

An array holds a list of values in order, and you can add to it, remove from it, or inspect it, using a small set of dedicated tags.

## Declaring an array

```html
<array name="fruits" value="['Apple', 'Banana', 'Orange']"></array>
<print>{fruits[0]}</print>
```

`fruits[0]` reads the first item — arrays start counting at 0, so `[0]` is "Apple," `[1]` is "Banana," and so on.

## The array API

| Tag | What it does |
|---|---|
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

`<foreach>` (covered in **Loops**) walks every item without needing to track an index manually:

```html
<foreach var="item" in="fruits">
    <print>{item}</print>
</foreach>
```

## Reactive lists and tables — binding an array to the page

This is where arrays get more powerful: instead of manually printing each item, you can `<bind>` a whole array to a list or table element. Whenever the array changes — you push an item, remove one, whatever — the HTML updates itself automatically. You never manually redraw anything.

### A list

```html
<ul id="list"></ul>

<div data-xlang>
    <array name="fruits" value="['Apple', 'Banana']"></array>
    <bind target="list" source="fruits"></bind>
</div>
```

Notice the attribute is `source`, not `as` — that's the signal that you're binding a whole array, not a single value.

### A table

```html
<table id="table"></table>

<div data-xlang>
    <array name="users" value="[]"></array>
    <bind target="table" source="users"></bind>
</div>
```

How XLang decides what to render depends on the container tag:

| Element | Rendering |
|---|---|
| `<ul>` / `<ol>` | each item becomes an `<li>` |
| `<table>` | each item becomes a `<tr>`; if the item is an object, each field becomes a `<td>` |
| anything else | each item becomes a `<span>` |

For tables specifically, if your array holds objects (like `{name: 'Ana', age: 30}`), XLang even generates the `<thead>` row automatically, using the object's keys as column headers. You don't write any table-building code — you just keep the array updated with `<push>`, `<remove>`, and so on, and the page follows along.

## Next step

Head to **DOM Manipulation** to trigger this kind of update from real user interaction — clicks, typing, and more.
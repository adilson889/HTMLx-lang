# Loops

There are three loop tags, each suited to a different situation. Picking
the right one makes your intent clear just by reading the tag name.

## `<loop>` — repeat forever, until you say stop

Use this when you don't know in advance how many times you'll repeat — you
just know the condition for stopping.

```html
<var name="i" value="0"></var>
<loop>
    <if condition="i >= 3">
        <break></break>
    </if>
    <print>{i}</print>
    <set name="i" value="i + 1"></set>
</loop>
```

Without that `<break>`, this would run forever. Always make sure a `<loop>`
has a way out.

## `<for>` — repeat across a known range

Use this when you know the start, end, and step size ahead of time.

```html
<for var="i" from="1" to="10" step="2">
    <print>{i}</print>
</for>
```

This counts `1, 3, 5, 7, 9` — starting at 1, stopping once it would exceed
10, adding 2 each time. `step` is optional and defaults to `1`. A negative
`step` counts down (`from="10" to="1" step="-1"`).

## `<foreach>` — repeat once per item in an array

Use this when you have a collection and want to do something with every
item in it, without worrying about indexes at all.

```html
<array name="fruits" value="['Apple', 'Banana', 'Orange']"></array>

<foreach var="item" in="fruits">
    <print>{item}</print>
</foreach>
```

(See **Arrays** for the full array API — `<array>`, `<push>`, and so on.)

## `<break>` and `<continue>`

Both only have an effect inside `<loop>`, `<for>`, or `<foreach>`:

- `<break>` — exits the loop immediately.
- `<continue>` — skips the rest of the current iteration and jumps back to
  the top of the loop.

```html
<var name="i" value="0"></var>
<loop>
    <set name="i" value="i + 1"></set>
    <if condition="i > 5">
        <break></break>
    </if>
    <if condition="i == 3">
        <continue></continue>
    </if>
    <print>{i}</print>
</loop>
```

This prints `1, 2, 4, 5` — `3` is skipped by `<continue>`, and the loop
stops entirely once `i` passes `5`.

## Next step

Head to **Functions** to package logic — including loops — into reusable,
named blocks.

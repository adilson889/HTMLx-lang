
# Native Functions

HTMLx-lang ships with a small standard library of common operations, so you
don't have to write them yourself. They're used exactly like any function
you'd declare with `<fun>` — inside `{ }`, `condition`, or `value`.

| Function | Does |
|----------|------|
| `upper(text)` | uppercase |
| `lower(text)` | lowercase |
| `trim(text)` | removes whitespace from both ends |
| `split(text, sep)` | splits text into an array by separator |
| `replace(text, from, to)` | replaces the first occurrence of `from` with `to` |
| `includes(text, part)` | true/false — does `text` contain `part`? |
| `round(number)` | rounds to the nearest whole number |
| `floor(number)` | rounds down |
| `ceil(number)` | rounds up |
| `abs(number)` | absolute value |
| `random(min, max)` | random whole number between `min` and `max` |

## Examples

```html
<var name="name" value="'  Ana  '"></var>
<print>{upper(trim(name))}</print>
```

This prints ANA — trim removes the surrounding spaces first, then
upper uppercases the result. Native functions combine freely, including
nested inside one another, just like the example above.

```html
<print>{random(1, 10)}</print>
```

Prints a random whole number from 1 to 10, inclusive.

```html
<var name="sentence" value="'the quick brown fox'"></var>
<array name="words" value="split(sentence, ' ')"></array>
<print>word count: {length(words)}</print>
```

Combines a native function (split) with an array declaration in one
step.

Next step

If you're ready for object-oriented patterns — classes, inheritance,
private methods — that's covered in the Pro documentation, along with
error handling (try/catch) and the module system.

```
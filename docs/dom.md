# DOM Manipulation

These tags let your XLang code react to what the user does, and directly
manipulate how elements look — without writing any JavaScript yourself.

## The toolbox

| Tag | What it does |
|-----|---------------|
| `<on event="..." target="id" call="function"></on>` | runs a function when an event fires |
| `<add-class target="id" class="name"></add-class>` | adds a CSS class |
| `<remove-class target="id" class="name"></remove-class>` | removes a CSS class |
| `<toggle-class target="id" class="name"></toggle-class>` | switches a CSS class on/off |
| `<show target="id"></show>` | makes an element visible |
| `<hide target="id"></hide>` | hides an element |
| `<set-style target="id" property="..." value="..."></set-style>` | sets one CSS property directly |

All of these give an error if the `target` id doesn't exist on the page —
they never fail silently, which makes typos easy to catch.

## `<on>` — listening for events

`<on>` connects a DOM event (like a click) to an XLang function:

```html
<button id="btnSave">Save</button>

<div data-xlang>
    <fun name="save">
        <print id="status">Saved!</print>
    </fun>

    <on event="click" target="btnSave" call="save"></on>
</div>
```

The `event` attribute accepts any standard DOM event name — `click`,
`input`, `change`, `submit`, and so on. Use `input` when you want to react
to every keystroke rather than a discrete click.

## A complete toggle example

Putting several of these tags together — a menu that shows/hides on
click:

```html
<button id="button">Menu</button>
<div id="content">Hidden</div>

<div data-xlang>
    <var name="visible" value="false"></var>

    <fun name="toggle">
        <if condition="visible == false">
            <set name="visible" value="true"></set>
            <show target="content"></show>
        </if>
        <else>
            <set name="visible" value="false"></set>
            <hide target="content"></hide>
        </else>
    </fun>

    <on event="click" target="button" call="toggle"></on>
</div>
```

Every click flips `visible` and shows/hides `content` accordingly.

## Styling dynamically

`set-style` accepts an expression, which makes it useful for things like
progress bars:

```html
<var name="progress" value="40"></var>
<div id="bar"></div>

<set-style target="bar" property="width" value="progress + '%'"></set-style>
```

## Calling XLang from plain HTML or JavaScript

Sometimes you have a regular HTML button (or plain JavaScript code) that
needs to trigger something written in XLang, from *outside* any
`<div data-xlang>` block. There's a global bridge for that:

```html
<button onclick="XLang.call('increment')">+1</button>
```

`XLang.call('functionName')` looks up a public function with that name in
any `<div data-xlang>` block on the page and runs it — this is your
one-way door from the "outside world" (plain HTML/JS) into XLang. Prefer
`<on>` when the XLang block already knows which element should trigger the
event; reach for `XLang.call` only when the trigger genuinely lives outside
XLang's own markup.

## Next step

You now have the full toolkit — variables, control flow, loops, functions,
arrays, and DOM interaction. From here, explore **Native Functions** for
built-in helpers you don't have to write yourself.

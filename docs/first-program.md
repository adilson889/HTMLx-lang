
# First Program

Let's write something small but complete — a program that stores a value,
does a tiny bit of logic with it, and shows a result. This walks through
the exact same ideas every larger HTMLx-lang program uses, just at the smallest
possible scale.

## Step 1 — the container

Every piece of HTMLx-lang code lives inside a `<div data-xlang>`. Start with an
empty one:

```html
<div data-xlang>

</div>
```

Nothing happens yet — there's no code inside it.

Step 2 — store a value

<var> creates a variable — think of it as a labeled box you can put a
value into:

```html
<div data-xlang>
    <var name="name" value="'World'"></var>
</div>
```

Notice the value is wrapped in two layers of quotes: the outer "..." is
required by HTML (every attribute value needs quotes), and the inner
'World' tells HTMLx-lang "this is a text string, not a number or a variable
name." Try it without the inner quotes and HTMLx-lang will look for a variable
called World instead of the text "World" — and fail, because that
variable doesn't exist.

Step 3 — show it

<print> displays something on the page. Use { } to insert a variable's
value into the text:

```html
<div data-xlang>
    <var name="name" value="'World'"></var>
    <print>Hello, {name}!</print>
</div>
```

Open this in a browser, and where the <div> used to be, you'll see:

```
Hello, World!
```

Step 4 — make it interactive

A static greeting is fine, but let's make it respond to input. Add a real
HTML <input> outside the HTMLx-lang block, and use <bind> to connect it:

```html
<input id="nameInput" type="text" placeholder="Your name" />

<div data-xlang>
    <bind target="nameInput" as="name"></bind>
    <print>Hello, {name}!</print>
</div>
```

Now the greeting updates live as someone types into the input — no click,
no button, no extra code. <bind> is doing the work of keeping name in
sync with what's typed.

What just happened

You used three of the most common HTMLx-lang tags:

· <var> — store a value
· <bind> — connect to something already on the page
· <print> — show a value, with { } interpolation

Every larger program is built from the same handful of building blocks,
just combined in more ways — functions, conditions, loops, arrays, and so
on.

Next step

Head to Project Structure to see how to organize this as your files
grow beyond a single small example.

```
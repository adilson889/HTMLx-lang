
# Control Flow

Control flow is how a program makes decisions — running one block of code instead of another, depending on a condition.

## Expressions, quickly

Before diving into `if`, it helps to know what you can write inside a `condition="..."` attribute. HTMLx-lang supports:

- Arithmetic: `+  -  *  /  %`
- Comparison: `==  !=  >  <  >=  <=`
- Logic: `&&  ||  !`

```html
<print>{(10 + 5) * 2}</print>
<print>{10 > 5 && 2 < 3}</print>
```

One thing worth knowing: + does double duty. Between two numbers, it adds. Between two strings, it concatenates. 'a' + 'b' gives you 'ab'.

if / elseif / else

This works exactly the way you'd expect from any programming language — just written as tags instead of curly braces.

```html
<if condition="x > 10">
    <print>large</print>
</if>
<elseif condition="x > 5">
    <print>medium</print>
</elseif>
<else>
    <print>small</print>
</else>
```

HTMLx-lang checks if first. If it's false, it checks the next elseif (you can have several in a row). If none of them match, else runs. Only one branch ever executes.

switch

Use switch when you're comparing one value against several possible exact matches — it reads cleaner than a long chain of elseif.

```html
<switch value="option">
    <case value="1">
        <print>Option 1</print>
    </case>
    <case value="2">
        <print>Option 2</print>
    </case>
    <default>
        <print>unknown</print>
    </default>
</switch>
```

If option matches none of the <case> values, <default> runs (if you included one).

A complete example

Putting <bind>, if/else, and <print> together — a simple login check:

```html
<input id="username" type="text" placeholder="Username" />
<input id="password" type="password" placeholder="Password" />
<button id="btnLogin">Login</button>
<div id="status"></div>

<div data-xlang>
    <bind target="username" as="username"></bind>
    <bind target="password" as="password"></bind>

    <fun name="login">
        <if condition="username == 'admin' && password == '1234'">
            <print id="status">Access granted!</print>
        </if>
        <else>
            <print id="status">Invalid username or password!</print>
        </else>
    </fun>

    <on event="click" target="btnLogin" call="login"></on>
</div>
```

(<fun> and <on> are covered in Functions and DOM Manipulation — you don't need to fully understand them yet to see the shape of the if.)

Next step

Head to Loops to repeat blocks of logic instead of running them once.

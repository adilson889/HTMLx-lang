
# XLang Examples

> **Important note:** the `<script type="text/xlang">` is only processed when
> it is inside `<body>`. Outside `<body>` (e.g., inside `<head>`), the
> interpreter does not find or execute the program. The
> `<script src="...xlang-interpreter.js">` (which imports the interpreter
> itself) can stay in the `<head>` without any problem — only the
> `<program>` needs to be in the `<body>`.

All examples use `<meta charset="UTF-8" />` for proper character encoding.

---

## 1. Hello, world

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <print>Hello, world!</print>
    </program>
    </script>

</body>
</html>
```

---

2. Variables and operations

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <var name="a" value="5" />
        <var name="b" value="3" />
        <print>Sum: {a + b}<br/></print>
        <print>Product: {a * b}<br/></print>

        <val name="pi" value="3.14" />
        <print>Pi: {pi}</print>
    </program>
    </script>

</body>
</html>
```

---

3. Conditionals

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <var name="age" value="20" />

        <if condition="age >= 18">
            <print>Adult</print>
        </if>
        <else>
            <print>Minor</print>
        </else>
    </program>
    </script>

</body>
</html>
```

---

4. Loop with counter

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <var name="i" value="0" />
        <loop>
            <if condition="i >= 5">
                <break />
            </if>
            <print>i = {i}<br/></print>
            <set name="i" value="i + 1" />
        </loop>
    </program>
    </script>

</body>
</html>
```

---

5. for with step

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <for var="n" from="0" to="20" step="5">
            <print>{n}<br/></print>
        </for>
    </program>
    </script>

</body>
</html>
```

---

6. Functions and recursion (factorial)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <fun name="factorial" params="n">
            <if condition="n <= 1">
                <return value="1" />
            </if>
            <return value="n * factorial(n - 1)" />
        </fun>

        <print>Factorial of 5: {factorial(5)}<br/></print>
        <print>Factorial of 7: {factorial(7)}<br/></print>
    </program>
    </script>

</body>
</html>
```

---

7. Arrays

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <array name="fruits" value="['Apple', 'Banana', 'Orange']" />
        <push name="fruits" value="'Grape'" />

        <foreach var="fruit" in="fruits">
            <print>{fruit}<br/></print>
        </foreach>

        <length name="total" target="fruits" />
        <print>Total: {total}</print>
    </program>
    </script>

</body>
</html>
```

---

8. Interactive form (real-time input)

The <input> elements are not declared in the HTML — XLang itself
creates the inputs from <val name="..." value="<input .../>" />. Do not
repeat "decorative" inputs in the HTML outside, otherwise you will have
two sets of fields where only one (created by XLang) is linked to the
calculation.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div style="border:1px solid #ccc; padding:10px; width:280px;">
        <h3>Calculator</h3>
        <script type="text/xlang">
        <program>
            <val name="a" value="<input type='number' />" />
            <val name="b" value="<input type='number' />" />

            <fun name="sum" params="x, y">
                <return value="x + y" />
            </fun>

            <print id="result">Sum: {sum(a, b)}</print>
        </program>
        </script>
        <div id="result" style="margin-top:10px; font-weight:bold;"></div>
    </div>

</body>
</html>
```

The two <input> elements appear exactly where the <script
type="text/xlang"> is, in the order they are declared (a first, b
after). Typing in them updates {sum(a, b)} in real time, without
reloading or clicking anything.

---

9. Classes and objects

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <class name="Person">
            <var name="name" value="" />
            <var name="age" value="0" />

            <init params="name, age">
                <set name="this.name" value="name" />
                <set name="this.age" value="age" />
            </init>

            <fun name="greet">
                <return value="'Hello, I am ' + this.name" />
            </fun>
        </class>

        <var name="p" value="<new class='Person' args=\"'Ana', 30\" />" />
        <print>{p.greet()}<br/></print>
        <print>Age: {p.age}</print>
    </program>
    </script>

</body>
</html>
```

---

10. Inheritance

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <class name="Animal">
            <var name="name" value="" />
            <init params="name">
                <set name="this.name" value="name" />
            </init>
            <fun name="speak">
                <return value="this.name + ' makes a sound'" />
            </fun>
        </class>

        <class name="Dog" extends="Animal">
            <override fun name="speak">
                <return value="this.name + ' barks'" />
            </override>
        </class>

        <var name="rex" value="<new class='Dog' args=\"'Rex'\" />" />
        <print>{rex.speak()}</print>
    </program>
    </script>

</body>
</html>
```

---

11. Switch

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <script type="text/xlang">
    <program>
        <var name="day" value="3" />

        <switch value="day">
            <case value="1">
                <print>Monday</print>
            </case>
            <case value="2">
                <print>Tuesday</print>
            </case>
            <case value="3">
                <print>Wednesday</print>
            </case>
            <default>
                <print>Other day</print>
            </default>
        </switch>
    </program>
    </script>

</body>
</html>
```

---

12. Interactive UI — button calls XLang function

Normal HTML buttons and events (onclick) can call public XLang functions
through XLang.call(name, args...). It is the bridge between the regular
HTML interface and the logic written in XLang.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div id="counter_display">0</div>
    <button onclick="XLang.call('increment')">+1</button>
    <button onclick="XLang.call('decrement')">-1</button>

    <script type="text/xlang">
    <program>
        <var name="counter" value="0" />

        <fun name="increment">
            <set name="counter" value="counter + 1" />
            <print id="counter_display">{counter}</print>
        </fun>

        <fun name="decrement">
            <set name="counter" value="counter - 1" />
            <print id="counter_display">{counter}</print>
        </fun>
    </program>
    </script>

</body>
</html>
```

Each click runs the XLang function, which updates the variable and
rewrites the <div id="counter_display"> — all inside XLang itself,
triggered from outside by a regular HTML event.

---

13. Task list (real use)

Combines array, foreach, push and XLang.call in a common use case.
Note: inside a foreach, build the complete string before making a single
<print id="..."> at the end — each <print id="..."> replaces the
element content (does not concatenate), so calling <print> multiple times
inside the loop would overwrite on each iteration.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div style="max-width:340px; font-family:sans-serif;">
        <h3>Task list</h3>
        <script type="text/xlang">
        <program>
            <array name="tasks" value="[]" />

            <val name="newTask" value="<input type='text' placeholder='New task' style='padding:6px; border:1px solid #ccc; border-radius:6px; width:180px;' />" />

            <fun name="add">
                <push name="tasks" value="newTask" />
                <call name="render" />
            </fun>

            <fun name="render">
                <var name="html" value="''" />
                <foreach var="t" in="tasks">
                    <set name="html" value="html + t + '<br/>'" />
                </foreach>
                <print id="list">{html}</print>
            </fun>
        </program>
        </script>
        <button onclick="XLang.call('add')" style="margin-left:6px; padding:6px 12px;">Add</button>
        <div id="list" style="margin-top:10px;"></div>
    </div>

</body>
</html>
```

---

14. Form with validation (real use)

A contact form with chained validation (if / elseif / else), helper
functions, and visual feedback — the kind of logic that would normally
require separate JavaScript, all inside XLang itself.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div style="max-width:320px; font-family:sans-serif;">
        <h3>Contact</h3>
        <script type="text/xlang">
        <program>
            <val name="name" value="<input type='text' placeholder='Your name' style='display:block; margin-bottom:8px; padding:8px; width:100%; border:1px solid #ccc; border-radius:6px;' />" />
            <val name="email" value="<input type='email' placeholder='Your email' style='display:block; margin-bottom:8px; padding:8px; width:100%; border:1px solid #ccc; border-radius:6px;' />" />

            <fun name="validateEmail" params="e">
                <if condition="e == ''">
                    <return value="false" />
                </if>
                <return value="true" />
            </fun>

            <fun name="send">
                <if condition="name == ''">
                    <print id="status" style="color:red;">Fill in the name</print>
                </if>
                <elseif condition="validateEmail(email) == false">
                    <print id="status" style="color:red;">Invalid email</print>
                </elseif>
                <else>
                    <print id="status" style="color:green;">Message sent, {name}!</print>
                </else>
            </fun>
        </program>
        </script>
        <button onclick="XLang.call('send')" style="padding:8px 16px;">Send</button>
        <div id="status" style="margin-top:10px; font-weight:bold;"></div>
    </div>

</body>
</html>
```

The validation runs entirely in the <if>/<elseif>/<else> of the send
function, calling validateEmail(email) — another XLang function — as part
of the condition itself.

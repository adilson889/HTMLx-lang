
---

# 2. Task List

```markdown
# Task List Example

A responsive task manager using reactive arrays.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Task List - HTMLx-lang</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: #ffffff;
            border-radius: 20px;
            padding: 30px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        h2 {
            color: #1a1a1a;
            margin-bottom: 20px;
            font-size: 26px;
        }

        .input-row {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            outline: none;
        }

        input:focus {
            border-color: #4f46e5;
        }

        button {
            padding: 12px 18px;
            background: #4f46e5;
            color: #ffffff;
            border: none;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            white-space: nowrap;
        }

        button:hover {
            background: #4338ca;
        }

        ul {
            list-style: none;
        }

        li {
            background: #f9fafb;
            padding: 12px 14px;
            border-radius: 10px;
            margin-bottom: 8px;
            border-left: 4px solid #4f46e5;
            font-size: 15px;
            color: #1f2937;
        }

        @media (max-width: 480px) {
            .container {
                padding: 20px;
            }

            .input-row {
                flex-direction: column;
            }

            button {
                width: 100%;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <h2>Task List</h2>

        <div class="input-row">
            <input id="newTask" type="text" placeholder="New task..." />
            <button id="btnAdd">Add</button>
        </div>

        <ul id="list"></ul>

        <div data-xlang>
            <array name="tasks" value="[]"></array>
            <bind target="newTask" as="newTask"></bind>
            <bind target="list" source="tasks"></bind>

            <fun name="add">
                <if condition="newTask != ''">
                    <push name="tasks" value="newTask"></push>
                    <set name="newTask" value="''"></set>
                </if>
            </fun>

            <on event="click" target="btnAdd" call="add"></on>
        </div>
    </div>

</body>
</html>
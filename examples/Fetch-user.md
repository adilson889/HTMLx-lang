

# 3. Fetch Users

```markdown
# Fetch Users Example

Load users from an API and display them in a reactive list.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fetch Users - HTMLx-lang</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: #1e293b;
            border-radius: 20px;
            padding: 30px;
            width: 100%;
            max-width: 460px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        h2 {
            color: #f1f5f9;
            margin-bottom: 20px;
            font-size: 26px;
        }

        button {
            width: 100%;
            padding: 14px;
            background: #3b82f6;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }

        button:hover {
            background: #2563eb;
        }

        #status {
            text-align: center;
            margin: 16px 0;
            font-weight: bold;
            font-size: 14px;
        }

        ul {
            list-style: none;
        }

        li {
            background: #0f172a;
            padding: 14px;
            border-radius: 10px;
            margin-bottom: 8px;
            color: #e2e8f0;
            font-size: 15px;
            border-left: 4px solid #3b82f6;
        }

        @media (max-width: 480px) {
            .container {
                padding: 20px;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <h2>Users</h2>

        <button id="btnLoad">Load Users</button>
        <div id="status"></div>
        <ul id="list"></ul>

        <div data-xlang>
            <array name="users" value="[]"></array>
            <bind target="list" source="users"></bind>

            <fun name="loadUsers">
                <print id="status" style="color:#94a3b8;">Loading...</print>

                <fetch url="'https://jsonplaceholder.typicode.com/users'" as="resposta"></fetch>

                <if condition="resposta.ok">
                    <set-array name="users" value="resposta.data"></set-array>
                    <print id="status" style="color:#4ade80;">Users loaded!</print>
                </if>
                <else>
                    <print id="status" style="color:#f87171;">Error {resposta.status}</print>
                </else>
            </fun>

            <on event="click" target="btnLoad" call="loadUsers"></on>
        </div>
    </div>

</body>
</html>
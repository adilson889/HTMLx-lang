# Login Example

A responsive login screen with validation.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Login - HTMLx-lang</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            max-width: 380px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        h2 {
            color: #ffffff;
            text-align: center;
            margin-bottom: 8px;
            font-size: 28px;
        }

        p {
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            margin-bottom: 28px;
            font-size: 14px;
        }

        input {
            width: 100%;
            padding: 14px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            color: #ffffff;
            font-size: 15px;
            margin-bottom: 14px;
            outline: none;
            transition: border-color 0.3s;
            box-sizing: border-box;
        }

        input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        input:focus {
            border-color: #667eea;
        }

        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        button:hover {
            opacity: 0.9;
        }

        #status {
            text-align: center;
            margin-top: 18px;
            font-weight: bold;
            font-size: 15px;
        }

        @media (max-width: 480px) {
            .card {
                padding: 28px;
            }

            h2 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>

    <div class="card">
        <h2>Welcome</h2>
        <p>Log in to continue</p>

        <input id="username" type="text" placeholder="Username" />
        <input id="password" type="password" placeholder="Password" />

        <button id="btnLogin">Login</button>
        <div id="status"></div>

        <div data-xlang>
            <bind target="username" as="username"></bind>
            <bind target="password" as="password"></bind>

            <fun name="login">
                <if condition="username == 'admin' && password == '1234'">
                    <print id="status" style="color:#4ade80;">Access granted!</print>
                </if>
                <else>
                    <print id="status" style="color:#f87171;">Invalid username or password!</print>
                </else>
            </fun>

            <on event="click" target="btnLogin" call="login"></on>
        </div>
    </div>

</body>
</html>
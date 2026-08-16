# Login with XLang

## Description
Login screen with credential validation.

## Features
- User and password input
- Validation with conditionals
- Visual feedback

## Code

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
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

        .login-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 380px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .title {
            color: white;
            font-size: 2em;
            margin-bottom: 10px;
            text-align: center;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            margin-bottom: 30px;
            font-size: 0.9em;
        }

        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            width: 100%;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        #status {
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 25px;
            }
            .title {
                font-size: 1.5em;
            }
        }
    </style>
</head>
<body>

    <div class="login-card">
        <div class="title">Welcome</div>
        <div class="subtitle">Log in to continue</div>
        
        <script type="text/xlang">
        <program>
            <val name="username" value="<input type='text' placeholder='Username' style='width:100%; padding:14px; border:2px solid rgba(255,255,255,0.3); border-radius:25px; font-size:14px; outline:none; margin-bottom:15px; background:rgba(255,255,255,0.1); color:white; transition:border-color 0.3s;' />" />
            
            <val name="password" value="<input type='password' placeholder='Password' style='width:100%; padding:14px; border:2px solid rgba(255,255,255,0.3); border-radius:25px; font-size:14px; outline:none; margin-bottom:20px; background:rgba(255,255,255,0.1); color:white; transition:border-color 0.3s;' />" />

            <fun name="login">
                <if condition="username == 'admin' && password == '1234'">
                    <print id="status" style="color:#4ade80;">Access granted!</print>
                </if>
                <else>
                    <print id="status" style="color:#f87171;">Invalid username or password!</print>
                </else>
            </fun>
        </program>
        </script>

        <button class="btn" onclick="XLang.call('login')">Login</button>
        <div id="status"></div>
    </div>

</body>
</html>
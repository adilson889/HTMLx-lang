# User Registration with OOP Classes

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; background: #f0f2f5; }
        .container { background: white; padding: 30px; border-radius: 15px; width: 350px; margin: 20px auto; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h3 { color: #333; }
        .btn { background: #1877f2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { opacity: 0.9; }
        #list { margin-top: 20px; text-align: left; }
        .user { background: #f8f9fa; padding: 10px 15px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #2ecc71; }
    </style>
</head>
<body>

    <center>
        <div class="container">
            <h3>User Registration</h3>
            
            <script type="text/xlang">
            <program>
                <class name="User">
                    <var name="name" value="''" />
                    <var name="age" value="0" />

                    <init params="name, age">
                        <set name="this.name" value="name" />
                        <set name="this.age" value="age" />
                    </init>

                    <fun name="present">
                        <return value="this.name + ' - ' + this.age + ' years'" />
                    </fun>
                </class>

                <array name="users" value="[]" />

                <val name="newName" value="<input type='text' placeholder='Name' style='padding:10px; width:65%; border:1px solid #ddd; border-radius:5px; margin-bottom:8px;' />" />
                <val name="newAge" value="<input type='number' placeholder='Age' style='padding:10px; width:65%; border:1px solid #ddd; border-radius:5px; margin-bottom:8px;' />" />

                <fun name="register">
                    <if condition="newName != '' && newAge != ''">
                        <var name="newUser" value="<new class='User' args='newName, newAge' />" />
                        <push name="users" value="newUser" />
                        <call name="render" />
                    </if>
                </fun>

                <fun name="render">
                    <var name="html" value="''" />
                    <foreach var="u" in="users">
                        <set name="html" value="html + '<div class=&quot;user&quot;>' + u.present() + '</div>'" />
                    </foreach>
                    <print id="list">{html}</print>
                </fun>
            </program>
            </script>

            <button class="btn" onclick="XLang.call('register')">Register</button>
            <div id="list"></div>
        </div>
    </center>

</body>
</html>
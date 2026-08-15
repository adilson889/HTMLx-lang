# Calculadora com XLang

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; display: flex; justify-content: center; margin-top: 100px; }
        .btn { padding: 10px 20px; background: #1877f2; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 2px; }
        #resultado { margin-top: 10px; font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>

    <div>
        <script type="text/xlang">
        <program>
            <val name="a" value="<input type='number' placeholder='Número A' style='padding:8px; margin-bottom:10px; display:block;' />" />
            <val name="b" value="<input type='number' placeholder='Número B' style='padding:8px; margin-bottom:10px; display:block;' />" />

            <fun name="somar">
                <print id="resultado">{a + b}</print>
            </fun>

            <fun name="subtrair">
                <print id="resultado">{a - b}</print>
            </fun>

            <fun name="multiplicar">
                <print id="resultado">{a * b}</print>
            </fun>

            <fun name="dividir">
                <if condition="b != 0">
                    <print id="resultado">{a / b}</print>
                </if>
                <else>
                    <print id="resultado">Erro: divisão por zero</print>
                </else>
            </fun>
        </program>
        </script>

        <button class="btn" onclick="XLang.call('somar')">+</button>
        <button class="btn" onclick="XLang.call('subtrair')">-</button>
        <button class="btn" onclick="XLang.call('multiplicar')">×</button>
        <button class="btn" onclick="XLang.call('dividir')">÷</button>
        <div id="resultado"></div>
    </div>

</body>
</html>
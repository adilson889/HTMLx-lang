# Calculadora com XLang

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; display: flex; justify-content: center; margin-top: 50px; background: #f0f2f5; }
        .calc { background: #333; padding: 20px; border-radius: 15px; width: 280px; }
        #display { background: #fff; padding: 15px; font-size: 24px; text-align: right; border-radius: 8px; margin-bottom: 15px; min-height: 30px; }
        .btn { padding: 15px; margin: 3px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; width: 55px; }
        .num { background: #555; color: white; }
        .op { background: #f39c12; color: white; }
        .clear { background: #e74c3c; color: white; }
        .igual { background: #2ecc71; color: white; }
    </style>
</head>
<body>

    <div class="calc">
        <div id="display">0</div>
        
        <script type="text/xlang">
        <program>
            <var name="valorAtual" value="''" />
            <var name="valorAnterior" value="''" />
            <var name="operacao" value="''" />

            <fun name="adicionarNumero" params="n">
                <set name="valorAtual" value="valorAtual + n" />
                <print id="display">{valorAtual}</print>
            </fun>

            <fun name="definirOperacao" params="op">
                <set name="valorAnterior" value="valorAtual" />
                <set name="valorAtual" value="''" />
                <set name="operacao" value="op" />
            </fun>

            <fun name="calcular">
                <if condition="operacao == '+'">
                    <print id="display">{valorAnterior * 1 + valorAtual * 1}</print>
                </if>
                <elseif condition="operacao == '-'">
                    <print id="display">{valorAnterior - valorAtual}</print>
                </elseif>
                <elseif condition="operacao == '*'">
                    <print id="display">{valorAnterior * valorAtual}</print>
                </elseif>
                <elseif condition="operacao == '/'">
                    <print id="display">{valorAnterior / valorAtual}</print>
                </elseif>
            </fun>

            <fun name="limpar">
                <set name="valorAtual" value="''" />
                <set name="valorAnterior" value="''" />
                <set name="operacao" value="''" />
                <print id="display">0</print>
            </fun>
        </program>
        </script>

        <button class="btn num" onclick="XLang.call('adicionarNumero', '7')">7</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '8')">8</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '9')">9</button>
        <button class="btn op" onclick="XLang.call('definirOperacao', '/')">÷</button>
        
        <button class="btn num" onclick="XLang.call('adicionarNumero', '4')">4</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '5')">5</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '6')">6</button>
        <button class="btn op" onclick="XLang.call('definirOperacao', '*')">×</button>
        
        <button class="btn num" onclick="XLang.call('adicionarNumero', '1')">1</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '2')">2</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '3')">3</button>
        <button class="btn op" onclick="XLang.call('definirOperacao', '-')">-</button>
        
        <button class="btn clear" onclick="XLang.call('limpar')">C</button>
        <button class="btn num" onclick="XLang.call('adicionarNumero', '0')">0</button>
        <button class="btn igual" onclick="XLang.call('calcular')">=</button>
        <button class="btn op" onclick="XLang.call('definirOperacao', '+')">+</button>
    </div>

</body>
</html>
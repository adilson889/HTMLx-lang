<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>XLang - Calculadora</title>
    <!-- Importando o interpretador XLang via CDN -->
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; margin-top: 50px; background: #f0f2f5; }
        .calc { background: #333; padding: 20px; border-radius: 15px; width: 280px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        #display { background: #fff; padding: 15px; font-size: 24px; text-align: right; border-radius: 8px; margin-bottom: 15px; min-height: 30px; font-weight: bold; }
        .btn { padding: 15px; margin: 3px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; width: 55px; transition: opacity 0.1s; }
        .btn:active { opacity: 0.8; }
        .num { background: #555; color: white; }
        .op { background: #f39c12; color: white; }
        .clear { background: #e74c3c; color: white; }
        .equal { background: #2ecc71; color: white; }
    </style>
</head>
<body>

    <div class="calc">
        <div id="display">0</div>

        <!-- Bloco lógico do Interpretador XLang -->
        <div data-xlang>
            <var name="currentValue" value="''"></var>
            <var name="previousValue" value="''"></var>
            <var name="operation" value="''"></var>
            <var name="result" value="0"></var>

            <fun name="addNumber" params="n">
                <!-- Se o display marcar 0 limpo, substitui; senão, concatena -->
                <if condition="currentValue == ''">
                    <set name="currentValue" value="n"></set>
                </if>
                <else>
                    <set name="currentValue" value="currentValue + n"></set>
                </else>
                <print id="display">{currentValue}</print>
            </fun>

            <fun name="setOperation" params="op">
                <!-- Salva o valor atual como numérico antes de limpar -->
                <set name="previousValue" value="currentValue * 1"></set>
                <set name="currentValue" value="''"></set>
                <set name="operation" value="op"></set>
            </fun>

            <fun name="calculate">
                <!-- Converte o segundo termo para numérico para evitar concatenação de texto -->
                <var name="currentNum" value="currentValue * 1"></var>
                
                <if condition="operation == '+'">
                    <set name="result" value="previousValue + currentNum"></set>
                </if>
                <elseif condition="operation == '-'">
                    <set name="result" value="previousValue - currentNum"></set>
                </elseif>
                <elseif condition="operation == '*'">
                    <set name="result" value="previousValue * currentNum"></set>
                </elseif>
                <elseif condition="operation == '/'">
                    <set name="result" value="previousValue / currentNum"></set>
                </elseif>

                <!-- Renderiza o resultado e joga de volta no estado para permitir operações contínuas -->
                <print id="display">{result}</print>
                <set name="currentValue" value="result + ''"></set> 
                <set name="operation" value="''"></set>
            </fun>

            <fun name="clear">
                <set name="currentValue" value="''"></set>
                <set name="previousValue" value="''"></set>
                <set name="operation" value="''"></set>
                <set name="result" value="0"></set>
                <print id="display">0</print>
            </fun>
        </div>

        <!-- Teclado Numérico e Operadores -->
        <button class="btn num" onclick="XLang.call('addNumber', '7')">7</button>
        <button class="btn num" onclick="XLang.call('addNumber', '8')">8</button>
        <button class="btn num" onclick="XLang.call('addNumber', '9')">9</button>
        <button class="btn op" onclick="XLang.call('setOperation', '/')">÷</button>

        <button class="btn num" onclick="XLang.call('addNumber', '4')">4</button>
        <button class="btn num" onclick="XLang.call('addNumber', '5')">5</button>
        <button class="btn num" onclick="XLang.call('addNumber', '6')">6</button>
        <button class="btn op" onclick="XLang.call('setOperation', '*')">×</button>

        <button class="btn num" onclick="XLang.call('addNumber', '1')">1</button>
        <button class="btn num" onclick="XLang.call('addNumber', '2')">2</button>
        <button class="btn num" onclick="XLang.call('addNumber', '3')">3</button>
        <button class="btn op" onclick="XLang.call('setOperation', '-')">-</button>

        <button class="btn clear" onclick="XLang.call('clear')">C</button>
        <button class="btn num" onclick="XLang.call('addNumber', '0')">0</button>
        <button class="btn equal" onclick="XLang.call('calculate')">=</button>
        <button class="btn op" onclick="XLang.call('setOperation', '+')">+</button>
    </div>

</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cd......./xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; display: flex; justify-content: center; margin-top: 50px; background: #f0f2f5; }
        .calc { background: #333; padding: 20px; border-radius: 15px; width: 280px; }
        #display { background: #fff; padding: 15px; font-size: 24px; text-align: right; border-radius: 8px; margin-bottom: 15px; min-height: 30px; }
        .btn { padding: 15px; margin: 3px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; width: 55px; }
        .num { background: #555; color: white; }
        .op { background: #f39c12; color: white; }
        .clear { background: #e74c3c; color: white; }
        .equal { background: #2ecc71; color: white; }
    </style>
</head>
<body>

    <div class="calc">
        <div id="display">0</div>

        <div data-xlang>
            <var name="currentValue" value="''"></var>
            <var name="previousValue" value="''"></var>
            <var name="operation" value="''"></var>

            <fun name="addNumber" params="n">
                <set name="currentValue" value="currentValue + n"></set>
                <print id="display">{currentValue}</print>
            </fun>

            <fun name="setOperation" params="op">
                <set name="previousValue" value="currentValue"></set>
                <set name="currentValue" value="''"></set>
                <set name="operation" value="op"></set>
            </fun>

            <fun name="calculate">
                <if condition="operation == '+'">
                    <print id="display">{previousValue * 1 + currentValue * 1}</print>
                </if>
                <elseif condition="operation == '-'">
                    <print id="display">{previousValue - currentValue}</print>
                </elseif>
                <elseif condition="operation == '*'">
                    <print id="display">{previousValue * currentValue}</print>
                </elseif>
                <elseif condition="operation == '/'">
                    <print id="display">{previousValue / currentValue}</print>
                </elseif>
            </fun>

            <fun name="clear">
                <set name="currentValue" value="''"></set>
                <set name="previousValue" value="''"></set>
                <set name="operation" value="''"></set>
                <print id="display">0</print>
            </fun>
        </div>

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
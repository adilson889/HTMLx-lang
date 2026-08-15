# Exemplos XLang

> **Nota importante:** o `<script type="text/xlang">` só é processado quando
> está dentro de `<body>`. Fora do `<body>` (ex: dentro de `<head>`), o
> interpretador não encontra nem executa o programa. O
> `<script src="...xlang-interpreter.js">` (que importa o interpretador em
> si) pode ficar no `<head>` sem problema — só o `<program>` precisa estar
> no `<body>`.

Todos os exemplos usam `<meta charset="UTF-8" />` para os acentos
aparecerem corretamente.

---

## 1. Olá, mundo

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
        <print>Olá, mundo!</print>
    </program>
    </script>

</body>
</html>
```

---

## 2. Variáveis e operações

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
        <print>Soma: {a + b}<br/></print>
        <print>Produto: {a * b}<br/></print>

        <val name="pi" value="3.14" />
        <print>Pi: {pi}</print>
    </program>
    </script>

</body>
</html>
```

---

## 3. Condicionais

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
        <var name="idade" value="20" />

        <if condition="idade >= 18">
            <print>Maior de idade</print>
        </if>
        <else>
            <print>Menor de idade</print>
        </else>
    </program>
    </script>

</body>
</html>
```

---

## 4. Loop com contador

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

## 5. `for` com step

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

## 6. Funções e recursão (fatorial)

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
        <fun name="fatorial" params="n">
            <if condition="n <= 1">
                <return value="1" />
            </if>
            <return value="n * fatorial(n - 1)" />
        </fun>

        <print>Fatorial de 5: {fatorial(5)}<br/></print>
        <print>Fatorial de 7: {fatorial(7)}<br/></print>
    </program>
    </script>

</body>
</html>
```

---

## 7. Arrays

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
        <array name="frutas" value="['Maçã', 'Banana', 'Laranja']" />
        <push name="frutas" value="'Uva'" />

        <foreach var="fruta" in="frutas">
            <print>{fruta}<br/></print>
        </foreach>

        <length name="total" target="frutas" />
        <print>Total: {total}</print>
    </program>
    </script>

</body>
</html>
```

---

## 8. Formulário interativo (input em tempo real)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div style="border:1px solid #ccc; padding:10px; width:280px;">
        <h3>Calculadora</h3>
        <input type="number" id="valor_a" placeholder="Número A" />
        <input type="number" id="valor_b" placeholder="Número B" />
        <div id="resultado" style="margin-top:10px; font-weight:bold;"></div>
    </div>

    <script type="text/xlang">
    <program>
        <val name="a" value="<input type='number' />" />
        <val name="b" value="<input type='number' />" />

        <fun name="somar" params="x, y">
            <return value="x + y" />
        </fun>

        <print id="resultado">Soma: {somar(a, b)}</print>
    </program>
    </script>

</body>
</html>
```

---

## 9. Classes e objetos

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
        <class name="Pessoa">
            <var name="nome" value="" />
            <var name="idade" value="0" />

            <init params="nome, idade">
                <set name="this.nome" value="nome" />
                <set name="this.idade" value="idade" />
            </init>

            <fun name="cumprimentar">
                <return value="'Olá, sou ' + this.nome" />
            </fun>
        </class>

        <var name="p" value="<new class='Pessoa' args=\"'Ana', 30\" />" />
        <print>{p.cumprimentar()}<br/></print>
        <print>Idade: {p.idade}</print>
    </program>
    </script>

</body>
</html>
```

---

## 10. Herança

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
            <var name="nome" value="" />
            <init params="nome">
                <set name="this.nome" value="nome" />
            </init>
            <fun name="falar">
                <return value="this.nome + ' faz um som'" />
            </fun>
        </class>

        <class name="Cachorro" extends="Animal">
            <override fun name="falar">
                <return value="this.nome + ' late'" />
            </override>
        </class>

        <var name="rex" value="<new class='Cachorro' args=\"'Rex'\" />" />
        <print>{rex.falar()}</print>
    </program>
    </script>

</body>
</html>
```

---

## 11. Switch

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
        <var name="dia" value="3" />

        <switch value="dia">
            <case value="1">
                <print>Segunda</print>
            </case>
            <case value="2">
                <print>Terça</print>
            </case>
            <case value="3">
                <print>Quarta</print>
            </case>
            <default>
                <print>Outro dia</print>
            </default>
        </switch>
    </program>
    </script>

</body>
</html>
```

---

## 12. UI interativa — botão chama função XLang

Botões e eventos HTML normais (`onclick`) podem chamar funções públicas da
XLang através de `XLang.call(nome, args...)`. É a ponte entre a interface
HTML comum e a lógica escrita em XLang.

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>

    <div id="contador_display">0</div>
    <button onclick="XLang.call('incrementar')">+1</button>
    <button onclick="XLang.call('decrementar')">-1</button>

    <script type="text/xlang">
    <program>
        <var name="contador" value="0" />

        <fun name="incrementar">
            <set name="contador" value="contador + 1" />
            <print id="contador_display">{contador}</print>
        </fun>

        <fun name="decrementar">
            <set name="contador" value="contador - 1" />
            <print id="contador_display">{contador}</print>
        </fun>
    </program>
    </script>

</body>
</html>
```

Cada clique corre a função XLang, que atualiza a variável e reescreve o
`<div id="contador_display">` — tudo dentro da própria XLang, disparado de
fora por um evento HTML comum.

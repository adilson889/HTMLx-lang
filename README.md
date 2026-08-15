# XLang

**Programação usando as próprias tags HTML.**

Sem nova sintaxe pra aprender, sem compilador externo, sem build step. Se já sabes HTML, já sabes 90% da XLang — o resto é só um punhado de tags novas (`<var>`, `<if>`, `<loop>`, `<fun>`...) que se comportam exactamente como esperarias.

```html
<script type="text/xlang">
  <program>
    <var name="a" value="5" />
    <var name="b" value="3" />
    <print>Soma: {a + b}</print>
  </program>
</script>
```

Corre direto no navegador. Sem npm, sem bundler, sem transpilação. É HTML — e o HTML já é a tua interface.

---

## Por que XLang

A maior parte das linguagens separa "o que se vê" de "o que corre". A XLang não separa — o `<program>` vive dentro da própria página, lê e escreve diretamente nos elementos que já lá estão (`id`, `<input>`, `<div>`), sem camada de tradução no meio.

```html
<input type="number" id="idade" />
<div id="resultado"></div>

<script type="text/xlang">
  <program>
    <val name="idade" value="<input type='number' />" />
    <print id="resultado"> Tens {idade} anos </print>
  </program>
</script>
```

---

## Começar agora

1. Importa o interpretador:
```html
<script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
```

2. Escreve o teu programa dentro de `<script type="text/xlang">`:
```html
<script type="text/xlang">
  <program>
    <var name="nome" value="'Mundo'" />
    <print>Olá, {nome}!</print>
  </program>
</script>
```

3. Abre o `.html` num navegador. Pronto.

---

## O que já existe

- Variáveis (`var`, `val`, `set`)
- Controlo de fluxo (`if` / `elseif` / `else`, `switch`)
- Loops (`loop`, `for`, `foreach`, `break`, `continue`)
- Funções (`fun`, `private fun`, `override fun`, recursão)
- Arrays (`array`, `push`, `pop`, `foreach`, indexação)
- Programação orientada a objetos (`class`, herança com `extends`, `super`, métodos privados)
- Interpolação de expressões em qualquer lado (`{a + b}`, `{objeto.metodo()}`)
- Sandboxing: nenhuma expressão XLang tem acesso a `window`, `document` ou APIs do browser fora do que a própria linguagem expõe

## Guia completo

O README cobre o essencial para começar. Para a referência técnica completa — todas as tags, POO em detalhe, arrays, casos de uso reais, boas práticas — consulta o guia completo.

📩 **[https://github.com/adilson889/Xlang/tree/main/examples]**

---

## Licença

*(a definir)*

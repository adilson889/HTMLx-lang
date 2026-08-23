# xlang-validation — Referencia

Lib de validacao de formularios, dados de entrada, e regras de negocio
comuns. Segue o mesmo padrao da `xlang-math`: funcoes nativas registadas
via `R.register`, com validacao de argumentos e mensagens de erro claras.

## Import

```html
<import name="validation"></import>
```

Registro no `xlang-modules.json`:

```json
{
  "validation": "./modules/xlang-validation.js"
}
```

## Presenca / vazio

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isEmpty` | `isEmpty(val)` | `true` se `val` for `null`/`undefined`, string vazia (apos trim), array vazio, ou objeto sem chaves |
| `isNotEmpty` | `isNotEmpty(val)` | oposto de `isEmpty` |
| `isNull` | `isNull(val)` | `true` se `null` ou `undefined` |
| `isNotNull` | `isNotNull(val)` | oposto de `isNull` |

## Texto

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isEmail` | `isEmail(val)` | `true` se `val` tiver formato de email |
| `isUrl` | `isUrl(val)` | `true` se `val` for uma URL valida |
| `isAlpha` | `isAlpha(val)` | `true` se `val` so tiver letras e espacos (inclui acentos) |
| `isAlphanumeric` | `isAlphanumeric(val)` | `true` se `val` so tiver letras e numeros |
| `isNumeric` | `isNumeric(val)` | `true` se `val` (string) representar um numero |
| `minLength` | `minLength(val, n)` | `true` se `val.length >= n` |
| `maxLength` | `maxLength(val, n)` | `true` se `val.length <= n` |
| `lengthBetween` | `lengthBetween(val, min, max)` | `true` se o tamanho estiver no intervalo |
| `matchesPattern` | `matchesPattern(val, pattern)` | `true` se `val` bater com a regex `pattern` (string) |
| `equalsIgnoreCase` | `equalsIgnoreCase(a, b)` | compara duas strings ignorando maiusculas/minusculas |

## Numeros

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isInteger` | `isInteger(val)` | `true` se `val` for inteiro |
| `isPositive` | `isPositive(val)` | `true` se `val > 0` |
| `isNegative` | `isNegative(val)` | `true` se `val < 0` |
| `inRange` | `inRange(val, min, max)` | `true` se `val` estiver entre `min` e `max` (inclusive) |

## Telefone

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isPhone` | `isPhone(val)` | `true` se `val` tiver 7 a 15 digitos, aceita `+`, espacos, hifens, parenteses |

Nao valida formato especifico de pais — so estrutura generica.

## Senha

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isStrongPassword` | `isStrongPassword(val)` | `true` se tiver 8+ caracteres, maiuscula, minuscula, digito e simbolo |
| `passwordsMatch` | `passwordsMatch(a, b)` | `true` se as duas strings forem iguais |

## Cartao / documentos

| Funcao | Assinatura | Devolve |
|---|---|---|
| `isValidLuhn` | `isValidLuhn(val)` | `true` se `val` passar o algoritmo de Luhn (usado em cartoes de credito e outros documentos numericos) |

## Arrays

| Funcao | Assinatura | Devolve |
|---|---|---|
| `hasDuplicates` | `hasDuplicates(arr)` | `true` se houver valores repetidos |
| `allValid` | `allValid(arr, "nomeDaFuncao")` | `true` se `nomeDaFuncao` devolver truthy para todos os itens |
| `anyValid` | `anyValid(arr, "nomeDaFuncao")` | `true` se `nomeDaFuncao` devolver truthy para pelo menos um item |

`nomeDaFuncao` e' o nome de qualquer funcao ja registada no XLang (nativa,
de outra lib, ou tua), passado como string.

## validateForm — validar varios campos de uma vez

A funcao mais util da lib. Recebe uma lista de regras e devolve uma lista
de mensagens de erro (vazia se tudo estiver valido).

```html
<import name="validation"></import>

<div data-xlang>
    <var name="email" value="'nao-e-email'"></var>
    <var name="senha" value="'fraca'"></var>

    <array name="regras" value="[
        { campo: 'email', valor: email, validador: 'isEmail', mensagem: 'Email invalido' },
        { campo: 'senha', valor: senha, validador: 'isStrongPassword', mensagem: 'Senha fraca demais' }
    ]"></array>

    <var name="erros" value="validateForm(regras)"></var>

    <print>{erros}</print>
</div>
```

Cada regra e' um objeto com:

| Campo | Obrigatorio | O que e' |
|---|---|---|
| `valor` | sim | o valor a validar |
| `validador` | sim | nome (string) de uma funcao de validacao ja registada, ex: `'isEmail'` |
| `campo` | nao | nome do campo, usado so se `mensagem` nao for definida |
| `mensagem` | nao | mensagem de erro customizada. Se omitida, usa `"campo: invalid value."` |

Se `validador` apontar para uma funcao que nao existe, `validateForm`
lanca erro (para apanhares erros de digitacao cedo). Se a propria
validacao lancar erro internamente (ex: tipo errado), essa regra conta
como invalida em vez de rebentar o formulario inteiro.

## Combinar com o teste de login

Exemplo pratico, a validar antes de tentar autenticar:

```html
<fun name="login">
    <array name="regras" value="[
        { campo: 'username', valor: username, validador: 'isNotEmpty', mensagem: 'Utilizador obrigatorio' },
        { campo: 'password', valor: password, validador: 'isNotEmpty', mensagem: 'Senha obrigatoria' }
    ]"></array>

    <var name="erros" value="validateForm(regras)"></var>

    <if condition="erros.length > 0">
        <print id="statusMsg">{erros[0]}</print>
    </if>
    <else>
        <if condition="username == 'admin' && password == '1234'">
            <print id="statusMsg">Acesso liberado</print>
        </if>
        <else>
            <print id="statusMsg">Usuario ou senha invalidos</print>
        </else>
    </else>
</fun>
```

## Erros comuns

| Erro | Causa |
|---|---|
| `"X" must be a string` | passaste numero/objeto/array a uma funcao que espera texto |
| `validator function "X" not found` | erro de digitacao no nome passado a `validador`, `allValid` ou `anyValid` |
| `invalid regular expression` | o `pattern` passado a `matchesPattern` nao e' uma regex valida |

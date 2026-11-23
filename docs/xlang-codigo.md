# xlang-codigo — Reference

Code generation library (v0.2). It builds TypeScript source from a tree of nodes, one character at a time, using syntax rules kept as data. There are no ready-made templates: every `const`, `:` and space is emitted by a rule.
Names given by the user are kept exactly as written, and the result is checked before it is returned. If anything is wrong, the library throws an error instead of returning doubtful code.
The output is an `XLangHtml` value (a `<pre><code>` block), so it needs an interpreter with `XLangHtml` support. Without it, the function returns the raw HTML string.

## Import

One import is enough per page: the functions are registered globally, so later `<script type="text/xlang">` blocks can use them.

```html
<import name="xlang.codigo"></import>
```

Registration in xlang-modules.json:

```json
{
  "codigo": "https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/modules/xlang-codigo.js"
}
```

## Functions

| Function | Signature | Returns |
|---|---|---|
| tsPrograma | tsPrograma(utilizador, linhas) | A `<pre><code>` block with the generated TypeScript. Throws if the program does not pass the checks |

### utilizador

A list of names that the user asked for (for example `['alunos']`). Each one must be a valid identifier, and the generated code must declare it with exactly that spelling.

### linhas

A list of lines. Each line becomes one `const` declaration, and has one of two shapes:

| Shape | Generates |
|---|---|
| `[nome, tipo, valor]` | `const nome: tipo = valor;` |
| `[nome, tipo, esq, op, dir]` | `const nome: tipo = esq op dir;` |

- `tipo` is `'number'`, `'string'` or `'boolean'`.
- In the first shape, `valor` is a number, a text or a boolean. Text is written between single quotes and escaped.
- In the second shape, `esq` and `dir` are either a number or a boolean (written as a value), or a text, which is always the **name of a variable** declared in an earlier line.
- `op` is `'+'`, `'-'`, `'*'` or `'/'` for numbers, and `'+'` for strings. Booleans have no operators.

## What is checked

Before any character is returned, the library checks that:

1. Names are valid TypeScript identifiers and are not reserved words (`class`, `function`, `let`...).
2. A name is not declared twice.
3. A variable is declared before it is used.
4. The value has the declared type, and operators are valid for that type. `number` and `string` cannot be combined.
5. Constants come before variables, and variables before functions.
6. Every name in `utilizador` is declared with the exact spelling, has the type that was asked for, and is used by another line (when the program has more than one line).
7. No generated line is longer than 80 columns.

## Generated style

2 spaces of indentation, single quotes, a semicolon after every statement, 80 columns at most, `const` by default, and a blank line between a function and the code around it.

## Errors

Invalid programs throw an error with a clear message, in Portuguese because it is meant to be shown to Lume users. When there is more than one problem, they are joined in one message. Inside `<print>`, an error appears as `[error: ...]` unless the interpreter has a custom print error message.

| Situation | Message |
|---|---|
| A user name was not declared | `A variável do utilizador "turma" não foi declarada.` |
| A user name is never used | `A variável do utilizador "alunos" não é usada em lado nenhum.` |
| Wrong type | `"alunos" é string mas o valor é number.` |
| Reserved word | `"class" é uma palavra reservada do TypeScript; escolhe outro nome.` |
| Use before declaration | `"b" é usada antes de ser declarada.` |
| Wrong order | `"alunos" está fora de ordem: constantes, depois variáveis, depois funções.` |
| Invalid line | `tsPrograma: cada linha é [nome, tipo, valor] ou [nome, tipo, esq, op, dir].` |

## JavaScript API

The module also exposes `window.LumeCodigo` (and `module.exports` in Node), so other scripts, such as a chat, can use the same engine without XLang.

| Function | Purpose |
|---|---|
| criarTabela() | Creates a symbol table |
| registarUtilizador(tabela, nome, tipo?) | Registers a name given by the user. Throws if it is not a valid name |
| declaracao(palavra, nome, tipo, valor) | Node for `const` / `let` |
| funcao(nome, params, retornoTipo, corpo) | Node for a function. `corpo` ends with a `retorno` |
| parametro(nome, tipo), retorno(expr) | Function parameter and `return` nodes |
| literal(valor), ident(nome), binaria(esq, op, dir) | Expression nodes |
| comparacao(esq, op, dir) | Comparison node (`<`, `>`, `<=`, `>=`, `===`, `!==`). Its type is `boolean`; text and boolean only accept `===` and `!==` |
| se(cond, entao, senao?) | `if` node. `cond` must be `boolean`. Each branch must end with a `return`. Without `senao` it generates an `if` followed by the code below it (early return) |
| verificar(programa, tabela) | Returns the list of problems (empty when all is right) |
| emitirLetras(programa) | Returns the characters, in order, for a typing effect |
| gerar(programa, tabela) | Checks, then returns the final text. Throws if there are problems |

## Examples

One line, a user variable:

```html
<script type="text/xlang">
<program>
    <import name="xlang.codigo"></import>
    <array name="utilizador" value="['alunos']"></array>
    <array name="linhas" value="[['alunos', 'number', 120]]"></array>
    <print>{tsPrograma(utilizador, linhas)}</print>
</program>
</script>
```

Generates:

```ts
const alunos: number = 120;
```

Two lines, the second one uses the user variable:

```html
<script type="text/xlang">
<program>
    <import name="xlang.codigo"></import>
    <array name="utilizador" value="['alunos']"></array>
    <array name="linhas" value="[['alunos', 'number', 120], ['total', 'number', 'alunos', '*', 2]]"></array>
    <print>{tsPrograma(utilizador, linhas)}</print>
</program>
</script>
```

Generates:

```ts
const alunos: number = 120;
const total: number = alunos * 2;
```

Two user variables and a calculation:

```html
<script type="text/xlang">
<program>
    <import name="xlang.codigo"></import>
    <array name="utilizador" value="['preco', 'quantidade']"></array>
    <array name="linhas" value="[['preco', 'number', 250], ['quantidade', 'number', 3], ['total', 'number', 'preco', '*', 'quantidade']]"></array>
    <print>{tsPrograma(utilizador, linhas)}</print>
</program>
</script>
```

Generates:

```ts
const preco: number = 250;
const quantidade: number = 3;
const total: number = preco * quantidade;
```

A user variable that was not declared (the library refuses to return code):

```html
<script type="text/xlang">
<program>
    <import name="xlang.codigo"></import>
    <array name="utilizador" value="['turma']"></array>
    <array name="linhas" value="[['alunos', 'number', 120]]"></array>
    <print>{tsPrograma(utilizador, linhas)}</print>
</program>
</script>
```

Shows: `[error: A variável do utilizador "turma" não foi declarada.]`

Using the JavaScript API, with an `if` inside a function:

```js
const C = window.LumeCodigo;
const f = C.funcao('maior', [C.parametro('a', 'number'), C.parametro('b', 'number')], 'number', [
  C.se(C.comparacao(C.ident('a'), '>', C.ident('b')), [C.retorno(C.ident('a'))]),
  C.retorno(C.ident('b'))
]);
console.log(C.gerar([f], C.criarTabela()));
// function maior(a: number, b: number): number {
//   if (a > b) {
//     return a;
//   }
//   return b;
// }
```

Using the JavaScript API, with a function and the letters one by one:

```js
const C = window.LumeCodigo;
const tabela = C.criarTabela();
C.registarUtilizador(tabela, 'alunos');

const programa = [
  C.declaracao('const', 'alunos', 'number', C.literal(120)),
  C.funcao('dobrar', [C.parametro('n', 'number')], 'number',
    [C.retorno(C.binaria(C.ident('n'), '*', C.literal(2)))])
];

console.log(C.gerar(programa, tabela));
// const alunos: number = 120;
//
// function dobrar(n: number): number {
//   return n * 2;
// }

const letras = C.emitirLetras(programa); // ['c', 'o', 'n', 's', 't', ' ', 'a', ...]
```

## Limits of this version

- Only `const`/`let` with `number`, `string` and `boolean`, simple calculations, and functions with one `return`. Through `tsPrograma` only `const` lines are available; functions are built with the JavaScript API.
- `if` and `else` exist only inside functions, through the JavaScript API (not through `tsPrograma`). Their branches must end with `return`.
- No loops, arrays, `import`, `interface` or classes yet.
- The rules (`REGRAS`) live at the top of the module, in a form ready to move to text files.

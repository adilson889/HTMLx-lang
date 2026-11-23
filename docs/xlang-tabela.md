# xlang-tabela — Reference

Table library. Tables come out clean (zebra rows, numbers right-aligned, decimal comma) and work in light and dark themes.
HTML functions return an `XLangHtml` value that `<print>` renders as a table (needs the interpreter with `XLangHtml` support;
without it they return the raw HTML string). `tabMarkdown` returns plain Markdown text, for chats that draw Markdown.

## Import

```html
<import name="xlang.tabela"></import>
```

One import per page is enough: the functions are registered globally.

Registration in xlang-modules.json:

```json
{
  "tabela": "https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/modules/xlang-tabela.js"
}
```

## General tables

| Function | Signature | Returns |
|---|---|---|
| tabTable | tabTable(headers, rows, titulo?, ultimaLinhaTotal?) | Table. If the last argument is true the last row is shown as a total |
| tabMarkdown | tabMarkdown(headers, rows) | Markdown table (number columns right-aligned) |
| tabKeyValue | tabKeyValue(keys, values, titulo?) | Two-column table (property / value) |
| tabTransposed | tabTransposed(headers, rows, titulo?) | Table with rows and columns swapped |

`rows` is an array of arrays, with at most 500 rows.

## Row helpers (return rows, to chain)

| Function | Signature | Returns |
|---|---|---|
| tabSortBy | tabSortBy(rows, coluna, decrescente?) | Rows sorted by a column (0 is the first) |
| tabAddTotal | tabAddTotal(rows, rotulo?) | Rows plus a last row with the sum of each numeric column |
| tabFromCsv | tabFromCsv(texto, separador?) | Rows from CSV text (numbers are converted; separator `;` or `,` is detected) |

## Ready-made tables

| Function | Signature | Table |
|---|---|---|
| tabLinearValues | tabLinearValues(m, b, de, ate, passo?) | x and y of y = mx + b |
| tabQuadraticValues | tabQuadraticValues(a, b, c, de, ate, passo?) | x and y of y = ax² + bx + c |
| tabMultiplication | tabMultiplication(n, ate?) | Times table of n (default up to 10) |
| tabFrequencies | tabFrequencies(values, titulo?) | Value, fi, fr, fr %, Fi, with a total row |
| tabStats | tabStats(values, amostral?, titulo?) | Count, sum, mean, median, mode, min, max, range, variance, standard deviation |
| tabTruth | tabTruth(vars, op, titulo?) | Truth table. op: and, or, xor, nand, nor, implies, iff, not (1 to 4 variables) |

## Errors

Invalid arguments throw an error with a clear message, for example:
`tabTruth: "op" must be one of: and, or, xor, nand, nor, implies, iff, not.`

## Examples

Table with totals:

```html
<script type="text/xlang">
<program>
    <import name="xlang.tabela"></import>
    <array name="cabecalho" value="['Nome', 'Nota', 'Faltas']"></array>
    <array name="alunos" value="[['Ana', 15.5, 2], ['Bruno', 12, 0], ['Carla', 18, 1]]"></array>
    <array name="comTotal" value="tabAddTotal(alunos)"></array>
    <print>{tabTable(cabecalho, comTotal, 'Turma A', true)}</print>
</program>
</script>
```

Sorted by the second column, highest first:

```html
<array name="ordenado" value="tabSortBy(alunos, 1, true)"></array>
<print>{tabTable(cabecalho, ordenado, 'Ranking')}</print>
```

Values of a function:

```html
<print>{tabQuadraticValues(1, -5, 6, 0, 5, 1)}</print>
<print>{tabLinearValues(2, -4, -2, 4, 1)}</print>
```

Times table:

```html
<print>{tabMultiplication(7)}</print>
```

Frequencies and statistics:

```html
<array name="notas" value="[2, 4, 4, 4, 5, 5, 7, 9]"></array>
<print>{tabFrequencies(notas, 'Notas da turma')}</print>
<print>{tabStats(notas)}</print>
```

Truth table:

```html
<array name="variaveis" value="['p', 'q']"></array>
<print>{tabTruth(variaveis, 'implies')}</print>
```

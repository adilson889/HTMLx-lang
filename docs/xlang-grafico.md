# xlang-grafico — Reference

Graphics library. Every function returns an `XLangHtml` value (an SVG drawing) that `<print>` renders as a graphic.
This needs an interpreter with `XLangHtml` support and the SVG whitelist in `sanitizeHtml`. Without it, the functions return the raw SVG string.
Axes and text use `currentColor`, so it works in light and dark themes.

## Import

```html
<from xlang import grafico />
```

Registration in xlang-modules.json:

```json
{
  "grafico": "./modules/xlang-grafico.js"
}
```

## Functions

| Function | Signature | Returns |
|---|---|---|
| plotParabola | plotParabola(a, b, c, titulo?) | SVG of y = ax² + bx + c with vertex and roots marked. "a" must not be zero |
| plotLinear | plotLinear(m, b, titulo?) | SVG of y = mx + b with the y-intercept and the root marked |
| plotPoints | plotPoints(xs, ys, titulo?, ligar?) | SVG with the points; joined by lines if ligar is true |
| plotBars | plotBars(labels, values, titulo?) | SVG bar chart (negative values allowed) |
| plotPie | plotPie(labels, values, titulo?) | SVG pie chart with percentages in the legend (values must not be negative) |
| numberLine | numberLine(min, max, pontos?, titulo?) | SVG number line with the given points marked |

## Errors

Invalid arguments throw an error with a clear message, for example:
`plotParabola: "a" must not be zero (use plotLinear for a straight line).`

## Examples

Parabola with vertex and roots:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <print>{plotParabola(1, -5, 6)}</print>
</program>
</script>
```

Draws y = x² − 5x + 6, with the roots x = 2 and x = 3 and the vertex marked.

Parabola with a custom title (opens downwards because a < 0):

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <print>{plotParabola(-1, 0, 4, 'Trajetoria')}</print>
</program>
</script>
```

Straight line:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <print>{plotLinear(2, -4)}</print>
</program>
</script>
```

Draws y = 2x − 4, with the point (0; −4) and the root x = 2 marked.

Points joined by lines:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <array name="xs" value="[1, 2, 3, 4]"></array>
    <array name="ys" value="[2, 4, 5, 9]"></array>
    <print>{plotPoints(xs, ys, 'Evolucao', true)}</print>
</program>
</script>
```

Bar chart:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <array name="turmas" value="['A', 'B', 'C']"></array>
    <array name="notas" value="[3, 7, 5]"></array>
    <print>{plotBars(turmas, notas, 'Notas por turma')}</print>
</program>
</script>
```

Pie chart:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <array name="opcoes" value="['Sim', 'Nao']"></array>
    <array name="votos" value="[60, 40]"></array>
    <print>{plotPie(opcoes, votos, 'Votos')}</print>
</program>
</script>
```

Number line with marked points:

```html
<script type="text/xlang">
<program>
    <from xlang import grafico />
    <array name="solucoes" value="[-2, 3]"></array>
    <print>{numberLine(-5, 5, solucoes, 'Solucoes')}</print>
</program>
</script>
```

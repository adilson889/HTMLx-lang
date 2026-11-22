# xlang-grafico — Reference

Graphics library. Every function returns an SVG string (`<svg ...>`) ready to insert in the page or chat.
Axes and text use `currentColor`, so it works in light and dark themes.

## Import

```html
<from xlang import grafico>
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

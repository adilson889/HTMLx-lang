// xlang-grafico.js - XLang Graphics Library v1.0
// Gráficos em SVG (string) para mostrar no chat: parábola, reta, pontos, barras, pizza e reta numérica.
// Cada função devolve uma string "<svg ...>...</svg>" pronta a inserir. Usa currentColor nos eixos e no texto,
// por isso funciona em tema claro e escuro.
(function() {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;
    // se o interpretador suportar XLangHtml, o SVG e desenhado; senao devolve a string
    const html = (s) => (window.XLangHtml ? new window.XLangHtml(s) : s);
    const CORES = ['#4f6bed', '#e8833a', '#2fa36b', '#c94f7c', '#8a6fdf', '#d4a017'];

    function requireNumbers(args, fnName) {
        for (const a of args) {
            if (typeof a !== 'number' || Number.isNaN(a) || !Number.isFinite(a)) {
                throw new Error(`${fnName}: all arguments must be finite numbers.`);
            }
        }
    }
    function requireNumericArray(val, fnName, label) {
        if (!Array.isArray(val)) throw new Error(`${fnName}: "${label}" must be an array.`);
        if (val.length === 0) throw new Error(`${fnName}: "${label}" must not be empty.`);
        for (const v of val) {
            if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
                throw new Error(`${fnName}: "${label}" must contain only finite numbers.`);
            }
        }
    }
    function requireLabels(val, n, fnName) {
        if (!Array.isArray(val) || val.length !== n) {
            throw new Error(`${fnName}: "labels" must be an array with the same length as the values.`);
        }
    }
    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function fmt(n) {
        const r = Math.round(n * 100) / 100;
        return String(Object.is(r, -0) ? 0 : r).replace('.', ',');
    }
    function num(n) { return Math.round(n * 100) / 100; }

    // passo "bonito" para as marcas dos eixos
    function passo(intervalo, alvo) {
        const bruto = intervalo / alvo;
        const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
        const f = bruto / mag;
        return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * mag;
    }

    const W = 360, H = 260, ML = 38, MR = 14, MT = 28, MB = 28;

    function abrir(titulo) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;height:auto;color:inherit" role="img" aria-label="${esc(titulo || 'grafico')}" font-family="sans-serif" font-size="10">`
            + (titulo ? `<text x="${W / 2}" y="16" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor">${esc(titulo)}</text>` : '');
    }

    // Plano cartesiano com eixos, grelha e marcas. Devolve {svg, X, Y} (funções de conversão)
    function plano(xmin, xmax, ymin, ymax, titulo) {
        if (xmax - xmin < 1e-9) { xmin -= 1; xmax += 1; }
        if (ymax - ymin < 1e-9) { ymin -= 1; ymax += 1; }
        const px = (W - ML - MR), py = (H - MT - MB);
        const X = (x) => ML + (x - xmin) / (xmax - xmin) * px;
        const Y = (y) => MT + (1 - (y - ymin) / (ymax - ymin)) * py;
        let s = abrir(titulo);
        const sx = passo(xmax - xmin, 6), sy = passo(ymax - ymin, 5);
        for (let x = Math.ceil(xmin / sx) * sx; x <= xmax + 1e-9; x += sx) {
            s += `<line x1="${num(X(x))}" y1="${MT}" x2="${num(X(x))}" y2="${H - MB}" stroke="currentColor" stroke-opacity="0.12"/>`;
            s += `<text x="${num(X(x))}" y="${H - MB + 12}" text-anchor="middle" fill="currentColor" fill-opacity="0.7">${fmt(x)}</text>`;
        }
        for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) {
            s += `<line x1="${ML}" y1="${num(Y(y))}" x2="${W - MR}" y2="${num(Y(y))}" stroke="currentColor" stroke-opacity="0.12"/>`;
            s += `<text x="${ML - 4}" y="${num(Y(y)) + 3}" text-anchor="end" fill="currentColor" fill-opacity="0.7">${fmt(y)}</text>`;
        }
        const ex = (0 >= xmin && 0 <= xmax) ? X(0) : ML;
        const ey = (0 >= ymin && 0 <= ymax) ? Y(0) : H - MB;
        s += `<line x1="${ML}" y1="${num(ey)}" x2="${W - MR}" y2="${num(ey)}" stroke="currentColor" stroke-width="1.2"/>`;
        s += `<line x1="${num(ex)}" y1="${MT}" x2="${num(ex)}" y2="${H - MB}" stroke="currentColor" stroke-width="1.2"/>`;
        return { svg: s, X, Y };
    }

    function ponto(X, Y, x, y, cor, rotulo, abaixo) {
        let s = `<circle cx="${num(X(x))}" cy="${num(Y(y))}" r="3.5" fill="${cor}"/>`;
        if (rotulo) s += `<text x="${num(X(x)) + 6}" y="${num(Y(y)) + (abaixo ? 16 : -7)}" fill="currentColor" font-size="10">${esc(rotulo)}</text>`;
        return s;
    }

    function curva(X, Y, f, xmin, xmax, ymin, ymax, cor) {
        let d = '', abrirTraco = true;
        const n = 160;
        for (let i = 0; i <= n; i++) {
            const x = xmin + (xmax - xmin) * i / n, y = f(x);
            if (!Number.isFinite(y) || y < ymin - (ymax - ymin) || y > ymax + (ymax - ymin)) { abrirTraco = true; continue; }
            d += (abrirTraco ? 'M' : 'L') + num(X(x)) + ' ' + num(Y(y)) + ' ';
            abrirTraco = false;
        }
        return `<path d="${d.trim()}" fill="none" stroke="${cor}" stroke-width="2" stroke-linejoin="round"/>`;
    }

    // ===== FUNCOES =====
    // plotParabola(a, b, c): y = ax² + bx + c, com vértice e raízes marcados
    R.register('plotParabola', (a, b, c, titulo) => {
        requireNumbers([a, b, c], 'plotParabola');
        if (a === 0) throw new Error('plotParabola: "a" must not be zero (use plotLinear for a straight line).');
        const xv = -b / (2 * a), yv = a * xv * xv + b * xv + c, d = b * b - 4 * a * c;
        const raizes = d >= 0 ? [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)] : [];
        const xs = [xv, 0].concat(raizes);
        let xmin = Math.min(...xs), xmax = Math.max(...xs);
        const folga = Math.max((xmax - xmin) * 0.35, 1.5);
        xmin -= folga; xmax += folga;
        const f = (x) => a * x * x + b * x + c;
        const ys = [yv, c, 0], ext = Math.max(Math.abs(f(xmin)), Math.abs(f(xmax)));
        let ymin = Math.min(...ys), ymax = Math.max(...ys);
        if (a > 0) ymax = Math.max(ymax, Math.min(ext, Math.abs(yv) * 3 + 6)); else ymin = Math.min(ymin, -Math.min(ext, Math.abs(yv) * 3 + 6));
        const pad = (ymax - ymin) * 0.12 || 1; ymin -= pad; ymax += pad;
        const p = plano(xmin, xmax, ymin, ymax, titulo === undefined ? 'y = ' + eq2(a, b, c) : titulo);
        let s = p.svg + curva(p.X, p.Y, f, xmin, xmax, ymin, ymax, CORES[0]);
        s += ponto(p.X, p.Y, xv, yv, CORES[1], `vértice (${fmt(xv)}; ${fmt(yv)})`, a > 0);
        raizes.forEach((r, i) => { if (i === 0 || Math.abs(r - raizes[0]) > 1e-9) s += ponto(p.X, p.Y, r, 0, CORES[2], `x = ${fmt(r)}`, a < 0); });
        return html(s + '</svg>');
    });

    // plotLinear(m, b): y = mx + b
    R.register('plotLinear', (m, b, titulo) => {
        requireNumbers([m, b], 'plotLinear');
        const xr = m !== 0 ? -b / m : 0;
        const xs = [0, xr, 1], xmin0 = Math.min(...xs), xmax0 = Math.max(...xs);
        const folga = Math.max((xmax0 - xmin0) * 0.5, 3);
        const xmin = xmin0 - folga, xmax = xmax0 + folga;
        const y1 = m * xmin + b, y2 = m * xmax + b;
        const ymin = Math.min(y1, y2, 0), ymax = Math.max(y1, y2, 0), pad = (ymax - ymin) * 0.1 || 1;
        const p = plano(xmin, xmax, ymin - pad, ymax + pad, titulo === undefined ? 'y = ' + fmt(m) + 'x ' + (b < 0 ? '− ' : '+ ') + fmt(Math.abs(b)) : titulo);
        let s = p.svg + `<line x1="${num(p.X(xmin))}" y1="${num(p.Y(y1))}" x2="${num(p.X(xmax))}" y2="${num(p.Y(y2))}" stroke="${CORES[0]}" stroke-width="2"/>`;
        s += ponto(p.X, p.Y, 0, b, CORES[1], `(0; ${fmt(b)})`);
        if (m !== 0) s += ponto(p.X, p.Y, xr, 0, CORES[2], `x = ${fmt(xr)}`);
        return html(s + '</svg>');
    });

    // plotPoints(xs, ys, titulo, ligar): pontos (e opcionalmente ligados por linhas)
    R.register('plotPoints', (xs, ys, titulo, ligar) => {
        requireNumericArray(xs, 'plotPoints', 'xs');
        requireNumericArray(ys, 'plotPoints', 'ys');
        if (xs.length !== ys.length) throw new Error('plotPoints: xs and ys must have the same length.');
        const xmin = Math.min(...xs, 0), xmax = Math.max(...xs, 0), ymin = Math.min(...ys, 0), ymax = Math.max(...ys, 0);
        const px = (xmax - xmin) * 0.1 || 1, py = (ymax - ymin) * 0.12 || 1;
        const p = plano(xmin - px, xmax + px, ymin - py, ymax + py, titulo);
        let s = p.svg;
        if (ligar) s += `<polyline points="${xs.map((x, i) => num(p.X(x)) + ',' + num(p.Y(ys[i]))).join(' ')}" fill="none" stroke="${CORES[0]}" stroke-width="2"/>`;
        xs.forEach((x, i) => { s += ponto(p.X, p.Y, x, ys[i], CORES[1]); });
        return html(s + '</svg>');
    });

    // ===== BARRAS / PIZZA =====
    R.register('plotBars', (labels, values, titulo) => {
        requireNumericArray(values, 'plotBars', 'values');
        requireLabels(labels, values.length, 'plotBars');
        const ymax0 = Math.max(...values, 0), ymin0 = Math.min(...values, 0), pad = (ymax0 - ymin0) * 0.1 || 1;
        const ymin = ymin0 < 0 ? ymin0 - pad : 0, ymax = ymax0 + pad;
        const p = plano(0, values.length, ymin, ymax, titulo);
        // remove marcas verticais do eixo x (nao fazem sentido em categorias): redesenha o plano sem texto em x
        let s = p.svg.replace(new RegExp(`<text x="[\\d.]+" y="${H - MB + 12}"[^>]*>[^<]*</text>`, 'g'), '');
        const larg = (W - ML - MR) / values.length;
        values.forEach((v, i) => {
            const x0 = ML + i * larg + larg * 0.18, w = larg * 0.64, y0 = p.Y(Math.max(v, 0)), y1 = p.Y(Math.min(v, 0));
            s += `<rect x="${num(x0)}" y="${num(y0)}" width="${num(w)}" height="${num(Math.max(y1 - y0, 0.5))}" rx="2" fill="${CORES[i % CORES.length]}"/>`;
            s += `<text x="${num(x0 + w / 2)}" y="${num(y0) - 3}" text-anchor="middle" fill="currentColor" font-size="10">${fmt(v)}</text>`;
            s += `<text x="${num(x0 + w / 2)}" y="${H - MB + 12}" text-anchor="middle" fill="currentColor" fill-opacity="0.8">${esc(labels[i])}</text>`;
        });
        return html(s + '</svg>');
    });

    R.register('plotPie', (labels, values, titulo) => {
        requireNumericArray(values, 'plotPie', 'values');
        requireLabels(labels, values.length, 'plotPie');
        if (values.some((v) => v < 0)) throw new Error('plotPie: values must not be negative.');
        const tot = values.reduce((a, b) => a + b, 0);
        if (tot === 0) throw new Error('plotPie: the sum of the values must be greater than zero.');
        const cx = 110, cy = 140, r = 82;
        let s = abrir(titulo), ang = -Math.PI / 2;
        values.forEach((v, i) => {
            const fr = v / tot, a2 = ang + fr * Math.PI * 2, cor = CORES[i % CORES.length];
            if (fr >= 0.9999) s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cor}"/>`;
            else if (fr > 0) s += `<path d="M${cx} ${cy} L${num(cx + r * Math.cos(ang))} ${num(cy + r * Math.sin(ang))} A${r} ${r} 0 ${fr > 0.5 ? 1 : 0} 1 ${num(cx + r * Math.cos(a2))} ${num(cy + r * Math.sin(a2))} Z" fill="${cor}" stroke="#fff" stroke-width="1"/>`;
            s += `<rect x="212" y="${44 + i * 20}" width="11" height="11" rx="2" fill="${cor}"/>`;
            s += `<text x="228" y="${54 + i * 20}" fill="currentColor">${esc(labels[i])} (${fmt(fr * 100)}%)</text>`;
            ang = a2;
        });
        return html(s + '</svg>');
    });

    // ===== RETA NUMERICA =====
    // numberLine(min, max, pontos, titulo): marca pontos numa reta
    R.register('numberLine', (min, max, pontos, titulo) => {
        requireNumbers([min, max], 'numberLine');
        if (min >= max) throw new Error('numberLine: min must be less than max.');
        const pts = pontos === undefined ? [] : pontos;
        if (!Array.isArray(pts)) throw new Error('numberLine: "pontos" must be an array.');
        requireNumbers(pts, 'numberLine');
        const h = 110, X = (x) => 20 + (x - min) / (max - min) * (W - 40);
        let s = abrir(titulo).replace(`viewBox="0 0 ${W} ${H}"`, `viewBox="0 0 ${W} ${h}"`);
        s += `<line x1="14" y1="64" x2="${W - 14}" y2="64" stroke="currentColor" stroke-width="1.5"/>`;
        const st = passo(max - min, 8);
        for (let x = Math.ceil(min / st) * st; x <= max + 1e-9; x += st) {
            s += `<line x1="${num(X(x))}" y1="59" x2="${num(X(x))}" y2="69" stroke="currentColor"/><text x="${num(X(x))}" y="84" text-anchor="middle" fill="currentColor" fill-opacity="0.8">${fmt(x)}</text>`;
        }
        pts.forEach((p, i) => {
            if (p < min || p > max) return;
            s += `<circle cx="${num(X(p))}" cy="64" r="5" fill="${CORES[i % CORES.length]}"/><text x="${num(X(p))}" y="50" text-anchor="middle" fill="currentColor" font-weight="600">${fmt(p)}</text>`;
        });
        return html(s + '</svg>');
    });

    function eq2(a, b, c) {
        const t = (k, v, p) => (k === 0 ? '' : (p ? (k < 0 ? ' − ' : ' + ') : (k < 0 ? '−' : '')) + (Math.abs(k) === 1 && v ? '' : fmt(Math.abs(k))) + v);
        let o = t(a, 'x²', false);
        o += t(b, 'x', o !== '');
        o += t(c, '', o !== '');
        return o || '0';
    }
})();

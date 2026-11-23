// xlang-tabela.js - XLang Table Library v1.0
// Tabelas limpas (HTML seguro ou Markdown) e geradores prontos: valores de funcoes, frequencias,
// resumo estatistico, tabela de verdade e tabuada. Usa so tags/atributos aceites pelo sanitizeHtml
// do interpretador (div, table, thead, tbody, tr, th, td, style) e cores com transparencia, por isso
// funciona em tema claro e escuro. Os numeros saem com virgula decimal (formato portugues).
(function() {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;
    // se o interpretador suportar XLangHtml, a tabela e desenhada; senao devolve a string HTML
    const html = (s) => (window.XLangHtml ? new window.XLangHtml(s) : s);

    function requireArray(val, fnName, label) {
        if (!Array.isArray(val)) throw new Error(`${fnName}: "${label}" must be an array.`);
    }
    function requireNumbers(args, fnName) {
        for (const a of args) {
            if (typeof a !== 'number' || Number.isNaN(a) || !Number.isFinite(a)) {
                throw new Error(`${fnName}: all numeric arguments must be finite numbers.`);
            }
        }
    }
    function requireNumericArray(val, fnName, label) {
        requireArray(val, fnName, label);
        if (val.length === 0) throw new Error(`${fnName}: "${label}" must not be empty.`);
        for (const v of val) {
            if (typeof v !== 'number' || Number.isNaN(v) || !Number.isFinite(v)) {
                throw new Error(`${fnName}: "${label}" must contain only finite numbers.`);
            }
        }
    }
    function requireMatrix(rows, fnName) {
        requireArray(rows, fnName, 'rows');
        for (const r of rows) {
            if (!Array.isArray(r)) throw new Error(`${fnName}: "rows" must be an array of arrays.`);
        }
    }
    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    // 1234.5 -> "1 234,5" (ate 4 decimais, sem zeros a mais)
    function fmt(n) {
        const r = Math.round(n * 1e4) / 1e4;
        const [int, dec] = String(Object.is(r, -0) ? 0 : r).split('.');
        const grupos = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return (dec ? grupos + ',' + dec : grupos).replace('-', '−');
    }
    function cel(v) {
        if (typeof v === 'number') return Number.isFinite(v) ? fmt(v) : String(v);
        if (typeof v === 'boolean') return v ? 'V' : 'F';
        if (v === null || v === undefined) return '';
        return String(v);
    }
    const eNumero = (v) => typeof v === 'number' && Number.isFinite(v);

    // ===== ESTILOS (cores com transparencia: servem em tema claro e escuro) =====
    const BORDA = '1px solid rgba(128,128,128,.35)';
    const S_TABELA = `border-collapse:collapse;width:100%;font-size:14px;line-height:1.35`;
    const S_TH = `border:${BORDA};padding:6px 10px;background:rgba(128,128,128,.18);font-weight:600;text-align:center`;
    const S_TD = `border:${BORDA};padding:5px 10px`;
    const S_TITULO = 'font-weight:600;margin:8px 0 4px;font-size:15px';

    // alinhamento por coluna: V/F ao centro; maioria de numeros a direita; o resto a esquerda
    function alinhamento(rows, j) {
        const col = rows.map((r) => r[j]).filter((v) => v !== '' && v !== undefined && v !== null);
        if (col.length && col.every((v) => v === 'V' || v === 'F' || typeof v === 'boolean')) return 'center';
        return col.length && col.filter(eNumero).length * 2 >= col.length ? 'right' : 'left';
    }
    // "ax² + bx + c" legivel: omite coeficientes 1 e 0 e usa o sinal certo
    function equacao(a, b, c) {
        const t = (k, v, depois) => (k === 0 ? '' : (depois ? (k < 0 ? ' − ' : ' + ') : (k < 0 ? '−' : '')) + (Math.abs(k) === 1 && v ? '' : fmt(Math.abs(k))) + v);
        let o = t(a, 'x²', false);
        o += t(b, 'x', o !== '');
        o += t(c, '', o !== '');
        return o || '0';
    }
    function construir(headers, rows, titulo, total) {
        const alin = Array.from({ length: Math.max(...rows.map((r) => r.length), 0) }, (_, j) => alinhamento(rows, j));
        let s = '';
        if (titulo) s += `<div style="${S_TITULO}">${esc(titulo)}</div>`;
        s += `<div style="overflow-x:auto;margin:4px 0 10px"><table style="${S_TABELA}">`;
        if (headers.length) {
            s += '<thead><tr>' + headers.map((h) => `<th style="${S_TH}">${esc(cel(h))}</th>`).join('') + '</tr></thead>';
        }
        s += '<tbody>';
        rows.forEach((r, i) => {
            const ultimo = total && i === rows.length - 1;
            const fundo = ultimo ? 'rgba(128,128,128,.18)' : (i % 2 === 1 ? 'rgba(128,128,128,.07)' : 'transparent');
            s += `<tr style="background:${fundo}${ultimo ? ';font-weight:600' : ''}">`;
            r.forEach((v, j) => {
                const al = alin[j];
                s += `<td style="${S_TD};text-align:${al}">${esc(cel(v))}</td>`;
            });
            s += '</tr>';
        });
        return s + '</tbody></table></div>';
    }
    function markdown(headers, rows) {
        const n = Math.max(headers.length, ...rows.map((r) => r.length), 1);
        const lim = (c) => cel(c).replace(/\|/g, '\\|').replace(/\n/g, ' ');
        const linha = (r) => '| ' + Array.from({ length: n }, (_, i) => lim(r[i])).join(' | ') + ' |';
        const hs = headers.length ? headers : Array.from({ length: n }, () => '');
        const al = Array.from({ length: n }, (_, i) => (rows.length && rows.every((r) => eNumero(r[i])) ? '---:' : '---'));
        return [linha(hs), '| ' + al.join(' | ') + ' |'].concat(rows.map(linha)).join('\n');
    }
    function validar(headers, rows, fnName) {
        requireArray(headers, fnName, 'headers');
        requireMatrix(rows, fnName);
        if (rows.length > 500) throw new Error(`${fnName}: too many rows (max 500).`);
    }

    // ===== TABELAS GERAIS =====
    // tabTable(headers, rows, titulo?, ultimaLinhaTotal?)
    R.register('tabTable', (headers, rows, titulo, total) => {
        validar(headers, rows, 'tabTable');
        return html(construir(headers, rows, titulo, !!total));
    });
    // tabMarkdown(headers, rows): para chats que desenham Markdown (colunas de numeros alinhadas a direita)
    R.register('tabMarkdown', (headers, rows) => {
        validar(headers, rows, 'tabMarkdown');
        return markdown(headers, rows);
    });
    // tabKeyValue(keys, values, titulo?): tabela de duas colunas (propriedade | valor)
    R.register('tabKeyValue', (keys, values, titulo) => {
        requireArray(keys, 'tabKeyValue', 'keys');
        requireArray(values, 'tabKeyValue', 'values');
        if (keys.length !== values.length) throw new Error('tabKeyValue: keys and values must have the same length.');
        return html(construir([], keys.map((k, i) => [k, values[i]]), titulo, false));
    });
    // tabTransposed(headers, rows, titulo?): troca linhas por colunas
    R.register('tabTransposed', (headers, rows, titulo) => {
        validar(headers, rows, 'tabTransposed');
        const todas = [headers].concat(rows), n = Math.max(...todas.map((r) => r.length), 0);
        const t = Array.from({ length: n }, (_, j) => todas.map((r) => r[j]));
        return html(construir([], t, titulo, false));
    });

    // ===== OPERACOES SOBRE LINHAS (devolvem linhas, para encadear) =====
    // tabSortBy(rows, coluna, decrescente?)
    R.register('tabSortBy', (rows, col, desc) => {
        requireMatrix(rows, 'tabSortBy');
        requireNumbers([col], 'tabSortBy');
        const k = desc ? -1 : 1;
        return rows.slice().sort((a, b) => {
            const x = a[col], y = b[col];
            if (typeof x === 'number' && typeof y === 'number') return k * (x - y);
            return k * String(x).localeCompare(String(y), 'pt');
        });
    });
    // tabAddTotal(rows, rotulo?): acrescenta uma linha com a soma das colunas numericas
    R.register('tabAddTotal', (rows, rotulo) => {
        requireMatrix(rows, 'tabAddTotal');
        if (rows.length === 0) throw new Error('tabAddTotal: "rows" must not be empty.');
        const n = Math.max(...rows.map((r) => r.length));
        const tot = Array.from({ length: n }, (_, j) => {
            const col = rows.map((r) => r[j]);
            return col.every(eNumero) ? col.reduce((a, b) => a + b, 0) : '';
        });
        if (tot[0] === '') tot[0] = rotulo === undefined ? 'Total' : rotulo;
        return rows.concat([tot]);
    });
    // tabFromCsv(texto, separador?): "a;b\n1;2" -> [['a','b'],[1,2]] (numeros convertidos)
    R.register('tabFromCsv', (texto, sep) => {
        if (typeof texto !== 'string') throw new Error('tabFromCsv: "texto" must be a string.');
        const s = sep === undefined ? (texto.includes(';') ? ';' : ',') : sep;
        return texto.split(/\r?\n/).filter((l) => l.trim() !== '').map((l) =>
            l.split(s).map((c) => {
                const t = c.trim();
                return t !== '' && /^-?\d+([.,]\d+)?$/.test(t) ? parseFloat(t.replace(',', '.')) : t;
            }));
    });

    // ===== GERADORES (matematica e estatistica) =====
    function intervalo(de, ate, passo, fnName) {
        requireNumbers([de, ate, passo], fnName);
        if (passo === 0) throw new Error(`${fnName}: step must not be zero.`);
        const xs = [];
        for (let x = de, i = 0; (passo > 0 ? x <= ate + 1e-9 : x >= ate - 1e-9); x += passo, i++) {
            if (i > 200) throw new Error(`${fnName}: too many rows (max 200).`);
            xs.push(Math.round(x * 1e9) / 1e9);
        }
        return xs;
    }
    // tabLinearValues(m, b, de, ate, passo): x e y de y = mx + b
    R.register('tabLinearValues', (m, b, de, ate, passo) => {
        requireNumbers([m, b], 'tabLinearValues');
        const xs = intervalo(de, ate, passo === undefined ? 1 : passo, 'tabLinearValues');
        return html(construir(['x', 'y = mx + b'], xs.map((x) => [x, m * x + b]), 'Tabela de y = ' + (m === 0 ? '' : (m === 1 ? '' : m === -1 ? '−' : fmt(m)) + 'x') + (b === 0 ? (m === 0 ? '0' : '') : (m === 0 ? fmt(b) : (b < 0 ? ' − ' : ' + ') + fmt(Math.abs(b)))), false));
    });
    // tabQuadraticValues(a, b, c, de, ate, passo): x e y de y = ax2 + bx + c
    R.register('tabQuadraticValues', (a, b, c, de, ate, passo) => {
        requireNumbers([a, b, c], 'tabQuadraticValues');
        const xs = intervalo(de, ate, passo === undefined ? 1 : passo, 'tabQuadraticValues');
        return html(construir(['x', 'y = ax² + bx + c'], xs.map((x) => [x, a * x * x + b * x + c]), 'Tabela de y = ' + equacao(a, b, c), false));
    });
    // tabMultiplication(n, ate?): tabuada de n
    R.register('tabMultiplication', (n, ate) => {
        requireNumbers([n], 'tabMultiplication');
        const lim = ate === undefined ? 10 : ate;
        requireNumbers([lim], 'tabMultiplication');
        if (lim < 1 || lim > 100 || !Number.isInteger(lim)) throw new Error('tabMultiplication: "ate" must be an integer between 1 and 100.');
        const rows = Array.from({ length: lim }, (_, i) => [`${fmt(n)} × ${i + 1}`, n * (i + 1)]);
        return html(construir([], rows, `Tabuada do ${fmt(n)}`, false));
    });
    // tabFrequencies(values, titulo?): valor, fi, fr, fr %, Fi
    R.register('tabFrequencies', (values, titulo) => {
        requireArray(values, 'tabFrequencies', 'values');
        if (values.length === 0) throw new Error('tabFrequencies: "values" must not be empty.');
        const cont = new Map();
        values.forEach((v) => cont.set(v, (cont.get(v) || 0) + 1));
        const chaves = [...cont.keys()].sort((a, b) =>
            typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'pt'));
        const n = values.length;
        let acum = 0;
        const rows = chaves.map((k) => {
            const f = cont.get(k);
            acum += f;
            return [k, f, Math.round(f / n * 1e4) / 1e4, fmt(f / n * 100) + ' %', acum];
        });
        rows.push(['Total', n, 1, '100 %', n]);
        return html(construir(['Valor', 'fᵢ', 'fr', 'fr (%)', 'Fᵢ'], rows, titulo === undefined ? 'Tabela de frequências' : titulo, true));
    });
    // tabStats(values, amostral?, titulo?): resumo estatistico
    R.register('tabStats', (values, amostral, titulo) => {
        requireNumericArray(values, 'tabStats', 'values');
        const n = values.length, soma = values.reduce((a, b) => a + b, 0), media = soma / n;
        const ord = values.slice().sort((a, b) => a - b), meio = Math.floor(n / 2);
        const mediana = n % 2 ? ord[meio] : (ord[meio - 1] + ord[meio]) / 2;
        const cont = new Map();
        values.forEach((v) => cont.set(v, (cont.get(v) || 0) + 1));
        const maxF = Math.max(...cont.values());
        const modas = [...cont].filter(([, c]) => c === maxF).map(([v]) => v).sort((a, b) => a - b);
        const moda = maxF === 1 ? 'não há' : (modas.length === 1 ? modas[0] : modas.map(fmt).join('; '));
        const ss = values.reduce((a, v) => a + (v - media) * (v - media), 0);
        if (amostral && n < 2) throw new Error('tabStats: sample statistics need at least two values.');
        const vari = ss / (amostral ? n - 1 : n);
        const rows = [
            ['Número de valores', n], ['Soma', soma], ['Média', media], ['Mediana', mediana], ['Moda', moda],
            ['Mínimo', ord[0]], ['Máximo', ord[n - 1]], ['Amplitude', ord[n - 1] - ord[0]],
            [amostral ? 'Variância (amostral)' : 'Variância', vari], [amostral ? 'Desvio padrão (amostral)' : 'Desvio padrão', Math.sqrt(vari)]
        ];
        return html(construir(['Medida', 'Valor'], rows, titulo === undefined ? 'Resumo estatístico' : titulo, false));
    });
    // tabTruth(variaveis, operador, titulo?): tabela de verdade. operador: and, or, xor, nand, nor, implies, iff, not
    R.register('tabTruth', (vars, op, titulo) => {
        requireArray(vars, 'tabTruth', 'vars');
        const OPS = {
            and: ['∧', (a) => a.every(Boolean)], or: ['∨', (a) => a.some(Boolean)],
            xor: ['⊕', (a) => a.filter(Boolean).length % 2 === 1],
            nand: ['↑', (a) => !a.every(Boolean)], nor: ['↓', (a) => !a.some(Boolean)],
            implies: ['→', (a) => !a[0] || a[1]], iff: ['↔', (a) => a[0] === a[1]],
            not: ['¬', (a) => !a[0]]
        };
        if (typeof op !== 'string' || !OPS[op]) throw new Error('tabTruth: "op" must be one of: and, or, xor, nand, nor, implies, iff, not.');
        const bin = (op === 'implies' || op === 'iff');
        const n = op === 'not' ? 1 : vars.length;
        if (op === 'not' && vars.length < 1) throw new Error('tabTruth: "not" needs one variable.');
        if (bin && vars.length !== 2) throw new Error(`tabTruth: "${op}" needs exactly two variables.`);
        if (n < 1 || n > 4) throw new Error('tabTruth: use between 1 and 4 variables.');
        const nomes = vars.slice(0, n).map(String), [simb, f] = OPS[op];
        const expr = op === 'not' ? `¬${nomes[0]}` : nomes.join(` ${simb} `);
        const rows = [];
        for (let i = 0; i < (1 << n); i++) {
            const vals = nomes.map((_, j) => Boolean((i >> (n - 1 - j)) & 1));
            rows.push(vals.map((v) => (v ? 'V' : 'F')).concat([f(vals) ? 'V' : 'F']));
        }
        return html(construir(nomes.concat([expr]), rows, titulo === undefined ? 'Tabela de verdade' : titulo, false));
    });
})();

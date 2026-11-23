// xlang-desenhos.js - XLang Drawings Library v0.1
// Desenhos em estilo aguarela/lapis de cor, em SVG (string), para mostrar no chat.
// Cada funcao devolve uma string "<svg ...>...</svg>" pronta a inserir (XLangHtml, se o interpretador o suportar).
// So usa as tags e atributos da lista branca do sanitizeHtml (sem <ellipse>, sem "opacity"): elipses saem como
// <path> com arcos e a transparencia usa fill-opacity / stroke-opacity.
// O SVG e gerado por codigo (nao ha desenhos guardados): a "semente" muda as flores, as hachuras e as manchas.
(function () {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;
    const html = (s) => (window.XLangHtml ? new window.XLangHtml(s) : s);

    // ---------- utilitarios ----------
    const OUT = '#3b2a22';
    const f = (x) => String(Math.round(x * 10) / 10);
    const at = (o) => Object.keys(o).map((k) => `${k}="${o[k]}"`).join(' ');
    const tag = (n, o, inner) => `<${n}${o && Object.keys(o).length ? ' ' + at(o) : ''}>${inner || ''}</${n}>`;
    const circ = (cx, cy, r, o) => tag('circle', Object.assign({ cx: f(cx), cy: f(cy), r: f(r) }, o));
    const rec = (x, y, w, h, o) => tag('rect', Object.assign({ x: f(x), y: f(y), width: f(w), height: f(h) }, o));
    const pth = (d, o) => tag('path', Object.assign({ d }, o));
    const poly = (pts, o) => tag('polygon', Object.assign({ points: pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' ') }, o));
    const grp = (inner, o) => tag('g', o, Array.isArray(inner) ? inner.join('') : inner);
    // elipse como <path> (a tag <ellipse> nao esta na lista branca)
    const ell = (cx, cy, rx, ry, o) =>
        pth(`M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0z`, o);

    function rng(seed) {
        let a = seed >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // ---------- a casa ----------
    function casa(semente) {
        const rnd = rng(semente);
        const uni = (a, b) => a + (b - a) * rnd();
        const esc = (arr) => arr[Math.floor(rnd() * arr.length)];
        const S = [];

        // papel e ceu aguarelado
        S.push(rec(0, 0, 400, 262, { fill: '#fffbf0' }));
        S.push(rec(5, 5, 390, 226, { fill: '#a4cfef' }));
        for (let i = 0; i < 14; i++) {
            S.push(ell(uni(20, 380), uni(15, 210), uni(30, 70), uni(10, 22),
                { fill: esc(['#d3eaf9', '#8dbfe6', '#c4e1f6', '#ffffff']), 'fill-opacity': 0.45 }));
        }

        // nuvens (duas passagens: contorno e miolo)
        const nuvem = (cx, cy, s) => {
            const cs = [[-16, 3, 9], [-6, -4, 12], [8, -3, 11], [18, 4, 8], [0, 5, 11]];
            return grp(cs.map((c) => circ(cx + c[0] * s, cy + c[1] * s, c[2] * s)), { fill: '#fff', stroke: '#8aa3c6', 'stroke-width': 1 })
                + grp(cs.map((c) => circ(cx + c[0] * s, cy + c[1] * s, c[2] * s * 0.85)), { fill: '#fff' })
                + ell(cx, cy + 8 * s, 20 * s, 4 * s, { fill: '#dbe7f6', 'fill-opacity': 0.8 });
        };
        [[30, 38, 1.15], [213, 13, 0.8], [324, 20, 0.95], [368, 80, 1.05], [80, 80, 0.85], [22, 118, 0.9], [353, 143, 1], [55, 168, 0.65], [128, 8, 0.9]]
            .forEach((n) => S.push(nuvem(n[0], n[1], n[2])));

        // relva
        S.push(pth('M0 216Q60 203 140 212T280 210T400 206V262H0z', { fill: '#8cc152', stroke: OUT, 'stroke-width': 1.1 }));
        S.push(pth('M0 236Q100 224 200 234T400 228V262H0z', { fill: '#6aa23a', 'fill-opacity': 0.55 }));
        const lam = { '#4f8a2b': '', '#3f7a25': '', '#6fb340': '' };
        const lamCores = Object.keys(lam);
        for (let i = 0; i < 60; i++) {
            const x = uni(4, 396), y = uni(222, 258), h = uni(4, 9);
            lam[esc(lamCores)] += `M${f(x)} ${f(y)}q${f(uni(-2, 2))} ${f(-h / 2)} ${f(uni(-2, 2))} ${f(-h)}`;
        }
        lamCores.forEach((c) => S.push(pth(lam[c], { stroke: c, 'stroke-width': 1.1 })));

        // chamine e fumo
        S.push(rec(130, 24, 30, 34, { fill: '#d9703f', stroke: OUT, 'stroke-width': 1.4 }));
        let tij = '';
        for (let i = 0; i < 5; i++) {
            tij += `M130 ${f(31 + i * 6)}H160`;
            for (let j = 0; j < 3; j++) { const x = 133 + j * 9 + (i % 2 ? 4 : 0); if (x < 158) tij += `M${f(x)} ${f(25 + i * 6)}v6`; }
        }
        S.push(pth(tij, { stroke: '#7a3a1d', 'stroke-width': 0.9 }));
        S.push(rec(127, 21, 36, 6, { fill: '#e28a55', stroke: OUT, 'stroke-width': 1.4 }));
        S.push(grp([circ(146, 15, 6), circ(152, 8, 7), circ(160, 3, 6)], { fill: '#c9cdd2', stroke: '#8d9298', 'stroke-width': 1 }));

        // corpo
        S.push(rec(98, 120, 204, 104, { fill: '#f6d44c', stroke: OUT, 'stroke-width': 1.8 }));
        const hc = { '#e9b52a': '', '#fbe27a': '', '#e0a21f': '' };
        const hcCores = Object.keys(hc);
        for (let i = 0; i < 110; i++) {
            hc[esc(hcCores)] += `M${f(uni(102, 296))} ${f(uni(124, 220))}l${f(uni(3, 6))} ${f(uni(-3, -1))}`;
        }
        hcCores.forEach((c) => S.push(pth(hc[c], { stroke: c, 'stroke-width': 0.9, 'stroke-opacity': 0.75 })));
        S.push(grp([[102, 132], [102, 150], [102, 205], [284, 128], [284, 206], [290, 160]].map((p) => rec(p[0], p[1], 12, 6)), { fill: '#e0a43a', 'fill-opacity': 0.7 }));

        // telhado de escamas
        const roof = [[81, 122], [118, 41], [274, 39], [316, 122]];
        S.push(poly(roof, { fill: '#e8453a', stroke: OUT, 'stroke-width': 1.8 }));
        const xl = (y) => 81 + (118 - 81) * (122 - y) / 81;
        const xr = (y) => 316 - (316 - 274) * (122 - y) / 83;
        const linhas = 8, rh = (122 - 41) / linhas;
        for (let r = 0; r < linhas; r++) {
            const ytop = 41 + r * rh, w = 15;
            let x = xl(ytop) + w / 2 + (r % 2 ? w / 2 : 0) + 1;
            const x1 = xr(ytop) - w / 2 - 1;
            const gp = [];
            while (x <= x1) {
                gp.push(pth(`M${f(x - w / 2)} ${f(ytop)}a${f(w / 2)} ${f(rh * 1.05)} 0 0 0 ${f(w)} 0z`, { fill: esc(['#e8453a', '#ee5a45', '#dc3a32']) }));
                x += w;
            }
            S.push(grp(gp, { stroke: '#8c1f1a', 'stroke-width': 1 }));
        }
        S.push(poly(roof, { fill: 'none', stroke: OUT, 'stroke-width': 1.9 }));

        // janelas
        const janela = (x, y, w, h, caixa) => {
            const o = [rec(x - 3, y - 3, w + 6, h + 6, { fill: '#2f6fc2', stroke: OUT, 'stroke-width': 1.4 })];
            const pw = (w - 4) / 2, ph = (h - 4) / 2, vidros = [];
            let luz = '';
            for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
                const px = x + i * (pw + 4), py = y + j * (ph + 4);
                vidros.push(rec(px, py, pw, ph));
                luz += `M${f(px + 3)} ${f(py + ph - 3)}l${f(pw * 0.4)} ${f(-ph * 0.5)}`;
            }
            o.push(grp(vidros, { fill: '#b9d7f2', stroke: '#20406e', 'stroke-width': 1 }));
            o.push(pth(luz, { stroke: '#fff', 'stroke-width': 1.2, 'stroke-opacity': 0.8 }));
            if (caixa) {
                o.push(rec(x - 1, y + h - 5, w + 2, 9, { fill: '#d9703f', stroke: OUT, 'stroke-width': 1.2 }));
                let hastes = ''; const flores = [];
                for (let k = 0; k < 6; k++) { const fx = x + 4 + k * (w - 6) / 5; hastes += `M${f(fx)} ${f(y + h - 4)}v-6`; flores.push(circ(fx, y + h - 10, 2.4)); }
                o.push(pth(hastes, { stroke: '#4f8a2b', 'stroke-width': 1 }));
                o.push(grp(flores, { fill: '#f08a3c', stroke: '#8a3a2a', 'stroke-width': 0.5 }));
            } else {
                o.push(rec(x - 5, y + h + 3, w + 10, 4, { fill: '#2f6fc2', stroke: OUT, 'stroke-width': 1.2 }));
            }
            return o.join('');
        };
        S.push(janela(119, 138, 38, 40, true));
        S.push(janela(241, 138, 38, 40, false));

        // porta em arco
        S.push(pth('M175 224V166Q175 148 200 148Q225 148 225 166V224z', { fill: '#8b5a3c', stroke: OUT, 'stroke-width': 1.6 }));
        S.push(pth('M180 224V168Q180 153 200 153Q220 153 220 168V224', { stroke: '#5a3820', 'stroke-width': 1.2 }));
        S.push(grp([rec(184, 166, 32, 20), rec(184, 192, 32, 26)], { fill: '#744826', stroke: OUT, 'stroke-width': 1 }));
        let tab = ''; for (let k = 0; k < 4; k++) tab += `M${f(188 + k * 7)} 168v16`;
        S.push(pth(tab, { stroke: '#8b5a3c', 'stroke-width': 0.7, 'stroke-opacity': 0.7 }));
        S.push(circ(214, 198, 2.6, { fill: '#f2c200', stroke: OUT, 'stroke-width': 0.8 }));

        // arbustos
        const arbusto = (cx, cy, r) => {
            const o = [circ(cx, cy, r, { fill: '#6ba33d', stroke: OUT, 'stroke-width': 1.4 }), circ(cx - r * 0.3, cy - r * 0.3, r * 0.55, { fill: '#8fcb55', 'fill-opacity': 0.8 })];
            const sp = { '#4f8a2b': [], '#3f7a25': [], '#a6dc6a': [] };
            const spc = Object.keys(sp);
            for (let i = 0; i < 10; i++) {
                const a = uni(0, 6.28), d = uni(0, r * 0.85);
                sp[esc(spc)].push(circ(cx + d * Math.cos(a), cy + d * Math.sin(a), uni(1, 2.2)));
            }
            spc.forEach((c) => { if (sp[c].length) o.push(grp(sp[c], { fill: c, 'fill-opacity': 0.8 })); });
            const fl = [];
            for (let i = 0; i < 3; i++) { const a = uni(0, 6.28), d = uni(0.2, 0.8) * r; fl.push(circ(cx + d * Math.cos(a), cy + d * Math.sin(a), 1.8)); }
            o.push(grp(fl, { fill: esc(['#e85d9a', '#f5b82e', '#7c5cd6']) }));
            return o.join('');
        };
        [[78, 205, 22], [98, 224, 15], [327, 204, 22], [304, 225, 15]].forEach((b) => S.push(arbusto(b[0], b[1], b[2])));

        // flores (agrupadas por cor para poupar bytes)
        const cores = ['#e85d9a', '#f5b82e', '#7c5cd6', '#f08a3c', '#ffffff', '#e04f4f', '#4f8ae0'];
        const fp = {}; cores.forEach((c) => { fp[c] = []; });
        let hastesF = ''; const centros = [];
        for (let i = 0; i < 26; i++) {
            let x = uni(10, 392);
            if (x > 96 && x < 304 && rnd() < 0.35) x = rnd() < 0.5 ? uni(10, 92) : uni(308, 392);
            const y = (x > 96 && x < 304) ? uni(228, 244) : uni(226, 256);
            const h = uni(10, 22), s = uni(0.8, 1.3), c = esc(cores);
            hastesF += `M${f(x)} ${f(y)}q${f(uni(-2, 2))} ${f(-h / 2)} ${f(uni(-1.5, 1.5))} ${f(-h)}`;
            for (let k = 0; k < 5; k++) { const a = k * 1.2566; fp[c].push(circ(x + 2.6 * s * Math.cos(a), y - h + 2.6 * s * Math.sin(a), 2.1 * s)); }
            centros.push(circ(x, y - h, 1.6 * s));
        }
        S.push(pth(hastesF, { stroke: '#3f7a25', 'stroke-width': 1.1 }));
        cores.forEach((c) => { if (fp[c].length) S.push(grp(fp[c], { fill: c, stroke: '#7a2f4a', 'stroke-width': 0.5 })); });
        S.push(grp(centros, { fill: '#f7d23e', stroke: '#a67800', 'stroke-width': 0.5 }));

        // cogumelos
        const cogu = (x, y, s) =>
            rec(x - 2 * s, y - 7 * s, 4 * s, 8 * s, { fill: '#f1e4d0', stroke: OUT, 'stroke-width': 0.8 })
            + pth(`M${f(x - 6 * s)} ${f(y - 6 * s)}a${f(6 * s)} ${f(6 * s)} 0 0 1 ${f(12 * s)} 0z`, { fill: '#d9362f', stroke: OUT, 'stroke-width': 1 })
            + grp([circ(x - 2 * s, y - 10 * s, 1.1 * s), circ(x + 2.5 * s, y - 9 * s, s)], { fill: '#fff' });
        [[38, 250, 1], [350, 248, 0.9], [366, 250, 0.7]].forEach((c) => S.push(cogu(c[0], c[1], c[2])));

        // borboletas
        const borb = (x, y, c1, c2) =>
            grp([ell(x - 4, y - 2, 4.5, 3), ell(x + 4, y - 2, 4.5, 3)], { fill: c1, stroke: OUT, 'stroke-width': 0.8 })
            + grp([ell(x - 3, y + 3, 3.2, 2.4), ell(x + 3, y + 3, 3.2, 2.4)], { fill: c2, stroke: OUT, 'stroke-width': 0.8 })
            + pth(`M${f(x)} ${f(y - 3)}v7`, { stroke: OUT, 'stroke-width': 1.2 })
            + pth(`M${f(x)} ${f(y - 3)}q-2 -4 -4 -4M${f(x)} ${f(y - 3)}q2 -4 4 -4`, { stroke: OUT, 'stroke-width': 0.7 });
        S.push(borb(307, 57, '#f08a3c', '#f5b82e'));
        S.push(borb(70, 134, '#4f9ae0', '#f5b82e'));
        S.push(borb(316, 118, '#f08a3c', '#d9362f'));
        S.push(borb(335, 48, '#f08a3c', '#f5b82e'));

        return `<svg xmlns="http://www.w3.org/2000/svg" class="ld" viewBox="0 0 400 262" width="100%" style="max-width:560px;height:auto" role="img" aria-label="Casa amarela de telhado vermelho, com flores, arbustos e nuvens">`
            + grp(S, { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) + '</svg>';
    }

    // desenhoCasa(semente?) -> SVG de uma casa em estilo aguarela. A semente (inteiro) muda flores, hachuras e manchas.
    R.register('desenhoCasa', (semente) => {
        if (semente !== undefined && (typeof semente !== 'number' || !Number.isFinite(semente))) {
            throw new Error('desenhoCasa: "semente" must be a finite number.');
        }
        return html(casa(semente === undefined ? 11 : Math.floor(semente)));
    });
})();

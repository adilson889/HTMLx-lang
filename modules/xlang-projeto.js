// xlang-projeto.js - XLang Project Library v1.0
// Projetos de ficheiros de texto guardados no navegador (localStorage): criar, abrir, listar, ler,
// escrever, renomear e apagar. Cada escrita guarda a versao anterior (ate 10 por ficheiro) para
// o xlang-editar poder desfazer. Tudo fica na pagina do chat; o editor so mostra e pede alteracoes.
// Se o child state.js estiver carregado (window.XLangStateApi), mantem os estados
// 'projeto', 'ficheiros' e 'aberto' sempre em dia, e a pagina reage em tempo real.
// Uso no XLang: <import name="xlang.projeto"> e {projLista()}, {projLer('index.xl')}, ...
// Uso em JavaScript: window.XLangProjeto (o xlang-editar usa-o).
// Os dados ficam em chaves 'xlangproj:*' (e nao 'htmlx:*'), para que <storage-clear> nunca os apague.
(function() {
    'use strict';
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;

    const PREFIXO = 'xlangproj:';
    const CHAVE_ATUAL = PREFIXO + '@atual';
    const MAX_FICHEIROS = 200;
    const MAX_TEXTO = 300000;
    const MAX_HISTORICO = 10;
    const MAX_CAMINHO = 120;

    let atual = '';
    let aberto = '';

    // ===== ARMAZENAMENTO =====
    function store() {
        const s = window.localStorage;
        if (!s) throw new Error('projeto: localStorage is not available in this page.');
        return s;
    }

    function chaveDe(nome) { return PREFIXO + 'p:' + nome; }

    function validarNome(nome, fn) {
        if (typeof nome !== 'string' || !/^[\w\- ]{1,40}$/.test(nome.trim()) || nome.trim() !== nome) {
            throw new Error(`${fn}: the project name must have 1 to 40 letters, digits, spaces, "_" or "-", with no space at the ends.`);
        }
        return nome;
    }

    function validarCaminho(c, fn) {
        if (typeof c !== 'string' || c.length === 0 || c.length > MAX_CAMINHO) {
            throw new Error(`${fn}: the file path must be a text of 1 to ${MAX_CAMINHO} characters.`);
        }
        const partes = c.split('/');
        for (const p of partes) {
            if (p === '' || p === '.' || p === '..' || !/^[\w.\- ]+$/.test(p) || p.trim() !== p) {
                throw new Error(`${fn}: invalid file path "${c}". Use folders and names with letters, digits, ".", "_", "-" and spaces, separated by "/", with no "..".`);
            }
        }
        return c;
    }

    function validarTexto(t, fn) {
        if (typeof t !== 'string') throw new Error(`${fn}: the content must be a text.`);
        if (t.length > MAX_TEXTO) throw new Error(`${fn}: the file is too big (the limit is ${MAX_TEXTO} characters).`);
        return t;
    }

    function carregar(nome, fn) {
        const raw = store().getItem(chaveDe(nome));
        if (raw === null) throw new Error(`${fn}: the project "${nome}" does not exist.`);
        try {
            const d = JSON.parse(raw);
            if (!d || typeof d !== 'object' || !d.files || typeof d.files !== 'object') throw new Error('bad');
            if (!d.hist || typeof d.hist !== 'object') d.hist = {};
            return d;
        } catch (e) {
            throw new Error(`${fn}: the data of the project "${nome}" is damaged.`);
        }
    }

    function gravar(nome, dados, fn) {
        try {
            store().setItem(chaveDe(nome), JSON.stringify(dados));
        } catch (e) {
            throw new Error(`${fn}: could not save, the browser storage is full. Delete files or projects you do not need.`);
        }
    }

    function projetoAtual(fn) {
        if (!atual) throw new Error(`${fn}: no project is open. Use projAbrir first.`);
        return atual;
    }

    // ===== ESTADO EM TEMPO REAL =====
    function sincronizar() {
        const api = window.XLangStateApi;
        if (!api) return;
        api.define('projeto', '');
        api.define('ficheiros', []);
        api.define('aberto', '');
        api.set('projeto', atual);
        let lista = [];
        if (atual) {
            try { lista = Object.keys(carregar(atual, 'projeto').files).sort(); } catch (e) { lista = []; }
        }
        api.set('ficheiros', lista);
        api.set('aberto', aberto);
    }

    // ===== OPERACOES =====
    const API = {
        criar(nome) {
            validarNome(nome, 'projCriar');
            if (store().getItem(chaveDe(nome)) !== null) {
                throw new Error(`projCriar: the project "${nome}" already exists.`);
            }
            gravar(nome, { v: 1, files: {}, hist: {} }, 'projCriar');
            return nome;
        },
        lista() {
            const s = store();
            const nomes = [];
            for (let i = 0; i < s.length; i++) {
                const k = s.key(i);
                if (k && k.startsWith(PREFIXO + 'p:')) nomes.push(k.slice((PREFIXO + 'p:').length));
            }
            return nomes.sort();
        },
        apagar(nome) {
            validarNome(nome, 'projApagar');
            carregar(nome, 'projApagar');
            store().removeItem(chaveDe(nome));
            if (atual === nome) {
                atual = '';
                aberto = '';
                try { store().removeItem(CHAVE_ATUAL); } catch (e) { /* sem efeito */ }
            }
            sincronizar();
            return true;
        },
        abrir(nome) {
            validarNome(nome, 'projAbrir');
            carregar(nome, 'projAbrir');
            atual = nome;
            aberto = '';
            try { store().setItem(CHAVE_ATUAL, nome); } catch (e) { /* sem efeito */ }
            sincronizar();
            return API.ficheiros();
        },
        // volta a abrir o projeto da ultima vez, se ainda existir
        restaurar() {
            let nome = null;
            try { nome = store().getItem(CHAVE_ATUAL); } catch (e) { return ''; }
            if (nome && store().getItem(chaveDe(nome)) !== null) {
                atual = nome;
                sincronizar();
            }
            return atual;
        },
        atual() { return atual; },
        ficheiros() {
            const d = carregar(projetoAtual('projFicheiros'), 'projFicheiros');
            return Object.keys(d.files).sort();
        },
        existe(caminho) {
            validarCaminho(caminho, 'projExiste');
            const d = carregar(projetoAtual('projExiste'), 'projExiste');
            return Object.prototype.hasOwnProperty.call(d.files, caminho);
        },
        ler(caminho, fn) {
            fn = fn || 'projLer';
            validarCaminho(caminho, fn);
            const d = carregar(projetoAtual(fn), fn);
            if (!Object.prototype.hasOwnProperty.call(d.files, caminho)) {
                throw new Error(`${fn}: the file "${caminho}" does not exist in the project "${atual}".`);
            }
            return d.files[caminho];
        },
        // cria ou substitui; guarda a versao anterior para desfazer
        escrever(caminho, texto, fn) {
            fn = fn || 'projEscrever';
            validarCaminho(caminho, fn);
            validarTexto(texto, fn);
            const d = carregar(projetoAtual(fn), fn);
            const existe = Object.prototype.hasOwnProperty.call(d.files, caminho);
            if (!existe && Object.keys(d.files).length >= MAX_FICHEIROS) {
                throw new Error(`${fn}: the project already has ${MAX_FICHEIROS} files, the limit.`);
            }
            if (existe && d.files[caminho] !== texto) {
                const h = d.hist[caminho] || (d.hist[caminho] = []);
                h.push(d.files[caminho]);
                while (h.length > MAX_HISTORICO) h.shift();
            }
            d.files[caminho] = texto;
            gravar(atual, d, fn);
            sincronizar();
            return caminho;
        },
        // repoe a versao anterior do ficheiro (sem a guardar no historico)
        desfazer(caminho, fn) {
            fn = fn || 'edDesfazer';
            validarCaminho(caminho, fn);
            const d = carregar(projetoAtual(fn), fn);
            if (!Object.prototype.hasOwnProperty.call(d.files, caminho)) {
                throw new Error(`${fn}: the file "${caminho}" does not exist in the project "${atual}".`);
            }
            const h = d.hist[caminho];
            if (!h || h.length === 0) throw new Error(`${fn}: there is nothing to undo in "${caminho}".`);
            d.files[caminho] = h.pop();
            gravar(atual, d, fn);
            sincronizar();
            return caminho;
        },
        apagarFicheiro(caminho) {
            validarCaminho(caminho, 'projApagarFicheiro');
            const d = carregar(projetoAtual('projApagarFicheiro'), 'projApagarFicheiro');
            if (!Object.prototype.hasOwnProperty.call(d.files, caminho)) {
                throw new Error(`projApagarFicheiro: the file "${caminho}" does not exist in the project "${atual}".`);
            }
            delete d.files[caminho];
            delete d.hist[caminho];
            gravar(atual, d, 'projApagarFicheiro');
            if (aberto === caminho) aberto = '';
            sincronizar();
            return true;
        },
        renomear(de, para) {
            validarCaminho(de, 'projRenomear');
            validarCaminho(para, 'projRenomear');
            const d = carregar(projetoAtual('projRenomear'), 'projRenomear');
            const tem = (c) => Object.prototype.hasOwnProperty.call(d.files, c);
            if (!tem(de)) throw new Error(`projRenomear: the file "${de}" does not exist in the project "${atual}".`);
            if (tem(para)) throw new Error(`projRenomear: the file "${para}" already exists.`);
            d.files[para] = d.files[de];
            if (d.hist[de]) d.hist[para] = d.hist[de];
            delete d.files[de];
            delete d.hist[de];
            gravar(atual, d, 'projRenomear');
            if (aberto === de) aberto = para;
            sincronizar();
            return para;
        },
        abrirFicheiro(caminho) {
            const texto = API.ler(caminho, 'projAbrirFicheiro');
            aberto = caminho;
            sincronizar();
            return texto;
        },
        aberto() { return aberto; }
    };

    window.XLangProjeto = API;

    // ===== FUNCOES DO XLANG =====
    // projCriar(nome): cria um projeto vazio
    R.register('projCriar', (nome) => API.criar(nome));
    // projLista(): nomes dos projetos
    R.register('projLista', () => API.lista());
    // projApagar(nome): apaga um projeto inteiro
    R.register('projApagar', (nome) => API.apagar(nome));
    // projAbrir(nome): torna-o o projeto atual e devolve a lista de ficheiros
    R.register('projAbrir', (nome) => API.abrir(nome));
    // projAtual(): nome do projeto aberto ('' se nenhum)
    R.register('projAtual', () => API.atual());
    // projFicheiros(): caminhos dos ficheiros do projeto atual, por ordem
    R.register('projFicheiros', () => API.ficheiros());
    // projExiste(caminho): true se o ficheiro existe
    R.register('projExiste', (c) => API.existe(c));
    // projLer(caminho): texto do ficheiro
    R.register('projLer', (c) => API.ler(c));
    // projEscrever(caminho, texto): cria ou substitui o ficheiro
    R.register('projEscrever', (c, t) => API.escrever(c, t));
    // projApagarFicheiro(caminho)
    R.register('projApagarFicheiro', (c) => API.apagarFicheiro(c));
    // projRenomear(de, para)
    R.register('projRenomear', (de, para) => API.renomear(de, para));
    // projAbrirFicheiro(caminho): marca-o como aberto (estado 'aberto') e devolve o texto
    R.register('projAbrirFicheiro', (c) => API.abrirFicheiro(c));

    // volta ao projeto da ultima vez (se o armazenamento estiver disponivel)
    try { API.restaurar(); } catch (e) { /* sem efeito */ }
})();

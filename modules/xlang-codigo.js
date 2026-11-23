// xlang-codigo.js - XLang Code Library v0.2
// Gera TypeScript letra a letra a partir de uma árvore de nós, sem templates prontos.
// Camadas: nós -> verificador -> emissor (regras de sintaxe em dados) -> texto.
// As variáveis do utilizador entram com o nome exato e são verificadas antes de mostrar.
// Uso no XLang: <import name="xlang.codigo"> e {tsPrograma(utilizador, linhas)}.
// Uso no Lume (JavaScript): window.LumeCodigo (ou require em Node).
(function() {
    'use strict';

    // ===== CONSTANTES =====
    const LARGURA_MAXIMA = 80;
    const INDENTACAO = 2;
    const TIPOS = ['number', 'string', 'boolean'];
    const OPERADORES = { number: ['+', '-', '*', '/'], string: ['+'], boolean: [] };
    const COMPARADORES = { number: ['<', '>', '<=', '>=', '===', '!=='], string: ['===', '!=='], boolean: ['===', '!=='] };
    const PALAVRAS_RESERVADAS = new Set([
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
        'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
        'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
        'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
        'yield', 'let', 'static', 'implements', 'interface', 'package', 'private',
        'protected', 'public', 'await'
    ]);

    // ===== REGRAS DE SINTAXE (dados) =====
    // Texto literal é emitido letra a letra. "@x" é um encaixe. ESP, FIM, INDENTA e
    // DESINDENTA são as únicas fontes de espaços, quebras de linha e indentação.
    const ESP = { controlo: 'espaco' };
    const FIM = { controlo: 'fim' };
    const INDENTA = { controlo: 'indenta' };
    const DESINDENTA = { controlo: 'desindenta' };

    const REGRAS = {
        Declaracao: ['@palavra', ESP, '@nome', ':', ESP, '@tipo', ESP, '=', ESP, '@valor', ';', FIM],
        Funcao: ['function', ESP, '@nome', '(', '@params', ')', ':', ESP, '@retorno', ESP,
            '{', FIM, INDENTA, '@corpo', DESINDENTA, '}', FIM],
        Retorno: ['return', ESP, '@expr', ';', FIM],
        Binaria: ['@esq', ESP, '@op', ESP, '@dir'],
        Comparacao: ['@esq', ESP, '@op', ESP, '@dir'],
        Se: ['if', ESP, '(', '@cond', ')', ESP, '{', FIM, INDENTA, '@entao', DESINDENTA, '}', FIM],
        SeSenao: ['if', ESP, '(', '@cond', ')', ESP, '{', FIM, INDENTA, '@entao', DESINDENTA, '}', ESP,
            'else', ESP, '{', FIM, INDENTA, '@senao', DESINDENTA, '}', FIM],
        Parametro: ['@nome', ':', ESP, '@tipo']
    };

    // ===== NÓS =====
    function declaracao(palavra, nome, tipo, valor) { return { forma: 'Declaracao', palavra, nome, tipo, valor }; }
    function funcao(nome, params, retornoTipo, corpo) { return { forma: 'Funcao', nome, params, retorno: retornoTipo, corpo }; }
    function retorno(expr) { return { forma: 'Retorno', expr }; }
    function literal(valor) { return { forma: 'Literal', valor }; }
    function ident(nome) { return { forma: 'Ident', nome }; }
    function binaria(esq, op, dir) { return { forma: 'Binaria', esq, op, dir }; }
    function comparacao(esq, op, dir) { return { forma: 'Comparacao', esq, op, dir }; }
    function se(cond, entao, senao) { return { forma: 'Se', cond, entao, senao: senao || [] }; }
    function parametro(nome, tipo) { return { forma: 'Parametro', nome, tipo }; }

    // ===== TABELA DE SÍMBOLOS =====
    function criarTabela() { return { utilizador: new Map() }; }

    function registarUtilizador(tabela, nome, tipo) {
        const problema = nomeValido(nome);
        if (problema) throw new Error(problema);
        tabela.utilizador.set(nome, tipo || null);
        return tabela;
    }

    // ===== VERIFICADOR =====
    function nomeValido(nome) {
        if (typeof nome !== 'string' || !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(nome)) {
            return '"' + nome + '" não é um nome válido (letras, números, _ e $, sem começar por número).';
        }
        if (PALAVRAS_RESERVADAS.has(nome)) {
            return '"' + nome + '" é uma palavra reservada do TypeScript; escolhe outro nome.';
        }
        return null;
    }

    function ordemDe(no) {
        if (no.forma === 'Declaracao') return no.palavra === 'const' ? 1 : 2;
        return 3;
    }

    function tipoDaExpressao(no, escopo, usados, problemas) {
        switch (no.forma) {
            case 'Literal': {
                const tipo = typeof no.valor;
                if (!TIPOS.includes(tipo) || (tipo === 'number' && !Number.isFinite(no.valor))) {
                    problemas.push('Valor não suportado: ' + String(no.valor) + '.');
                    return null;
                }
                return tipo;
            }
            case 'Ident':
                usados.add(no.nome);
                if (!escopo.has(no.nome)) {
                    problemas.push('"' + no.nome + '" é usada antes de ser declarada.');
                    return null;
                }
                return escopo.get(no.nome);
            case 'Binaria': {
                const esq = tipoDaExpressao(no.esq, escopo, usados, problemas);
                const dir = tipoDaExpressao(no.dir, escopo, usados, problemas);
                if (!esq || !dir) return null;
                if (esq !== dir) {
                    problemas.push('Não se pode combinar ' + esq + ' com ' + dir + ' em "' + no.op + '".');
                    return null;
                }
                if (!OPERADORES[esq].includes(no.op)) {
                    problemas.push('O operador "' + no.op + '" não vale para ' + esq + '.');
                    return null;
                }
                return esq;
            }
            case 'Comparacao': {
                const esq = tipoDaExpressao(no.esq, escopo, usados, problemas);
                const dir = tipoDaExpressao(no.dir, escopo, usados, problemas);
                if (!esq || !dir) return null;
                if (esq !== dir) {
                    problemas.push('Não se pode comparar ' + esq + ' com ' + dir + ' em "' + no.op + '".');
                    return null;
                }
                if (!COMPARADORES[esq].includes(no.op)) {
                    problemas.push('O comparador "' + no.op + '" não vale para ' + esq + '.');
                    return null;
                }
                return 'boolean';
            }
            default:
                problemas.push('Expressão desconhecida: ' + no.forma + '.');
                return null;
        }
    }

    function verificarDeclaracao(no, escopo, usados, problemas) {
        if (no.palavra !== 'const' && no.palavra !== 'let') problemas.push('Palavra desconhecida: ' + no.palavra + '.');
        if (!TIPOS.includes(no.tipo)) problemas.push('Tipo desconhecido: ' + no.tipo + '.');
        const tipoValor = tipoDaExpressao(no.valor, escopo, usados, problemas);
        if (tipoValor && tipoValor !== no.tipo) {
            problemas.push('"' + no.nome + '" é ' + no.tipo + ' mas o valor é ' + tipoValor + '.');
        }
        escopo.set(no.nome, no.tipo);
    }

    function verificarFuncao(no, escopo, usados, problemas) {
        const local = new Map(escopo);
        no.params.forEach(function(p) {
            const problema = nomeValido(p.nome);
            if (problema) problemas.push(problema);
            if (!TIPOS.includes(p.tipo)) problemas.push('Tipo desconhecido: ' + p.tipo + '.');
            local.set(p.nome, p.tipo);
        });
        if (!TIPOS.includes(no.retorno)) problemas.push('Tipo desconhecido: ' + no.retorno + '.');
        const ultimo = no.corpo[no.corpo.length - 1];
        if (!ultimo || ultimo.forma !== 'Retorno') problemas.push('A função "' + no.nome + '" tem de acabar com return.');
        verificarCorpo(no.corpo, local, no, usados, problemas);
    }

    // Verifica uma lista de passos (corpo da função ou de um if).
    function verificarCorpo(corpo, local, fn, usados, problemas) {
        corpo.forEach(function(passo, i) {
            if (i < corpo.length - 1 && passo.forma === 'Retorno') {
                problemas.push('Há código depois do return na função "' + fn.nome + '".');
            }
            if (passo.forma === 'Retorno') {
                const tipo = tipoDaExpressao(passo.expr, local, usados, problemas);
                if (tipo && tipo !== fn.retorno) {
                    problemas.push('A função "' + fn.nome + '" devolve ' + fn.retorno + ' mas o return é ' + tipo + '.');
                }
            } else if (passo.forma === 'Se') {
                const t = tipoDaExpressao(passo.cond, local, usados, problemas);
                if (t && t !== 'boolean') problemas.push('A condição do if tem de ser boolean, mas é ' + t + '.');
                [passo.entao, passo.senao].forEach(function(ramo, k) {
                    if (k === 1 && !ramo.length) return;
                    if (!ramo.length) { problemas.push('O if da função "' + fn.nome + '" está vazio.'); return; }
                    if (ramo[ramo.length - 1].forma !== 'Retorno') {
                        problemas.push('Dentro do if, o último passo tem de ser return.');
                    }
                    verificarCorpo(ramo, local, fn, usados, problemas);
                });
            } else {
                problemas.push('Instrução não suportada na função "' + fn.nome + '": ' + passo.forma + '.');
            }
        });
    }

    // Devolve a lista de problemas (vazia se estiver tudo certo).
    function verificar(programa, tabela) {
        const problemas = [];
        const escopo = new Map();
        const declarados = new Set();
        const usados = new Set();
        let ordemAnterior = 0;

        programa.forEach(function(no) {
            const ordem = ordemDe(no);
            if (ordem < ordemAnterior) {
                problemas.push('"' + no.nome + '" está fora de ordem: constantes, depois variáveis, depois funções.');
            }
            ordemAnterior = Math.max(ordemAnterior, ordem);

            const problemaNome = nomeValido(no.nome);
            if (problemaNome) problemas.push(problemaNome);
            if (declarados.has(no.nome)) problemas.push('"' + no.nome + '" já foi declarada.');
            declarados.add(no.nome);

            if (no.forma === 'Declaracao') verificarDeclaracao(no, escopo, usados, problemas);
            else if (no.forma === 'Funcao') verificarFuncao(no, escopo, usados, problemas);
            else problemas.push('Nó desconhecido: ' + no.forma + '.');
        });

        // Variáveis do utilizador: declaradas com o nome exato e, havendo mais código, usadas.
        tabela.utilizador.forEach(function(tipo, nome) {
            if (!declarados.has(nome)) {
                problemas.push('A variável do utilizador "' + nome + '" não foi declarada.');
                return;
            }
            if (tipo && escopo.get(nome) !== tipo) {
                problemas.push('A variável do utilizador "' + nome + '" devia ser ' + tipo + '.');
            }
            if (programa.length > 1 && !usados.has(nome)) {
                problemas.push('A variável do utilizador "' + nome + '" não é usada em lado nenhum.');
            }
        });
        return problemas;
    }

    // ===== EMISSOR (letra a letra) =====
    function criarEmissor() {
        const letras = [];
        let nivel = 0;
        let inicioDeLinha = true;
        return {
            letras: letras,
            letra: function(c) {
                if (inicioDeLinha) {
                    for (let i = 0; i < nivel * INDENTACAO; i++) letras.push(' ');
                    inicioDeLinha = false;
                }
                letras.push(c);
            },
            texto: function(s) { for (const c of s) this.letra(c); },
            espaco: function() { this.letra(' '); },
            fim: function() { letras.push('\n'); inicioDeLinha = true; },
            indenta: function() { nivel++; },
            desindenta: function() { nivel--; }
        };
    }

    function emitirLiteral(valor, em) {
        if (typeof valor !== 'string') {
            em.texto(String(valor));
            return;
        }
        em.letra("'");
        for (const c of valor) {
            if (c === "'" || c === '\\') em.letra('\\');
            em.letra(c);
        }
        em.letra("'");
    }

    function emitirExpressao(no, em) {
        if (no.forma === 'Literal') emitirLiteral(no.valor, em);
        else if (no.forma === 'Ident') em.texto(no.nome);
        else aplicarRegra(no.forma, no, em);
    }

    function preencher(encaixe, no, em) {
        switch (encaixe) {
            case 'palavra': case 'nome': case 'tipo': case 'op': case 'retorno':
                em.texto(no[encaixe]);
                break;
            case 'valor': case 'expr': case 'esq': case 'dir': case 'cond':
                emitirExpressao(no[encaixe], em);
                break;
            case 'params':
                no.params.forEach(function(p, i) {
                    if (i > 0) { em.texto(','); em.espaco(); }
                    aplicarRegra('Parametro', p, em);
                });
                break;
            case 'corpo': case 'entao': case 'senao':
                no[encaixe].forEach(function(passo) { aplicarRegra(passo.forma, passo, em); });
                break;
            default:
                throw new Error('Encaixe desconhecido: ' + encaixe + '.');
        }
    }

    function aplicarRegra(nomeRegra, no, em) {
        if (nomeRegra === 'Se' && no.senao && no.senao.length) nomeRegra = 'SeSenao';
        REGRAS[nomeRegra].forEach(function(item) {
            if (item === ESP) em.espaco();
            else if (item === FIM) em.fim();
            else if (item === INDENTA) em.indenta();
            else if (item === DESINDENTA) em.desindenta();
            else if (item.charAt(0) === '@') preencher(item.slice(1), no, em);
            else em.texto(item);
        });
    }

    // Devolve a lista de letras, na ordem em que o Lume as escreveria.
    function emitirLetras(programa) {
        const em = criarEmissor();
        programa.forEach(function(no, i) {
            const separar = i > 0 && (no.forma === 'Funcao' || programa[i - 1].forma === 'Funcao');
            if (separar) em.fim();
            aplicarRegra(no.forma, no, em);
        });
        return em.letras;
    }

    // ===== GERAR =====
    function gerar(programa, tabela) {
        const problemas = verificar(programa, tabela || criarTabela());
        if (problemas.length) throw new Error(problemas.join('\n'));
        const texto = emitirLetras(programa).join('');
        const longas = texto.split('\n').filter(function(l) { return l.length > LARGURA_MAXIMA; });
        if (longas.length) throw new Error('Há linhas com mais de ' + LARGURA_MAXIMA + ' colunas.');
        return texto;
    }

    const API = {
        criarTabela: criarTabela, registarUtilizador: registarUtilizador,
        declaracao: declaracao, funcao: funcao, retorno: retorno, parametro: parametro,
        literal: literal, ident: ident, binaria: binaria, comparacao: comparacao, se: se,
        verificar: verificar, emitirLetras: emitirLetras, gerar: gerar,
        deLinhas: null
    };

    // ===== LIGAÇÃO AO XLANG =====
    function esc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function operando(x) { return typeof x === 'string' ? ident(x) : literal(x); }

    // utilizador: nomes dados pelo utilizador. linhas: [nome, tipo, valor] ou
    // [nome, tipo, esq, op, dir]. Em esq e dir, texto é o nome de uma variável.
    function programaDasLinhas(utilizador, linhas) {
        if (!Array.isArray(utilizador)) throw new Error('tsPrograma: "utilizador" deve ser uma lista de nomes.');
        if (!Array.isArray(linhas) || linhas.length === 0) throw new Error('tsPrograma: "linhas" deve ser uma lista não vazia.');
        const tabela = criarTabela();
        utilizador.forEach(function(nome) { registarUtilizador(tabela, nome); });
        const programa = linhas.map(function(l) {
            if (!Array.isArray(l) || (l.length !== 3 && l.length !== 5)) {
                throw new Error('tsPrograma: cada linha é [nome, tipo, valor] ou [nome, tipo, esq, op, dir].');
            }
            const valor = l.length === 3 ? literal(l[2]) : binaria(operando(l[2]), l[3], operando(l[4]));
            return declaracao('const', l[0], l[1], valor);
        });
        return { programa: programa, tabela: tabela };
    }

    API.deLinhas = programaDasLinhas;

    if (typeof window !== 'undefined') {
        window.LumeCodigo = API;
        if (window.XLangRegistry) {
            const html = function(s) { return window.XLangHtml ? new window.XLangHtml(s) : s; };
            window.XLangRegistry.register('tsPrograma', function(utilizador, linhas) {
                const p = programaDasLinhas(utilizador, linhas);
                const codigo = gerar(p.programa, p.tabela).replace(/\n$/, '');
                return html('<pre style="white-space:pre;overflow-x:auto;margin:0"><code>' + esc(codigo) + '</code></pre>');
            });
        }
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();

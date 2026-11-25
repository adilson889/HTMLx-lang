// xlang-editar.js - XLang Edit Library v1.0
// Edicao segura de ficheiros do projeto aberto (xlang-projeto): trocar um trecho exato, inserir
// linhas, ler um intervalo, procurar em todos os ficheiros e desfazer. A troca recusa quando o
// trecho nao existe ou aparece mais de uma vez, para nunca estragar um ficheiro sem o dizer.
// Precisa do modulo xlang-projeto carregado antes.
// Uso no XLang: <import name="xlang.projeto"> <import name="xlang.editar">
//   {edTrocar('app.xl', 'ola', 'bom dia')}, {edProcurar('total')}, {edDesfazer('app.xl')}
(function() {
    'use strict';
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;
    const MAX_RESULTADOS = 100;
    const LARGURA_LINHA = 120;

    function projeto(fn) {
        if (!window.XLangProjeto) {
            throw new Error(`${fn}: the module xlang-projeto must be loaded first.`);
        }
        return window.XLangProjeto;
    }

    function exigirTexto(v, fn, rotulo) {
        if (typeof v !== 'string') throw new Error(`${fn}: "${rotulo}" must be a text.`);
    }

    function exigirInteiro(v, fn, rotulo, min) {
        if (typeof v !== 'number' || !Number.isInteger(v) || v < min) {
            throw new Error(`${fn}: "${rotulo}" must be a whole number, ${min} or more.`);
        }
    }

    function linhasDe(texto) {
        return texto.split('\n');
    }

    // edTrocar(caminho, antigo, novo): troca UM trecho exato; devolve a linha (a contar de 1) onde ficou
    R.register('edTrocar', (caminho, antigo, novo) => {
        const P = projeto('edTrocar');
        exigirTexto(antigo, 'edTrocar', 'old');
        exigirTexto(novo, 'edTrocar', 'new');
        if (antigo.length === 0) throw new Error('edTrocar: "old" must not be empty.');
        const texto = P.ler(caminho, 'edTrocar');
        const partes = texto.split(antigo);
        const n = partes.length - 1;
        if (n === 0) throw new Error(`edTrocar: the text to replace was not found in "${caminho}".`);
        if (n > 1) throw new Error(`edTrocar: the text to replace appears ${n} times in "${caminho}". Give more context so it appears once.`);
        const posicao = partes[0].length;
        const linha = texto.slice(0, posicao).split('\n').length;
        P.escrever(caminho, partes[0] + novo + partes[1], 'edTrocar');
        return linha;
    });

    // edInserir(caminho, depoisDaLinha, texto): insere linhas depois da linha indicada (0 = no inicio)
    R.register('edInserir', (caminho, depois, texto) => {
        const P = projeto('edInserir');
        exigirInteiro(depois, 'edInserir', 'line', 0);
        exigirTexto(texto, 'edInserir', 'text');
        const linhas = linhasDe(P.ler(caminho, 'edInserir'));
        if (depois > linhas.length) {
            throw new Error(`edInserir: "${caminho}" has only ${linhas.length} lines.`);
        }
        linhas.splice(depois, 0, ...linhasDe(texto));
        P.escrever(caminho, linhas.join('\n'), 'edInserir');
        return depois + 1;
    });

    // edLinhas(caminho, de, ate): as linhas de..ate, cada uma como "N| texto"
    R.register('edLinhas', (caminho, de, ate) => {
        const P = projeto('edLinhas');
        exigirInteiro(de, 'edLinhas', 'from', 1);
        exigirInteiro(ate, 'edLinhas', 'to', de);
        const linhas = linhasDe(P.ler(caminho, 'edLinhas'));
        if (de > linhas.length) throw new Error(`edLinhas: "${caminho}" has only ${linhas.length} lines.`);
        const fim = Math.min(ate, linhas.length);
        const saida = [];
        for (let i = de; i <= fim; i++) saida.push(`${i}| ${linhas[i - 1]}`);
        return saida.join('\n');
    });

    // edProcurar(texto): onde aparece, em todos os ficheiros; cada resultado e "caminho:linha: conteudo"
    R.register('edProcurar', (texto) => {
        const P = projeto('edProcurar');
        exigirTexto(texto, 'edProcurar', 'text');
        if (texto.length === 0) throw new Error('edProcurar: "text" must not be empty.');
        const alvo = texto.toLowerCase();
        const saida = [];
        for (const caminho of P.ficheiros()) {
            const linhas = linhasDe(P.ler(caminho, 'edProcurar'));
            for (let i = 0; i < linhas.length; i++) {
                if (linhas[i].toLowerCase().includes(alvo)) {
                    let c = linhas[i].trim();
                    if (c.length > LARGURA_LINHA) c = c.slice(0, LARGURA_LINHA) + '...';
                    saida.push(`${caminho}:${i + 1}: ${c}`);
                    if (saida.length >= MAX_RESULTADOS) return saida;
                }
            }
        }
        return saida;
    });

    // edDesfazer(caminho): volta a versao anterior do ficheiro
    R.register('edDesfazer', (caminho) => projeto('edDesfazer').desfazer(caminho, 'edDesfazer'));
})();

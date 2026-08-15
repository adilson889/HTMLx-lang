// xlang-bootstrap.js
//
// Companheiro do xlang-interpreter.js. Resolve a tag <import> dentro de um
// <program> XLang, injetando dinamicamente o <script src> do modulo pedido
// (vindo do CDN) e so liberando a execucao do program depois que o modulo
// termina de carregar.
//
// Ordem de carregamento no HTML do usuario final:
//   <script src=".../xlang-interpreter.js"></script>
//   <script src=".../xlang-bootstrap.js"></script>
//
// Modulos registram suas funcoes chamando window.XLangRegistry.register(...)
// quando terminam de carregar (ver xlang-interpreter.js para a definicao de
// window.XLangRegistry). O Bootstrap so cuida de baixar e cachear o script;
// quem registra as funcoes e o proprio modulo.

(function () {
    if (typeof window === 'undefined') return;

    // Mapa fixo: nome usado em <import name="..."> -> URL do modulo no CDN.
    // "from" reservado para futura organizacao por pacote/namespace; por
    // agora todo import parte do mesmo mapa "xlang".
    const MODULE_URLS = {
        // Exemplo de como um modulo futuro entraria aqui:
        // math: 'https://cdn.jsdelivr.net/gh/usuario/repo@versao/xlang-math.js',
        // strings: 'https://cdn.jsdelivr.net/gh/usuario/repo@versao/xlang-strings.js',
    };

    // Cache de promises por URL, para nao injetar o mesmo <script> duas
    // vezes se dois <import> (ou dois <program> na mesma pagina) pedirem
    // o mesmo modulo.
    const loadingPromises = new Map();

    function injectScript(url) {
        if (loadingPromises.has(url)) {
            return loadingPromises.get(url);
        }
        const promise = new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-xlang-module="${url}"]`);
            if (existing) {
                resolve();
                return;
            }
            const scriptEl = document.createElement('script');
            scriptEl.src = url;
            scriptEl.setAttribute('data-xlang-module', url);
            scriptEl.onload = () => resolve();
            scriptEl.onerror = () => reject(new Error(`XLangBootstrap: failed to load module script "${url}".`));
            document.head.appendChild(scriptEl);
        });
        loadingPromises.set(url, promise);
        return promise;
    }

    window.XLangBootstrap = {
        // Permite registrar/sobrescrever URLs de modulos em runtime, caso o
        // usuario final queira apontar para outro CDN ou versao.
        registerModuleUrl(name, url) {
            MODULE_URLS[name] = url;
        },

        // Chamado pelo xlang-interpreter.js para cada <import from="..." name="...">
        // encontrado no topo do <program>. Resolve a URL, injeta o <script>,
        // espera carregar. Erros de modulo desconhecido ou falha de rede sao
        // propagados como erro claro para quem chamou run().
        async resolve(from, name) {
            const url = MODULE_URLS[name];
            if (!url) {
                throw new Error(`<import name="${name}"> failed: no module registered with this name. Use XLangBootstrap.registerModuleUrl("${name}", url) to add it.`);
            }
            await injectScript(url);
        }
    };
})();

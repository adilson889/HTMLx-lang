// children/js-bridge.js
//
// Bridge generico: expoe as funcoes de qualquer objeto/namespace JS
// (ja carregado globalmente, ex: window._ do lodash) como funcoes
// nativas do XLang, com prefixo, sem escrever um wrapper por funcao.
//
// Uso tipico (via xlang-bootstrap.js + xlang-modules.json):
//
//   "lodash": {
//       "cdn": "https://cdn.jsdelivr.net/npm/lodash@4/lodash.min.js",
//       "global": "_",
//       "prefix": "lodash"
//   }
//
// Depois de <import name="lodash"></import>, fica disponivel:
//   lodash_capitalize('ola mundo')
//   lodash_debounce(...)
//   etc, para cada funcao do objeto global apontado.
//
// Limitacoes conscientes:
// - So funciona bem para libs utilitarias (funcoes puras ou quase-puras).
// - Nao serve para libs com ciclo de vida/estado proprio (React, Vue),
//   essas continuam a precisar de um child escrito a mao.

(function () {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;
    const bridged = new Set();

    window.XLangBridge = function (prefix, globalObj) {
        if (!prefix || typeof prefix !== 'string') {
            throw new Error('XLangBridge: "prefix" must be a non-empty string.');
        }
        if (!globalObj || typeof globalObj !== 'object' && typeof globalObj !== 'function') {
            throw new Error(`XLangBridge: invalid global object for prefix "${prefix}".`);
        }

        const bridgeKey = prefix;
        if (bridged.has(bridgeKey)) return;
        bridged.add(bridgeKey);

        Object.keys(globalObj).forEach((key) => {
            const fn = globalObj[key];
            if (typeof fn !== 'function') return;

            const xlangName = prefix + '_' + key;
            R.register(xlangName, (...args) => fn.apply(globalObj, args));
        });
    };
})();

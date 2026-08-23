

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

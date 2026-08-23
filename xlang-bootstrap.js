(function () {
    if (typeof window === 'undefined') return;

    let modulesJsonUrl = './xlang-modules.json';
    let modulesCache = null;

    function injectScript(url) {
        return new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-xlang-module="${url}"]`);
            if (existing) {
                resolve();
                return;
            }
            const scriptEl = document.createElement('script');
            scriptEl.src = url;
            scriptEl.setAttribute('data-xlang-module', url);
            scriptEl.onload = () => resolve();
            scriptEl.onerror = () => reject(new Error(`XLangBootstrap: failed to load module "${url}".`));
            document.head.appendChild(scriptEl);
        });
    }

    async function loadModulesCache() {
        if (modulesCache) return modulesCache;
        const response = await fetch(modulesJsonUrl);
        if (!response.ok) {
            throw new Error(`XLangBootstrap: failed to load modules registry from "${modulesJsonUrl}".`);
        }
        modulesCache = await response.json();
        return modulesCache;
    }

    async function resolveExternalEntry(name, entry) {
        if (!entry.cdn) {
            throw new Error(`XLangBootstrap: module "${name}" is missing "cdn" in registry entry.`);
        }
        await injectScript(entry.cdn);

        if (!entry.global) {
            // Sem global declarado: assume-se que o script já se auto-regista
            // (ex: um child XLang normal servido via CDN). Nada mais a fazer.
            return;
        }

        const globalObj = window[entry.global];
        if (!globalObj) {
            throw new Error(`XLangBootstrap: global "${entry.global}" not found after loading module "${name}".`);
        }

        if (typeof window.XLangBridge !== 'function') {
            throw new Error(`XLangBootstrap: XLangBridge not loaded, cannot bridge module "${name}". Load children/js-bridge.js first.`);
        }

        window.XLangBridge(entry.prefix || name, globalObj);
    }

    window.XLangBootstrap = {
        setModulesJsonUrl(url) {
            modulesJsonUrl = url;
            modulesCache = null;
        },

        async resolve(from, name) {
            const cache = await loadModulesCache();

            const key = from ? `${from}.${name}` : name;
            const entry = cache[key] !== undefined ? cache[key] : cache[name];

            if (entry === undefined) {
                throw new Error(`<import name="${name}"${from ? ` from="${from}"` : ''}> failed: module not found in registry.`);
            }

            if (typeof entry === 'string') {
                await injectScript(entry);
                return;
            }

            if (typeof entry === 'object' && entry !== null) {
                await resolveExternalEntry(name, entry);
                return;
            }

            throw new Error(`XLangBootstrap: invalid registry entry for module "${name}".`);
        }
    };
})();

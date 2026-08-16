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

    window.XLangBootstrap = {
        setModulesJsonUrl(url) {
            modulesJsonUrl = url;
            modulesCache = null;
        },

        async resolve(from, name) {
            if (!modulesCache) {
                const response = await fetch(modulesJsonUrl);
                if (!response.ok) {
                    throw new Error(`XLangBootstrap: failed to load modules registry from "${modulesJsonUrl}".`);
                }
                modulesCache = await response.json();
            }

            const url = modulesCache[name];
            if (!url) {
                throw new Error(`<import name="${name}"> failed: module not found in registry.`);
            }

            await injectScript(url);
        }
    };
})();
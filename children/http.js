// children/http.js
// Adiciona tags declarativas de HTTP ao HTMLx-lang (inspirado no HTMX)

(function () {
    if (typeof window === 'undefined' || !window.XLangInterpreter) return;

    const originalProcessTag = XLangInterpreter.prototype.processTag;

    // Cache em memória: Map<url, { data, timestamp, ttl }>
    const httpCache = new Map();

    async function fetchWithRetry(url, options, retries, retryDelay) {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = options.timeout
                    ? setTimeout(() => controller.abort(), options.timeout)
                    : null;

                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.body || undefined,
                    signal: controller.signal
                });

                if (timeoutId) clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (e) {
                lastError = e;
                if (attempt < retries) {
                    await new Promise((r) => setTimeout(r, retryDelay));
                }
            }
        }
        throw lastError;
    }

    function applySwap(targetId, swap, content) {
        const el = document.getElementById(targetId);
        if (!el) return;

        switch (swap) {
            case 'outerHTML':
                el.outerHTML = content;
                break;
            case 'beforebegin':
                el.insertAdjacentHTML('beforebegin', content);
                break;
            case 'afterend':
                el.insertAdjacentHTML('afterend', content);
                break;
            case 'textContent':
                el.textContent = content;
                break;
            case 'innerHTML':
            default:
                el.innerHTML = content;
                break;
        }
    }

    XLangInterpreter.prototype.processTag = async function (tagName, attrs, body, scope) {
        const httpTags = ['http-get', 'http-post', 'http-json'];

        if (httpTags.includes(tagName)) {
            const urlExpr = this.getAttr(attrs, 'url');
            const asName = this.getAttr(attrs, 'as');
            const targetId = this.getAttr(attrs, 'target');
            const swap = this.getAttr(attrs, 'swap') || 'innerHTML';
            const method = tagName === 'http-post' ? 'POST' : 'GET';
            const useJson = tagName === 'http-json';

            // Opções
            const cache = this.getAttr(attrs, 'cache') === 'true';
            const ttl = Number(this.getAttr(attrs, 'ttl') || '60000');
            const retries = Number(this.getAttr(attrs, 'retries') || '0');
            const retryDelay = Number(this.getAttr(attrs, 'retry-delay') || '1000');
            const timeout = Number(this.getAttr(attrs, 'timeout') || '5000');
            const bodyExpr = this.getAttr(attrs, 'body');
            const headersExpr = this.getAttr(attrs, 'headers');

            if (!urlExpr) {
                throw new Error(`<${tagName}>: missing "url" attribute.`);
            }

            let url;
            try {
                url = await this.evalExpr(urlExpr, scope);
            } catch {
                url = urlExpr.replace(/^['"]|['"]$/g, '');
            }

            let requestBody = undefined;
            if (bodyExpr) {
                try {
                    requestBody = await this.evalExpr(bodyExpr, scope);
                } catch {
                    requestBody = bodyExpr;
                }
                if (typeof requestBody === 'object') {
                    requestBody = JSON.stringify(requestBody);
                }
            }

            let headers = {};
            if (headersExpr) {
                try {
                    headers = await this.evalExpr(headersExpr, scope);
                } catch {
                    headers = {};
                }
            }

            // Cache
            const cacheKey = `${method}:${url}`;
            if (cache && httpCache.has(cacheKey)) {
                const entry = httpCache.get(cacheKey);
                if (Date.now() - entry.timestamp < entry.ttl) {
                    if (asName) {
                        scope.defineVar(asName, { type: 'value', value: entry.data, mutable: true });
                    }
                    if (targetId) {
                        applySwap(targetId, swap, entry.data);
                    }
                    return;
                }
                httpCache.delete(cacheKey);
            }

            // Requisição
            try {
                const response = await fetchWithRetry(
                    url,
                    { method, body: requestBody, headers, timeout },
                    retries,
                    retryDelay
                );

                let data;
                if (useJson) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    // Tenta parsear JSON automaticamente
                    try {
                        data = JSON.parse(text);
                    } catch {
                        data = text;
                    }
                }

                // Guarda no cache
                if (cache) {
                    httpCache.set(cacheKey, { data, timestamp: Date.now(), ttl });
                }

                // Define variável
                if (asName) {
                    scope.defineVar(asName, { type: 'value', value: data, mutable: true });
                }

                // Swap no DOM
                if (targetId) {
                    const content = typeof data === 'object'
                        ? JSON.stringify(data)
                        : String(data);
                    applySwap(targetId, swap, content);
                }
            } catch (e) {
                console.error(`XLang <${tagName}> error:`, e.message);
                if (asName) {
                    scope.defineVar(asName, { type: 'value', value: null, mutable: true });
                }
            }

            return;
        }

        return originalProcessTag.call(this, tagName, attrs, body, scope);
    };
})();
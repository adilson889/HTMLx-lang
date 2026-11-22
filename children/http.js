// children/http.js
// Estende o <fetch> nativo com cache, retry, timeout e swap no DOM

(function () {
    if (typeof window === 'undefined' || !window.XLangInterpreter) return;

    const originalProcessTag = XLangInterpreter.prototype.processTag;

    // Cache em memória
    const httpCache = new Map();

    async function fetchWithRetry(url, options, retries, retryDelay, timeout) {
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = timeout
                    ? setTimeout(() => controller.abort(), timeout)
                    : null;

                const response = await fetch(url, {
                    method: options.method || 'GET',
                    headers: options.headers || {},
                    body: options.body || undefined,
                    signal: controller.signal
                });

                if (timeoutId) clearTimeout(timeoutId);

                // Mesmo formato do <fetch> nativo
                let data;
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = text;
                }

                return {
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    data,
                    headers: Object.fromEntries(response.headers.entries())
                };
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
        if (tagName === 'fetch') {
            const urlExpr = this.getAttr(attrs, 'url');
            const asName = this.getAttr(attrs, 'as');
            const targetId = this.getAttr(attrs, 'target');
            const swap = this.getAttr(attrs, 'swap') || 'innerHTML';
            const method = this.getAttr(attrs, 'method') || 'GET';
            const bodyExpr = this.getAttr(attrs, 'body');
            const headersExpr = this.getAttr(attrs, 'headers');

            // Opções extras
            const cache = this.getAttr(attrs, 'cache') === 'true';
            const ttl = Number(this.getAttr(attrs, 'ttl') || '60000');
            const retries = Number(this.getAttr(attrs, 'retries') || '0');
            const retryDelay = Number(this.getAttr(attrs, 'retry-delay') || '1000');
            const timeout = Number(this.getAttr(attrs, 'timeout') || '0');

            if (!urlExpr) {
                throw new Error('<fetch>: missing "url" attribute.');
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
                        scope.defineVar(asName, { type: 'value', value: entry.result, mutable: true });
                    }
                    if (targetId) {
                        applySwap(targetId, swap, typeof entry.result.data === 'object'
                            ? JSON.stringify(entry.result.data)
                            : String(entry.result.data));
                    }
                    return;
                }
                httpCache.delete(cacheKey);
            }

            // Requisição
            try {
                const result = await fetchWithRetry(
                    url,
                    { method, body: requestBody, headers },
                    retries,
                    retryDelay,
                    timeout
                );

                if (cache) {
                    httpCache.set(cacheKey, { result, timestamp: Date.now(), ttl });
                }

                if (asName) {
                    scope.defineVar(asName, { type: 'value', value: result, mutable: true });
                }

                if (targetId) {
                    applySwap(targetId, swap, typeof result.data === 'object'
                        ? JSON.stringify(result.data)
                        : String(result.data));
                }
            } catch (e) {
                console.error('XLang <fetch> error:', e.message);
                if (asName) {
                    scope.defineVar(asName, { type: 'value', value: { ok: false, status: 0, data: null, error: e.message }, mutable: true });
                }
            }

            return;
        }

        return originalProcessTag.call(this, tagName, attrs, body, scope);
    };
})();
// children/http.js
// Estende o <fetch> nativo com cache, retry e timeout.
// Não reimplementa o fetch: só intercepta quando há opções extra.

(function () {
    if (typeof window === 'undefined') return;

    const httpCache = new Map(); // chave -> { data, timestamp, ttl }

    function init() {
        if (typeof XLangInterpreter === 'undefined') {
            setTimeout(init, 50);
            return;
        }

        const originalProcessTag = XLangInterpreter.prototype.processTag;

        XLangInterpreter.prototype.processTag = async function (tagName, attrs, body, scope) {
            if (tagName !== 'fetch') {
                return originalProcessTag.call(this, tagName, attrs, body, scope);
            }

            const cache = this.getAttr(attrs, 'cache') === 'true';
            const ttl = Number(this.getAttr(attrs, 'ttl') || '60000');
            const retries = Number(this.getAttr(attrs, 'retries') || '0');
            const retryDelay = Number(this.getAttr(attrs, 'retry-delay') || '1000');
            const timeout = Number(this.getAttr(attrs, 'timeout') || '0');

            // Sem opções extra -> fetch nativo
            if (!cache && retries === 0 && timeout === 0) {
                return originalProcessTag.call(this, tagName, attrs, body, scope);
            }

            const urlExpr = this.getAttr(attrs, 'url');
            const asName = this.getAttr(attrs, 'as');
            const methodAttr = this.getAttr(attrs, 'method');
            const bodyExpr = this.getAttr(attrs, 'body');
            const headersExpr = this.getAttr(attrs, 'headers');

            if (!urlExpr || !asName) return;

            let url;
            try { url = this.evalExpr(urlExpr, scope); }
            catch { url = urlExpr; }

            const method = (methodAttr || 'GET').toUpperCase();

            const options = { method };
            if (headersExpr !== null) {
                try { options.headers = this.evalExpr(headersExpr, scope); }
                catch { options.headers = {}; }
            }
            if (bodyExpr !== null && method !== 'GET') {
                let bodyVal;
                try { bodyVal = this.evalExpr(bodyExpr, scope); }
                catch { bodyVal = bodyExpr; }
                options.headers = options.headers || {};
                if (typeof bodyVal === 'object') {
                    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
                    options.body = JSON.stringify(bodyVal);
                } else {
                    options.body = String(bodyVal);
                }
            }

            const cacheKey = `${method}:${url}:${options.body || ''}`;

            // Cache hit
            if (cache && httpCache.has(cacheKey)) {
                const entry = httpCache.get(cacheKey);
                if (Date.now() - entry.timestamp < entry.ttl) {
                    scope.defineVar(asName, {
                        type: 'value',
                        value: entry.result,
                        mutable: true
                    });
                    return;
                }
                httpCache.delete(cacheKey);
            }

            // Requisição com retry e timeout
            let result;
            let lastError = null;

            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    let controller = null;
                    let timeoutId = null;

                    if (timeout > 0) {
                        controller = new AbortController();
                        timeoutId = setTimeout(() => controller.abort(), timeout);
                        options.signal = controller.signal;
                    }

                    const res = await fetch(url, options);

                    if (timeoutId) clearTimeout(timeoutId);

                    const contentType = res.headers.get('content-type') || '';
                    let data;
                    if (contentType.includes('application/json')) {
                        data = await res.json();
                    } else {
                        data = await res.text();
                    }

                    result = { ok: res.ok, status: res.status, data };

                    // Se não for ok e ainda há tentativas, tenta de novo
                    if (!res.ok && attempt < retries) {
                        throw new Error(`HTTP ${res.status}`);
                    }

                    break;
                } catch (e) {
                    lastError = e;
                    if (attempt < retries) {
                        await new Promise((r) => setTimeout(r, retryDelay));
                    } else {
                        result = { ok: false, status: 0, data: null, error: e.message };
                    }
                }
            }

            if (result === undefined) {
                result = { ok: false, status: 0, data: null, error: lastError ? lastError.message : 'unknown' };
            }

            if (cache && result.ok) {
                httpCache.set(cacheKey, { result, timestamp: Date.now(), ttl });
            }

            scope.defineVar(asName, { type: 'value', value: result, mutable: true });
        };
    }

    init();
})();
// children/http.js
(function () {
    if (typeof window === 'undefined') return;

    const httpCache = new Map();

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
            const timeout = Number(this.getAttr(attrs, 'timeout') || '0');

            // Se não tem as opções do http.js, usa o fetch nativo e limpo
            if (!cache && retries === 0 && timeout === 0) {
                return originalProcessTag.call(this, tagName, attrs, body, scope);
            }

            // Extrair URL e nome da variável para o cache
            const urlExpr = this.getAttr(attrs, 'url');
            const asName = this.getAttr(attrs, 'as');
            const url = this.evalExpr(urlExpr, scope);
            const cacheKey = `${url}`;

            // Verificar cache
            if (cache && httpCache.has(cacheKey)) {
                const entry = httpCache.get(cacheKey);
                if (Date.now() - entry.timestamp < entry.ttl) {
                    scope.defineVar(asName, { type: 'value', value: entry.result, mutable: true });
                    return;
                }
                httpCache.delete(cacheKey);
            }

            // Limpar os atributos extra para o fetch nativo não se confundir
            let cleanAttrs = attrs
                .replace(/cache="[^"]*"/g, '')
                .replace(/ttl="[^"]*"/g, '')
                .replace(/retries="[^"]*"/g, '')
                .replace(/retry-delay="[^"]*"/g, '')
                .replace(/timeout="[^"]*"/g, '');

            let result = null;

            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    // Criar um scope temporário para intercetar o resultado do fetch nativo
                    const tempScope = new Scope(scope);
                    
                    // Executar o fetch nativo
                    await originalProcessTag.call(this, 'fetch', cleanAttrs, body, tempScope);
                    
                    // O fetch nativo guardou a resposta na variável
                    const entry = tempScope.getVarEntry(asName);
                    if (entry) result = entry.value;

                    // Se a resposta for OK, para de tentar
                    if (result && result.ok) break;
                } catch (e) {
                    if (attempt === retries) throw e;
                }

                // Esperar antes de tentar de novo
                if (attempt < retries) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }

            // Guardar no cache e definir no scope principal
            if (cache && result && result.ok) {
                httpCache.set(cacheKey, { result, timestamp: Date.now(), ttl });
            }
            if (result) {
                scope.defineVar(asName, { type: 'value', value: result, mutable: true });
            }
        };
    }

    init();
})();
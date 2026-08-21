// children/state.js
// Adds use-state to HTMLx-lang

(function () {
    if (typeof window === 'undefined' || !window.XLangInterpreter) return;

    const originalRun = XLangInterpreter.prototype.run;

    XLangInterpreter.prototype.run = async function (code) {
        await collectUseStateElements(this);
        return originalRun.call(this, code);
    };

    function collectUseStateElements(interpreter) {
        const elements = document.querySelectorAll('[use-state]');

        elements.forEach((el) => {
            const stateExpr = el.getAttribute('use-state').trim();

            if (!stateExpr) return;

            let stateName = stateExpr;
            let defaultValue = '';

            if (stateExpr.includes(':')) {
                const colonIndex = stateExpr.indexOf(':');
                stateName = stateExpr.slice(0, colonIndex).trim();
                defaultValue = stateExpr.slice(colonIndex + 1).trim();
            }

            if (!stateName) return;

            const rootScope = interpreter.rootScope;

            if (!rootScope) return;

            const existing = rootScope.getVarEntry(stateName);

            const readValue = () => {
                if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'select') {
                    const raw = el.value;
                    if (el.type === 'number' && raw !== '' && !isNaN(raw) && raw.trim() !== '') {
                        return Number(raw);
                    }
                    return raw;
                }
                return el.textContent;
            };

            const writeValue = (value) => {
                if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea' || el.tagName.toLowerCase() === 'select') {
                    el.value = value === undefined || value === null ? '' : String(value);
                } else {
                    el.textContent = value === undefined || value === null ? '' : String(value);
                }
            };

            if (!existing) {
                let initialValue = defaultValue;

                try {
                    initialValue = interpreter.evalExpr(defaultValue || "''", rootScope);
                } catch {
                    initialValue = defaultValue;
                }

                rootScope.defineVar(stateName, {
                    type: 'use-state',
                    el,
                    value: initialValue,
                    mutable: true,
                    readers: new Set(),
                    writer: el
                });

                writeValue(initialValue);
            }

            const entry = rootScope.getVarEntry(stateName);

            if (entry && entry.type === 'use-state') {
                if (entry.writer === el) {
                    entry.el = el;
                    const listener = () => {
                        entry.value = readValue();
                    };

                    const tag = el.tagName.toLowerCase();
                    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
                        el.addEventListener('input', listener);
                        el.addEventListener('change', listener);
                    }
                } else {
                    entry.readers.add(el);
                    writeValue(entry.value);
                }
            }
        });
    }

    const originalProcessTag = XLangInterpreter.prototype.processTag;

    XLangInterpreter.prototype.processTag = async function (tagName, attrs, body, scope) {
        return originalProcessTag.call(this, tagName, attrs, body, scope);
    };
})();
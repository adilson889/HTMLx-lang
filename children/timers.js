(function () {
    if (typeof window === 'undefined' || !window.XLangInterpreter) return;

    const originalProcessTag = XLangInterpreter.prototype.processTag;

    XLangInterpreter.prototype.processTag = async function (tagName, attrs, body, scope) {
        if (tagName === 'after') {
            const ms = Number(this.evalExpr(this.getAttr(attrs, 'ms') || '0', scope));
            const callName = this.getAttr(attrs, 'call');
            await new Promise((resolve) => setTimeout(resolve, ms));
            if (callName) {
                await this.callFunction(callName, [], scope);
            }
            return;
        }

        if (tagName === 'every') {
            const ms = Number(this.evalExpr(this.getAttr(attrs, 'ms') || '1000', scope));
            const callName = this.getAttr(attrs, 'call');
            if (callName) {
                setInterval(async () => {
                    try {
                        await this.callFunction(callName, [], scope);
                    } catch (e) {
                        console.error('XLang <every> error:', e.message);
                    }
                }, ms);
            }
            return;
        }

        return originalProcessTag.call(this, tagName, attrs, body, scope);
    };
})();
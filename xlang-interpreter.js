class BreakSignal {}
class ContinueSignal {}
class ReturnSignal {
    constructor(value) { this.value = value; }
}

class Scope {
    constructor(parent = null) {
        this.parent = parent;
        this.vars = new Map();
        this.funcs = new Map();
    }

    defineVar(name, entry) {
        this.vars.set(name, entry);
    }

    getVarEntry(name) {
        let s = this;
        while (s) {
            if (s.vars.has(name)) return s.vars.get(name);
            s = s.parent;
        }
        return undefined;
    }

    setVar(name, entry) {
        let s = this;
        while (s) {
            if (s.vars.has(name)) {
                s.vars.set(name, entry);
                return true;
            }
            s = s.parent;
        }
        return false;
    }

    defineFunc(name, def) {
        this.funcs.set(name, def);
    }

    getFunc(name) {
        let s = this;
        while (s) {
            if (s.funcs.has(name)) return s.funcs.get(name);
            s = s.parent;
        }
        return undefined;
    }
}

class XLangInterpreter {
    constructor(outputDiv) {
        this.outputDiv = outputDiv;
        this.globalFuncs = new Map();
    }

    run(code) {
        this.globalFuncs = new Map();
        const clean = code.replace(/<!--[\s\S]*?-->/g, '');
        const programMatch = clean.match(/<program[^>]*>([\s\S]*?)<\/program>/i);
        if (!programMatch) {
            throw new Error('Tag <program> não encontrada.');
        }
        const rootScope = new Scope(null);
        try {
            this.executeBlock(this.parseStatements(programMatch[1]), rootScope);
        } catch (e) {
            if (!(e instanceof BreakSignal) && !(e instanceof ContinueSignal) && !(e instanceof ReturnSignal)) {
                throw e;
            }
        }
    }

    findTagEnd(str, fromIndex) {
        let inQuote = null;
        for (let i = fromIndex; i < str.length; i++) {
            const c = str[i];
            if (inQuote) {
                if (c === inQuote) inQuote = null;
            } else if (c === '"' || c === "'") {
                inQuote = c;
            } else if (c === '>') {
                return i;
            }
        }
        return -1;
    }

    parseStatements(block) {
        const statements = [];
        block = block.trim();
        let pos = 0;

        while (pos < block.length) {
            const rest = block.substring(pos);
            const tagMatch = rest.match(/<(\w+)/);
            if (!tagMatch) break;

            const tagName = tagMatch[1];
            const startIdx = pos + tagMatch.index;
            const tagEnd = this.findTagEnd(block, startIdx);
            if (tagEnd === -1) break;

            const isSelfClosing = block[tagEnd - 1] === '/';
            const attrsEnd = isSelfClosing ? tagEnd - 1 : tagEnd;
            const attrsRaw = block.substring(startIdx + 1 + tagName.length, attrsEnd).trim();

            let body = '';
            let endIdx;

            if (isSelfClosing) {
                endIdx = tagEnd + 1;
            } else {
                const openStr = '<' + tagName;
                const closeStr = '</' + tagName;
                let depth = 1;
                let searchPos = tagEnd + 1;
                let closeStart = -1;
                let closeEnd = -1;

                while (depth > 0) {
                    const nextOpen = block.indexOf(openStr, searchPos);
                    const nextClose = block.indexOf(closeStr, searchPos);
                    if (nextClose === -1) break;

                    const openIsRealTag = nextOpen !== -1 && /[\s/>]/.test(block[nextOpen + openStr.length] || '>');

                    if (nextOpen !== -1 && openIsRealTag && nextOpen < nextClose) {
                        const innerTagEnd = this.findTagEnd(block, nextOpen);
                        if (innerTagEnd === -1) break;
                        const innerSelfClosing = block[innerTagEnd - 1] === '/';
                        if (!innerSelfClosing) depth++;
                        searchPos = innerTagEnd + 1;
                    } else {
                        depth--;
                        if (depth === 0) {
                            closeStart = nextClose;
                            const gtIdx = block.indexOf('>', nextClose);
                            closeEnd = gtIdx + 1;
                        } else {
                            searchPos = nextClose + closeStr.length;
                        }
                    }
                }

                if (closeStart === -1) break;
                body = block.substring(tagEnd + 1, closeStart).trim();
                endIdx = closeEnd;
            }

            statements.push({ tagName: tagName.toLowerCase(), attrs: attrsRaw, body });
            pos = endIdx;
        }

        return statements;
    }

    getAttr(attrs, name) {
        let m = attrs.match(new RegExp(name + '="([^"]*)"'));
        if (m) return m[1];
        m = attrs.match(new RegExp(name + "='([^']*)'"));
        return m ? m[1] : null;
    }

    currentValue(entry) {
        if (!entry) return undefined;
        if (entry.type === 'input') {
            const raw = entry.el.value;
            return raw !== '' && !isNaN(raw) && raw.trim() !== '' ? Number(raw) : raw;
        }
        return entry.value;
    }

    splitTopLevel(str) {
        const parts = [];
        let depth = 0, inQuote = null, current = '';
        for (const c of str) {
            if (inQuote) {
                current += c;
                if (c === inQuote) inQuote = null;
            } else if (c === '"' || c === "'") {
                inQuote = c;
                current += c;
            } else if (c === '(') {
                depth++; current += c;
            } else if (c === ')') {
                depth--; current += c;
            } else if (c === ',' && depth === 0) {
                parts.push(current.trim());
                current = '';
            } else {
                current += c;
            }
        }
        if (current.trim() !== '') parts.push(current.trim());
        return parts;
    }

    evalExpr(expr, scope) {
        let out = '';
        let i = 0;
        const calledFuncs = new Set();

        while (i < expr.length) {
            const c = expr[i];
            if (c === '"' || c === "'") {
                const quote = c;
                let j = i + 1;
                while (j < expr.length && expr[j] !== quote) j++;
                out += expr.substring(i, j + 1);
                i = j + 1;
                continue;
            }
            const wordMatch = expr.substring(i).match(/^[A-Za-z_]\w*/);
            if (wordMatch) {
                const word = wordMatch[0];
                let k = i + word.length;
                while (k < expr.length && /\s/.test(expr[k])) k++;
                const isCall = expr[k] === '(';

                if (isCall) {
                    calledFuncs.add(word);
                    out += word;
                } else {
                    const entry = scope.getVarEntry(word);
                    out += entry !== undefined ? JSON.stringify(this.currentValue(entry)) : word;
                }
                i += word.length;
                continue;
            }
            out += c;
            i++;
        }

        const paramNames = [];
        const paramValues = [];
        calledFuncs.forEach((name) => {
            paramNames.push(name);
            paramValues.push((...args) => this.callFunction(name, args, scope));
        });

        const fn = Function(...paramNames, '"use strict"; return (' + out + ')');
        return fn(...paramValues);
    }

    callFunction(name, argValues, callerScope) {
        const def = callerScope.getFunc(name) || this.globalFuncs.get(name);
        if (!def) throw new Error('Função não definida: ' + name);

        const fnScope = new Scope(def.closureScope);
        def.params.forEach((p, idx) => {
            fnScope.defineVar(p, { type: 'value', value: argValues[idx], mutable: true });
        });

        try {
            this.executeBlock(this.parseStatements(def.body), fnScope);
            return undefined;
        } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
        }
    }

    extractVarNames(text) {
        const names = new Set();
        for (const m of text.matchAll(/{([^}]+)}/g)) {
            (m[1].match(/\w+/g) || []).forEach((t) => names.add(t));
        }
        return names;
    }

    executeBlock(statements, scope) {
        let i = 0;
        let chainState = null;

        while (i < statements.length) {
            const stmt = statements[i];
            const tag = stmt.tagName;

            if (tag === 'if') {
                let cond = false;
                try { cond = !!this.evalExpr(this.getAttr(stmt.attrs, 'condition') || 'false', scope); }
                catch { cond = false; }
                if (cond) {
                    this.executeBlock(this.parseStatements(stmt.body), new Scope(scope));
                    chainState = true;
                } else {
                    chainState = false;
                }
                i++;
                continue;
            }

            if (tag === 'elseif') {
                if (chainState === false) {
                    let cond = false;
                    try { cond = !!this.evalExpr(this.getAttr(stmt.attrs, 'condition') || 'false', scope); }
                    catch { cond = false; }
                    if (cond) {
                        this.executeBlock(this.parseStatements(stmt.body), new Scope(scope));
                        chainState = true;
                    }
                }
                i++;
                continue;
            }

            if (tag === 'else') {
                if (chainState === false) {
                    this.executeBlock(this.parseStatements(stmt.body), new Scope(scope));
                }
                chainState = null;
                i++;
                continue;
            }

            this.processTag(tag, stmt.attrs, stmt.body, scope);
            i++;
        }
    }

    processTag(tagName, attrs, body, scope) {
        switch (tagName) {
            case 'break':
                throw new BreakSignal();

            case 'continue':
                throw new ContinueSignal();

            case 'return': {
                const valueExpr = this.getAttr(attrs, 'value');
                const value = valueExpr !== null ? this.evalExpr(valueExpr, scope) : undefined;
                throw new ReturnSignal(value);
            }

            case 'print': {
                const idAttr = this.getAttr(attrs, 'id');
                const rawText = body.trim();

                let target;
                if (idAttr) {
                    target = document.getElementById(idAttr);
                    if (!target) return;
                } else {
                    target = document.createElement('span');
                    this.outputDiv.appendChild(target);
                }

                const render = () => {
                    const text = rawText.replace(/{([^}]+)}/g, (match, expr) => {
                        try { return String(this.evalExpr(expr.trim(), scope)); }
                        catch { return match; }
                    });
                    target.textContent = text + ' ';
                };
                render();

                this.extractVarNames(rawText).forEach((name) => {
                    const entry = scope.getVarEntry(name);
                    if (entry && entry.type === 'input') {
                        entry.el.addEventListener('input', render);
                    }
                });
                break;
            }

            case 'var':
            case 'val': {
                const name = this.getAttr(attrs, 'name');
                if (!name) break;
                if (tagName === 'val' && scope.getVarEntry(name) !== undefined) break;

                const rawValue = (this.getAttr(attrs, 'value') || '').trim();

                if (rawValue.startsWith('<input')) {
                    const temp = document.createElement('div');
                    temp.innerHTML = rawValue;
                    const inputEl = temp.firstChild;
                    this.outputDiv.appendChild(inputEl);
                    scope.defineVar(name, { type: 'input', el: inputEl, mutable: tagName === 'var' });
                } else if (rawValue.startsWith('<call')) {
                    const fnName = this.getAttr(rawValue, 'name');
                    const argsStr = this.getAttr(rawValue, 'args') || '';
                    const argValues = this.splitTopLevel(argsStr).map((a) => this.evalExpr(a, scope));
                    const result = this.callFunction(fnName, argValues, scope);
                    scope.defineVar(name, { type: 'value', value: result, mutable: tagName === 'var' });
                } else {
                    let value;
                    try { value = this.evalExpr(rawValue, scope); }
                    catch { value = rawValue; }
                    scope.defineVar(name, { type: 'value', value, mutable: tagName === 'var' });
                }
                break;
            }

            case 'set': {
                const name = this.getAttr(attrs, 'name');
                const rawValue = this.getAttr(attrs, 'value');
                if (!name || rawValue === null) break;

                const entry = scope.getVarEntry(name);
                if (entry === undefined) break;
                if (entry.mutable === false) {
                    throw new Error('<set> não pode alterar "' + name + '": foi declarada com <val>.');
                }
                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }
                scope.setVar(name, { type: 'value', value, mutable: true });
                break;
            }

            case 'loop': {
                while (true) {
                    try {
                        this.executeBlock(this.parseStatements(body), new Scope(scope));
                    } catch (e) {
                        if (e instanceof BreakSignal) break;
                        if (e instanceof ContinueSignal) continue;
                        throw e;
                    }
                }
                break;
            }

            case 'for': {
                const varName = this.getAttr(attrs, 'var');
                const fromVal = Number(this.evalExpr(this.getAttr(attrs, 'from') || '0', scope));
                const toVal = Number(this.evalExpr(this.getAttr(attrs, 'to') || '0', scope));
                const stepAttr = this.getAttr(attrs, 'step');
                const step = Number(stepAttr !== null ? this.evalExpr(stepAttr, scope) : 1);

                if (step === 0 || !varName) break;

                let current = fromVal;
                const goingUp = step > 0;

                while (goingUp ? current <= toVal : current >= toVal) {
                    const forScope = new Scope(scope);
                    forScope.defineVar(varName, { type: 'value', value: current, mutable: true });
                    try {
                        this.executeBlock(this.parseStatements(body), forScope);
                    } catch (e) {
                        if (e instanceof BreakSignal) break;
                        if (e instanceof ContinueSignal) { current += step; continue; }
                        throw e;
                    }
                    current += step;
                }
                break;
            }

            case 'switch': {
                const valueExpr = this.getAttr(attrs, 'value');
                let switchVal;
                try { switchVal = this.evalExpr(valueExpr, scope); }
                catch { switchVal = undefined; }

                const cases = this.parseStatements(body);
                let matched = null;
                let defaultCase = null;
                for (const c of cases) {
                    if (c.tagName === 'case') {
                        let cVal;
                        try { cVal = this.evalExpr(this.getAttr(c.attrs, 'value'), scope); }
                        catch { cVal = undefined; }
                        if (cVal == switchVal) { matched = c; break; }
                    } else if (c.tagName === 'default') {
                        defaultCase = c;
                    }
                }
                const chosen = matched || defaultCase;
                if (chosen) {
                    this.executeBlock(this.parseStatements(chosen.body), new Scope(scope));
                }
                break;
            }

            case 'fun': {
                const name = this.getAttr(attrs, 'name');
                const params = (this.getAttr(attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                this.globalFuncs.set(name, { name, params, body, closureScope: scope, isPrivate: false });
                break;
            }

            case 'private': {
                const name = this.getAttr(attrs, 'name');
                const params = (this.getAttr(attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                scope.defineFunc(name, { name, params, body, closureScope: scope, isPrivate: true });
                break;
            }

            case 'override': {
                const name = this.getAttr(attrs, 'name');
                const params = (this.getAttr(attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                this.globalFuncs.set(name, { name, params, body, closureScope: scope, isPrivate: false, isOverride: true });
                break;
            }

            default:
                break;
        }
    }
}

// ===== AUTO-INICIALIZAÇÃO CORRIGIDA =====
// Lê o HTML BRUTO antes do navegador processar
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    function initXLang() {
        // Busca o HTML fonte original
        fetch(window.location.href)
            .then(response => response.text())
            .then(html => {
                // Encontra todos os <program> no HTML bruto
                const regex = /<program[^>]*>([\s\S]*?)<\/program>/gi;
                const matches = [...html.matchAll(regex)];
                
                // Encontra os elementos <program> no DOM
                const programElements = document.querySelectorAll('program');
                
                matches.forEach((match, index) => {
                    if (index >= programElements.length) return;
                    
                    const programEl = programElements[index];
                    const container = document.createElement('div');
                    const interpreter = new XLangInterpreter(container);
                    
                    try {
                        interpreter.run(match[0]);
                        programEl.parentNode.replaceChild(container, programEl);
                        console.log(`✓ Programa XLang #${index + 1} executado!`);
                    } catch (error) {
                        console.error(`✗ Erro:`, error);
                        container.textContent = 'ERRO: ' + error.message;
                        programEl.parentNode.replaceChild(container, programEl);
                    }
                });
            })
            .catch(error => {
                console.error('XLang: Não foi possível ler o HTML fonte:', error);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initXLang);
    } else {
        initXLang();
    }
}

// Export para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XLangInterpreter, Scope, BreakSignal, ContinueSignal, ReturnSignal };
} 
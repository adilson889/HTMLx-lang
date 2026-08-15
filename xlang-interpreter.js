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
        this.meta = null;
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

    // ===== metadados de escopo (classe atual, classe pai p/ <super>) =====
    findMeta(key) {
        let s = this;
        while (s) {
            if (s.meta && Object.prototype.hasOwnProperty.call(s.meta, key)) return s.meta[key];
            s = s.parent;
        }
        return undefined;
    }
}

// ===== Registry global de funcoes nativas =====
// As nativas de String/Math (secao 15 da documentacao) ja vem registradas
// aqui. Modulos futuros carregados via <import> (resolvido pelo Bootstrap)
// se registram no mesmo Map chamando window.XLangRegistry.register(nome, fn).
// evalExpr/callFunction consultam este Map exatamente como consultavam o
// antigo NATIVE_FUNCS local.
if (typeof window !== 'undefined') {
    if (!window.__XLANG_NATIVE_REGISTRY__) {
        window.__XLANG_NATIVE_REGISTRY__ = new Map();
    }
    if (!window.XLangRegistry) {
        window.XLangRegistry = {
            register(name, fn) {
                window.__XLANG_NATIVE_REGISTRY__.set(name, fn);
            },
            has(name) {
                return window.__XLANG_NATIVE_REGISTRY__.has(name);
            },
            get(name) {
                return window.__XLANG_NATIVE_REGISTRY__.get(name);
            }
        };
    }
}
const NATIVE_FUNCS = (typeof window !== 'undefined') ? window.__XLANG_NATIVE_REGISTRY__ : new Map();

// ===== Funcoes nativas de String e Math (secao 15 da documentacao) =====
// Consultadas no mesmo ponto onde evalExpr ja checa scope.getFunc/globalFuncs.
[
    ['upper', (texto) => String(texto).toUpperCase()],
    ['lower', (texto) => String(texto).toLowerCase()],
    ['trim', (texto) => String(texto).trim()],
    ['split', (texto, sep) => String(texto).split(sep)],
    ['replace', (texto, de, para) => String(texto).replace(de, para)],
    ['includes', (texto, parte) => String(texto).includes(parte)],
    ['round', (numero) => Math.round(Number(numero))],
    ['floor', (numero) => Math.floor(Number(numero))],
    ['ceil', (numero) => Math.ceil(Number(numero))],
    ['abs', (numero) => Math.abs(Number(numero))],
    ['random', (min, max) => Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min)],
].forEach(([name, fn]) => NATIVE_FUNCS.set(name, fn));

class XLangInterpreter {
    constructor(outputDiv) {
        this.outputDiv = outputDiv;
        this.globalFuncs = new Map();
        this.classes = new Map();
    }

    // run() e async porque <import> (resolvido no topo do <program>, antes de
    // qualquer outra tag) precisa esperar o Bootstrap injetar e carregar o
    // <script src> do modulo via CDN. O resto da execucao (executeBlock)
    // continua 100% sincrono, como sempre foi.
    async run(code) {
        this.globalFuncs = new Map();
        this.classes = new Map();
        const clean = code.replace(/<!--[\s\S]*?-->/g, '');
        const programMatch = clean.match(/<program[^>]*>([\s\S]*?)<\/program>/i);
        if (!programMatch) {
            throw new Error('Missing <program> tag.');
        }

        const allStatements = this.parseStatements(programMatch[1]);

        // <import> so e aceito no nivel raiz do <program>, como cabecalho.
        // Coleta todos os <import> do topo e resolve antes de rodar o resto.
        const imports = [];
        const bodyStatements = [];
        for (const stmt of allStatements) {
            if (stmt.tagName === 'import') {
                imports.push(stmt);
            } else {
                bodyStatements.push(stmt);
            }
        }

        if (imports.length > 0) {
            await this.resolveImports(imports);
        }

        const rootScope = new Scope(null);
        try {
            this.executeBlock(bodyStatements, rootScope);
        } catch (e) {
            if (!(e instanceof BreakSignal) && !(e instanceof ContinueSignal) && !(e instanceof ReturnSignal)) {
                throw e;
            }
        }
    }

    // Delega a resolucao de cada <import> ao Bootstrap (window.XLangBootstrap),
    // que sabe o mapa nome -> URL do CDN e como injetar o <script> no <head>.
    // Sem o Bootstrap carregado, <import> falha com um erro claro em vez de
    // silenciosamente nao fazer nada.
    async resolveImports(importStatements) {
        if (typeof window === 'undefined' || !window.XLangBootstrap || typeof window.XLangBootstrap.resolve !== 'function') {
            throw new Error('<import> requires xlang-bootstrap.js to be loaded before running XLang programs.');
        }
        for (const stmt of importStatements) {
            const from = this.getAttr(stmt.attrs, 'from');
            const name = this.getAttr(stmt.attrs, 'name');
            if (!name) {
                throw new Error('<import> requires a "name" attribute.');
            }
            await window.XLangBootstrap.resolve(from || 'xlang', name);
        }
    }

    findTagEnd(str, fromIndex) {
        let inQuote = null;
        for (let i = fromIndex; i < str.length; i++) {
            const c = str[i];
            if (inQuote) {
                // \" ou \' dentro de um atributo não fecham a aspa
                if (c === '\\') { i++; continue; }
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
            // ===== ALTERADO: aceita nomes de tag com hífen (add-class, set-style, etc.) =====
            const tagMatch = rest.match(/<([\w-]+)/);
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

    // ===== entende \" e \' escapados dentro do valor =====
    getAttr(attrs, name) {
        let m = attrs.match(new RegExp(name + '="((?:[^"\\\\]|\\\\.)*)"'));
        if (m) return this.unescapeAttr(m[1]);
        m = attrs.match(new RegExp(name + "='((?:[^'\\\\]|\\\\.)*)'"));
        if (m) return this.unescapeAttr(m[1]);
        return null;
    }

    unescapeAttr(s) {
        return s.replace(/\\(.)/g, '$1');
    }

    // JSON.stringify converte Infinity/-Infinity/NaN para null, o que faz
    // resultados como "10 / 0" virarem "null" em vez de Infinity. Aqui
    // esses tres casos sao embutidos como literal JS valido antes do
    // fallback normal do JSON.stringify.
    safeSerialize(val) {
        if (typeof val === 'number') {
            if (Number.isNaN(val)) return 'NaN';
            if (val === Infinity) return 'Infinity';
            if (val === -Infinity) return '-Infinity';
        }
        return JSON.stringify(val);
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

    // ---- evalExpr seguro: whitelist estrita, sem acesso a globals ----
    // entende obj.campo e obj.metodo(...)
    evalExpr(expr, scope) {
        let out = '';
        let i = 0;
        const calledFuncs = new Set();
        const methodCalls = new Map();
        let methodCounter = 0;
        const callerClassName = scope.findMeta('currentClassName');
        const ALLOWED_LITERALS = new Set(['true', 'false', 'null']);

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

                // detecta cadeia obj.campo(.campo2...)
                const chain = [word];
                let scanPos = i + word.length;
                while (true) {
                    let p = scanPos;
                    while (p < expr.length && /\s/.test(expr[p])) p++;
                    if (expr[p] === '.') {
                        const m2 = expr.substring(p + 1).match(/^[A-Za-z_]\w*/);
                        if (m2) {
                            chain.push(m2[0]);
                            scanPos = p + 1 + m2[0].length;
                            continue;
                        }
                    }
                    break;
                }
                let afterChain = scanPos;
                while (afterChain < expr.length && /\s/.test(expr[afterChain])) afterChain++;
                const followedByParen = expr[afterChain] === '(';

                if (chain.length === 1 && ALLOWED_LITERALS.has(word)) {
                    out += word;
                    i = scanPos;
                    continue;
                }

                if (chain.length === 1 && followedByParen) {
                    if (!scope.getFunc(word) && !this.globalFuncs.get(word) && !NATIVE_FUNCS.has(word)) {
                        throw new Error(`Undefined XLang function: "${word}"`);
                    }
                    calledFuncs.add(word);
                    out += word;
                    i = scanPos;
                    continue;
                }

                // chamada de método obj.metodo(...)
                if (chain.length > 1 && followedByParen) {
                    if (chain.length !== 2) {
                        throw new Error(`Chained method calls not supported: "${chain.join('.')}"`);
                    }
                    const [objName, methodName] = chain;
                    const entry = scope.getVarEntry(objName);
                    if (entry === undefined) {
                        throw new Error(`Identifier not allowed in XLang expression: "${objName}"`);
                    }
                    const receiver = this.currentValue(entry);
                    const placeholder = `__m${methodCounter++}`;
                    methodCalls.set(placeholder, { receiver, methodName });
                    out += placeholder;
                    i = scanPos;
                    continue;
                }

                // leitura de campo obj.campo(.campo2...)
                if (chain.length > 1) {
                    const objName = chain[0];
                    const entry = scope.getVarEntry(objName);
                    if (entry === undefined) {
                        throw new Error(`Identifier not allowed in XLang expression: "${objName}"`);
                    }
                    let val = this.currentValue(entry);
                    for (let ci = 1; ci < chain.length; ci++) {
                        val = (val !== null && val !== undefined) ? val[chain[ci]] : undefined;
                    }
                    out += this.safeSerialize(val === undefined ? null : val);
                    i = scanPos;
                    continue;
                }

                const entry = scope.getVarEntry(word);
                if (entry === undefined) {
                    throw new Error(`Identifier not allowed in XLang expression: "${word}"`);
                }
                out += this.safeSerialize(this.currentValue(entry));
                i = scanPos;
                continue;
            }
            if (!/[\s0-9+\-*/%()<>=!&|,.\[\]]/.test(c)) {
                throw new Error(`Character not allowed in XLang expression: "${c}"`);
            }
            out += c;
            i++;
        }

        const paramNames = [];
        const paramValues = [];
        calledFuncs.forEach((name) => {
            paramNames.push(name);
            if (NATIVE_FUNCS.has(name) && !scope.getFunc(name) && !this.globalFuncs.get(name)) {
                paramValues.push((...args) => NATIVE_FUNCS.get(name)(...args));
            } else {
                paramValues.push((...args) => this.callFunction(name, args, scope));
            }
        });
        methodCalls.forEach((info, placeholder) => {
            paramNames.push(placeholder);
            paramValues.push((...args) => this.callMethod(info.receiver, info.methodName, args, callerClassName));
        });

        const fn = new Function(...paramNames, 'return (' + out + ')');
        return fn.apply(undefined, paramValues);
    }

    callFunction(name, argValues, callerScope) {
        const def = callerScope.getFunc(name) || this.globalFuncs.get(name);
        if (!def) {
            if (NATIVE_FUNCS.has(name)) return NATIVE_FUNCS.get(name)(...argValues);
            throw new Error('Undefined function: ' + name);
        }

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

    // chama método de instância (com checagem de private)
    callMethod(instance, methodName, argValues, callerClassName) {
        if (!instance || !instance.__class) {
            throw new Error(`Cannot call method "${methodName}" on this value.`);
        }
        const found = this.findMethod(instance.__class, methodName);
        if (!found) {
            throw new Error(`Undefined method: ${methodName}`);
        }
        if (found.def.isPrivate && found.ownerClass.name !== callerClassName) {
            throw new Error(`Private method "${methodName}" cannot be called from here.`);
        }

        const methodScope = new Scope(found.ownerClass.declScope);
        methodScope.meta = { currentClassName: found.ownerClass.name };
        methodScope.defineVar('this', { type: 'value', value: instance, mutable: false });
        found.def.params.forEach((p, idx) => {
            methodScope.defineVar(p, { type: 'value', value: argValues[idx], mutable: true });
        });

        try {
            this.executeBlock(this.parseStatements(found.def.body), methodScope);
            return undefined;
        } catch (e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
        }
    }

    // procura método subindo a cadeia de herança
    findMethod(className, methodName) {
        let cls = this.classes.get(className);
        while (cls) {
            if (cls.methods.has(methodName)) {
                return { def: cls.methods.get(methodName), ownerClass: cls };
            }
            cls = cls.parentName ? this.classes.get(cls.parentName) : null;
        }
        return null;
    }

    // cria instância de classe
    instantiate(className, argValues) {
        const cls = this.classes.get(className);
        if (!cls) throw new Error('Undefined class: ' + className);

        const chain = [];
        let c = cls;
        while (c) {
            chain.unshift(c);
            c = c.parentName ? this.classes.get(c.parentName) : null;
        }

        const instance = { __class: className };
        for (const c2 of chain) {
            for (const f of c2.fields) {
                const fieldScope = new Scope(c2.declScope);
                let val;
                try { val = this.evalExpr(f.valueExpr, fieldScope); }
                catch { val = f.valueExpr; }
                instance[f.name] = val;
            }
        }

        this.runInit(cls, instance, argValues);
        return instance;
    }

    // roda o <init> de uma classe (usado por instantiate e <super>)
    runInit(cls, instance, argValues) {
        if (!cls.initDef) return;
        const initScope = new Scope(cls.declScope);
        initScope.meta = { classForSuper: cls, currentClassName: cls.name };
        initScope.defineVar('this', { type: 'value', value: instance, mutable: false });
        cls.initDef.params.forEach((p, idx) => {
            initScope.defineVar(p, { type: 'value', value: argValues[idx], mutable: true });
        });
        try {
            this.executeBlock(this.parseStatements(cls.initDef.body), initScope);
        } catch (e) {
            if (!(e instanceof ReturnSignal)) throw e;
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
        let tryFailed = null;

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

            if (tag === 'try') {
                let errMsg = null;
                try {
                    this.executeBlock(this.parseStatements(stmt.body), new Scope(scope));
                    tryFailed = false;
                } catch (e) {
                    if (e instanceof BreakSignal || e instanceof ContinueSignal || e instanceof ReturnSignal) {
                        throw e;
                    }
                    tryFailed = true;
                    errMsg = e.message;
                }
                if (tryFailed) {
                    this._lastCaughtError = errMsg;
                }
                i++;
                continue;
            }

            if (tag === 'catch') {
                if (tryFailed === true) {
                    const catchScope = new Scope(scope);
                    catchScope.defineVar('error', { type: 'value', value: this._lastCaughtError, mutable: false });
                    this.executeBlock(this.parseStatements(stmt.body), catchScope);
                }
                tryFailed = null;
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
                        catch (e) { return `[error: ${e.message}]`; }
                    });
                    // innerHTML: permite <br>, <hr>, <b>, etc. dentro do <print>.
                    // A interpolação {} já ocorreu acima, antes desta linha.
                    target.innerHTML = text + ' ';
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

                const inputMatch = rawValue.match(/<input\b[^>]*\/?>/i);
                if (inputMatch) {
                    const temp = document.createElement('div');
                    temp.innerHTML = inputMatch[0];
                    const inputEl = temp.firstChild;
                    this.outputDiv.appendChild(inputEl);
                    scope.defineVar(name, { type: 'input', el: inputEl, mutable: tagName === 'var' });
                } else if (rawValue.startsWith('<call')) {
                    const fnName = this.getAttr(rawValue, 'name');
                    const argsStr = this.getAttr(rawValue, 'args') || '';
                    const argValues = this.splitTopLevel(argsStr).map((a) => this.evalExpr(a, scope));
                    const result = this.callFunction(fnName, argValues, scope);
                    scope.defineVar(name, { type: 'value', value: result, mutable: tagName === 'var' });
                } else if (rawValue.startsWith('<new')) {
                    const className = this.getAttr(rawValue, 'class');
                    const argsStr = this.getAttr(rawValue, 'args') || '';
                    const argValues = this.splitTopLevel(argsStr).map((a) => this.evalExpr(a, scope));
                    const instance = this.instantiate(className, argValues);
                    scope.defineVar(name, { type: 'value', value: instance, mutable: tagName === 'var' });
                } else {
                    let value;
                    try { value = this.evalExpr(rawValue, scope); }
                    catch { value = rawValue; }
                    scope.defineVar(name, { type: 'value', value, mutable: tagName === 'var' });
                }
                break;
            }

            // aceita name="this.campo" e name="arr[i]"
            case 'set': {
                const name = this.getAttr(attrs, 'name');
                let rawValue = this.getAttr(attrs, 'value');
                if (!name || rawValue === null) break;

                // compound assignment: i++, i--, i += expr, i -= expr, i *= expr, i /= expr
                // reescreve para a expressao pura equivalente (ex.: "i + 1") antes
                // de seguir o fluxo normal de <set>, que ja sabe ler o valor atual
                // de "name" (variavel simples, this.campo ou arr[i]).
                rawValue = rawValue.trim();
                const trimmedName = name.trim();
                const incDecMatch = rawValue.match(/^([A-Za-z_][\w.\[\]]*)\s*(\+\+|--)$/);
                const compoundMatch = rawValue.match(/^([A-Za-z_][\w.\[\]]*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
                if (incDecMatch && incDecMatch[1] === trimmedName) {
                    const op = incDecMatch[2] === '++' ? '+' : '-';
                    rawValue = `${trimmedName} ${op} 1`;
                } else if (compoundMatch && compoundMatch[1] === trimmedName) {
                    const op = compoundMatch[2][0];
                    rawValue = `${trimmedName} ${op} (${compoundMatch[3]})`;
                }

                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }

                const propMatch = name.match(/^([A-Za-z_]\w*)\.(\w+)$/);
                if (propMatch) {
                    const [, objName, propName] = propMatch;
                    const entry = scope.getVarEntry(objName);
                    if (entry === undefined) throw new Error(`Identifier not allowed: "${objName}"`);
                    const obj = this.currentValue(entry);
                    if (!obj || typeof obj !== 'object') throw new Error(`"${objName}" is not an object.`);
                    obj[propName] = value;
                    break;
                }

                const idxMatch = name.match(/^([A-Za-z_]\w*)\[(.+)\]$/);
                if (idxMatch) {
                    const [, arrName, idxExpr] = idxMatch;
                    const entry = scope.getVarEntry(arrName);
                    if (!entry || !Array.isArray(entry.value)) throw new Error(`"${arrName}" is not an array.`);
                    let idx;
                    try { idx = this.evalExpr(idxExpr, scope); }
                    catch { idx = Number(idxExpr); }
                    entry.value[idx] = value;
                    break;
                }

                const entry = scope.getVarEntry(name);
                if (entry === undefined) break;
                if (entry.mutable === false) {
                    throw new Error('<set> cannot modify "' + name + '": declared with <val>.');
                }
                scope.setVar(name, { type: 'value', value, mutable: true });
                break;
            }

            // ===== ARRAYS =====
            case 'array': {
                const name = this.getAttr(attrs, 'name');
                const rawValue = this.getAttr(attrs, 'value');
                if (!name) break;

                let value = [];
                if (rawValue !== null) {
                    try { value = this.evalExpr(rawValue, scope); }
                    catch { value = []; }
                }

                scope.defineVar(name, { type: 'value', value, mutable: true });
                break;
            }

            case 'push': {
                const name = this.getAttr(attrs, 'name');
                const rawValue = this.getAttr(attrs, 'value');
                if (!name || rawValue === null) break;

                const entry = scope.getVarEntry(name);
                if (!entry || !Array.isArray(entry.value)) {
                    throw new Error(`"${name}" is not an array.`);
                }

                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }

                entry.value.push(value);
                break;
            }

            case 'pop': {
                const name = this.getAttr(attrs, 'name');
                if (!name) break;

                const entry = scope.getVarEntry(name);
                if (!entry || !Array.isArray(entry.value)) {
                    throw new Error(`"${name}" is not an array.`);
                }

                entry.value.pop();
                break;
            }

            case 'unshift': {
                const name = this.getAttr(attrs, 'name');
                const rawValue = this.getAttr(attrs, 'value');
                if (!name || rawValue === null) break;
                const entry = scope.getVarEntry(name);
                if (!entry || !Array.isArray(entry.value)) throw new Error(`"${name}" is not an array.`);
                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }
                entry.value.unshift(value);
                break;
            }

            case 'shift': {
                const name = this.getAttr(attrs, 'name');
                if (!name) break;
                const entry = scope.getVarEntry(name);
                if (!entry || !Array.isArray(entry.value)) throw new Error(`"${name}" is not an array.`);
                entry.value.shift();
                break;
            }

            case 'indexof': {
                const name = this.getAttr(attrs, 'name');
                const target = this.getAttr(attrs, 'target');
                const rawValue = this.getAttr(attrs, 'value');
                if (!name || !target || rawValue === null) break;
                const entry = scope.getVarEntry(target);
                if (!entry || !Array.isArray(entry.value)) throw new Error(`"${target}" is not an array.`);
                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }
                const idx = entry.value.findIndex((v) => v === value);
                scope.defineVar(name, { type: 'value', value: idx, mutable: true });
                break;
            }

            case 'remove': {
                const name = this.getAttr(attrs, 'name');
                const indexAttr = this.getAttr(attrs, 'index');
                if (!name || indexAttr === null) break;
                const entry = scope.getVarEntry(name);
                if (!entry || !Array.isArray(entry.value)) throw new Error(`"${name}" is not an array.`);
                let idx;
                try { idx = this.evalExpr(indexAttr, scope); }
                catch { idx = Number(indexAttr); }
                entry.value.splice(idx, 1);
                break;
            }

            case 'length': {
                const name = this.getAttr(attrs, 'name');
                const target = this.getAttr(attrs, 'target');
                if (!name || !target) break;

                const entry = scope.getVarEntry(target);
                if (!entry || !Array.isArray(entry.value)) {
                    throw new Error(`"${target}" is not an array.`);
                }

                scope.defineVar(name, { type: 'value', value: entry.value.length, mutable: true });
                break;
            }

            case 'foreach': {
                const varName = this.getAttr(attrs, 'var');
                const inName = this.getAttr(attrs, 'in');
                if (!varName || !inName) break;
                const entry = scope.getVarEntry(inName);
                if (!entry || !Array.isArray(entry.value)) throw new Error(`"${inName}" is not an array.`);

                for (const item of entry.value.slice()) {
                    const iterScope = new Scope(scope);
                    iterScope.defineVar(varName, { type: 'value', value: item, mutable: true });
                    try {
                        this.executeBlock(this.parseStatements(body), iterScope);
                    } catch (e) {
                        if (e instanceof BreakSignal) break;
                        if (e instanceof ContinueSignal) continue;
                        throw e;
                    }
                }
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
                if (!this.globalFuncs.has(name)) {
                    throw new Error(`<override fun> failed: no <fun name="${name}"> exists to override.`);
                }
                const params = (this.getAttr(attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                this.globalFuncs.set(name, { name, params, body, closureScope: scope, isPrivate: false, isOverride: true });
                break;
            }

            // call como statement solto, com suporte a target="obj" (método)
            case 'call': {
                const fnName = this.getAttr(attrs, 'name');
                const argsStr = this.getAttr(attrs, 'args') || '';
                const argValues = this.splitTopLevel(argsStr).map((a) => this.evalExpr(a, scope));
                const targetName = this.getAttr(attrs, 'target');
                if (targetName) {
                    const entry = scope.getVarEntry(targetName);
                    if (entry === undefined) throw new Error(`Identifier not allowed: "${targetName}"`);
                    const receiver = this.currentValue(entry);
                    this.callMethod(receiver, fnName, argValues, scope.findMeta('currentClassName'));
                } else {
                    this.callFunction(fnName, argValues, scope);
                }
                break;
            }

            // declaração de classe
            case 'class': {
                const name = this.getAttr(attrs, 'name');
                if (!name) break;
                const parentName = this.getAttr(attrs, 'extends');
                const classStatements = this.parseStatements(body);

                const fields = [];
                let initDef = null;
                const methods = new Map();

                for (const stmt of classStatements) {
                    if (stmt.tagName === 'var' || stmt.tagName === 'val') {
                        const fname = this.getAttr(stmt.attrs, 'name');
                        const fvalue = this.getAttr(stmt.attrs, 'value') || '';
                        if (fname) fields.push({ name: fname, valueExpr: fvalue });
                    } else if (stmt.tagName === 'init') {
                        const params = (this.getAttr(stmt.attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                        initDef = { params, body: stmt.body };
                    } else if (stmt.tagName === 'fun') {
                        const mname = this.getAttr(stmt.attrs, 'name');
                        const params = (this.getAttr(stmt.attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                        methods.set(mname, { name: mname, params, body: stmt.body, isPrivate: false });
                    } else if (stmt.tagName === 'private') {
                        const mname = this.getAttr(stmt.attrs, 'name');
                        const params = (this.getAttr(stmt.attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                        methods.set(mname, { name: mname, params, body: stmt.body, isPrivate: true });
                    } else if (stmt.tagName === 'override') {
                        const mname = this.getAttr(stmt.attrs, 'name');
                        const params = (this.getAttr(stmt.attrs, 'params') || '').split(',').map((p) => p.trim()).filter(Boolean);
                        methods.set(mname, { name: mname, params, body: stmt.body, isPrivate: false, isOverride: true });
                    }
                }

                if (parentName && !this.classes.has(parentName)) {
                    throw new Error(`<class extends="${parentName}"> failed: parent class not defined (declare it first).`);
                }

                for (const [mname, def] of methods) {
                    if (def.isOverride) {
                        let found = false;
                        let p = parentName ? this.classes.get(parentName) : null;
                        while (p) {
                            if (p.methods.has(mname)) { found = true; break; }
                            p = p.parentName ? this.classes.get(p.parentName) : null;
                        }
                        if (!found) {
                            throw new Error(`<override fun name="${mname}"> failed: no parent class defines this method.`);
                        }
                    }
                }

                this.classes.set(name, { name, parentName, fields, initDef, methods, declScope: scope });
                break;
            }

            // <super args="..." /> dentro de <init>
            case 'super': {
                const cls = scope.findMeta('classForSuper');
                if (!cls || !cls.parentName) {
                    throw new Error('<super> can only be used inside <init> of a class with "extends".');
                }
                const parentCls = this.classes.get(cls.parentName);
                if (!parentCls) throw new Error('Parent class not found: ' + cls.parentName);
                const argsStr = this.getAttr(attrs, 'args') || '';
                const argValues = this.splitTopLevel(argsStr).map((a) => this.evalExpr(a, scope));
                const thisEntry = scope.getVarEntry('this');
                if (!thisEntry) throw new Error('<super> called without "this" in scope.');
                this.runInit(parentCls, thisEntry.value, argValues);
                break;
            }

            // ===== NOVO: DOM — eventos, classes, estilo, visibilidade =====
            case 'on': {
                const eventName = this.getAttr(attrs, 'event');
                const targetId = this.getAttr(attrs, 'target');
                const callName = this.getAttr(attrs, 'call');
                if (!eventName || !targetId || !callName) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found for <on>.`);
                el.addEventListener(eventName, () => {
                    try {
                        this.callFunction(callName, [], scope);
                    } catch (e) {
                        console.error('XLang <on> error:', e.message);
                    }
                });
                break;
            }

            case 'add-class': {
                const targetId = this.getAttr(attrs, 'target');
                const className = this.getAttr(attrs, 'class');
                if (!targetId || !className) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                el.classList.add(className);
                break;
            }

            case 'remove-class': {
                const targetId = this.getAttr(attrs, 'target');
                const className = this.getAttr(attrs, 'class');
                if (!targetId || !className) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                el.classList.remove(className);
                break;
            }

            case 'toggle-class': {
                const targetId = this.getAttr(attrs, 'target');
                const className = this.getAttr(attrs, 'class');
                if (!targetId || !className) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                el.classList.toggle(className);
                break;
            }

            case 'show': {
                const targetId = this.getAttr(attrs, 'target');
                if (!targetId) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                el.style.display = '';
                break;
            }

            case 'hide': {
                const targetId = this.getAttr(attrs, 'target');
                if (!targetId) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                el.style.display = 'none';
                break;
            }

            case 'set-style': {
                const targetId = this.getAttr(attrs, 'target');
                const property = this.getAttr(attrs, 'property');
                const rawValue = this.getAttr(attrs, 'value');
                if (!targetId || !property || rawValue === null) break;
                const el = document.getElementById(targetId);
                if (!el) throw new Error(`Element with id "${targetId}" not found.`);
                let value;
                try { value = this.evalExpr(rawValue, scope); }
                catch { value = rawValue; }
                el.style.setProperty(property, String(value));
                break;
            }

            // <import> so e valido no nivel raiz do <program> (cabecalho),
            // resolvido em run() antes do executeBlock rodar. Se chegou aqui
            // e porque apareceu dentro de <fun>/<if>/<loop>/etc, o que nao e
            // suportado.
            case 'import':
                throw new Error('<import> is only allowed at the top level of <program>, not inside other blocks.');

            default:
                break;
        }
    }
}

// ===== AUTO-INICIALIZAÇÃO =====
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const xlangInterpreters = [];

    async function initXLang() {
        const scripts = document.querySelectorAll('script[type="text/xlang"]');

        for (let index = 0; index < scripts.length; index++) {
            const scriptEl = scripts[index];
            const container = document.createElement('div');
            const interpreter = new XLangInterpreter(container);

            try {
                await interpreter.run(scriptEl.textContent);
                scriptEl.parentNode.replaceChild(container, scriptEl);
                xlangInterpreters.push(interpreter);
                console.log(`Programa XLang #${index + 1} executado.`);
            } catch (error) {
                console.error(`Erro:`, error);
                container.textContent = 'ERRO: ' + error.message;
                scriptEl.parentNode.replaceChild(container, scriptEl);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initXLang);
    } else {
        initXLang();
    }

    // Ponte para HTML/JS externo chamar funcoes publicas da XLang, ex:
    // <button onclick="XLang.call('incrementar')">+1</button>
    window.XLang = {
        call(name, ...args) {
            for (const interp of xlangInterpreters) {
                if (interp.globalFuncs.has(name)) {
                    const rootScope = new Scope(null);
                    return interp.callFunction(name, args, rootScope);
                }
            }
            throw new Error(`XLang.call: função pública "${name}" não encontrada.`);
        }
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XLangInterpreter, Scope, BreakSignal, ContinueSignal, ReturnSignal };
}

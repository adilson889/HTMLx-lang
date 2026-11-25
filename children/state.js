(function () {
    if (typeof window === 'undefined') return;

    const states = new Map();
    // listeners by name; the name '*' listens to every state
    const listeners = new Map();

    function readFromElement(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            const raw = el.value;
            if (el.type === 'number' && raw !== '' && !isNaN(raw) && raw.trim() !== '') {
                return Number(raw);
            }
            return raw;
        }
        return el.textContent;
    }

    // what an element shows for a value: lists and objects are shown as JSON
    function toText(value) {
        if (value === undefined || value === null) return '';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (e) {
                return String(value);
            }
        }
        return String(value);
    }

    function writeToElement(el, value) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
            el.value = toText(value);
        } else {
            el.textContent = toText(value);
        }
    }

    function createState(name, defaultValue) {
        if (!states.has(name)) {
            states.set(name, {
                value: defaultValue,
                writer: null,
                readers: new Set()
            });
        }
        return states.get(name);
    }

    // one place that tells everyone a state changed: the elements that read it,
    // the listeners registered with on(), and the 'xlang:state-change' event
    function emit(name, state) {
        state.readers.forEach((reader) => {
            writeToElement(reader, state.value);
        });

        window.dispatchEvent(new CustomEvent('xlang:state-change', {
            detail: { name, value: state.value }
        }));

        [listeners.get(name), listeners.get('*')].forEach((set) => {
            if (!set) return;
            Array.from(set).forEach((fn) => {
                try {
                    fn(state.value, name);
                } catch (e) {
                    console.error('xlang state listener for "' + name + '" failed:', e);
                }
            });
        });
    }

    function setState(name, value) {
        const state = states.get(name);
        if (!state) return;

        // a value that did not change does not wake anyone up; lists and objects
        // always do, because they may have been changed in place (see touch)
        if (typeof value !== 'object' && Object.is(state.value, value)) return;

        state.value = value;

        if (state.writer) {
            writeToElement(state.writer, value);
        }

        emit(name, state);
    }

    function connectElement(el) {
        const expr = (el.getAttribute('use-state') || '').trim();
        if (!expr) return;

        let name = expr;
        let defaultValue = '';

        const colonIndex = expr.indexOf(':');
        if (colonIndex !== -1) {
            name = expr.slice(0, colonIndex).trim();
            defaultValue = expr.slice(colonIndex + 1).trim();
        }

        if (!name) return;

        const tag = el.tagName.toLowerCase();
        const isFormElement = tag === 'input' || tag === 'textarea' || tag === 'select';

        const state = createState(name, defaultValue);

        if (isFormElement && !state.writer) {
            state.writer = el;

            const current = readFromElement(el);
            if (current !== '' && current !== undefined && current !== null) {
                state.value = current;
            } else {
                writeToElement(el, state.value);
            }

            el.addEventListener('input', () => {
                state.value = readFromElement(el);
                emit(name, state);
            });
        } else {
            state.readers.add(el);
            writeToElement(el, state.value);
        }

        window.XLangState = window.XLangState || {};
        window.XLangState[name] = state.value;
    }

    // makes one state readable and writable through window.XLangState[name]
    function exposeOne(name, state) {
        if (!window.XLangState) {
            window.XLangState = {};
        }

        Object.defineProperty(window.XLangState, name, {
            get() {
                return state.value;
            },
            set(value) {
                setState(name, value);
            },
            configurable: true,
            enumerable: true
        });
    }

    function exposeToXlang() {
        if (!window.XLangState) {
            window.XLangState = {};
        }

        states.forEach((state, name) => {
            exposeOne(name, state);
        });
    }

    // For code that is not an element on the page (a project, its files, the open file):
    //   XLangStateApi.define('files', [])            creates a state (or keeps the one that exists)
    //   XLangStateApi.get('files') / .set('files', v)
    //   XLangStateApi.on('files', fn)                fn(value, name) on every change; returns a function that stops it
    //   XLangStateApi.on('*', fn)                    the same for every state
    //   XLangStateApi.touch('files')                 tells everyone after a list or object was changed in place
    // A state that must be a variable of an XLang program has to be defined before that program runs.
    const api = {
        define(name, value) {
            if (typeof name !== 'string' || !name.trim()) {
                throw new Error('XLangStateApi.define: "name" must be a non-empty string.');
            }
            name = name.trim();
            let state = states.get(name);
            if (!state) {
                state = createState(name, value);
                exposeOne(name, state);
            }
            return state.value;
        },
        has(name) {
            return states.has(name);
        },
        names() {
            return Array.from(states.keys());
        },
        get(name) {
            const state = states.get(name);
            return state ? state.value : undefined;
        },
        set(name, value) {
            if (!states.has(name)) {
                throw new Error('XLangStateApi.set: the state "' + name + '" does not exist. Use define first.');
            }
            setState(name, value);
        },
        touch(name) {
            const state = states.get(name);
            if (!state) {
                throw new Error('XLangStateApi.touch: the state "' + name + '" does not exist. Use define first.');
            }
            if (state.writer) {
                writeToElement(state.writer, state.value);
            }
            emit(name, state);
        },
        on(name, fn) {
            if (typeof fn !== 'function') {
                throw new Error('XLangStateApi.on: the listener must be a function.');
            }
            if (!listeners.has(name)) {
                listeners.set(name, new Set());
            }
            listeners.get(name).add(fn);
            return function off() {
                const set = listeners.get(name);
                if (set) set.delete(fn);
            };
        }
    };
    window.XLangStateApi = api;

    function init() {
        document.querySelectorAll('[use-state]').forEach((el) => {
            connectElement(el);
        });

        exposeToXlang();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

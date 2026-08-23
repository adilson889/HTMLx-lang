// xlang-validation.js - XLang Validation Library v1.0
// Validacao de formularios, dados de entrada, e regras de negocio comuns.
(function() {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;

    function requireString(val, fnName, label) {
        if (typeof val !== 'string') {
            throw new Error(`${fnName}: "${label}" must be a string.`);
        }
    }

    function requireNumber(val, fnName, label) {
        if (typeof val !== 'number' || Number.isNaN(val)) {
            throw new Error(`${fnName}: "${label}" must be a number.`);
        }
    }

    // ===== PRESENCA / VAZIO =====
    R.register('isEmpty', (val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') return val.trim().length === 0;
        if (Array.isArray(val)) return val.length === 0;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
    });
    R.register('isNotEmpty', (val) => !R.get('isEmpty')(val));
    R.register('isNull', (val) => val === null || val === undefined);
    R.register('isNotNull', (val) => val !== null && val !== undefined);

    // ===== TEXTO =====
    R.register('isEmail', (val) => {
        requireString(val, 'isEmail', 'val');
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
    });
    R.register('isUrl', (val) => {
        requireString(val, 'isUrl', 'val');
        try { new URL(val); return true; } catch { return false; }
    });
    R.register('isAlpha', (val) => {
        requireString(val, 'isAlpha', 'val');
        return /^[A-Za-zÀ-ÿ\s]+$/.test(val);
    });
    R.register('isAlphanumeric', (val) => {
        requireString(val, 'isAlphanumeric', 'val');
        return /^[A-Za-z0-9]+$/.test(val);
    });
    R.register('isNumeric', (val) => {
        requireString(val, 'isNumeric', 'val');
        return /^-?\d+(\.\d+)?$/.test(val.trim());
    });
    R.register('minLength', (val, n) => {
        requireString(val, 'minLength', 'val');
        requireNumber(n, 'minLength', 'n');
        return val.length >= n;
    });
    R.register('maxLength', (val, n) => {
        requireString(val, 'maxLength', 'val');
        requireNumber(n, 'maxLength', 'n');
        return val.length <= n;
    });
    R.register('lengthBetween', (val, min, max) => {
        requireString(val, 'lengthBetween', 'val');
        requireNumber(min, 'lengthBetween', 'min');
        requireNumber(max, 'lengthBetween', 'max');
        if (min > max) throw new Error('lengthBetween: min must not be greater than max.');
        return val.length >= min && val.length <= max;
    });
    R.register('matchesPattern', (val, pattern) => {
        requireString(val, 'matchesPattern', 'val');
        requireString(pattern, 'matchesPattern', 'pattern');
        try {
            return new RegExp(pattern).test(val);
        } catch (e) {
            throw new Error(`matchesPattern: invalid regular expression "${pattern}".`);
        }
    });
    R.register('equalsIgnoreCase', (a, b) => {
        requireString(a, 'equalsIgnoreCase', 'a');
        requireString(b, 'equalsIgnoreCase', 'b');
        return a.toLowerCase() === b.toLowerCase();
    });

    // ===== NUMEROS =====
    R.register('isInteger', (val) => typeof val === 'number' && Number.isInteger(val));
    R.register('isPositive', (val) => {
        requireNumber(val, 'isPositive', 'val');
        return val > 0;
    });
    R.register('isNegative', (val) => {
        requireNumber(val, 'isNegative', 'val');
        return val < 0;
    });
    R.register('inRange', (val, min, max) => {
        requireNumber(val, 'inRange', 'val');
        requireNumber(min, 'inRange', 'min');
        requireNumber(max, 'inRange', 'max');
        if (min > max) throw new Error('inRange: min must not be greater than max.');
        return val >= min && val <= max;
    });

    // ===== TELEFONE (formato flexivel, aceita +, espacos, hifens, parenteses) =====
    R.register('isPhone', (val) => {
        requireString(val, 'isPhone', 'val');
        const cleaned = val.replace(/[\s()-]/g, '');
        return /^\+?\d{7,15}$/.test(cleaned);
    });

    // ===== SENHA =====
    R.register('isStrongPassword', (val) => {
        requireString(val, 'isStrongPassword', 'val');
        if (val.length < 8) return false;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasDigit = /\d/.test(val);
        const hasSpecial = /[^A-Za-z0-9]/.test(val);
        return hasUpper && hasLower && hasDigit && hasSpecial;
    });
    R.register('passwordsMatch', (a, b) => {
        requireString(a, 'passwordsMatch', 'a');
        requireString(b, 'passwordsMatch', 'b');
        return a === b;
    });

    // ===== CARTAO / DOCUMENTOS (algoritmos genericos, sem validar pais especifico) =====
    R.register('isValidLuhn', (val) => {
        requireString(val, 'isValidLuhn', 'val');
        const digits = val.replace(/\s/g, '');
        if (!/^\d+$/.test(digits)) return false;
        let sum = 0;
        let shouldDouble = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let d = parseInt(digits[i], 10);
            if (shouldDouble) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    });

    // ===== ARRAYS / LISTAS =====
    R.register('allValid', (arr, fnName) => {
        if (!Array.isArray(arr)) throw new Error('allValid: "arr" must be an array.');
        requireString(fnName, 'allValid', 'fnName');
        const fn = R.get(fnName);
        if (!fn) throw new Error(`allValid: validator function "${fnName}" not found.`);
        return arr.every((item) => !!fn(item));
    });
    R.register('anyValid', (arr, fnName) => {
        if (!Array.isArray(arr)) throw new Error('anyValid: "arr" must be an array.');
        requireString(fnName, 'anyValid', 'fnName');
        const fn = R.get(fnName);
        if (!fn) throw new Error(`anyValid: validator function "${fnName}" not found.`);
        return arr.some((item) => !!fn(item));
    });
    R.register('hasDuplicates', (arr) => {
        if (!Array.isArray(arr)) throw new Error('hasDuplicates: "arr" must be an array.');
        return new Set(arr).size !== arr.length;
    });

    // ===== COMPOSICAO: valida varios campos de uma vez, devolve erros =====
    // rules: array de objetos {campo, valor, validador, mensagem}
    // devolve: array de mensagens de erro (vazio se tudo valido)
    R.register('validateForm', (rules) => {
        if (!Array.isArray(rules)) throw new Error('validateForm: "rules" must be an array.');
        const errors = [];
        rules.forEach((rule, idx) => {
            if (!rule || typeof rule !== 'object') {
                throw new Error(`validateForm: rule at index ${idx} must be an object.`);
            }
            const { campo, valor, validador, mensagem } = rule;
            if (typeof validador !== 'string') {
                throw new Error(`validateForm: rule "${campo || idx}" is missing "validador" (function name as string).`);
            }
            const fn = R.get(validador);
            if (!fn) {
                throw new Error(`validateForm: validator function "${validador}" not found.`);
            }
            let ok;
            try {
                ok = !!fn(valor);
            } catch (e) {
                ok = false;
            }
            if (!ok) {
                errors.push(mensagem || `${campo || 'campo'}: invalid value.`);
            }
        });
        return errors;
    });
})();

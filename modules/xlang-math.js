// xlang-math.js - XLang Math Library v3.0
// Cobre math.h quase por completo + subconjunto vetorizado do numpy
// (vetores/matrizes de tamanho arbitrário, sem broadcasting N-dimensional).
(function() {
    if (typeof window === 'undefined' || !window.XLangRegistry) return;

    const R = window.XLangRegistry;

    function requireNumbers(args, fnName) {
        for (const a of args) {
            if (typeof a !== 'number' || Number.isNaN(a)) {
                throw new Error(`${fnName}: all arguments must be numbers.`);
            }
        }
    }

    function requireNonEmpty(args, fnName) {
        if (args.length === 0) {
            throw new Error(`${fnName}: requires at least one value.`);
        }
    }

    function requireArray(val, fnName, label) {
        if (!Array.isArray(val)) {
            throw new Error(`${fnName}: "${label}" must be an array.`);
        }
    }

    function requireNumericArray(val, fnName, label) {
        requireArray(val, fnName, label);
        for (const v of val) {
            if (typeof v !== 'number' || Number.isNaN(v)) {
                throw new Error(`${fnName}: "${label}" must contain only numbers.`);
            }
        }
    }

    function requireSameLength(a, b, fnName) {
        if (a.length !== b.length) {
            throw new Error(`${fnName}: arrays must have the same length.`);
        }
    }

    function requireMatrix(val, fnName, label) {
        requireArray(val, fnName, label);
        if (val.length === 0 || !Array.isArray(val[0])) {
            throw new Error(`${fnName}: "${label}" must be a matrix (array of arrays).`);
        }
        const cols = val[0].length;
        for (const row of val) {
            if (!Array.isArray(row) || row.length !== cols) {
                throw new Error(`${fnName}: "${label}" has inconsistent row lengths.`);
            }
        }
    }

    function requireSquareMatrix(val, fnName, label) {
        requireMatrix(val, fnName, label);
        if (val.length !== val[0].length) {
            throw new Error(`${fnName}: "${label}" must be a square matrix.`);
        }
    }

    // ===== BASICAS =====
    R.register('add', (...args) => { requireNonEmpty(args, 'add'); requireNumbers(args, 'add'); return args.reduce((a, b) => a + b, 0); });
    R.register('sub', (a, b) => { requireNumbers([a, b], 'sub'); return a - b; });
    R.register('mul', (...args) => { requireNonEmpty(args, 'mul'); requireNumbers(args, 'mul'); return args.reduce((a, b) => a * b, 1); });
    R.register('div', (a, b) => {
        requireNumbers([a, b], 'div');
        if (b === 0) throw new Error('div: division by zero.');
        return a / b;
    });
    R.register('mod', (a, b) => {
        requireNumbers([a, b], 'mod');
        if (b === 0) throw new Error('mod: division by zero.');
        return a % b;
    });
    R.register('fmod', (a, b) => {
        requireNumbers([a, b], 'fmod');
        if (b === 0) throw new Error('fmod: division by zero.');
        // fmod (C semantics): resultado tem o mesmo sinal de a, diferente de % em casos negativos identicos ao JS %
        return a % b;
    });
    R.register('pow', (a, b) => { requireNumbers([a, b], 'pow'); return Math.pow(a, b); });
    R.register('sqr', (a) => {
        requireNumbers([a], 'sqr');
        if (a < 0) throw new Error('sqr: cannot take square root of a negative number.');
        return Math.sqrt(a);
    });
    R.register('cbr', (a) => { requireNumbers([a], 'cbr'); return Math.cbrt(a); });

    // ===== IEEE / CLASSIFICACAO (equivalentes de math.h) =====
    R.register('isNaN', (a) => typeof a === 'number' && Number.isNaN(a));
    R.register('isInfinity', (a) => a === Infinity || a === -Infinity);
    R.register('isFinite', (a) => typeof a === 'number' && Number.isFinite(a));
    R.register('nan', () => NaN);
    R.register('frexp', (a) => {
        requireNumbers([a], 'frexp');
        if (a === 0) return [0, 0];
        const exp = Math.ceil(Math.log2(Math.abs(a)));
        const mantissa = a / Math.pow(2, exp);
        return [mantissa, exp];
    });
    R.register('ldexp', (mantissa, exp) => {
        requireNumbers([mantissa, exp], 'ldexp');
        return mantissa * Math.pow(2, exp);
    });
    R.register('copysign', (a, b) => {
        requireNumbers([a, b], 'copysign');
        return Math.sign(b) < 0 ? -Math.abs(a) : Math.abs(a);
    });

    // ===== AGREGADOS =====
    R.register('sum', (...args) => { requireNonEmpty(args, 'sum'); requireNumbers(args, 'sum'); return args.reduce((a, b) => a + b, 0); });
    R.register('avg', (...args) => { requireNonEmpty(args, 'avg'); requireNumbers(args, 'avg'); return args.reduce((a, b) => a + b, 0) / args.length; });
    R.register('min', (...args) => { requireNonEmpty(args, 'min'); requireNumbers(args, 'min'); return Math.min(...args); });
    R.register('max', (...args) => { requireNonEmpty(args, 'max'); requireNumbers(args, 'max'); return Math.max(...args); });
    R.register('median', (...args) => {
        requireNonEmpty(args, 'median');
        requireNumbers(args, 'median');
        const sorted = [...args].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    });
    R.register('mode', (...args) => {
        requireNonEmpty(args, 'mode');
        requireNumbers(args, 'mode');
        const counts = new Map();
        for (const v of args) counts.set(v, (counts.get(v) || 0) + 1);
        let best = args[0], bestCount = 0;
        for (const [v, c] of counts) {
            if (c > bestCount) { best = v; bestCount = c; }
        }
        return best;
    });
    R.register('range', (...args) => {
        requireNonEmpty(args, 'range');
        requireNumbers(args, 'range');
        return Math.max(...args) - Math.min(...args);
    });
    R.register('product', (...args) => { requireNonEmpty(args, 'product'); requireNumbers(args, 'product'); return args.reduce((a, b) => a * b, 1); });
    R.register('clamp', (value, lo, hi) => {
        requireNumbers([value, lo, hi], 'clamp');
        if (lo > hi) throw new Error('clamp: min must not be greater than max.');
        return Math.min(Math.max(value, lo), hi);
    });
    R.register('lerp', (a, b, t) => { requireNumbers([a, b, t], 'lerp'); return a + (b - a) * t; });
    R.register('sign', (a) => { requireNumbers([a], 'sign'); return Math.sign(a); });

    // ===== TRIGONOMETRIA =====
    R.register('sin', (a) => { requireNumbers([a], 'sin'); return Math.sin(a); });
    R.register('cos', (a) => { requireNumbers([a], 'cos'); return Math.cos(a); });
    R.register('tan', (a) => { requireNumbers([a], 'tan'); return Math.tan(a); });
    R.register('asin', (a) => {
        requireNumbers([a], 'asin');
        if (a < -1 || a > 1) throw new Error('asin: value must be between -1 and 1.');
        return Math.asin(a);
    });
    R.register('acos', (a) => {
        requireNumbers([a], 'acos');
        if (a < -1 || a > 1) throw new Error('acos: value must be between -1 and 1.');
        return Math.acos(a);
    });
    R.register('atan', (a) => { requireNumbers([a], 'atan'); return Math.atan(a); });
    R.register('atan2', (y, x) => { requireNumbers([y, x], 'atan2'); return Math.atan2(y, x); });
    R.register('degrees', (rad) => { requireNumbers([rad], 'degrees'); return rad * (180 / Math.PI); });
    R.register('radians', (deg) => { requireNumbers([deg], 'radians'); return deg * (Math.PI / 180); });
    R.register('hypot', (...args) => { requireNonEmpty(args, 'hypot'); requireNumbers(args, 'hypot'); return Math.hypot(...args); });

    // ===== LOGARITMOS =====
    R.register('log', (a) => {
        requireNumbers([a], 'log');
        if (a <= 0) throw new Error('log: value must be greater than zero.');
        return Math.log(a);
    });
    R.register('log10', (a) => {
        requireNumbers([a], 'log10');
        if (a <= 0) throw new Error('log10: value must be greater than zero.');
        return Math.log10(a);
    });
    R.register('log2', (a) => {
        requireNumbers([a], 'log2');
        if (a <= 0) throw new Error('log2: value must be greater than zero.');
        return Math.log2(a);
    });
    R.register('exp', (a) => { requireNumbers([a], 'exp'); return Math.exp(a); });

    // ===== CONSTANTES =====
    R.register('PI', () => Math.PI);
    R.register('E', () => Math.E);
    R.register('TAU', () => Math.PI * 2);
    R.register('INFINITY', () => Infinity);
    R.register('NAN', () => NaN);

    // ===== ARREDONDAMENTO =====
    R.register('round', (a, decimals = 0) => {
        requireNumbers([a, decimals], 'round');
        const factor = Math.pow(10, decimals);
        return Math.round(a * factor) / factor;
    });
    R.register('floor', (a) => { requireNumbers([a], 'floor'); return Math.floor(a); });
    R.register('ceil', (a) => { requireNumbers([a], 'ceil'); return Math.ceil(a); });
    R.register('trunc', (a) => { requireNumbers([a], 'trunc'); return Math.trunc(a); });

    // ===== HIPERBOLICAS =====
    R.register('sinh', (a) => { requireNumbers([a], 'sinh'); return Math.sinh(a); });
    R.register('cosh', (a) => { requireNumbers([a], 'cosh'); return Math.cosh(a); });
    R.register('tanh', (a) => { requireNumbers([a], 'tanh'); return Math.tanh(a); });
    R.register('asinh', (a) => { requireNumbers([a], 'asinh'); return Math.asinh(a); });
    R.register('acosh', (a) => {
        requireNumbers([a], 'acosh');
        if (a < 1) throw new Error('acosh: value must be greater than or equal to 1.');
        return Math.acosh(a);
    });
    R.register('atanh', (a) => {
        requireNumbers([a], 'atanh');
        if (a <= -1 || a >= 1) throw new Error('atanh: value must be between -1 and 1 (exclusive).');
        return Math.atanh(a);
    });

    // ===== TEORIA DOS NUMEROS =====
    R.register('factorial', (a) => {
        requireNumbers([a], 'factorial');
        if (a < 0 || !Number.isInteger(a)) throw new Error('factorial: value must be a non-negative integer.');
        let result = 1;
        for (let i = 2; i <= a; i++) result *= i;
        return result;
    });
    R.register('gcd', (a, b) => {
        requireNumbers([a, b], 'gcd');
        if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('gcd: values must be integers.');
        a = Math.abs(a); b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    });
    R.register('lcm', (a, b) => {
        requireNumbers([a, b], 'lcm');
        if (!Number.isInteger(a) || !Number.isInteger(b)) throw new Error('lcm: values must be integers.');
        if (a === 0 || b === 0) return 0;
        let x = Math.abs(a), y = Math.abs(b);
        while (y) { [x, y] = [y, x % y]; }
        return Math.abs(a * b) / x;
    });
    R.register('isPrime', (a) => {
        requireNumbers([a], 'isPrime');
        if (!Number.isInteger(a) || a < 2) return false;
        if (a === 2) return true;
        if (a % 2 === 0) return false;
        for (let i = 3; i * i <= a; i += 2) {
            if (a % i === 0) return false;
        }
        return true;
    });

    // ===== VETORES (tamanho fixo N, ex: coordenadas) =====
    R.register('dot', (arr1, arr2) => {
        requireArray(arr1, 'dot', 'arr1');
        requireArray(arr2, 'dot', 'arr2');
        requireSameLength(arr1, arr2, 'dot');
        return arr1.reduce((sum, val, i) => sum + val * arr2[i], 0);
    });
    R.register('magnitude', (arr) => {
        requireArray(arr, 'magnitude', 'arr');
        return Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0));
    });
    R.register('normalize', (arr) => {
        requireArray(arr, 'normalize', 'arr');
        const mag = Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0));
        if (mag === 0) throw new Error('normalize: cannot normalize a zero-length vector.');
        return arr.map((v) => v / mag);
    });
    R.register('cross', (arr1, arr2) => {
        requireArray(arr1, 'cross', 'arr1');
        requireArray(arr2, 'cross', 'arr2');
        if (arr1.length !== 3 || arr2.length !== 3) {
            throw new Error('cross: both vectors must have exactly 3 components.');
        }
        return [
            arr1[1] * arr2[2] - arr1[2] * arr2[1],
            arr1[2] * arr2[0] - arr1[0] * arr2[2],
            arr1[0] * arr2[1] - arr1[1] * arr2[0]
        ];
    });
    R.register('distance', (arr1, arr2) => {
        requireArray(arr1, 'distance', 'arr1');
        requireArray(arr2, 'distance', 'arr2');
        requireSameLength(arr1, arr2, 'distance');
        return Math.sqrt(arr1.reduce((sum, val, i) => sum + Math.pow(val - arr2[i], 2), 0));
    });

    // ===== ARRAYS VETORIZADOS (numpy-like, tamanho arbitrario) =====
    // Aplicam a operacao elemento a elemento, sem precisar de <for>/<foreach>.
    R.register('vecScale', (arr, k) => {
        requireNumericArray(arr, 'vecScale', 'arr');
        requireNumbers([k], 'vecScale');
        return arr.map((v) => v * k);
    });
    R.register('vecAdd', (a, b) => {
        requireNumericArray(a, 'vecAdd', 'a');
        requireNumericArray(b, 'vecAdd', 'b');
        requireSameLength(a, b, 'vecAdd');
        return a.map((v, i) => v + b[i]);
    });
    R.register('vecSub', (a, b) => {
        requireNumericArray(a, 'vecSub', 'a');
        requireNumericArray(b, 'vecSub', 'b');
        requireSameLength(a, b, 'vecSub');
        return a.map((v, i) => v - b[i]);
    });
    R.register('vecMulElementwise', (a, b) => {
        requireNumericArray(a, 'vecMulElementwise', 'a');
        requireNumericArray(b, 'vecMulElementwise', 'b');
        requireSameLength(a, b, 'vecMulElementwise');
        return a.map((v, i) => v * b[i]);
    });
    R.register('vecDivElementwise', (a, b) => {
        requireNumericArray(a, 'vecDivElementwise', 'a');
        requireNumericArray(b, 'vecDivElementwise', 'b');
        requireSameLength(a, b, 'vecDivElementwise');
        return a.map((v, i) => {
            if (b[i] === 0) throw new Error('vecDivElementwise: division by zero.');
            return v / b[i];
        });
    });
    R.register('vecSum', (arr) => {
        requireNumericArray(arr, 'vecSum', 'arr');
        return arr.reduce((s, v) => s + v, 0);
    });
    R.register('vecAvg', (arr) => {
        requireNumericArray(arr, 'vecAvg', 'arr');
        if (arr.length === 0) throw new Error('vecAvg: array must not be empty.');
        return arr.reduce((s, v) => s + v, 0) / arr.length;
    });
    R.register('vecMin', (arr) => {
        requireNumericArray(arr, 'vecMin', 'arr');
        if (arr.length === 0) throw new Error('vecMin: array must not be empty.');
        return Math.min(...arr);
    });
    R.register('vecMax', (arr) => {
        requireNumericArray(arr, 'vecMax', 'arr');
        if (arr.length === 0) throw new Error('vecMax: array must not be empty.');
        return Math.max(...arr);
    });
    R.register('vecAbs', (arr) => {
        requireNumericArray(arr, 'vecAbs', 'arr');
        return arr.map((v) => Math.abs(v));
    });
    R.register('vecRound', (arr, decimals = 0) => {
        requireNumericArray(arr, 'vecRound', 'arr');
        const factor = Math.pow(10, decimals);
        return arr.map((v) => Math.round(v * factor) / factor);
    });
    R.register('vecClamp', (arr, lo, hi) => {
        requireNumericArray(arr, 'vecClamp', 'arr');
        requireNumbers([lo, hi], 'vecClamp');
        if (lo > hi) throw new Error('vecClamp: min must not be greater than max.');
        return arr.map((v) => Math.min(Math.max(v, lo), hi));
    });
    R.register('vecFill', (n, value) => {
        requireNumbers([n], 'vecFill');
        if (!Number.isInteger(n) || n < 0) throw new Error('vecFill: size must be a non-negative integer.');
        return Array.from({ length: n }, () => value);
    });
    R.register('vecRange', (from, to, step = 1) => {
        requireNumbers([from, to, step], 'vecRange');
        if (step === 0) throw new Error('vecRange: step must not be zero.');
        const out = [];
        if (step > 0) { for (let v = from; v <= to; v += step) out.push(v); }
        else { for (let v = from; v >= to; v += step) out.push(v); }
        return out;
    });

    // ===== MATRIZES =====
    R.register('matrixAdd', (m1, m2) => {
        requireMatrix(m1, 'matrixAdd', 'm1');
        requireMatrix(m2, 'matrixAdd', 'm2');
        if (m1.length !== m2.length || m1[0].length !== m2[0].length) {
            throw new Error('matrixAdd: matrices must have the same dimensions.');
        }
        return m1.map((row, i) => row.map((val, j) => val + m2[i][j]));
    });
    R.register('matrixSub', (m1, m2) => {
        requireMatrix(m1, 'matrixSub', 'm1');
        requireMatrix(m2, 'matrixSub', 'm2');
        if (m1.length !== m2.length || m1[0].length !== m2[0].length) {
            throw new Error('matrixSub: matrices must have the same dimensions.');
        }
        return m1.map((row, i) => row.map((val, j) => val - m2[i][j]));
    });
    R.register('matrixScale', (m, k) => {
        requireMatrix(m, 'matrixScale', 'm');
        requireNumbers([k], 'matrixScale');
        return m.map((row) => row.map((val) => val * k));
    });
    R.register('matrixMul', (m1, m2) => {
        requireMatrix(m1, 'matrixMul', 'm1');
        requireMatrix(m2, 'matrixMul', 'm2');
        if (m1[0].length !== m2.length) {
            throw new Error('matrixMul: number of columns in m1 must match number of rows in m2.');
        }
        return m1.map((row) =>
            m2[0].map((_, j) =>
                row.reduce((sum, val, k) => sum + val * m2[k][j], 0)
            )
        );
    });
    R.register('transpose', (m) => {
        requireMatrix(m, 'transpose', 'm');
        return m[0].map((_, i) => m.map((row) => row[i]));
    });
    R.register('identity', (n) => {
        requireNumbers([n], 'identity');
        if (!Number.isInteger(n) || n < 1) throw new Error('identity: size must be a positive integer.');
        return Array.from({ length: n }, (_, i) =>
            Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
        );
    });
    R.register('determinant', (m) => {
        requireSquareMatrix(m, 'determinant', 'm');
        const n = m.length;
        if (n === 1) return m[0][0];
        if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
        // expansao de Laplace pela primeira linha (suficiente para matrizes pequenas)
        let det = 0;
        for (let col = 0; col < n; col++) {
            const minor = m.slice(1).map((row) => row.filter((_, j) => j !== col));
            const cofactor = (col % 2 === 0 ? 1 : -1) * m[0][col];
            det += cofactor * R.get('determinant')(minor);
        }
        return det;
    });
    R.register('inverse', (m) => {
        requireSquareMatrix(m, 'inverse', 'm');
        const n = m.length;
        const det = R.get('determinant')(m);
        if (det === 0) throw new Error('inverse: matrix is singular (determinant is zero).');
        if (n === 1) return [[1 / m[0][0]]];
        // matriz de cofatores -> adjunta transposta -> divide pelo determinante
        const cofactors = m.map((row, i) =>
            row.map((_, j) => {
                const minor = m.filter((_, ri) => ri !== i).map((r) => r.filter((_, ci) => ci !== j));
                const sign = (i + j) % 2 === 0 ? 1 : -1;
                return sign * R.get('determinant')(minor);
            })
        );
        const adjugate = R.get('transpose')(cofactors);
        return adjugate.map((row) => row.map((val) => val / det));
    });
    R.register('trace', (m) => {
        requireSquareMatrix(m, 'trace', 'm');
        return m.reduce((sum, row, i) => sum + row[i], 0);
    });

    // ===== ESTATISTICA =====
    R.register('variance', (...args) => {
        requireNonEmpty(args, 'variance');
        requireNumbers(args, 'variance');
        const mean = args.reduce((a, b) => a + b, 0) / args.length;
        return args.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / args.length;
    });
    R.register('sampleVariance', (...args) => {
        requireNonEmpty(args, 'sampleVariance');
        requireNumbers(args, 'sampleVariance');
        if (args.length < 2) throw new Error('sampleVariance: requires at least two values.');
        const mean = args.reduce((a, b) => a + b, 0) / args.length;
        return args.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (args.length - 1);
    });
    R.register('std', (...args) => {
        requireNonEmpty(args, 'std');
        requireNumbers(args, 'std');
        const mean = args.reduce((a, b) => a + b, 0) / args.length;
        const variance = args.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / args.length;
        return Math.sqrt(variance);
    });
    R.register('sampleStd', (...args) => {
        requireNonEmpty(args, 'sampleStd');
        requireNumbers(args, 'sampleStd');
        if (args.length < 2) throw new Error('sampleStd: requires at least two values.');
        const mean = args.reduce((a, b) => a + b, 0) / args.length;
        const variance = args.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (args.length - 1);
        return Math.sqrt(variance);
    });
})();

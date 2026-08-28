
# xlang-validation — Reference

Validation library for forms, input data, and common business rules.
Follows the same pattern as xlang-math: native functions registered
via R.register, with argument validation and clear error messages.

## Import

```html
<from xlang import validation>
```

Registration in xlang-modules.json:

```json
{
  "validation": "./modules/xlang-validation.js"
}
```

## Presence / empty

| Function | Signature | Returns |
|---|---|---|
| isEmpty | isEmpty(val) | true if val is null/undefined, empty string (after trim), empty array, or object with no keys |
| isNotEmpty | isNotEmpty(val) | opposite of isEmpty |
| isNull | isNull(val) | true if null or undefined |
| isNotNull | isNotNull(val) | opposite of isNull |

## Text

| Function | Signature | Returns |
|---|---|---|
| isEmail | isEmail(val) | true if val has an email format |
| isUrl | isUrl(val) | true if val is a valid URL |
| isAlpha | isAlpha(val) | true if val contains only letters and spaces (includes accents) |
| isAlphanumeric | isAlphanumeric(val) | true if val contains only letters and numbers |
| isNumeric | isNumeric(val) | true if val (string) represents a number |
| minLength | minLength(val, n) | true if val.length >= n |
| maxLength | maxLength(val, n) | true if val.length <= n |
| lengthBetween | lengthBetween(val, min, max) | true if the length is within range |
| matchesPattern | matchesPattern(val, pattern) | true if val matches the pattern regex (string) |
| equalsIgnoreCase | equalsIgnoreCase(a, b) | compares two strings ignoring case |

## Numbers

| Function | Signature | Returns |
|---|---|---|
| isInteger | isInteger(val) | true if val is an integer |
| isPositive | isPositive(val) | true if val > 0 |
| isNegative | isNegative(val) | true if val < 0 |
| inRange | inRange(val, min, max) | true if val is between min and max (inclusive) |

## Phone

| Function | Signature | Returns |
|---|---|---|
| isPhone | isPhone(val) | true if val has 7 to 15 digits, accepts +, spaces, hyphens, parentheses |

Does not validate country-specific format — only generic structure.

## Password

| Function | Signature | Returns |
|---|---|---|
| isStrongPassword | isStrongPassword(val) | true if it has 8+ characters, uppercase, lowercase, digit, and symbol |
| passwordsMatch | passwordsMatch(a, b) | true if both strings are equal |

## Card / documents

| Function | Signature | Returns |
|---|---|---|
| isValidLuhn | isValidLuhn(val) | true if val passes the Luhn algorithm (used in credit cards and other numeric documents) |

## Arrays

| Function | Signature | Returns |
|---|---|---|
| hasDuplicates | hasDuplicates(arr) | true if there are duplicate values |
| allValid | allValid(arr, "functionName") | true if functionName returns truthy for all items |
| anyValid | anyValid(arr, "functionName") | true if functionName returns truthy for at least one item |

functionName is the name of any function already registered in XLang (native,
from another lib, or custom), passed as a string.

## validateForm — validate multiple fields at once

The most useful function in the lib. Receives a list of rules and returns a list
of error messages (empty if everything is valid).

```html
<script type="text/xlang">
    <program>
        <from xlang import validation>

        <var name="email" value="'not-an-email'"></var>
        <var name="senha" value="'weak'"></var>

        <array name="regras" value="[
            { campo: 'email', valor: email, validador: 'isEmail', mensagem: 'Invalid email' },
            { campo: 'senha', valor: senha, validador: 'isStrongPassword', mensagem: 'Password is too weak' }
        ]"></array>

        <var name="erros" value="validateForm(regras)"></var>

        <print>{erros}</print>
    </program>
</script>
```

Each rule is an object containing:

| Field | Required | Description |
|---|---|---|
| valor | yes | the value to validate |
| validador | yes | name (string) of an already registered validation function, e.g., 'isEmail' |
| campo | no | field name, used only if mensagem is not defined |
| mensagem | no | custom error message. If omitted, defaults to "field: invalid value." |

If validador points to a function that does not exist, validateForm
throws an error (so you can catch typos early). If the validation itself
throws an internal error (e.g., wrong type), that rule counts as invalid
instead of breaking the whole form.

## Combining with login test

Practical example, validating before attempting to authenticate:

```html
<fun name="login">
    <array name="regras" value="[
        { campo: 'username', valor: username, validador: 'isNotEmpty', mensagem: 'User required' },
        { campo: 'password', valor: password, validador: 'isNotEmpty', mensagem: 'Password required' }
    ]"></array>

    <var name="erros" value="validateForm(regras)"></var>

    <if condition="erros.length > 0">
        <print id="statusMsg">{erros[0]}</print>
    </if>
    <else>
        <if condition="username == 'admin' && password == '1234'">
            <print id="statusMsg">Access granted</print>
        </if>
        <else>
            <print id="statusMsg">Invalid username or password</print>
        </else>
    </else>
</fun>
```

## Common errors

| Error | Cause |
|---|---|
| "X" must be a string | passed a number/object/array to a function expecting text |
| validator function "X" not found | typo in the name passed to validador, allValid, or anyValid |
| invalid regular expression | the pattern passed to matchesPattern is not a valid regex |
```

# xlang-validation — Reference

Validation library for forms, input data, and common business rules.

Follows the same pattern as `xlang-math`: native functions registered via
`R.register`, with argument validation and clear error messages.

---

## Import

```html
<import name="validation"></import>
```

Registration in xlang-modules.json:

```json
{
  "validation": "./modules/xlang-validation.js"
}
```

---

Presence / Empty

Function Signature Returns
isEmpty isEmpty(val) true if val is null/undefined, empty string (after trim), empty array, or object with no keys
isNotEmpty isNotEmpty(val) opposite of isEmpty
isNull isNull(val) true if null or undefined
isNotNull isNotNull(val) opposite of isNull

---

Text

Function Signature Returns
isEmail isEmail(val) true if val has email format
isUrl isUrl(val) true if val is a valid URL
isAlpha isAlpha(val) true if val only has letters and spaces
isAlphanumeric isAlphanumeric(val) true if val only has letters and numbers
isNumeric isNumeric(val) true if val represents a number
minLength minLength(val, n) true if val.length >= n
maxLength maxLength(val, n) true if val.length <= n
lengthBetween lengthBetween(val, min, max) true if length is within range
matchesPattern matchesPattern(val, pattern) true if val matches regex pattern
equalsIgnoreCase equalsIgnoreCase(a, b) compares two strings ignoring case

---

Numbers

Function Signature Returns
isInteger isInteger(val) true if val is integer
isPositive isPositive(val) true if val > 0
isNegative isNegative(val) true if val < 0
inRange inRange(val, min, max) true if val is between min and max inclusive

---

Phone

Function Signature Returns
isPhone isPhone(val) true if val has 7 to 15 digits, accepts +, spaces, hyphens, parentheses

Does not validate country-specific format — only generic structure.

---

Password

Function Signature Returns
isStrongPassword isStrongPassword(val) true if it has 8+ characters, uppercase, lowercase, digit and symbol
passwordsMatch passwordsMatch(a, b) true if both strings are equal

---

Card / Documents

Function Signature Returns
isValidLuhn isValidLuhn(val) true if val passes the Luhn algorithm

---

Arrays

Function Signature Returns
hasDuplicates hasDuplicates(arr) true if there are repeated values
allValid allValid(arr, "functionName") true if functionName returns truthy for all items
anyValid anyValid(arr, "functionName") true if functionName returns truthy for at least one item

functionName is the name of any function already registered in XLang,
passed as a string.

---

validateForm — validate multiple fields at once

Receives a list of rules and returns a list of error messages.

```html
<import name="validation"></import>

<div data-xlang>
    <var name="email" value="'not-an-email'"></var>
    <var name="password" value="'weak'"></var>

    <var name="errors" value="validateForm([
        { field: 'email', value: email, validator: 'isEmail', message: 'Invalid email' },
        { field: 'password', value: password, validator: 'isStrongPassword', message: 'Password too weak' }
    ])"></var>

    <print>{errors}</print>
</div>
```

Each rule has:

Field Required Description
value yes value to validate
validator yes name of a registered validation function
field no field name, used only if message is not set
message no custom error message

---

Login example

```html
<fun name="login">
    <var name="errors" value="validateForm([
        { field: 'username', value: username, validator: 'isNotEmpty', message: 'Username required' },
        { field: 'password', value: password, validator: 'isNotEmpty', message: 'Password required' }
    ])"></var>

    <if condition="errors.length > 0">
        <print id="statusMsg">{errors[0]}</print>
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

```
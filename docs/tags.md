
# HTMLx-lang Tags Reference

## Variables
| Tag | Syntax | Example |
|-----|--------|---------|
| `<var>` | `<var name="x" value="5"></var>` | Mutable variable |
| `<val>` | `<val name="x" value="5"></val>` | Immutable variable |
| `<set>` | `<set name="x" value="10"></set>` | Update variable |

## Binding
| Tag | Syntax | Example |
|-----|--------|---------|
| `<bind>` (element) | `<bind target="id" as="name"></bind>` | Two-way bind to an input, or read/write bind to a text element |
| `<bind>` (array) | `<bind target="id" source="arr"></bind>` | Reactive list/table bound to an array |

## Output
| Tag | Syntax | Example |
|-----|--------|---------|
| `<print>` | `<print>Text {var}</print>` | Output text |
| `<print id>` | `<print id="target">Text</print>` | Write to element |

## Control Flow
| Tag | Syntax | Example |
|-----|--------|---------|
| `<if>` | `<if condition="x > 5">` | Conditional |
| `<elseif>` | `<elseif condition="x > 3">` | Alternative |
| `<else>` | `<else>` | Default |
| `<switch>` | `<switch value="x">` | Multiple choice |
| `<case>` | `<case value="1">` | Case |
| `<default>` | `<default>` | Default case |

## Loops
| Tag | Syntax | Example |
|-----|--------|---------|
| `<loop>` | `<loop>` | Infinite loop |
| `<for>` | `<for var="i" from="0" to="10" step="1">` | Counter loop |
| `<foreach>` | `<foreach var="item" in="array">` | Array loop |
| `<break>` | `<break></break>` | Exit loop |
| `<continue>` | `<continue></continue>` | Skip iteration |

## Functions
| Tag | Syntax | Example |
|-----|--------|---------|
| `<fun>` | `<fun name="fn" params="a, b">` | Public function |
| `<private fun>` | `<private fun name="fn" params="a">` | Private function |
| `<override fun>` | `<override fun name="fn" params="a">` | Override function |
| `<return>` | `<return value="expr"></return>` | Return value |
| `<call>` | `<call name="fn" args="1, 2"></call>` | Call function |

## Arrays
| Tag | Syntax | Example |
|-----|--------|---------|
| `<array>` | `<array name="arr" value="[1, 2]"></array>` | Declare array |
| `<push>` | `<push name="arr" value="3"></push>` | Add to end |
| `<pop>` | `<pop name="arr"></pop>` | Remove last |
| `<shift>` | `<shift name="arr"></shift>` | Remove first |
| `<unshift>` | `<unshift name="arr" value="0"></unshift>` | Add to start |
| `<indexOf>` | `<indexOf name="idx" target="arr" value="2"></indexOf>` | Find index |
| `<remove>` | `<remove name="arr" index="1"></remove>` | Remove at index |
| `<length>` | `<length name="len" target="arr"></length>` | Get length |

## Classes
| Tag | Syntax | Example |
|-----|--------|---------|
| `<class>` | `<class name="User" extends="Parent">` | Declare class |
| `<init>` | `<init params="a, b">` | Constructor |
| `<super>` | `<super args="a, b"></super>` | Call parent |
| `<new>` | `<new class='User' args='a, b'>` | Instantiate |

## DOM
| Tag | Syntax | Example |
|-----|--------|---------|
| `<on>` | `<on event="click" target="id" call="fn"></on>` | Event listener |
| `<show>` | `<show target="id"></show>` | Show element |
| `<hide>` | `<hide target="id"></hide>` | Hide element |
| `<add-class>` | `<add-class target="id" class="name"></add-class>` | Add CSS class |
| `<remove-class>` | `<remove-class target="id" class="name"></remove-class>` | Remove CSS class |
| `<toggle-class>` | `<toggle-class target="id" class="name"></toggle-class>` | Toggle CSS class |
| `<set-style>` | `<set-style target="id" property="css" value="val"></set-style>` | Set style |

## Storage
| Tag | Syntax | Example |
|-----|--------|---------|
| `<storage-set>` | `<storage-set key="name" value="'Ana'"></storage-set>` | Save a value to localStorage |
| `<storage-get>` | `<storage-get key="name" as="savedName"></storage-get>` | Load a value from localStorage |
| `<storage-get>` with default | `<storage-get key="theme" as="theme" default="'light'"></storage-get>` | Load a value, or use a default if missing |
| `<storage-remove>` | `<storage-remove key="name"></storage-remove>` | Remove one key |
| `<storage-clear>` | `<storage-clear></storage-clear>` | Remove all HTMLx-lang keys |

Notes:

- Keys are automatically prefixed with `htmlx:` internally.
- Values are stored and retrieved with JSON serialization.
- `storage-clear` only removes keys created by HTMLx-lang.
- `key` accepts dynamic expressions, for example `key="'user_' + userId"`.

## Error Handling
| Tag | Syntax | Example |
|-----|--------|---------|
| `<try>` | `<try>` | Try block |
| `<catch>` | `<catch>` | Catch errors; caught message available as `{error}` |

## Imports
| Tag | Syntax | Example |
|-----|--------|---------|
| `<import>` | `<import name="xlang.math"></import>` | Import module |
| `<import>` | `<import from="xlang" name="math"></import>` | Import module |
| `<import>` | `<import modules="xlang.math"></import>` | Import module |
```
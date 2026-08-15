# XLang Tags Reference

## Variables
| Tag | Syntax | Example |
|-----|--------|---------|
| `<var>` | `<var name="x" value="5" />` | Mutable variable |
| `<val>` | `<val name="x" value="5" />` | Immutable variable |
| `<set>` | `<set name="x" value="10" />` | Update variable |

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
| `<break>` | `<break />` | Exit loop |
| `<continue>` | `<continue />` | Skip iteration |

## Functions
| Tag | Syntax | Example |
|-----|--------|---------|
| `<fun>` | `<fun name="fn" params="a, b">` | Public function |
| `<private fun>` | `<private fun name="fn" params="a">` | Private function |
| `<override fun>` | `<override fun name="fn" params="a">` | Override function |
| `<return>` | `<return value="expr" />` | Return value |
| `<call>` | `<call name="fn" args="1, 2" />` | Call function |

## Arrays
| Tag | Syntax | Example |
|-----|--------|---------|
| `<array>` | `<array name="arr" value="[1, 2]" />` | Declare array |
| `<push>` | `<push name="arr" value="3" />` | Add to end |
| `<pop>` | `<pop name="arr" />` | Remove last |
| `<shift>` | `<shift name="arr" />` | Remove first |
| `<unshift>` | `<unshift name="arr" value="0" />` | Add to start |
| `<indexOf>` | `<indexOf name="idx" target="arr" value="2" />` | Find index |
| `<remove>` | `<remove name="arr" index="1" />` | Remove at index |
| `<length>` | `<length name="len" target="arr" />` | Get length |

## Classes
| Tag | Syntax | Example |
|-----|--------|---------|
| `<class>` | `<class name="User" extends="Parent">` | Declare class |
| `<init>` | `<init params="a, b">` | Constructor |
| `<super>` | `<super args="a, b" />` | Call parent |

## DOM
| Tag | Syntax | Example |
|-----|--------|---------|
| `<on>` | `<on event="click" target="id" call="fn" />` | Event listener |
| `<show>` | `<show target="id" />` | Show element |
| `<hide>` | `<hide target="id" />` | Hide element |
| `<add-class>` | `<add-class target="id" class="name" />` | Add CSS class |
| `<remove-class>` | `<remove-class target="id" class="name" />` | Remove CSS class |
| `<toggle-class>` | `<toggle-class target="id" class="name" />` | Toggle CSS class |
| `<set-style>` | `<set-style target="id" property="css" value="val" />` | Set style |

## Error Handling
| Tag | Syntax | Example |
|-----|--------|---------|
| `<try>` | `<try>` | Try block |
| `<catch>` | `<catch>` | Catch errors |

## Imports
| Tag | Syntax | Example |
|-----|--------|---------|
| `<from>` | `<from xlang import math />` | Import module |
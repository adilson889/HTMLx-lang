
---

# 4. Storage Example


# Storage Example

Save and load data with localStorage.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Storage - HTMLx-lang</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fafaf9;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            background: #ffffff;
            border-radius: 20px;
            padding: 30px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            border: 1px solid #e7e5e4;
        }

        h2 {
            color: #1c1917;
            margin-bottom: 20px;
            font-size: 26px;
        }

        input {
            width: 100%;
            padding: 13px;
            border: 2px solid #e7e5e4;
            border-radius: 12px;
            font-size: 15px;
            margin-bottom: 14px;
            outline: none;
        }

        input:focus {
            border-color: #f97316;
        }

        .buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        button {
            padding: 13px;
            border: none;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        }

        .save {
            background: #f97316;
            color: #ffffff;
        }

        .load {
            background: #0ea5e9;
            color: #ffffff;
        }

        .clear {
            background: #ef4444;
            color: #ffffff;
            grid-column: span 2;
        }

        button:hover {
            opacity: 0.9;
        }

        #result {
            margin-top: 16px;
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            min-height: 24px;
        }

        @media (max-width: 480px) {
            .container {
                padding: 20px;
            }

            .buttons {
                grid-template-columns: 1fr;
            }

            .clear {
                grid-column: span 1;
            }
        }
    </style>
</head>
<body>

    <div class="container">
        <h2>Notes</h2>

        <input id="note" type="text" placeholder="Write a note..." />

        <div class="buttons">
            <button class="save" id="btnSave">Save</button>
            <button class="load" id="btnLoad">Load</button>
            <button class="clear" id="btnClear">Clear</button>
        </div>

        <div id="result"></div>

        <script type="text/xlang">
        <program>
            <bind target="note" as="note"></bind>

            <fun name="save">
                <storage-set key="note" value="note"></storage-set>
                <print id="result" style="color:#f97316;">Saved!</print>
            </fun>

            <fun name="load">
                <storage-get key="note" as="savedNote" default="'No note saved'"></storage-get>
                <print id="result" style="color:#0ea5e9;">{savedNote}</print>
            </fun>

            <fun name="clear">
                <storage-remove key="note"></storage-remove>
                <print id="result" style="color:#ef4444;">Cleared!</print>
            </fun>

            <on event="click" target="btnSave" call="save"></on>
            <on event="click" target="btnLoad" call="load"></on>
            <on event="click" target="btnClear" call="clear"></on>
        </program>
        </script>
    </div>

</body>
</html>
```

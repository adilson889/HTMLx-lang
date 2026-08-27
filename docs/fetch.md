# Fetch

HTMLx-lang includes built-in support for making HTTP requests.

This means your programs can talk to APIs, load data from servers, and send
data back — without writing any JavaScript.

No imports. No setup. Just one tag.

---

## Why fetch?

Most modern apps need to talk to a backend or an external API.

Before, this required JavaScript and a lot of boilerplate.

With HTMLx-lang, it is one tag.

---

## The `<fetch>` tag

```html
<script type="text/xlang">
<program>
    <fetch url="'https://api.exemplo.com/dados'" as="resposta"></fetch>
</program>
</script>
```

This makes a request and stores the result in the variable resposta.

The execution waits for the response before moving to the next line.

---

The response object

The result stored in as is always an object with this shape:

```javascript
{
    ok: true,
    status: 200,
    data: { ... }
}
```

ok

true if the request succeeded.

false if the request failed.

status

The HTTP status code.

Examples:

· 200 — success
· 404 — not found
· 500 — server error

If the request could not be made at all, status is 0.

data

The response body.

If the response is JSON, data is already converted to an object or array.

If the response is text, data is a string.

---

Making a GET request

```html
<script type="text/xlang">
<program>
    <fetch url="'https://jsonplaceholder.typicode.com/users'" as="resposta"></fetch>
</program>
</script>
```

Then use the data:

```html
<script type="text/xlang">
<program>
    <if condition="resposta.ok">
        <print>Total: {resposta.data.length}</print>
    </if>
    <else>
        <print>Erro: {resposta.status}</print>
    </else>
</program>
</script>
```

---

Making a POST request

```html
<script type="text/xlang">
<program>
    <fetch url="'https://api.exemplo.com/criar'" method="POST" body="{nome: 'Ana'}" as="resposta"></fetch>
</program>
</script>
```

When body is an object, HTMLx-lang automatically:

· Sets Content-Type to application/json
· Converts the body to JSON

---

Sending custom headers

```html
<script type="text/xlang">
<program>
    <fetch url="'https://api.exemplo.com/dados'" headers="{Authorization: 'Bearer token'}" as="resposta"></fetch>
</program>
</script>
```

---

Complete example — loading users

```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8" />
    <title>Fetch Example</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
</head>
<body>

    <h3>Buscar usuários</h3>

    <button id="btnBuscar">Carregar usuários</button>
    <div id="resultado"></div>
    <ul id="lista"></ul>

    <script type="text/xlang">
    <program>
        <array name="users" value="[]"></array>
        <bind target="lista" source="users"></bind>

        <fun name="buscar">
            <print id="resultado">Carregando...</print>

            <fetch url="'https://jsonplaceholder.typicode.com/users'" method="GET" as="resposta"></fetch>

            <if condition="resposta.ok">
                <set-array name="users" value="resposta.data"></set-array>
                <print id="resultado">Usuários carregados!</print>
            </if>
            <else>
                <print id="resultado">Erro {resposta.status}</print>
            </else>
        </fun>

        <on event="click" target="btnBuscar" call="buscar"></on>
    </program>
    </script>

</body>
</html>
```

---

Error handling

When the request fails, the response still comes back as an object.

```html
<script type="text/xlang">
<program>
    <fetch url="'https://api.exemplo.com/erro'" as="resposta"></fetch>

    <if condition="resposta.ok == false">
        <print>Falhou com status {resposta.status}</print>
        <print>Erro: {resposta.error}</print>
    </if>
</program>
</script>
```

If the request could not even be sent, the object includes an error
field with a message.

---

Attributes summary

Attribute Required Description
url Yes The URL to call
as Yes Variable to store the response
method No HTTP method — GET, POST, PUT, DELETE, etc. Default is GET
body No Request body. Objects become JSON automatically
headers No Extra headers as an object

---

Important notes

· The next tag only runs after the response arrives.
· JSON responses are parsed automatically.
· Text responses stay as text.
· Failed requests do not break the program.
· You can use try and catch around <fetch> if you want stronger control.

---

Summary

· <fetch> makes HTTP requests 

· as stores the response object
· The response contains ok, status, and data
· JSON is parsed automatically
· POST and headers are supported
· It works without JavaScript

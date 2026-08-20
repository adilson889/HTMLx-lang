
# LocalStorage

HTMLx-lang includes built-in support for the browser's `localStorage`.

This means your programs can save data, reload the page, and still find the
same values there.

No JavaScript. No imports. No setup.

---

## Why localStorage?

The web is stateless by default. When the page reloads, everything resets.

`localStorage` fixes that by giving you a small permanent storage space in
the browser.

With HTMLx-lang, you use simple tags to read and write that storage.

---

## The four storage tags

| Tag | Purpose |
|---|---|
| `<storage-set>` | Save a value |
| `<storage-get>` | Load a value |
| `<storage-remove>` | Remove one value |
| `<storage-clear>` | Remove all HTMLx-lang values |

All four tags are built into the core language. You do not need to import a
module.

---

## Saving a value

Use `<storage-set>` to save something.

```html
<storage-set key="nomeUsuario" value="'Adilson'"></storage-set>
```

This stores the value Adilson under the key nomeUsuario.

key and value are normal HTMLx-lang expressions.

That means you can also do:

```html
<var name="userId" value="1"></var>
<storage-set key="'user_' + userId" value="'Ativo'"></storage-set>
```

This saves Ativo under the key user_1.

---

Loading a value

Use <storage-get> to read a value back.

```html
<storage-get key="nomeUsuario" as="nome"></storage-get>
<print>Olá, {nome}!</print>
```

as creates an HTMLx-lang variable with the loaded value.

---

Loading with a default value

Sometimes the key does not exist yet.

By default, <storage-get> returns undefined in that case.

But you can provide a fallback with default:

```html
<storage-get key="tema" as="tema" default="'claro'"></storage-get>
<print>Tema: {tema}</print>
```

If tema is not stored, the variable receives claro.

If tema already exists, the stored value wins.

---

Saving numbers, arrays and objects

localStorage normally stores only text.

HTMLx-lang handles this automatically.

Numbers

```html
<var name="idade" value="25"></var>
<storage-set key="idade" value="idade"></storage-set>
```

Later:

```html
<storage-get key="idade" as="idadeSalva"></storage-get>
<print>{idadeSalva}</print>
```

The value comes back as a number, not as text.

Arrays

```html
<array name="frutas" value="['Maçã', 'Banana']"></array>
<storage-set key="frutas" value="frutas"></storage-set>
```

Later:

```html
<storage-get key="frutas" as="frutasSalvas"></storage-get>
<foreach var="fruta" in="frutasSalvas">
    <print>{fruta}</print>
</foreach>
```

The array comes back as a real array.

---

Removing a value

```html
<storage-remove key="nomeUsuario"></storage-remove>
```

This removes only that key.

---

Clearing all HTMLx-lang storage

```html
<storage-clear></storage-clear>
```

This removes all keys created by HTMLx-lang.

It never removes storage created by other scripts on the same page.

---

Automatic namespace

HTMLx-lang adds an internal prefix to every key.

When you write:

```html
<storage-set key="nome" value="'Ana'"></storage-set>
```

The browser actually stores:

```
htmlx:nome
```

You never see this prefix. It exists only to prevent conflicts with other
scripts that also use localStorage.

---

Complete example

```html
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8" />
    <title>LocalStorage Example</title>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/HTMLx-lang@main/xlang-interpreter.js"></script>
</head>
<body>

    <h3>Notas</h3>

    <input id="nota" type="text" placeholder="Escreve uma nota" />
    <button id="btnSalvar">Salvar</button>
    <button id="btnCarregar">Carregar</button>
    <button id="btnLimpar">Limpar</button>
    <div id="resultado"></div>

    <div data-xlang>
        <bind target="nota" as="nota"></bind>

        <fun name="salvar">
            <storage-set key="minhaNota" value="nota"></storage-set>
            <print id="resultado">Nota salva!</print>
        </fun>

        <fun name="carregar">
            <storage-get key="minhaNota" as="notaSalva" default="'Sem nota'"></storage-get>
            <print id="resultado">Nota: {notaSalva}</print>
        </fun>

        <fun name="limpar">
            <storage-remove key="minhaNota"></storage-remove>
            <print id="resultado">Nota removida!</print>
        </fun>

        <on event="click" target="btnSalvar" call="salvar"></on>
        <on event="click" target="btnCarregar" call="carregar"></on>
        <on event="click" target="btnLimpar" call="limpar"></on>
    </div>

</body>
</html>
```

---

Summary

· <storage-set> saves a value

· <storage-get> loads a value into a variable
· <storage-remove> removes one key
· <storage-clear> removes all HTMLx-lang keys
· Numbers, arrays and objects work automatically
· Keys are namespaced automatically
· default provides a fallback when a key is missing
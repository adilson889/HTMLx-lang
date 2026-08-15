# Login com XLang

## Descrição
Tela de login com validação de credenciais.

## Funcionalidades
- Input de usuário e senha
- Validação com condicionais
- Feedback visual

## Código

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
</head>
<body>
    <script type="text/xlang">
    <program>
        <val name="usuario" value="<input type='text' placeholder='Usuário' />" />
        <val name="senha" value="<input type='password' placeholder='Senha' />" />
        
        <fun name="login">
            <if condition="usuario == 'admin' && senha == '1234'">
                <print id="status">Acesso liberado!</print>
            </if>
            <else>
                <print id="status">Credenciais inválidas!</print>
            </else>
        </fun>
    </program>
    </script>
    <button onclick="XLang.call('login')">Entrar</button>
    <div id="status"></div>
</body>
</html>
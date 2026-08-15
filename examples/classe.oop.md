# Cadastro de Usuários com Classes OOP

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; background: #f0f2f5; }
        .container { background: white; padding: 30px; border-radius: 15px; width: 350px; margin: 20px auto; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h3 { color: #333; }
        .btn { background: #1877f2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        .btn:hover { opacity: 0.9; }
        #lista { margin-top: 20px; text-align: left; }
        .usuario { background: #f8f9fa; padding: 10px 15px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #2ecc71; }
    </style>
</head>
<body>

    <center>
        <div class="container">
            <h3>Cadastro de Usuários</h3>
            
            <script type="text/xlang">
            <program>
                <class name="Usuario">
                    <var name="nome" value="''" />
                    <var name="idade" value="0" />

                    <init params="nome, idade">
                        <set name="this.nome" value="nome" />
                        <set name="this.idade" value="idade" />
                    </init>

                    <fun name="apresentar">
                        <return value="this.nome + ' - ' + this.idade + ' anos'" />
                    </fun>
                </class>

                <array name="usuarios" value="[]" />

                <val name="novoNome" value="<input type='text' placeholder='Nome' style='padding:10px; width:65%; border:1px solid #ddd; border-radius:5px; margin-bottom:8px;' />" />
                <val name="novaIdade" value="<input type='number' placeholder='Idade' style='padding:10px; width:65%; border:1px solid #ddd; border-radius:5px; margin-bottom:8px;' />" />

                <fun name="cadastrar">
                    <if condition="novoNome != '' && novaIdade != ''">
                        <var name="novoUsuario" value="<new class='Usuario' args='novoNome, novaIdade' />" />
                        <push name="usuarios" value="novoUsuario" />
                        <call name="renderizar" />
                    </if>
                </fun>

                <fun name="renderizar">
                    <var name="html" value="''" />
                    <foreach var="u" in="usuarios">
                        <set name="html" value="html + '<div class=&quot;usuario&quot;>' + u.apresentar() + '</div>'" />
                    </foreach>
                    <print id="lista">{html}</print>
                </fun>
            </program>
            </script>

            <button class="btn" onclick="XLang.call('cadastrar')">Cadastrar</button>
            <div id="lista"></div>
        </div>
    </center>

</body>
</html>
# Lista de Tarefas com XLang

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <script src="https://cdn.jsdelivr.net/gh/adilson889/Xlang@main/xlang-interpreter.js"></script>
    <style>
        body { font-family: Arial; background: #f0f2f5; }
        .container { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 350px; margin: 20px auto; }
        h3 { margin-top: 0; color: #333; }
        .btn { background: #1877f2; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 2px; }
        .btn-danger { background: #e74c3c; }
        .btn:hover { opacity: 0.9; }
        #lista { margin-top: 15px; }
        .tarefa { background: #f8f9fa; padding: 10px 15px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #1877f2; }
    </style>
</head>
<body>

    <center>
        <div class="container">
            <h3>Lista de Tarefas</h3>
            
            <script type="text/xlang">
            <program>
                <array name="tarefas" value="[]" />

                <val name="novaTarefa" value="<input type='text' placeholder='Nova tarefa...' style='padding:10px; width:65%; border:1px solid #ddd; border-radius:5px;' />" />

                <fun name="adicionar">
                    <if condition="novaTarefa != ''">
                        <push name="tarefas" value="novaTarefa" />
                        <call name="renderizar" />
                    </if>
                </fun>

                <fun name="removerUltima">
                    <pop name="tarefas" />
                    <call name="renderizar" />
                </fun>

                <fun name="renderizar">
                    <var name="html" value="''" />
                    <foreach var="t" in="tarefas">
                        <set name="html" value="html + '<div class=&quot;tarefa&quot;>' + t + '</div>'" />
                    </foreach>
                    <print id="lista">{html}</print>
                </fun>

                <call name="renderizar" />
            </program>
            </script>

            <button class="btn" onclick="XLang.call('adicionar')">Adicionar</button>
            <button class="btn btn-danger" onclick="XLang.call('removerUltima')">Remover</button>
            <div id="lista"></div>
        </div>
    </center>

</body>
</html>
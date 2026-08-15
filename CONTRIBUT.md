# Contribuir para a XLang

Obrigado pelo interesse em ajudar a XLang a crescer.

## Como contribuir

**Reportar bugs** — abre uma [issue](https://github.com/adilson889/Xlang/issues)
com:
- Um exemplo `.html` mínimo que reproduz o problema
- O que esperavas que acontecesse
- O que aconteceu de facto (mensagem de erro, comportamento errado, etc.)

**Sugerir funcionalidades** — abre uma issue a descrever o caso de uso. Uma
proposta com um exemplo de sintaxe (mesmo que hipotético) ajuda muito mais
do que uma descrição abstrata.

**Enviar código** — pull requests são bem-vindos para:
- Correções de bugs
- Novos exemplos em `examples.md`
- Melhorias na documentação

Antes de um PR maior (nova tag, mudança de comportamento existente), abre
uma issue primeiro para alinhar a ideia — evita trabalho perdido se a
direção não encaixar no projeto.

## Testar localmente

A XLang não tem build step. Para testar mudanças no interpretador:

1. Clona o repositório.
2. Cria um `.html` de teste que importa o `xlang-interpreter.js` local:
   ```html
   <script src="xlang-interpreter.js"></script>
   ```
3. Abre o ficheiro num navegador (ou serve com qualquer servidor estático
   simples) e confirma que o comportamento é o esperado.

## Estilo de código

- Sem dependências externas no `xlang-interpreter.js` — é para correr
  direto no navegador, sem bundler.
- Mensagens de erro claras e em português, como as já existentes.
- Testa sempre com pelo menos um exemplo `.html` real antes de submeter,
  não só mentalmente — o parser tem casos de aninhamento que só aparecem
  em uso real.

## Código de conduta

Sê respeitoso. Discussões técnicas são bem-vindas, ataques pessoais não.

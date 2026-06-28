# Nota Técnica

## Objetivo

O objetivo deste projeto foi implementar uma funcionalidade ponta a ponta para gestão de incidentes, contemplando front-end, back-end, persistência em banco de dados, CRUD completo, logs mínimos para diagnóstico, testes automatizados, documentação, deploy demonstrativo e análise técnica de incidente.

Além do fluxo funcional, também foi dada atenção à experiência visual da aplicação, com uma interface responsiva, organizada em áreas distintas, com dashboard inicial, tela de processos, filtros, edição, exclusão, animações e acabamento visual premium.

## Decisões técnicas

O projeto foi dividido em duas aplicações principais: uma API em ASP.NET Core e um front-end em React com TypeScript.

A separação entre front-end e back-end foi escolhida para manter responsabilidades bem definidas. A API concentra regras de negócio, persistência, validações e logs. O front-end concentra a experiência do usuário, navegação entre áreas, validações de interface, filtros, atualização de status, edição, exclusão e consumo dos endpoints.

O Entity Framework Core foi utilizado para persistência dos dados por oferecer integração simples e produtiva com o ASP.NET Core. O banco escolhido foi SQLite, pois facilita a execução local do projeto sem depender de uma instalação externa de banco de dados.

No front-end, React com TypeScript foi utilizado para garantir melhor organização da interface, tipagem dos dados e maior segurança na comunicação com a API. Vite foi utilizado para simplificar o ambiente de desenvolvimento e otimizar o build da aplicação.

Tailwind CSS foi adicionado ao projeto para apoiar a construção visual da interface, junto de CSS customizado para acabamento premium, animações, tema dark/glass, scrollbar personalizada e responsividade.

## Modelagem

A entidade principal do sistema é o incidente.

Campos principais:

* Id
* Título
* Descrição
* Severidade
* Status
* Data de criação
* Data de atualização

A severidade permite classificar o impacto do incidente, enquanto o status permite acompanhar a evolução da tratativa.

## Fluxo funcional

O usuário pode cadastrar um incidente informando título, descrição e severidade. Após o cadastro, o incidente é exibido na listagem com seu status inicial como "Aberto".

A aplicação foi organizada em duas áreas:

### Início

A página inicial funciona como um dashboard. Ela apresenta:

* Status da API
* Total de incidentes
* Quantidade de incidentes abertos
* Quantidade de incidentes em análise
* Quantidade de incidentes resolvidos
* Taxa de resolução
* Quantidade de incidentes críticos
* Últimos registros
* Cadastro rápido de novo incidente

Essa organização permite que o usuário tenha uma visão rápida da situação geral do sistema.

### Processos

A página de processos concentra a gestão dos incidentes cadastrados. Nela é possível:

* Visualizar todos os incidentes
* Filtrar por status
* Filtrar por severidade
* Atualizar status
* Editar dados completos de um incidente
* Excluir incidente com confirmação

Essa separação melhora a clareza da interface, pois diferencia a visão executiva da tela operacional de gestão.

## CRUD

O projeto implementa CRUD completo para incidentes.

### Create

A criação é feita pelo endpoint:

```http
POST /api/incidents
```

No front-end, o cadastro pode ser realizado pela tela inicial.

### Read

A leitura é feita pelos endpoints:

```http
GET /api/incidents
GET /api/incidents/{id}
```

No front-end, os incidentes são exibidos na tela de processos e também resumidos no dashboard.

### Update

A atualização completa é feita pelo endpoint:

```http
PUT /api/incidents/{id}
```

Também existe atualização específica de status:

```http
PATCH /api/incidents/{id}/status
```

No front-end, o usuário pode editar os dados completos do incidente ou alterar rapidamente apenas o status.

### Delete

A exclusão é feita pelo endpoint:

```http
DELETE /api/incidents/{id}
```

No front-end, a exclusão exige confirmação antes de remover o registro.

## Indicador de status da API

Foi implementado um indicador visual de disponibilidade da API na interface.

O indicador possui três estados:

* Verificando conexão
* Sistema operacional
* API indisponível

Esse recurso melhora a experiência do usuário e facilita o diagnóstico visual quando o front-end não consegue se comunicar com o back-end.

## Design e experiência do usuário

A interface foi evoluída para ter um acabamento mais profissional e demonstrar cuidado com a experiência do usuário.

Foram aplicados:

* Tema escuro
* Estilo visual glassmorphism
* Cards com transparência e blur
* Orbes animados no fundo
* Animações suaves de entrada
* Microinterações em botões, cards e navegação
* Separação visual entre dashboard e processos
* Barra de rolagem personalizada
* Footer com autoria do projeto
* Layout responsivo para diferentes tamanhos de tela

Essa abordagem torna o projeto mais apresentável para avaliação, sem comprometer a clareza do fluxo funcional.

## Logs

Foram adicionados logs nas principais operações da API, incluindo criação, listagem, busca por ID, atualização completa, alteração de status, exclusão e tentativas de acesso a registros inexistentes.

Esses logs ajudam no diagnóstico de problemas, permitindo identificar se a requisição chegou à API, se um registro foi encontrado, se uma alteração foi executada e se houve tentativa de operar sobre um item inexistente.

## Testes

Foram implementados testes automatizados para cobrir cenários principais da API, como:

* Criação de incidente válido
* Validação de incidente sem título
* Listagem de incidentes cadastrados
* Retorno de erro ao buscar incidente inexistente
* Atualização completa de incidente
* Atualização de status de um incidente
* Exclusão de incidente

Esses testes ajudam a garantir que os principais fluxos da API continuem funcionando após futuras alterações.

## Deploy

O projeto possui deploy demonstrativo.

### Front-end

O front-end foi publicado no GitHub Pages.

URL:

```txt
https://gustavocampelo.github.io/teste-tecnico-incidentes/
```

O deploy é feito por GitHub Actions, executando o build do projeto Vite e publicando a pasta `dist`.

A variável `VITE_API_BASE_URL` é utilizada no processo de build para apontar o front-end para a API pública.

### Back-end

A API foi publicada no Render utilizando Docker.

URL:

```txt
https://incident-manager-api-yidz.onrender.com
```

Endpoint de saúde:

```txt
https://incident-manager-api-yidz.onrender.com/api/health
```

O Dockerfile foi adicionado na raiz do projeto para permitir o build e execução da API em ambiente de hospedagem.

## Dados iniciais

Foram adicionados dados iniciais para demonstração, evitando que a aplicação apareça vazia no primeiro acesso ao ambiente publicado.

Isso melhora a experiência do avaliador, pois permite visualizar imediatamente o dashboard, os cards, os filtros e a listagem de incidentes sem precisar cadastrar dados manualmente.

## Análise de incidente

### Cenário

Foi considerado um cenário de erro recorrente em que usuários relatam que uma funcionalidade do sistema fica carregando indefinidamente ao tentar acessar determinado painel.

### Possíveis causas

As possíveis causas para esse tipo de incidente incluem:

* Falha na comunicação entre front-end e API
* Timeout em uma chamada externa
* Erro de validação não tratado corretamente
* Falha de consulta no banco de dados
* Dados inconsistentes retornados pela API
* Ausência de tratamento de erro no front-end
* Problema específico em determinados dispositivos ou navegadores
* API indisponível ou em processo de inicialização no ambiente de hospedagem
* Configuração incorreta de CORS
* Falha de infraestrutura ou indisponibilidade temporária do serviço

### Como os logs ajudariam

Com logs nas operações principais, seria possível identificar se a requisição chegou à API, se ocorreu erro ao consultar ou persistir dados, se algum registro não foi encontrado ou se uma exceção inesperada ocorreu durante o processamento.

Além disso, logs com informações como identificador do incidente, severidade, status e operação executada ajudam a rastrear o fluxo do problema com mais clareza.

O endpoint de saúde da API também auxilia na identificação rápida de indisponibilidade do back-end.

### Correções sugeridas

* Melhorar o tratamento de exceções na API
* Padronizar as respostas de erro
* Adicionar validações antes da persistência
* Garantir feedback visual no front-end em caso de falha
* Evitar carregamento infinito quando uma requisição falhar
* Criar testes para cenários de erro
* Registrar logs com informações suficientes para diagnóstico
* Monitorar a disponibilidade da API com endpoint de health check
* Validar configuração de CORS entre front-end e back-end
* Adicionar monitoramento externo em ambiente produtivo

### Medidas de prevenção

* Implementar monitoramento de erros em produção
* Adicionar alertas para falhas recorrentes
* Criar testes automatizados para fluxos críticos
* Utilizar logs estruturados
* Validar os dados de entrada no front-end e no back-end
* Documentar os endpoints da API
* Criar padrões de resposta para erros
* Separar variáveis de ambiente por ambiente
* Utilizar banco de dados persistente em produção
* Criar pipeline de validação antes do deploy
* Monitorar tempo de resposta da API

## Trade-offs

O uso de SQLite foi uma escolha para simplificar a execução local do projeto. Em um ambiente produtivo, uma opção mais robusta seria utilizar PostgreSQL ou SQL Server.

A autenticação não foi implementada para manter o foco no fluxo principal do desafio. Em uma evolução futura, poderia ser adicionada autenticação com JWT e controle de permissões.

O deploy do back-end foi feito em ambiente gratuito. Isso facilita a demonstração do projeto, mas pode gerar tempo de inicialização maior após períodos de inatividade.

A interface recebeu um acabamento visual mais elaborado, com animações e estilo dark/glass. Essa decisão melhora a apresentação do projeto, mas foi mantida sem adicionar complexidade excessiva à arquitetura.

A aplicação foi separada em duas áreas internas, dashboard e processos, sem adição de uma biblioteca de rotas. Essa escolha simplifica a navegação e reduz dependências, mantendo o comportamento suficiente para o escopo do teste.

## Melhorias futuras

* Implementar autenticação e autorização
* Adicionar paginação na listagem
* Adicionar ordenação por data, severidade e status
* Criar tela detalhada para cada incidente
* Utilizar PostgreSQL ou SQL Server em ambiente produtivo
* Melhorar a cobertura de testes
* Adicionar testes de integração no front-end
* Implementar logs estruturados com Serilog
* Adicionar monitoramento externo
* Criar histórico de alterações de status
* Adicionar responsáveis pela tratativa
* Adicionar comentários ou evolução do incidente
* Criar pipeline de deploy também para a API
* Adicionar confirmação customizada no lugar do `window.confirm`
* Adicionar gráficos ao dashboard
* Adicionar exportação de dados
* Adicionar busca textual por título ou descrição

## Conclusão

O projeto entrega uma solução funcional e demonstrável de gestão de incidentes, cobrindo criação, leitura, atualização, exclusão, filtros, dashboard, validações, logs, testes, deploy e documentação.

A implementação busca equilibrar simplicidade técnica, clareza de arquitetura, usabilidade e apresentação visual profissional, mantendo o projeto objetivo e adequado ao contexto de um teste técnico full stack.

Projeto desenvolvido por **Gustavo Campelo**.

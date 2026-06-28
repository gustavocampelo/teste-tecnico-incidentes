# Nota Técnica

## Objetivo

O objetivo deste projeto foi implementar uma funcionalidade ponta a ponta para gestão de incidentes, contemplando front-end, back-end, persistência em banco de dados, logs mínimos para diagnóstico, testes automatizados e uma breve análise técnica de incidente.

## Decisões técnicas

O projeto foi dividido em duas aplicações principais: uma API em ASP.NET Core e um front-end em React com TypeScript.

A separação entre front-end e back-end foi escolhida para manter responsabilidades bem definidas. A API concentra regras de negócio, persistência, validações e logs. O front-end concentra a experiência do usuário, validações de interface, filtros e consumo dos endpoints.

O Entity Framework Core foi utilizado para persistência dos dados por oferecer uma integração simples e produtiva com o ASP.NET Core. O banco escolhido foi SQLite, pois facilita a execução local do projeto sem depender de uma instalação externa de banco de dados.

No front-end, React com TypeScript foi utilizado para garantir melhor organização da interface e maior segurança na manipulação dos dados retornados pela API.

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

## Logs

Foram adicionados logs nas principais operações da API, incluindo criação, listagem, atualização, alteração de status e tentativas de acesso a registros inexistentes.

Esses logs ajudam no diagnóstico de problemas, permitindo identificar operações executadas, falhas de consulta e comportamento inesperado durante o uso da aplicação.

## Testes

Foram implementados testes automatizados para cobrir cenários principais da API, como:

* Criação de incidente válido
* Validação de incidente sem título
* Listagem de incidentes cadastrados
* Retorno de erro ao buscar incidente inexistente
* Atualização de status de um incidente

Esses testes ajudam a garantir que os principais fluxos da API continuem funcionando após futuras alterações.

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

### Como os logs ajudariam

Com logs nas operações principais, seria possível identificar se a requisição chegou à API, se ocorreu erro ao consultar ou persistir dados, se algum registro não foi encontrado ou se uma exceção inesperada ocorreu durante o processamento.

Além disso, logs com informações como identificador do incidente, severidade, status e operação executada ajudam a rastrear o fluxo do problema com mais clareza.

### Correções sugeridas

* Melhorar o tratamento de exceções na API
* Padronizar as respostas de erro
* Adicionar validações antes da persistência
* Garantir feedback visual no front-end em caso de falha
* Evitar carregamento infinito quando uma requisição falhar
* Criar testes para cenários de erro
* Registrar logs com informações suficientes para diagnóstico

### Medidas de prevenção

* Implementar monitoramento de erros em produção
* Adicionar alertas para falhas recorrentes
* Criar testes automatizados para fluxos críticos
* Utilizar logs estruturados
* Validar os dados de entrada no front-end e no back-end
* Documentar os endpoints da API
* Criar padrões de resposta para erros

## Trade-offs

O uso de SQLite foi uma escolha para simplificar a execução local do projeto. Em um ambiente produtivo, uma opção mais robusta seria utilizar PostgreSQL ou SQL Server.

A autenticação não foi implementada para manter o foco no fluxo principal do desafio. Em uma evolução futura, poderia ser adicionada autenticação com JWT e controle de permissões.

A interface foi mantida objetiva para priorizar a clareza do fluxo funcional, validações e integração com a API.

## Melhorias futuras

* Implementar autenticação e autorização
* Adicionar paginação na listagem
* Adicionar ordenação por data, severidade e status
* Criar dashboard com indicadores de incidentes
* Adicionar Docker para facilitar a execução
* Melhorar a cobertura de testes
* Adicionar testes de integração no front-end
* Implementar logs estruturados com Serilog
* Adicionar monitoramento externo
* Criar histórico de alterações de status

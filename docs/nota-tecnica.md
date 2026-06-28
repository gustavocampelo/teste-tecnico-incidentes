# Nota Técnica

## Objetivo

O objetivo deste projeto foi implementar uma funcionalidade ponta a ponta para gestão de incidentes, contemplando front-end, back-end, persistência em banco de dados, logs mínimos para diagnóstico, testes automatizados, documentação, deploy demonstrativo e análise técnica de incidente.

## Decisões técnicas

O projeto foi dividido em duas aplicações principais: uma API em ASP.NET Core e um front-end em React com TypeScript.

A separação entre front-end e back-end foi escolhida para manter responsabilidades bem definidas. A API concentra regras de negócio, persistência, validações e logs. O front-end concentra a experiência do usuário, validações de interface, filtros, atualização de status e consumo dos endpoints.

O Entity Framework Core foi utilizado para persistência dos dados por oferecer integração simples e produtiva com o ASP.NET Core. O banco escolhido foi SQLite, pois facilita a execução local do projeto sem depender de uma instalação externa de banco de dados.

No front-end, React com TypeScript foi utilizado para garantir melhor organização da interface, tipagem dos dados e maior segurança na comunicação com a API.

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

A listagem permite filtrar incidentes por status e severidade. Também é possível atualizar o status de cada incidente diretamente pela interface.

O front-end possui validações para evitar envio de dados incompletos. O back-end também possui validações para garantir integridade dos dados recebidos.

## Indicador de status da API

Foi implementado um indicador visual de disponibilidade da API na interface.

O indicador possui três estados:

* Verificando API
* API conectada
* API indisponível

Esse recurso melhora a experiência do usuário e facilita o diagnóstico visual quando o front-end não consegue se comunicar com o back-end.

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

## Trade-offs

O uso de SQLite foi uma escolha para simplificar a execução local do projeto. Em um ambiente produtivo, uma opção mais robusta seria utilizar PostgreSQL ou SQL Server.

A autenticação não foi implementada para manter o foco no fluxo principal do desafio. Em uma evolução futura, poderia ser adicionada autenticação com JWT e controle de permissões.

O deploy do back-end foi feito em ambiente gratuito. Isso facilita a demonstração do projeto, mas pode gerar tempo de inicialização maior após períodos de inatividade.

A interface foi mantida objetiva para priorizar a clareza do fluxo funcional, validações e integração com a API.

## Melhorias futuras

* Implementar autenticação e autorização
* Adicionar paginação na listagem
* Adicionar ordenação por data, severidade e status
* Criar dashboard com indicadores de incidentes
* Utilizar PostgreSQL ou SQL Server em ambiente produtivo
* Melhorar a cobertura de testes
* Adicionar testes de integração no front-end
* Implementar logs estruturados com Serilog
* Adicionar monitoramento externo
* Criar histórico de alterações de status
* Adicionar tela de detalhes do incidente
* Adicionar responsáveis pela tratativa
* Adicionar comentários ou evolução do incidente
* Criar pipeline de deploy também para a API

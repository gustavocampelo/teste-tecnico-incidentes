# Teste Técnico - Sistema de Gestão de Incidentes

Este projeto foi desenvolvido como parte de um teste técnico com o objetivo de demonstrar a implementação de uma funcionalidade ponta a ponta, contemplando front-end, back-end, persistência em banco de dados, logs mínimos para diagnóstico, testes automatizados e análise técnica de incidente.

## Visão geral

A aplicação permite cadastrar, listar, filtrar e atualizar o status de incidentes. O fluxo foi pensado para simular um cenário real de acompanhamento de erros recorrentes em um sistema, permitindo registrar informações básicas do problema, severidade, status e datas de criação e atualização.

## Tecnologias utilizadas

### Back-end

* ASP.NET Core Web API
* Entity Framework Core
* SQLite
* xUnit
* Logs nativos com `ILogger`

### Front-end

* React
* TypeScript
* Vite
* Axios
* CSS

## Funcionalidades

* Cadastro de incidentes
* Listagem de incidentes
* Filtro por status
* Filtro por severidade
* Atualização de status
* Validações no front-end
* Validações no back-end
* Persistência em banco de dados SQLite
* Logs das principais operações da API
* Testes automatizados dos cenários principais

## Estrutura do projeto

```txt
teste-tecnico-incidentes/
│
├── backend/
│   ├── IncidentManager.Api/
│   └── IncidentManager.Tests/
│
├── frontend/
│   └── incident-manager-web/
│
├── docs/
│   └── nota-tecnica.md
│
├── README.md
└── .gitignore
```

## Como executar o projeto

### Pré-requisitos

É necessário ter instalado:

* .NET SDK 9
* Node.js
* npm
* Git

## Executando o back-end

Acesse a pasta da API:

```bash
cd backend/IncidentManager.Api
```

Restaure as dependências:

```bash
dotnet restore
```

Execute a API:

```bash
dotnet run
```

A API será executada em:

```txt
http://localhost:5252
```

Endpoint de teste:

```txt
http://localhost:5252/api/incidents
```

## Executando o front-end

Em outro terminal, acesse a pasta do front-end:

```bash
cd frontend/incident-manager-web
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

O front-end será executado em:

```txt
http://localhost:5173
```

## Executando os testes

Acesse a pasta do back-end:

```bash
cd backend
```

Execute:

```bash
dotnet test
```

## Endpoints da API

### Listar incidentes

```http
GET /api/incidents
```

Parâmetros opcionais:

```txt
status
severity
```

Exemplo:

```http
GET /api/incidents?status=Aberto&severity=Alta
```

### Buscar incidente por ID

```http
GET /api/incidents/{id}
```

### Criar incidente

```http
POST /api/incidents
```

Exemplo de requisição:

```json
{
  "title": "Erro ao carregar painel administrativo",
  "description": "Usuário relata que o painel fica carregando indefinidamente ao informar o CNPJ.",
  "severity": "Alta"
}
```

### Atualizar incidente

```http
PUT /api/incidents/{id}
```

Exemplo de requisição:

```json
{
  "title": "Erro ao carregar painel administrativo",
  "description": "Usuário relata que o painel fica carregando indefinidamente ao informar o CNPJ.",
  "severity": "Alta",
  "status": "EmAnalise"
}
```

### Atualizar status do incidente

```http
PATCH /api/incidents/{id}/status
```

Exemplo de requisição:

```json
{
  "status": "Resolvido"
}
```

### Remover incidente

```http
DELETE /api/incidents/{id}
```

## Valores aceitos

### Severidade

```txt
Baixa
Media
Alta
Critica
```

### Status

```txt
Aberto
EmAnalise
Resolvido
```

## Logs

A API registra logs mínimos nas principais operações:

* Listagem de incidentes
* Criação de incidente
* Atualização de incidente
* Alteração de status
* Tentativas de buscar, atualizar ou remover incidentes inexistentes

Esses logs auxiliam no diagnóstico de problemas e na rastreabilidade das operações.

## Observações

O banco utilizado é SQLite para simplificar a execução local. O arquivo de banco é criado automaticamente ao executar a API.

A análise técnica do incidente, decisões, trade-offs e melhorias futuras estão documentadas em:

```txt
docs/nota-tecnica.md
```

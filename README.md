# Teste Técnico - Sistema de Gestão de Incidentes

![Prévia da aplicação](docs/images/preview.png)

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB)
![Vite](https://img.shields.io/badge/Vite-Front--end-646CFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57)
![Docker](https://img.shields.io/badge/Docker-API-2496ED)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222222)
![Render](https://img.shields.io/badge/API-Render-46E3B7)

Sistema full stack para gestão de incidentes, desenvolvido como parte de um teste técnico. O projeto contempla front-end, back-end, persistência em banco de dados, CRUD completo, logs mínimos para diagnóstico, testes automatizados, documentação de API, nota técnica, deploy demonstrativo e interface premium com dashboard.

## Aplicação online

Front-end publicado no GitHub Pages:

```txt
https://gustavocampelo.github.io/teste-tecnico-incidentes/
```

API publicada no Render:

```txt
https://incident-manager-api-yidz.onrender.com
```

Health check da API:

```txt
https://incident-manager-api-yidz.onrender.com/api/health
```

Endpoint principal da API:

```txt
https://incident-manager-api-yidz.onrender.com/api/incidents
```

> Observação: a API está hospedada no plano gratuito do Render. No primeiro acesso, ela pode levar alguns segundos para responder caso esteja em modo de espera. Se o indicador da API aparecer como indisponível, aguarde alguns segundos e atualize a página.

## Visão geral

A aplicação permite cadastrar, listar, filtrar, editar, atualizar status e excluir incidentes. O fluxo foi pensado para simular um cenário real de acompanhamento de erros recorrentes em um sistema, permitindo registrar informações básicas do problema, severidade, status e datas de criação e atualização.

A interface foi organizada em duas áreas principais:

* **Início:** dashboard com visão geral do sistema, status da API, indicadores e cadastro rápido de incidentes.
* **Processos:** tela de gestão com filtros, listagem de incidentes, edição, exclusão e atualização de status.

O front-end possui uma interface responsiva, com acabamento visual premium em estilo dark/glass, animações suaves, cards de resumo, indicador dinâmico de disponibilidade da API, footer com autoria e barra de rolagem personalizada.

## Funcionalidades

* Dashboard inicial com visão geral dos incidentes
* Indicador visual de disponibilidade da API
* Cadastro de incidentes
* Listagem de incidentes
* Filtro por status
* Filtro por severidade
* Edição completa de incidente
* Atualização rápida de status
* Exclusão de incidente com confirmação
* Validações no front-end
* Validações no back-end
* Persistência em banco de dados SQLite
* Logs das principais operações da API
* Testes automatizados dos cenários principais
* Dados iniciais para demonstração
* Interface responsiva
* Animações e microinterações
* Footer com autoria
* Deploy demonstrativo online

## Tecnologias utilizadas

### Back-end

* ASP.NET Core Web API
* Entity Framework Core
* SQLite
* xUnit
* Logs nativos com `ILogger`
* Docker

### Front-end

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* CSS customizado

### Deploy

* GitHub Pages para publicação do front-end
* GitHub Actions para build e deploy do front-end
* Render para hospedagem da API
* Docker para empacotamento e execução da API

## Estrutura do projeto

```txt
teste-tecnico-incidentes/
│
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml
│
├── backend/
│   ├── IncidentManager.Api/
│   └── IncidentManager.Tests/
│
├── frontend/
│   └── incident-manager-web/
│
├── docs/
│   ├── images/
│   │   └── preview.png
│   └── nota-tecnica.md
│
├── Dockerfile
├── README.md
└── .gitignore
```

## Como validar rapidamente

1. Acesse a aplicação publicada no GitHub Pages.
2. Aguarde o indicador da API ficar disponível.
3. Na tela inicial, confira os cards do dashboard.
4. Cadastre um novo incidente pelo formulário.
5. Acesse a área de processos.
6. Filtre os incidentes por status ou severidade.
7. Edite um incidente existente.
8. Atualize o status de um incidente.
9. Exclua um incidente.
10. Acesse `/api/health` para validar a disponibilidade da API.
11. Execute `dotnet test` localmente para validar os testes automatizados.

## Como executar localmente

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

A API será executada localmente em:

```txt
http://localhost:5252
```

Endpoint de saúde:

```txt
http://localhost:5252/api/health
```

Endpoint de incidentes:

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

Por padrão, em ambiente local, o front-end consome a API em:

```txt
http://localhost:5252/api
```

Essa configuração está no arquivo:

```txt
frontend/incident-manager-web/src/services/api.ts
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

Os testes cobrem os principais cenários da API, incluindo:

* Criação de incidente válido
* Validação de incidente sem título
* Listagem de incidentes cadastrados
* Retorno de erro ao buscar incidente inexistente
* Atualização completa de incidente
* Atualização de status de incidente
* Exclusão de incidente

## Build do front-end

Para validar o build do front-end:

```bash
cd frontend/incident-manager-web
npm run build
```

## Endpoints da API

### Health check

```http
GET /api/health
```

Retorna o status de disponibilidade da API.

Exemplo de resposta:

```json
{
  "status": "Healthy",
  "timestamp": "2026-06-28T19:03:10.0336398Z"
}
```

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
* Busca de incidente por ID
* Criação de incidente
* Atualização completa de incidente
* Alteração de status
* Exclusão de incidente
* Tentativas de buscar, atualizar ou remover incidentes inexistentes

Esses logs auxiliam no diagnóstico de problemas e na rastreabilidade das operações.

## Design e experiência

A interface foi desenvolvida com foco em clareza, usabilidade e apresentação profissional. O sistema conta com:

* Tema escuro em estilo glassmorphism
* Cards com transparência e blur
* Orbes animados de fundo
* Microinterações em botões e cards
* Indicador visual de status da API
* Separação entre dashboard e gestão de processos
* Scrollbar personalizada
* Layout responsivo
* Footer com autoria do projeto

## Deploy

### Front-end

O front-end é publicado no GitHub Pages por meio de GitHub Actions.

Arquivo do workflow:

```txt
.github/workflows/deploy-frontend.yml
```

Durante o build, a variável `VITE_API_BASE_URL` é utilizada para configurar a URL pública da API.

### Back-end

A API é publicada no Render utilizando Docker.

Arquivo Docker:

```txt
Dockerfile
```

A API escuta a porta definida pelo ambiente de hospedagem e expõe os endpoints necessários para o front-end.

## Observações sobre persistência

O banco utilizado é SQLite para simplificar a execução local e o entendimento do projeto.

No ambiente gratuito do Render, a persistência com SQLite deve ser considerada demonstrativa. Em um ambiente produtivo, o ideal seria utilizar um banco gerenciado, como PostgreSQL ou SQL Server.

## Nota técnica

A análise técnica do incidente, decisões, trade-offs, limitações e melhorias futuras estão documentadas em:

```txt
docs/nota-tecnica.md
```

## Decisões e boas práticas demonstradas

* Separação entre front-end e back-end
* API REST documentada
* Uso de DTOs para entrada de dados
* Validações no front-end e no back-end
* CRUD completo de incidentes
* Logs para diagnóstico
* Testes automatizados
* Configuração de CORS para integração entre front-end e API
* Uso de variável de ambiente para URL da API no deploy
* Dockerização da API
* Deploy automatizado do front-end com GitHub Actions
* Interface responsiva e orientada à experiência do usuário
* Documentação com instruções claras de execução

## Autoria

Projeto desenvolvido por **Gustavo Campelo**.

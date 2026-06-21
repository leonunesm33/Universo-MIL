# Universo MIL — Plataforma de Treinamento

Plataforma LMS (Learning Management System) corporativa para treinamento de equipes de vendas. Arquitetura inspirada em serviços de streaming, com gestão de cursos, avaliações, pesquisas de clima, NPS e checklist operacional.

## Stack

| Tecnologia | Versão |
|---|---|
| Next.js (App Router + Turbopack) | 16.2.9 |
| NextAuth | v5 beta |
| Prisma ORM | v5 |
| PostgreSQL | 16 |
| Tailwind CSS | v4 |
| Node.js | 20 LTS |

## Funcionalidades

- **Aprendizado:** cursos com módulos, aulas em vídeo, documentos e progresso por aula
- **Avaliações:** quiz por módulo com nota de aprovação configurável
- **POP (Procedimento Operacional):** visualização de procedimentos por cargo
- **Pesquisa de Clima:** pesquisas periódicas com resultados por loja
- **Checklist Operacional:** templates configuráveis com respostas e histórico
- **NPS:** Net Promoter Score com coleta e dashboard
- **Perfis de Acesso:** COLABORADOR → SUPERVISAO → GERENTE → GESTAO → ADMIN
- **Painel Admin:** dashboard, relatórios, ranking de engajamento, gestão de usuários/cursos/lojas

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- npm 10+

## Instalação local (desenvolvimento)

```bash
# 1. Clonar o repositório
git clone https://github.com/leonunesm33/Universo-MIL.git
cd Universo-MIL

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Gerar cliente Prisma e rodar migrations
npx prisma generate
npx prisma migrate deploy

# 5. Popular banco com dados iniciais
npx prisma db seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse em: http://localhost:3000

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string PostgreSQL |
| `AUTH_SECRET` | Secret do NextAuth (gere com `openssl rand -base64 32`) |
| `AUTH_URL` | URL base da aplicação |
| `JWT_SECRET` | Secret para JWT |
| `SMTP_HOST` | Host do servidor de e-mail |
| `SMTP_PORT` | Porta SMTP |
| `SMTP_FROM` | E-mail remetente |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação |

## Docker (produção)

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com as credenciais de produção

# 2. Build e subir todos os serviços
docker compose up -d --build
```

A aplicação sobe na porta `3000`. MailHog (simulador de e-mail) disponível na porta `8025`.

## Perfis de acesso

| Role | Acesso |
|---|---|
| `COLABORADOR` | Cursos, perfil |
| `GERENTE` | + POP |
| `SUPERVISAO` | + Checklist, dashboard analytics (somente leitura) |
| `GESTAO` | + Equipe, POP, clima, analytics |
| `ADMIN` | Acesso total ao painel administrativo |

## Estrutura do projeto

```
src/
├── app/
│   ├── (student)/      # Rotas do aluno (homepage, cursos, perfil…)
│   ├── admin/          # Painel administrativo
│   └── api/            # Rotas de API REST
├── components/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── prisma.ts       # Instância do Prisma Client
│   └── permissions.ts  # Matriz de permissões por role
├── proxy.ts            # Middleware Next.js (auth + RBAC)
└── types/
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Screenshots

Capturas de tela da plataforma disponíveis em `docs/screenshots/`.

## Deploy em servidor Ubuntu

Consulte o guia completo em [docs/DEPLOY.md](docs/DEPLOY.md).

## Documentação técnica

Consulte [docs/TECHNICAL.md](docs/TECHNICAL.md) para arquitetura detalhada, modelo de dados e API.

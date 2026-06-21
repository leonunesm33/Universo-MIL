# Documentação Técnica — Universo MIL

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 16.2.9                       │
│                     App Router + Turbopack                   │
│                                                              │
│  ┌──────────────┐   ┌──────────────────┐   ┌────────────┐  │
│  │   (student)  │   │    admin/        │   │   api/     │  │
│  │  rotas React │   │  painel admin    │   │  REST      │  │
│  └──────────────┘   └──────────────────┘   └────────────┘  │
│         │                    │                    │          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              src/proxy.ts (middleware)               │   │
│  │           Auth + RBAC + redirects                   │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                    │                    │          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              NextAuth v5 (auth.ts)                   │   │
│  │        JWT sessions · Credentials provider          │   │
│  └──────────────────────────────────────────────────────┘   │
│         │                                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Prisma v5 (lib/prisma.ts)               │   │
│  │                  PostgreSQL 16                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Middleware de Autenticação (`src/proxy.ts`)

O arquivo `src/proxy.ts` é o middleware do Next.js 16.2.9 (nesta versão o nome padrão é `proxy.ts`, **não** `middleware.ts`).

Fluxo de decisão:
1. Rotas públicas (`/login`, `/convite`, etc.) → passa direto
2. Usuário logado em `/login` → redireciona para dashboard ou homepage
3. Raiz `/` → redireciona com base no role
4. Sem sessão → `/login`
5. Rotas `/admin/dashboard`, `/admin/relatorios`, `/admin/ranking` → requer `admin_analytics`
6. Demais rotas `/admin/*` → requer `admin_panel`
7. `/pop` → requer `pop`
8. `/checklist` → requer `checklist_answer`
9. `/equipe` → requer `team_evolution`

## Sistema de Permissões (`src/lib/permissions.ts`)

### Roles

| Role | Hierarquia |
|---|---|
| `COLABORADOR` | Nível base — colaboradores de loja |
| `GERENTE` | Gerente de loja |
| `SUPERVISAO` | Supervisão regional |
| `GESTAO` | Gestão / diretoria |
| `ADMIN` | Administrador do sistema |

### Matriz de Features

| Feature | COLABORADOR | GERENTE | SUPERVISAO | GESTAO | ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|
| `learning` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `clima` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `nps` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `pop` | — | ✓ | ✓ | — | ✓ |
| `checklist_answer` | — | — | ✓ | ✓ | ✓ |
| `team_evolution` | — | — | ✓ | ✓ | ✓ |
| `admin_analytics` | — | — | ✓ | ✓ | ✓ |
| `checklist_dash` | — | — | — | ✓ | ✓ |
| `admin_panel` | — | — | — | — | ✓ |

## Modelo de Dados

### Entidades principais

```
Store ──< User ──< UserCourse ──< LessonProgress
                │
                ├──< AssessmentResponse ──< AssessmentAnswer
                ├──< ChecklistResponse ──< ChecklistAnswerItem
                ├──< ClimateResponse ──< ClimateAnswer
                ├──< NPSResponse ──< NPSAnswer
                └──< LoginLog

Course ──< Module ──< Lesson
                  └──< Assessment ──< Question ──< Option

ChecklistTemplate ──< ChecklistItem
ClimateResearch ──< ClimateQuestion
NPSCampaign ──< NPSQuestion
           └──< NPSLeader
```

### Modelos Prisma

| Modelo | Descrição |
|---|---|
| `Store` | Loja/unidade |
| `User` | Usuário da plataforma |
| `Course` | Curso (status: DRAFT/PUBLISHED) |
| `Module` | Módulo dentro de um curso |
| `Lesson` | Aula (tipo: VIDEO) |
| `Assessment` | Avaliação vinculada a um módulo |
| `Question` | Questão da avaliação |
| `Option` | Alternativa de questão |
| `UserCourse` | Matrícula de usuário em curso |
| `LessonProgress` | Progresso por aula |
| `AssessmentResponse` | Resposta de avaliação |
| `Certificate` | Certificado emitido (módulo ou curso) |
| `Favorite` | Aula favoritada |
| `Like` | Like/dislike em aula |
| `StudentNote` | Anotação de aluno |
| `LoginLog` | Histórico de login |
| `InviteToken` | Token de convite para cadastro |
| `PlatformConfig` | Configurações da plataforma |
| `POPDocument` | Documento de POP |
| `ClimateResearch` | Pesquisa de clima |
| `ClimateQuestion` | Pergunta da pesquisa de clima |
| `ClimateResponse` | Resposta de pesquisa de clima |
| `ClimateAnswer` | Resposta individual por pergunta |
| `ChecklistTemplate` | Template de checklist |
| `ChecklistItem` | Item do checklist |
| `ChecklistResponse` | Resposta de checklist |
| `ChecklistAnswerItem` | Resposta de item individual |
| `NPSCampaign` | Campanha NPS |
| `NPSLeader` | Líder vinculado à campanha NPS |
| `NPSQuestion` | Pergunta NPS |
| `NPSAnswer` | Resposta NPS por questão |
| `NPSResponse` | Resposta completa de NPS |

## Rotas de API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `POST` | `/api/convite/[token]` | Validar/usar token de convite |

### Perfil
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/perfil` | Dados do usuário logado |
| `PUT` | `/api/perfil` | Atualizar nome, senha, avatar |

### Upload
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/upload` | Upload de arquivo para `public/uploads/` |

### Admin — Config
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/config` | Ler configurações da plataforma |
| `PUT` | `/api/admin/config` | Salvar configurações da plataforma |

### Admin — Usuários
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/users` | Listar usuários (com filtros) |
| `POST` | `/api/admin/users` | Criar usuário |
| `PATCH` | `/api/admin/users/[id]` | Atualizar usuário |
| `DELETE` | `/api/admin/users/[id]` | Excluir usuário |

### Admin — Lojas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/admin/stores` | Listar lojas |
| `POST` | `/api/admin/stores` | Criar loja |
| `PATCH` | `/api/admin/stores/[id]` | Atualizar loja |

### Progresso / Avaliação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/progress` | Marcar aula como concluída |
| `POST` | `/api/avaliacoes/[id]/responder` | Submeter resposta de avaliação |

### NPS
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/nps/active` | Campanha NPS ativa para o usuário |
| `POST` | `/api/nps/[id]/responder` | Submeter resposta NPS |

## Server Actions

As mutações administrativas são implementadas como Server Actions em `src/app/admin/actions/`:

| Arquivo | Actions |
|---|---|
| `users.ts` | `createUser`, `updateUser`, `blockUser`, `deleteUser`, `sendInvite` |
| `courses.ts` | `createCourse`, `updateCourse`, `publishCourse`, `deleteCourse` |
| `assessments.ts` | `createAssessment`, `toggleAssessmentStatus`, `addQuestion`, `deleteQuestion` |
| `metrics.ts` | `getDashboardMetrics(storeId?)` |
| `checklist.ts` | `createChecklistTemplate`, `submitChecklistResponse` |
| `clima.ts` | `createClimateResearch`, `publishClimateResearch` |
| `nps.ts` | `createNPSCampaign`, `activateNPSCampaign` |
| `pop.ts` | `createPOPDocument`, `deletePOPDocument` |

## Configuração de Build

### `next.config.ts`
```ts
output: "standalone"  // Para deployment Docker
```

### Dockerfile (multi-stage)
```
Stage 1 (builder): node:20-alpine → npm ci → prisma generate → npm run build
Stage 2 (runner):  node:20-alpine → copia standalone + static + public + prisma
```

### `docker-compose.yml`
- `db`: PostgreSQL 16 Alpine com healthcheck
- `mailhog`: SMTP fake para desenvolvimento (porta 8025)
- `app`: Next.js standalone com `prisma migrate deploy && node server.js`

## Migrations

Migrations Prisma em `prisma/migrations/`:

| Migration | Descrição |
|---|---|
| `20260618233637_init` | Schema inicial completo |
| `20260619140605_add_invite_token_platform_config` | Tokens de convite e config da plataforma |
| `20260619201117_add_platform_facebook` | Campo Facebook na config |
| `20260620150337_expand_role_enum` | Adição dos roles GERENTE e GESTAO |
| `20260620180956_add_pop_clima_checklist_nps` | Módulos POP, Clima, Checklist, NPS |
| `20260620193020_fase2_novos_modelos` | Modelos de Fase 2 |
| `20260620202335_add_climate_period` | Período nas pesquisas de clima |
| `20260620234903_add_nps_leaders_assessment_module_websiteurl` | NPS leaders, avaliação por módulo, websiteUrl |

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|:---:|---|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `AUTH_SECRET` | ✓ | Secret NextAuth (≥32 chars) |
| `AUTH_URL` | ✓ | URL base da aplicação |
| `JWT_SECRET` | ✓ | Secret JWT adicional |
| `SMTP_HOST` | — | Host SMTP (padrão: localhost) |
| `SMTP_PORT` | — | Porta SMTP (padrão: 1025) |
| `SMTP_SECURE` | — | TLS SMTP (padrão: false) |
| `SMTP_USER` | — | Usuário SMTP |
| `SMTP_PASS` | — | Senha SMTP |
| `SMTP_FROM` | — | E-mail remetente |
| `NEXT_PUBLIC_APP_URL` | ✓ | URL pública (usada em e-mails e links) |
| `DB_PASSWORD` | ✓ (Docker) | Senha do PostgreSQL no Docker Compose |

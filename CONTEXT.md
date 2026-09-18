# Universo MIL — Contexto

> Arquivo de memória do projeto. Qualquer IA (Kiro, Claude, outra) deve ler isto antes de trabalhar aqui e **atualizar ao fim de uma sessão que gerou informação nova relevante**.

## Visão geral
Plataforma LMS (Learning Management System) corporativa para treinamento de equipes de vendas, com arquitetura inspirada em serviços de streaming.

## Regras absolutas
- Nunca commitar credenciais. Segredos reais ficam em `.env.service` / `.env.local` / `.claude/.env` (todos no `.gitignore`).
- **Atenção Next.js:** esta versão tem breaking changes vs. o Next que a IA conhece. Ler os guias em `node_modules/next/dist/docs/` antes de escrever código (ver `AGENTS.md`).

## Stack e arquitetura
- Next.js 16.2.9 (App Router + Turbopack), NextAuth v5 beta, Prisma v5, PostgreSQL 16, Tailwind v4, Node 20 LTS.
- Perfis de acesso: COLABORADOR → SUPERVISAO → GERENTE → GESTAO → ADMIN.
- Módulos: cursos/aulas, avaliações (quiz), POP, pesquisa de clima, checklist operacional, NPS, painel admin.
- Rodar local: `npm install` → configurar `.env` → `npx prisma migrate` → `npm run dev`.

## Decisões e histórico
- 2026-09-18: adicionados scripts `activate-demo-users.ts` / `activate-demo.js` (ativação de usuários demo via Prisma). `.env.service` continha segredos reais (AUTH_SECRET, JWT_SECRET, SMTP_PASS, DATABASE_URL) e foi protegido no `.gitignore` — nunca versionar.

## Credenciais (por referência — NUNCA o valor)
- Arquivos de segredos: `.env.service`, `.env.local`, `.claude/.env`
- Template público: `.env.example`
- Chaves: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `JWT_SECRET`, `SMTP_*`, `NEXT_PUBLIC_APP_URL`

## Estado atual / próximos passos
- Repo no GitHub: github.com/leonunesm33/Universo-MIL (público). Branch `master`.
- Docs adicionais em `docs/TECHNICAL.md` e `docs/DEPLOY.md`.

## Integrações de IA
- `AGENTS.md`: regra sobre a versão nova do Next.js.

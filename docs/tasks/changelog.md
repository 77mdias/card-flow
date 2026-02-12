# Changelog

Registro historico do que foi entregue no projeto.
Formato baseado em Keep a Changelog e semver quando aplicavel.

## [Unreleased]

### Added
- Estrutura de governanca com `AGENTS.md` no formato DO/DONT.
- Templates base: `templates/task-spec.md` e `templates/bug-report.md`.
- Estrutura de organizacao: `backlog/` e `sprints/`.
- Primeira task-spec completa: `development/task-s01-001-auth0-base-user-lifecycle.md`.
- Fundacao de autenticacao com Auth0 e ciclo inicial de usuario (Sprint 01):
  - integracao Auth0 com App Router (`/auth/login`, `/auth/logout`, `/auth/callback`);
  - protecao server-side de rotas privadas via `proxy.ts`;
  - sincronizacao de usuario interno (`users`) com update de `last_login_at`;
  - bloqueio de usuarios `INACTIVE` e `DELETED` no servidor;
  - validacao obrigatoria de env com Zod e baseline de headers de seguranca;
  - testes unit/integration e suite e2e para fluxo critico de auth.
- Fluxo customizado de reenvio de verificacao de email no backend:
  - geracao de ticket de verificacao via Auth0 Management API;
  - envio de email via SMTP (Nodemailer) sem depender do provider nativo do Auth0;
  - server action tipada com feedback seguro na tela de `email-verification-required`;
  - rate limit server-side em memoria para reduzir abuso de reenvio.
- Fluxo de exclusao sincronizada de conta:
  - endpoint privado `DELETE /api/private/account`;
  - remocao no Auth0 Management API e no banco local;
  - resposta tipada com `logoutUrl` para encerrar sessao apos exclusao;
  - testes unit e integration para evitar regressao de conflito Auth0 x banco.
- Migracao de autenticacao para Better Auth (email/senha + verificacao por SMTP):
  - rotas de auth via `app/api/auth/[...all]/route.ts`;
  - novas telas de login/cadastro (`/auth/login` e `/auth/register`);
  - logout via `GET /auth/logout` com limpeza de cookie de sessao;
  - migracao Prisma com tabelas `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications`;
  - refatoracao de servicos de sessao, verificacao de email e exclusao de conta para Better Auth;
  - nota de conflito: decisao de produto migrou do stack anterior (Auth0) para Better Auth;
  - remocao de dependencias e modulos legados do Auth0.

## [0.1.0] - 2026-02-12

### Added
- Bootstrap inicial Next.js 16 + TypeScript + Tailwind.
- Documento de produto inicial em `PRD.md`.

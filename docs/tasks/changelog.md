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

## [0.1.0] - 2026-02-12

### Added
- Bootstrap inicial Next.js 16 + TypeScript + Tailwind.
- Documento de produto inicial em `PRD.md`.

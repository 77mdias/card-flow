# Sprint 01 - Base + Auth

## Objetivo
Estabelecer fundacao tecnica e autenticacao segura com Auth0.

## Status
- concluido em 2026-02-12.
- atualizado em 2026-02-16 com paginas de suporte de autenticacao.
- task entregue: `docs/tasks/development/task-s01-001-auth0-base-user-lifecycle.md`.
- documentacao da feature: `docs/tasks/development/task-s01-001-auth0-base-user-lifecycle-features.md`.

## Escopo
- setup inicial de arquitetura de pastas.
- integracao Auth0 (login/logout/callback/session).
- protecao de rotas privadas.
- persistencia inicial de usuario.
- paginas de autenticacao para suporte de fluxo:
  - verificacao de email (pendente, sucesso e erro).
  - erro de conexao no login/cadastro.

## Criterios de aceite
- login e logout funcionais.
- sessao disponivel server-side.
- rotas privadas protegidas.
- CI verde.

## Fora de escopo
- CRUD completo de cartoes.
- dashboard final.

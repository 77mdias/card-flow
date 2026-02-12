# Task Spec

## 1. Meta
- task_id: TASK-S01-001
- titulo: Fundacao de autenticacao com Auth0 e ciclo inicial de usuario
- tipo: feature
- prioridade: P0
- status: ready
- owner: unassigned
- sprint: Sprint 01 - Base + Auth
- criado_em: 2026-02-12
- atualizado_em: 2026-02-12

## 2. Contexto de negocio
- problema: O projeto ainda esta no bootstrap e nao possui autenticacao, sessao server-side, nem persistencia confiavel de usuario. Sem essa base, todas as features do MVP (cartoes, transacoes, statements, dashboard e inatividade) ficam bloqueadas.
- valor para usuario: Garante acesso seguro, protecao de dados privados e base para continuidade da jornada (login -> dashboard -> uso recorrente).
- referencia_prd: PRD.md #2 (Objetivos do MVP), #3 (Fluxo de autenticacao e seguranca), #4 (Tabela users), #6 (Funcionalidades do MVP), #7 (Requisitos nao-funcionais - seguranca).
- notas_da_task: Conflito registrado entre PRD e stack obrigatoria. O PRD descreve email/senha com Argon2id e verificacao propria; AGENTS.md exige Auth0 (`@auth0/nextjs-auth0`). Decisao operacional desta task: usar Auth0 como fonte de autenticacao e manter `users.status` + `last_login_at` no banco para regras de dominio.

## 3. Escopo
### In scope
- Integrar Auth0 no App Router com fluxo de login, logout, callback e sessao.
- Proteger rotas privadas no servidor (middleware + verificacao server-side).
- Persistir usuario interno no primeiro login e atualizar `last_login_at` nos logins seguintes.
- Respeitar status de usuario `ACTIVE | INACTIVE | DELETED` no acesso da aplicacao.
- Validar variaveis de ambiente obrigatorias no startup.

### Out of scope
- Cadastro local com senha, hash Argon2id e token de verificacao proprio.
- CRUD de cartoes, statements, transacoes e dashboard.
- Automacao de inatividade (cron dia 7/12/19) e envio de emails.
- Controle fino de permissao por papeis alem de dono da conta.

## 4. Requisitos funcionais
- RF01: Usuario autenticado via Auth0 consegue iniciar sessao e encerrar sessao com sucesso.
- RF02: Rotas privadas so podem ser acessadas com sessao valida no servidor.
- RF03: No primeiro login valido, sistema cria registro em `users` com status inicial `ACTIVE`.
- RF04: A cada login valido, sistema atualiza `last_login_at`.
- RF05: Usuario com status `INACTIVE` ou `DELETED` nao acessa area privada (bloqueio server-side com resposta segura e orientacao de reativacao/suporte).

## 5. Requisitos nao funcionais
- RNF01: Nenhum segredo (token, cookie, header de auth) em logs.
- RNF02: Tipagem strict sem `any` no fluxo de auth/session.
- RNF03: Nenhum dado privado de usuario deve ser cacheado acidentalmente.
- RNF04: Fluxo de auth deve manter compatibilidade com Next.js App Router (sem uso de `/pages` para novas features).

## 6. Contratos tecnicos
- entradas:
  - Requisicoes HTTP para endpoints de autenticacao do Auth0.
  - Sessao server-side obtida via `auth0.getSession(...)`.
  - Variaveis de ambiente obrigatorias (Auth0 app + secret + base URL + conexao banco).
- saidas:
  - Sessao autenticada para paginas/rotas privadas.
  - DTO interno de usuario persistido/sincronizado (`id`, `email`, `status`, `last_login_at`).
  - Resposta segura para usuario nao autorizado (sem erro interno bruto).
- schema_validacao:
  - Zod para validar env vars obrigatorias no startup.
  - Validacao de payload externo que entrar por handlers internos (quando aplicavel).
- authn_authz:
  - Authn: Auth0 (`@auth0/nextjs-auth0`) centralizado em `lib/auth0.ts`.
  - Authz: Regras de status (`ACTIVE | INACTIVE | DELETED`) aplicadas em `server/services/*`.
  - Nao confiar em dados de auth enviados pelo cliente.
- estrategia_cache:
  - Dados privados por usuario com estrategia `no-store`.
  - Leitura de sessao sempre server-side.
- estrategia_revalidacao:
  - Nao ha cache compartilhado relevante nesta task.
  - Em mutacoes de perfil/sessao futuras, usar `revalidatePath`/`revalidateTag` explicitamente.

## 7. Impacto tecnico
- arquitetura:
  - Adicionar `lib/auth0.ts` como ponto unico de integracao.
  - Criar boundary claro: `server/repos/users-repo.ts` e `server/services/auth-service.ts`.
  - Proteger segmentos privados com middleware oficial.
- banco_de_dados:
  - Criar modelo `users` com campos minimos de dominio: `id`, `email`, `status`, `last_login_at`, `created_at`, `deleted_at`.
  - Incluir identificador estavel do provedor (`auth_provider`, `auth_subject`) para correlacao com Auth0.
- migracoes:
  - Primeira migration de `users` e enums de status.
  - Garantir indice/constraint de unicidade para email e subject do provedor.
- observabilidade:
  - Logar eventos minimos de auth: rota, request_id, resultado (success/failure), duracao.
  - Nao logar tokens/cookies/headers sensiveis.
- seguranca:
  - Env validation obrigatoria no startup.
  - Bloqueio server-side para status nao ativo.
  - Baseline de headers de seguranca no app.

## 8. Plano de implementacao
1. Instalar e configurar `@auth0/nextjs-auth0` com App Router e `lib/auth0.ts`.
2. Definir schema Zod de env e falhar startup se obrigatorios ausentes.
3. Criar schema Prisma inicial de `users` + migration.
4. Implementar repo/servico para upsert de usuario no login e update de `last_login_at`.
5. Aplicar protecao de rotas privadas em middleware e checagem server-side de status.
6. Tratar fluxos `INACTIVE`/`DELETED` com resposta segura e sem vazamento de detalhes internos.
7. Escrever testes (unit + integration + e2e) e ajustar CI.

## 9. Plano de testes
- unit:
  - `auth-service`: cria usuario novo com status `ACTIVE`.
  - `auth-service`: atualiza `last_login_at` em login recorrente.
  - `auth-service`: bloqueia `INACTIVE`/`DELETED`.
- integration:
  - Handler protegido sem sessao retorna nao autorizado.
  - Handler protegido com sessao valida retorna sucesso.
  - Sincronizacao de usuario via callback/login persiste campos esperados.
- e2e:
  - Login -> acesso rota privada -> logout.
  - Usuario marcado `INACTIVE` perde acesso e recebe mensagem de reativacao.
- cenarios_criticos:
  - Sessao invalida/expirada.
  - Usuario autenticado no provedor mas ausente no banco local (deve criar).
  - Usuario `DELETED` no banco local (deve negar acesso mesmo autenticado no provedor).

## 10. Criterios de aceite
- [ ] Fluxo Auth0 (login/logout/callback/session) funcional no App Router.
- [ ] Rotas privadas protegidas por middleware e verificacao server-side.
- [ ] Registro interno de usuario criado/sincronizado com `status` e `last_login_at`.
- [ ] Bloqueio de acesso para `INACTIVE` e `DELETED` aplicado no servidor.
- [ ] Validacao de env vars obrigatorias implementada.
- [ ] Cobertura minima: unit + integration + e2e do fluxo critico de auth.

## 11. Riscos e rollback
- riscos:
  - Divergencia PRD (senha/Argon2) vs AGENTS (Auth0) gerar ambiguidade de execucao.
  - Falha de mapeamento entre identidade Auth0 e usuario interno.
  - Regressao de acesso indevido por cache/guard mal configurado.
- mitigacao:
  - Registrar decisao tecnica nesta task e referenciar explicitamente no PR.
  - Garantir chave unica de identidade (`auth_subject`) + testes de sincronizacao.
  - Testes de autorizacao server-side para status e sessao.
- plano_rollback:
  - Reverter migration e feature flags de protecao para estado anterior.
  - Desabilitar sincronizacao automatica e manter apenas rotas publicas ate correcao.

## 12. Checklist final
- [x] Alinhado ao PRD
- [x] Alinhado ao AGENTS.md (DO/DONT)
- [x] Sem quebra de boundary server/client
- [x] Validacao + authz server-side
- [x] Cache/revalidacao explicitos
- [ ] Testes atualizados
- [x] Docs atualizadas

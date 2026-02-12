# TASK-S01-001 - Documentacao de features entregues

## 1. Estrategia de documentacao adotada
Para esta entrega, a documentacao foi organizada em tres niveis:
- rastreabilidade de task: atualizacao da task-spec com status final e evidencias.
- documentacao de feature: este arquivo com fluxo funcional, contrato tecnico e operacao.
- historico de release: atualizacao de changelog para facilitar consulta futura.

Esse formato permite responder rapido a tres perguntas:
- o que foi implementado?
- como funciona tecnicamente?
- como validar e operar em desenvolvimento/producao?

## 2. Escopo entregue (Sprint 01)
- Integracao Auth0 no App Router para login, logout, callback e sessao.
- Protecao server-side de rotas privadas.
- Persistencia/sincronizacao de usuario interno no login.
- Atualizacao de `last_login_at` em login recorrente.
- Bloqueio server-side para usuarios `INACTIVE` e `DELETED`.
- Validacao de variaveis de ambiente obrigatorias no startup.
- Baseline de seguranca com headers HTTP.

## 3. Features funcionais

### 3.1 Login e logout com Auth0
- Entrada de autenticacao via `/auth/login`.
- Encerramento de sessao via `/auth/logout`.
- Callback processado pelo SDK do Auth0 via `/auth/callback`.
- Sessao lida somente no servidor (`auth0.getSession(...)`).

### 3.2 Rotas privadas protegidas
- Rotas privadas definidas nesta fase:
  - `/dashboard`
  - `/api/private/*`
- Se nao houver sessao valida, o usuario e redirecionado para `/auth/login` com `returnTo`.

### 3.3 Sincronizacao de usuario interno
Ao autenticar com sucesso no Auth0:
- Se usuario nao existe localmente, cria registro em `users` com status `ACTIVE`.
- Se usuario existe, sincroniza email/email_verified e atualiza `last_login_at`.
- Identidade externa correlacionada por `auth_subject` (claim `sub`).

### 3.4 Regra de bloqueio por status
- `ACTIVE`: acesso permitido.
- `INACTIVE`: acesso negado no servidor com resposta segura.
- `DELETED`: acesso negado no servidor com resposta segura.

### 3.5 Endpoint privado de sessao
- Endpoint: `GET /api/private/session`.
- Contrato de retorno:
  - sucesso: `{ ok: true, data }`
  - falha: `{ ok: false, error, message }`
- Cache explicitamente desabilitado (`Cache-Control: no-store`).

## 4. Arquitetura implementada

### 4.1 Arquivos principais
- `lib/auth0.ts`: client Auth0 centralizado.
- `lib/validation/env.ts` e `lib/env.ts`: schema/parse de env.
- `lib/prisma.ts`: singleton Prisma server-side.
- `server/repos/users-repo.ts`: acesso a dados de usuarios.
- `server/services/auth-service.ts`: regra de negocio de auth/authz.
- `proxy.ts`: protecao de rotas privadas no edge/server boundary.
- `app/dashboard/page.tsx`: pagina privada com validacao server-side.
- `app/api/private/session/route.ts`: endpoint privado para estado de sessao.

### 4.2 Modelo de dados criado
Tabela `users`:
- `id` (uuid)
- `auth_provider`
- `auth_subject` (unique)
- `email` (unique)
- `email_verified`
- `status` (`ACTIVE | INACTIVE | DELETED`)
- `last_login_at`
- `created_at`
- `deleted_at` nullable

Migration inicial:
- `prisma/migrations/20260212170000_init_users/migration.sql`

## 5. Configuracao de ambiente
Variaveis obrigatorias:
- `APP_BASE_URL`
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_SECRET`
- `DATABASE_URL`

Referencia:
- `.env.example`

## 6. Seguranca e observabilidade
- Nao ha logging de token/cookie/header sensivel.
- Eventos minimos de auth registrados com:
  - rota
  - request_id
  - resultado
  - duracao
- Headers baseline adicionados:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), g
Verifique sua caixa de entrada e, apos confirmar o email, tente entrar novamente.eolocation=()`

## 7. Testes implementados

### 7.1 Unit
Arquivo: `tests/unit/auth-service.test.ts`
- cria usuario novo com status `ACTIVE`.
- atualiza `last_login_at` em login recorrente.
- bloqueia `INACTIVE` e `DELETED`.

### 7.2 Integration
Arquivo: `tests/integration/private-session-route.test.ts`
- handler sem sessao retorna 401.
- handler com sessao valida retorna 200.
- handler com usuario inativo retorna 403.

### 7.3 E2E
Arquivo: `tests/e2e/auth-flow.spec.ts`
- login -> dashboard -> logout.
- bloqueio de usuario inativo.
- execucao depende de credenciais Auth0 reais no ambiente.

## 8. Como validar localmente
1. Preencher `.env.local`.
2. Rodar `bun run prisma:generate`.
3. Rodar migration: `bun run prisma:migrate:dev`.
4. Validar qualidade:
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test`
   - `bun run build`
5. Para e2e real, configurar credenciais e rodar `bun run test:e2e`.

## 9. Limites desta entrega
- Nao inclui CRUD de cartoes/statements/transacoes.
- Nao inclui automacao da politica de inatividade (dias 7/12/19).
- Nao inclui envio de email de aviso/reativacao.

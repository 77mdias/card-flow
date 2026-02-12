# AGENTS.md - CardFlow (DO / DONT)

Este repositorio segue um modelo de execucao estrito.
Use este arquivo como regra operacional para agentes.

## 1) Fonte de verdade

DO
- Tratar `PRD.md` como fonte de verdade de negocio.
- Tratar documentacao oficial (via Context7) como fonte de verdade tecnica.
- Registrar qualquer conflito entre implementacao e PRD nas notas da task.

DONT
- Inventar regra de negocio fora do PRD.
- Assumir comportamento de biblioteca sem validar quando houver duvida.

## 2) Stack obrigatoria

DO
- Usar Next.js 16+ com App Router (`/app`).
- Usar TypeScript strict.
- Usar Prisma com Neon Postgres.
- Usar Auth0 (`@auth0/nextjs-auth0`) para autenticacao.

DONT
- Criar novas features em `/pages`.
- Introduzir outra solucao de auth sem decisao explicita.

## 3) Estrutura e separacao de camadas

DO
- Organizar por feature e dominio.
- Manter codigo server-only em `server/*`.
- Usar `import "server-only"` em modulos que nunca podem ir para cliente.
- Centralizar contratos em `lib/types`, `lib/validation`, `lib/constants`.

DONT
- Misturar UI, regra de negocio e acesso a dados no mesmo modulo.
- Importar codigo `server/*` dentro de componentes client.

## 4) Server Components e Client Components

DO
- Usar Server Components por padrao.
- Marcar `"use client"` apenas para hooks/estado, eventos, browser APIs ou libs client-only.
- Manter componentes client pequenos (ilhas interativas).

DONT
- Transformar paginas inteiras em client sem necessidade real.
- Enviar segredos ou dados sensiveis para bundle cliente.

## 5) Prisma + Neon (dados)

DO
- Acessar banco apenas por `server/repos/*`.
- Implementar regra de negocio em `server/services/*`.
- Manter `PrismaClient` singleton server-side.
- Usar transacao em operacoes multi-entidade.
- Retornar DTO de dominio estavel para UI/API.

DONT
- Consultar Prisma diretamente de `page.tsx`, `layout.tsx` ou componentes de UI.
- Expor registro cru de banco para o frontend quando houver regra de dominio.

## 6) Mutacoes (Server Action vs Route Handler)

DO
- Usar Server Actions para mutacoes acopladas a formulario React.
- Usar `app/api/*` para webhooks, integracoes e APIs externas.
- Seguir sempre esta ordem: validar -> autenticar -> autorizar -> mutar -> revalidar -> responder.
- Retornar resultado tipado seguro (`{ ok: true, data } | { ok: false, error }`).

DONT
- Executar mutacao sem validacao de input.
- Retornar erro interno bruto para cliente.

## 7) Cache e revalidacao

DO
- Definir estrategia de cache explicitamente em toda leitura.
- Usar `no-store` para dados privados por usuario.
- Usar tags/TTL para dados compartilhados.
- Revalidar com `revalidateTag`/`revalidatePath` apos mutacoes.

DONT
- Permitir cache acidental de dados privados.
- Tratar cache apenas como performance; cache tambem e corretude.

## 8) Auth0 (authn/authz)

DO
- Centralizar integracao em `lib/auth0.ts`.
- Ler sessao no servidor com `auth0.getSession(...)`.
- Proteger rotas/paginas no servidor (middleware + protecao oficial).
- Enforcar autorizacao na camada de servico.

DONT
- Confiar em `userId`, `role`, `price` ou flags vindas do cliente.
- Implementar auth de senha local em paralelo ao Auth0 sem decisao de produto.

## 9) Seguranca

DO
- Validar input externo com Zod.
- Aplicar rate limit em endpoints sensiveis.
- Aplicar headers de seguranca.
- Redigir logs sem segredos (tokens, cookies, headers de auth).
- Validar env vars obrigatorias no startup.

DONT
- Exibir stack trace interno em producao.
- Logar dados sensiveis.

## 10) Regras obrigatorias do PRD

DO
- Respeitar status de usuario: `ACTIVE | INACTIVE | DELETED`.
- Implementar politica de inatividade:
  - 7 dias sem login: aviso.
  - 12 dias: `INACTIVE` + aviso.
  - 19 dias: exclusao permanente + aviso final.
- Impor validacoes de cartao:
  - `closing_day` 1..28.
  - `due_day` 1..31.
- Impor validacoes de transacao:
  - `amount_cents > 0`.
  - `type=CARD` exige `card_id`.
- Implementar statements com:
  - criacao automatica por periodo.
  - status `OPEN | CLOSED | PAID`.
  - indice unico `(user_id, card_id, period_year, period_month)`.
  - recalc total apos cada transacao.
- Aplicar regra de periodo:
  - compra `<= closing_day` -> mes atual.
  - compra `> closing_day` -> mes seguinte.
- No MVP, mostrar totais separados por moeda (sem conversao automatica).

DONT
- Armazenar numero completo de cartao.
- Armazenar CVV.
- Misturar moedas no mesmo total agregado sem separacao.

## 11) UX, performance e acessibilidade

DO
- Usar `next/image` para imagens quando aplicavel.
- Usar Suspense/streaming para trechos lentos.
- Evitar over-fetching (buscar no servidor e repassar props).
- Garantir acessibilidade basica: labels, foco, teclado, semantica.

DONT
- Enviar bibliotecas pesadas para cliente sem necessidade.
- Deixar fluxo critico sem fallback de carregamento/erro.

## 12) Erros, logs e observabilidade

DO
- Implementar `error.tsx` e `not-found.tsx` nos segmentos relevantes.
- Logar contexto minimo: rota, duracao, resultado, request id.
- Monitorar eventos criticos (auth, mutacoes sensiveis).

DONT
- Expor detalhes internos de excecao para usuario final.

## 13) Tipagem, lint, testes e CI

DO
- Evitar `any`; quando inevitavel, justificar com comentario e tarefa de remocao.
- Usar `unknown` + validacao para dados externos.
- Manter lockfile commitado.
- Exigir CI verde para merge: `lint`, `typecheck`, `test`, `build`.
- Cobrir com:
  - unit tests para funcoes/servicos.
  - integration para actions/handlers.
  - e2e para fluxos criticos.

DONT
- Mergear PR com testes/checks quebrados.
- Aceitar mudanca de regra de negocio sem teste.

## 14) Padrao para documentacao de TASKS (futuro)

DO
- Criar uma task por unidade de negocio (ex: cartoes, statements, inatividade).
- Em cada task, documentar explicitamente:
  - contexto de negocio (referencia ao PRD).
  - escopo (in/out).
  - contrato tecnico (inputs, outputs, schema, auth, cache).
  - criterio de aceite testavel.
  - plano de testes.
  - riscos e rollback.
- Manter rastreabilidade: task -> PR -> testes -> release notes.

DONT
- Misturar varias features nao relacionadas na mesma task.
- Fechar task sem criterio de aceite verificavel.

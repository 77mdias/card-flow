# Sprint Planning (Inicial)

Baseado no roadmap tecnico do PRD.
Cadencia sugerida: 2 semanas por sprint.

## Sprint 01 - Base + Auth
- objetivo: base do projeto com autenticacao e usuario.
- entregas:
  - estrutura de pastas alinhada ao AGENTS.
  - integracao Auth0 (login/logout/callback/session).
  - modelo de usuario e persistencia inicial.
  - protecao de rotas privadas.
- riscos:
  - configuracao incorreta de sessao/cookies.
  - mismatch entre identidade Auth0 e modelo interno.

## Sprint 02 - Cartoes + Statements Base
- objetivo: CRUD de cartoes e estrutura inicial de statements.
- entregas:
  - CRUD de cartoes com validacoes.
  - proibicao de armazenamento de dados sensiveis.
  - criacao/consulta de statements por periodo.
- riscos:
  - regras de fechamento/vencimento mal validadas.

## Sprint 03 - Transacoes + Calculo Automatico
- objetivo: lancamento de gastos e vinculacao automatica da fatura.
- entregas:
  - CRUD de transacoes (CARD/PIX/CASH).
  - regra de periodo por `closing_day`.
  - recalc de total de statement apos mutacao.
- riscos:
  - inconsistencias em concorrencia de escrita.

## Sprint 04 - Dashboard Multi-Moeda
- objetivo: visao consolidada por moeda.
- entregas:
  - totais por moeda.
  - faturas abertas.
  - ultimas transacoes.
  - marcar statement como paga.
- riscos:
  - cache indevido de dados privados.

## Sprint 05 - Politica de Inatividade
- objetivo: automacao de inatividade e ciclo de desativacao/exclusao.
- entregas:
  - job diario (cron) para regras de dia 7, 12 e 19.
  - envio de emails de notificacao.
  - soft delete antes do hard delete.
- riscos:
  - deletar conta fora da janela correta.

# Debitos Tecnicos Iniciais

## Debt 001 - Estrutura padrao de logs
- impacto: medio
- risco: baixa rastreabilidade de incidentes.
- acao sugerida: adotar logger estruturado com request id e contexto.
- alvo: sprint 01

## Debt 002 - Contratos de erro padronizados
- impacto: medio
- risco: respostas inconsistentes entre handlers/actions.
- acao sugerida: criar envelope de erro padrao e helpers.
- alvo: sprint 02

## Debt 003 - Suite inicial de e2e
- impacto: alto
- risco: regressao em fluxos criticos sem deteccao.
- acao sugerida: criar baseline e2e para auth e fluxo core.
- alvo: sprint 03

## Debt 004 - Observabilidade de jobs
- impacto: alto
- risco: falhas silenciosas em politica de inatividade.
- acao sugerida: metricas/alertas para cron e envio de email.
- alvo: sprint 05

## Debt 005 - Politica de backup/restore documentada
- impacto: alto
- risco: recuperacao lenta em incidente de dados.
- acao sugerida: documento de operacao para backup e restore Neon.
- alvo: sprint 02

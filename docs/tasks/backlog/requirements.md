# Requisitos Nao Priorizados

## Seguranca
- Endurecimento de CSP por rota.
- Politica de retencao de logs com mascaramento validado.
- Auditoria de eventos sensiveis com trilha imutavel.

## Performance
- Meta de dashboard abaixo de 1s em p95 em ambiente de producao.
- Estrategia de cache de leitura por agregados nao sensiveis.
- Plano de benchmark para consultas de statements/transacoes.

## Dados
- Estrategia de arquivamento para contas DELETED.
- Politica de backup e restore documentada para Neon.
- Padrao de versionamento de schema e rollback de migration.

## Produto
- Politica de moeda primaria por usuario.
- Definicao de limites de uso por plano (futuro SaaS pago).
- Internacionalizacao de interface (pt-BR/en-US).

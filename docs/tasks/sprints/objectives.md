# Objetivos Iniciais

## Objetivos de produto (MVP)
1. Permitir cadastro/autenticacao segura com conta verificada.
2. Permitir gestao de cartoes sem armazenar dados sensiveis.
3. Automatizar criacao e atualizacao de statements.
4. Entregar dashboard objetivo com totais por moeda.
5. Aplicar politica de inatividade com comunicacao por email.

## Objetivos tecnicos
1. Garantir boundaries server/client em 100% das features novas.
2. Garantir validacao de input em 100% das mutacoes.
3. Garantir authz server-side em 100% das rotas privadas.
4. Garantir build, lint, typecheck e testes verdes no CI.

## Objetivos de qualidade
1. Cobrir servicos criticos com testes unitarios.
2. Cobrir actions/handlers com testes de integracao.
3. Cobrir fluxo critico com e2e (auth, cartoes, transacoes, statements).


---

# 📄 PRD — CardFlow (Nome provisório)

---

# 1. Visão do Produto

CardFlow é um mini-SaaS para gerenciamento simples e seguro de cartões de crédito, faturas e gastos mensais (cartão + Pix/dinheiro), com suporte multi-moeda.

O foco é:

* Controle claro das faturas abertas
* Transparência do total mensal
* Segurança e privacidade
* UX simples e objetiva

Não é uma plataforma contábil. É um sistema de controle pessoal otimizado.

---

# 2. Objetivos do MVP

### Objetivos principais

1. Usuário cadastra conta com email verificado
2. Cadastra cartões (sem dados sensíveis reais)
3. Sistema gera e organiza faturas por período
4. Usuário lança gastos automaticamente vinculados
5. Visualiza resumo mensal consolidado multi-moeda
6. Sistema gerencia inatividade com aviso e reativação

---

# 3. Fluxo de Autenticação e Segurança

## 3.1 Cadastro

Fluxo:

1. Usuário inicia cadastro/login pela aplicação
2. Aplicação redireciona para o Auth0 Universal Login
3. Usuário conclui cadastro/autenticação no Auth0
4. Auth0 valida/verifica email conforme política configurada
5. Aplicação sincroniza/ativa conta interna

### Regras

* Autenticação gerenciada por **Auth0**
* Apenas email verificado pode acessar a aplicação
* Email único no banco interno
* Identidade externa vinculada por `auth_subject` (sub do provedor)

---

## 3.2 Login

* Login centralizado no Auth0
* Apenas email verificado pode logar
* Sessão via cookie httpOnly
* Rotação de token
* Rate limit por IP + por email

---

## 3.3 Política de Inatividade

### Definição de Inatividade:

7 dias sem login.

### Fluxo:

Dia 7:

* Email enviado:

  > “Sua conta será desativada em 5 dias por inatividade.”

Dia 12:

* Conta muda status para `INACTIVE`
* Email:

  > “Sua conta foi desativada. Você tem 7 dias para reativar.”

Dia 19:

* Se não reativada → exclusão permanente
* Email final notificando exclusão

### Implementação técnica:

* Campo `status` enum: ACTIVE | INACTIVE | DELETED
* Campo `last_login_at`
* Cron diário via Vercel

---

# 4. Modelagem de Dados (Postgres — Neon)

---

## Tabela: users

* id (uuid)
* auth_provider (varchar)
* auth_subject (unique)
* email (unique)
* email_verified (boolean)
* status (enum)
* last_login_at
* created_at
* deleted_at nullable

---

## Tabela: cards

* id (uuid)
* user_id (fk)
* nickname
* brand
* last4
* closing_day (int)
* due_day (int)
* currency (varchar 3)
* created_at

⚠ Não armazenar número completo.
⚠ Não armazenar CVV.

---

## Tabela: statements (faturas)

* id (uuid)
* user_id
* card_id
* period_year
* period_month
* currency
* status (OPEN | CLOSED | PAID)
* total_cents
* created_at

Índice único:
(user_id, card_id, period_year, period_month)

---

## Tabela: transactions

* id (uuid)
* user_id
* type (CARD | PIX | CASH)
* amount_cents (bigint)
* currency (varchar 3)
* description
* date
* card_id nullable
* statement_id nullable
* created_at

---

# 5. Regras de Negócio

---

# 5.1 Cálculo Automático de Fatura

Quando usuário cria um gasto do tipo CARD:

1. Seleciona cartão
2. Informa data da compra
3. Sistema verifica closing_day

### Regra:

Se:
data_compra <= dia_fechamento
→ pertence à fatura do mês atual

Se:
data_compra > dia_fechamento
→ pertence à fatura do mês seguinte

Exemplo:
Fechamento dia 20
Compra dia 22/02
→ entra na fatura de março

Se não existir fatura para aquele período:
→ sistema cria automaticamente

---

# 5.2 Multi-moeda

Cada:

* Cartão tem moeda própria
* Transação tem moeda explícita

### Conversão?

MVP:
Sem conversão automática.

Dashboard:

* Agrupar por moeda
* Exibir totais separados

Exemplo:
BRL:

* Cartão: R$ 2.000
* Pix: R$ 300

USD:

* Cartão: $500

Versão futura:

* API de câmbio para conversão dinâmica

---

# 6. Funcionalidades do MVP

---

## 6.1 Dashboard

Exibe:

* Totais por moeda
* Faturas abertas
* Últimas 10 transações
* Status de cada fatura
* Botão “Marcar como paga”

---

## 6.2 Gestão de Cartões

CRUD completo:

* Criar
* Editar
* Excluir
* Visualizar histórico de faturas

Validações:

* closing_day entre 1 e 28
* due_day entre 1 e 31

---

## 6.3 Faturas

* Criadas automaticamente
* Podem ser:

  * OPEN
  * CLOSED
  * PAID
* Totais recalculados a cada transação

---

## 6.4 Transações

Campos:

* Valor
* Moeda
* Tipo
* Data
* Descrição

Validação:

* amount_cents > 0
* Se tipo CARD → card obrigatório

---

# 7. Requisitos Não-Funcionais

---

## Segurança

* Auth0 (`@auth0/nextjs-auth0`)
* Rate limiting
* CSRF protection
* Secure headers
* Sanitização de inputs
* Logs sem dados sensíveis

---

## Performance

* Dashboard < 1 segundo
* Índices adequados no banco
* Queries agregadas eficientes

---

## Confiabilidade

* Migrations versionadas
* Backup Neon
* Soft delete antes de hard delete

---

# 8. Arquitetura Técnica

---

## Stack

* Next.js (App Router)
* TypeScript
* Tailwind
* Neon Postgres
* Prisma ou Drizzle
* Auth0 (`@auth0/nextjs-auth0`)
* Vercel

---

## Estrutura recomendada

```
/app
  /dashboard
  /cards
  /statements
  /settings
/api
/services
/db
/lib/security
```

---

# 9. Fluxo UX

---

## Novo usuário

1. Cadastro
2. Verificação email
3. Criar primeiro cartão
4. Lançar primeiro gasto
5. Ver dashboard

---

## Usuário recorrente

1. Login
2. Dashboard mostra:

   * Faturas abertas
   * Totais
3. Lançar novo gasto
4. Marcar fatura como paga

---

# 10. Roadmap Técnico (Sprints)

---

## Sprint 1 — Base

* Setup projeto
* Auth com verificação email
* CRUD usuários

## Sprint 2 — Cartões

* CRUD cartões
* Estrutura de faturas

## Sprint 3 — Transações

* Lançamento automático
* Cálculo automático de fatura

## Sprint 4 — Dashboard

* Resumo multi-moeda
* Totais agregados

## Sprint 5 — Política de Inatividade

* Cron
* Emails automáticos
* Soft delete
* Hard delete

---

# 11. Riscos e Pontos Críticos

1. Exclusão automática pode gerar insatisfação
2. Multi-moeda aumenta complexidade de agregação
3. Email delivery precisa ser confiável (Resend recomendado)

---

# 12. Próximo Nível (Futuro)

* Parcelamento automático
* Categorias e orçamento mensal
* Gráficos
* App mobile
* Open Finance
* Exportação CSV/PDF
* Sistema de assinatura (Stripe)

---

# Conclusão Estratégica

Você está criando:

Um SaaS enxuto, viável, com:

* Segurança adequada
* Escalabilidade real
* Complexidade controlada
* Arquitetura moderna
* Modelo expandível

Next.js + Neon + Vercel é mais do que suficiente para o MVP.

---

Se quiser, posso agora:

1. Criar o **schema SQL completo pronto para rodar**
2. Criar a **estrutura inicial de pastas + arquitetura ideal**
3. Gerar um **roadmap técnico com tasks no formato de Jira**
4. Criar o **fluxo de cálculo da fatura em pseudocódigo avançado**
5. Criar um **plano de monetização futuro**

Qual desses você quer aprofundar primeiro?

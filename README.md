# CardFlow

Fundacao do MVP com Next.js App Router, Auth0 e Prisma (Neon Postgres).

## Requisitos

- Node.js 20+
- Bun 1.1+
- Banco Postgres (Neon recomendado)
- Tenant Auth0 configurado com callback/logout URLs

## Setup rapido

1. Instale dependencias:

```bash
bun install
```

2. Configure variaveis de ambiente:

```bash
cp .env.example .env.local
```

3. Gere o client do Prisma:

```bash
bun run prisma:generate
```

4. Rode migrations:

```bash
bun run prisma:migrate:dev
```

5. Suba a aplicacao:

```bash
bun run dev
```

## Scripts

- `bun run dev`: inicia em desenvolvimento
- `bun run build`: build de producao
- `bun run start`: inicia build de producao
- `bun run lint`: lint
- `bun run typecheck`: checagem TypeScript
- `bun run test`: testes unit e integration (Vitest)
- `bun run test:e2e`: testes e2e (Playwright)
- `bun run prisma:generate`: gera Prisma Client
- `bun run prisma:migrate:dev`: cria/aplica migration local
- `bun run prisma:migrate:deploy`: aplica migration em ambiente alvo

## Fluxo de autenticacao

- Login: `/auth/login`
- Logout: `/auth/logout`
- Callback: `/auth/callback`
- Pagina privada principal: `/dashboard`
- Endpoint privado de sessao: `/api/private/session`

## Observacoes de seguranca

- Sessao e validacao de auth sempre no servidor
- Dados privados com estrategia `no-store`
- Bloqueio server-side para usuarios `INACTIVE` e `DELETED`
- Variaveis obrigatorias validadas no startup

# CardFlow

Fundacao do MVP com Next.js App Router, Better Auth e Prisma (Neon Postgres).

## Requisitos

- Node.js 20+
- Bun 1.1+
- Banco Postgres (Neon recomendado)

## Setup rapido

1. Instale dependencias:

```bash
bun install
```

2. Configure variaveis de ambiente:

```bash
cp .env.example .env.local
```

Para Neon (pooler), mantenha `DATABASE_URL` com `connect_timeout` para reduzir falhas
intermitentes em comandos do Prisma (`migrate`, `status`, `studio`), por exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&channel_binding=require&connect_timeout=15"
```

Para maior robustez, configure tambem `DIRECT_URL` (host direto, sem pooler) para
comandos administrativos do Prisma:

```env
DIRECT_URL="postgresql://USER:PASSWORD@HOST-DIRECT:5432/DATABASE?sslmode=require&connect_timeout=15"
```

Convencao usada no projeto:
- `DATABASE_URL`: runtime da aplicacao (queries do Prisma Client em requests).
- `DIRECT_URL`: migrations e comandos admin (`migrate`, `status`, `studio`).

Para autenticacao e verificacao de email via Better Auth + Nodemailer, configure:

```env
BETTER_AUTH_SECRET="use-openssl-rand-hex-32"
SMTP_HOST="smtp.provider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="smtp-username"
SMTP_PASS="smtp-password"
SMTP_FROM="CardFlow <noreply@77code.com.br>"
SMTP_REPLY_TO="suporte@77code.com.br"
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
- `bun run prisma:migrate:status`: status das migrations no banco alvo
- `bun run prisma:studio`: abre Prisma Studio
- `bun run auth:schema:generate`: regenera modelos de auth no `schema.prisma` via Better Auth CLI

## Fluxo de autenticacao

- Login: `/auth/login`
- Cadastro: `/auth/register`
- Logout: `/auth/logout?returnTo=/`
- Pagina privada principal: `/dashboard`
- Rotas da API de auth: `/api/auth/*`
- Endpoint privado de sessao: `/api/private/session`
- Pagina de email pendente: `/email-verification-required` (com reenvio via backend)
- Endpoint privado de exclusao sincronizada de conta: `DELETE /api/private/account` (remocao no Better Auth + banco local)

## Prisma + Better Auth

O schema de auth foi gerado pelo Better Auth CLI com `lib/auth-cli.ts` e inclui:
- `auth_users`
- `auth_sessions`
- `auth_accounts`
- `auth_verifications`

Se precisar regenerar o schema de auth:

```bash
bunx @better-auth/cli@latest generate --config lib/auth-cli.ts --yes
```

Depois rode migration normalmente:

```bash
bun run prisma:migrate:dev
```

## Observacoes de seguranca

- Sessao e validacao de auth sempre no servidor
- Dados privados com estrategia `no-store`
- Bloqueio server-side para usuarios `INACTIVE` e `DELETED`
- Variaveis obrigatorias validadas no startup

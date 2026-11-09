# TuManera Hub

Loja, estúdio de personalização DTF, atendimento WhatsApp e gestão da TuManera Co. em uma única plataforma.

Plano de arquitetura e roadmap: https://claude.ai/artifact/HPMrLmAZ52erhk2mWXUTXb

## Estado atual: Fase 0 (fundação)

| Área | O que existe |
| --- | --- |
| Loja | Home, catálogo por categoria e página de cada categoria com a tabela de preços de cada modelo |
| Estúdio (`/estudio`) | Escolha de peça, cor e áreas de estampa; upload da arte com aviso de dpi e fundo; arrastar para posicionar; preço por faixa de quantidade; envio do resumo pelo WhatsApp |
| DTF por metro (`/dtf-por-metro`) | Calculadora por comprimento da folha |
| Collabs | Página de captação e vitrine demonstrativa em `marca.tumanera.com.br` (via `src/proxy.ts`) |
| Painel (`/painel`) | Esqueleto com os módulos de todas as fases |
| Banco | Esquema multi-tenant em `src/db/schema.ts`, migration em `drizzle/`, Row Level Security em `drizzle/rls.sql` |

## Preços

Os preços vêm da tabela oficial **v5** (`data/tabela-precos-v5.csv`): 34 modelos em 10 categorias, preço por peça por faixa de quantidade e tamanho da arte (sem estampa, A6 a A2), já com uma estampa incluída.

Para atualizar: troque o CSV (mesmas colunas, separador `;`) e rode `npm run precos`, que regenera `src/data/tabela-precos.json`.

Regras assumidas no estúdio, a confirmar com a TuManera:
- Cada estampa adicional soma a diferença (preço com a arte − preço sem estampa) da mesma faixa.
- Peça enviada pelo cliente cobra só essas diferenças.
- Áreas de estampa e tamanho máximo por área estão em `src/lib/catalog.ts`.
- DTF por metro ainda usa preço de exemplo (não está na tabela v5).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # testes de preço e de resolução de subdomínio
npm run build
```

Para testar uma subloja de collab: abra `http://minhamarca.localhost:3000`.

## Banco de dados (quando for ligar)

1. Criar o projeto no Supabase e copiar a connection string para `.env.local` (ver `.env.example`).
2. `npx drizzle-kit migrate` para criar as tabelas.
3. Rodar `drizzle/rls.sql` no SQL Editor do Supabase.

## Stack

Next.js 16 (App Router, Turbopack, Cache Components) · TypeScript · Tailwind CSS 4 · Drizzle ORM + PostgreSQL (Supabase) · Vitest.

Integrações previstas: WhatsApp Cloud API (coexistência com o app WhatsApp Business), Mercado Pago ou Pagar.me com split, Melhor Envio, Focus NFe ou NFE.io para NF-e e NFS-e (Simples Nacional, venda mista de produto e serviço).

## Estrutura

```
src/
  app/(loja)/       páginas públicas (home, produtos, estúdio, DTF, collabs, blog)
  app/c/[tenant]/   vitrine de cada collab (reescrita pelo proxy a partir do subdomínio)
  app/painel/       painel interno
  components/       Mockup (peças em SVG), cabeçalho/rodapé, Reveal (animação)
  db/               esquema Drizzle e cliente
  lib/              catálogo, preços, tenant, WhatsApp
  proxy.ts          subdomínio -> tenant
drizzle/            migrations e políticas RLS
```

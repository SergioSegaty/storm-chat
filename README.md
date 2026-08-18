# Storm Chat

A study project exploring what a production-ready **RAG (Retrieval-Augmented Generation) chatbot** looks like end to end — frontend, backend, ingestion pipeline, and streamed LLM responses via the **Vercel AI SDK** and the **Claude API**.

This is not a product. It's a learning ground for understanding how the pieces of a real RAG system fit together: parsing source documents, chunking, embedding, vector search, retrieval, and grounding an LLM's streamed answer in that retrieved context — deployed the way a real app would be.

## Goals

- Understand each layer of a RAG pipeline in isolation, with clean boundaries between them.
- Use the **Vercel AI SDK** to stream Claude responses to the frontend.
- Keep the ingestion layer format-agnostic, starting with PDF and Markdown.
- Structure the codebase so each layer (ingestion, chunking, embedding, vector store, retrieval) could be swapped or scaled independently, the way it would need to be in production.
- Ship it like a real project: separately deployed frontend/backend, wired up to CI/CD.

## Architecture

The RAG pipeline is broken into distinct layers, each with a single responsibility:

```
                 ┌─────────────────────────────────────────────────────────┐
                 │                  Frontend (Vercel)                        │
                 │        Chat UI · streams Claude's response token by      │
                 │           token via the Vercel AI SDK's useChat          │
                 └───────────────────────────┬─────────────────────────────┘
                                              │
                 ┌───────────────────────────▼─────────────────────────────┐
                 │                  Backend (Render)                         │
                 │        API routes · orchestrates retrieval + Claude      │
                 └───────────────────────────┬─────────────────────────────┘
                                              │
        ┌──────────────┬──────────────┬──────▼───────┬──────────────┐
        │  1. Ingestion │ 2. Chunking  │ 3. Embedding │ 4. Vector    │
        │     Layer     │    Layer     │    Layer     │   Store      │
        │  parses PDF   │  splits docs │  Voyage AI   │  Supabase    │
        │  and MD files │  into chunks │  embeddings  │  pgvector    │
        └──────────────┴──────────────┴──────────────┴──────┬───────┘
                                                              │
                 ┌───────────────────────────────────────────▼─────────────┐
                 │                     5. Retrieval Layer                   │
                 │      similarity search → relevant chunks as context      │
                 └───────────────────────────┬───────────────────────────-─┘
                                              │
                 ┌───────────────────────────▼─────────────────────────────┐
                 │                       Claude API                         │
                 │      context + user question → streamed response        │
                 └────────────────────────────────────────────────────────-┘
```

### Layers

1. **Ingestion Layer** — reads raw source files (PDF, Markdown to start) and normalizes them into plain text with metadata (source, page, etc.).
2. **Chunking Layer** — splits normalized documents into retrieval-sized chunks, preserving enough context per chunk to be useful on its own.
3. **Embedding Layer** — converts each chunk into a vector embedding using **Voyage AI**.
4. **Vector Store** — **Supabase (Postgres + pgvector)** persists embeddings and serves similarity search.
5. **Retrieval Layer** — takes a user query, embeds it via Voyage AI, searches pgvector, and returns the most relevant chunks.
6. **Generation** — the retrieved chunks are injected as context into a prompt sent to the **Claude API**, whose response is streamed back to the frontend through the Vercel AI SDK.

## Project structure

This is a pnpm monorepo.

```
storm-chat/
├── packages/
│   ├── server/       # Backend: API routes, RAG pipeline orchestration, Claude API integration
│   │   └── Dockerfile   # Deployed to Render
│   ├── frontend/     # Frontend: chat interface (Vercel AI SDK), deployed to Vercel
│   └── shared/       # Shared types/utilities used by both frontend and backend
├── .github/
│   └── workflows/    # CI: lint, test, build per package (path-filtered)
├── pnpm-workspace.yaml
└── package.json
```

## Tech stack

| Concern | Choice |
|---|---|
| LLM | Claude API (Anthropic) |
| Streaming / model calls | Vercel AI SDK |
| Embeddings | Voyage AI |
| Vector store | Supabase (Postgres + pgvector) |
| Source formats | PDF, Markdown |
| Frontend hosting | Vercel |
| Backend hosting | Render (Docker) |
| Monorepo | pnpm workspaces |
| CI/CD | GitHub Actions |
| Language | TypeScript |

## CI/CD

GitHub Actions workflows in `.github/workflows/` are path-filtered per package, so a change only triggers the relevant pipeline:

- `frontend.yml` — runs on changes to `packages/frontend`, `packages/shared`: build `shared` → lint → test → build.
- `server.yml` — runs on changes to `packages/server`, `packages/shared`: build `shared` → lint → test → build.

Deployment: Vercel deploys the `frontend` package directly from the repo; Render builds and deploys the `server` package's `Dockerfile`.

## Status

🚧 Early scaffolding. The monorepo layout (`server`, `frontend`, `shared`) and CI workflows exist; the ingestion → chunking → embedding → vector store → retrieval pipeline and the Claude streaming integration are being built out layer by layer.

## Getting started

```bash
pnpm install

# Run the backend
pnpm dev:backend

# Run the frontend
pnpm dev:frontend
```

You'll need the following environment variables once each layer is wired up:

```bash
ANTHROPIC_API_KEY=      # Claude API
VOYAGE_API_KEY=         # Voyage AI embeddings
SUPABASE_URL=           # Supabase project URL
SUPABASE_SERVICE_KEY=   # Supabase service role key (backend only)
```

## Other scripts

```bash
pnpm build   # builds shared first, then the rest of the workspace
pnpm lint    # lint all packages
pnpm test    # test all packages
```
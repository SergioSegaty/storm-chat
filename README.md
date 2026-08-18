# Storm Chat

A study project exploring what a production-ready **RAG (Retrieval-Augmented Generation) chatbot** looks like end to end — frontend, backend, ingestion pipeline, and streamed LLM responses via the **Vercel AI SDK** and the **Claude API**.

This is not a product. It's a learning ground for understanding how the pieces of a real RAG system fit together: parsing source documents, chunking, embedding, vector search, retrieval, and grounding an LLM's streamed answer in that retrieved context.

## Goals

- Understand each layer of a RAG pipeline in isolation, with clean boundaries between them.
- Use the **Vercel AI SDK** to stream Claude responses to the frontend.
- Keep the ingestion layer format-agnostic, starting with PDF and Markdown.
- Structure the codebase so each layer (ingestion, chunking, embedding, vector store, retrieval) could be swapped or scaled independently, the way it would need to be in production.

## Architecture

The RAG pipeline is broken into distinct layers, each with a single responsibility:

```
                 ┌─────────────────────────────────────────────────────────┐
                 │                        Frontend                          │
                 │        Chat UI · streams Claude's response token by      │
                 │           token via the Vercel AI SDK's useChat          │
                 └───────────────────────────┬─────────────────────────────┘
                                              │
                 ┌───────────────────────────▼─────────────────────────────┐
                 │                         Backend                          │
                 │        API routes · orchestrates retrieval + Claude      │
                 └───────────────────────────┬─────────────────────────────┘
                                              │
        ┌──────────────┬──────────────┬──────▼───────┬──────────────┐
        │  1. Ingestion │ 2. Chunking  │ 3. Embedding │ 4. Vector    │
        │     Layer     │    Layer     │    Layer     │   Store      │
        │  parses PDF   │  splits docs │  turns chunks│  persists +  │
        │  and MD files │  into chunks │  into vectors│  indexes     │
        │               │              │              │  embeddings  │
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
3. **Embedding Layer** — converts each chunk into a vector embedding.
4. **Vector Store** — persists embeddings and supports similarity search over them.
5. **Retrieval Layer** — takes a user query, embeds it, searches the vector store, and returns the most relevant chunks.
6. **Generation** — the retrieved chunks are injected as context into a prompt sent to the **Claude API**, whose response is streamed back to the frontend through the Vercel AI SDK.

## Project structure

This is a pnpm monorepo. The packages are scaffolding for the layers above and are still being built out.

```
storm-chat/
├── packages/
│   ├── server/     # Backend: API routes, RAG pipeline orchestration, Claude API integration
│   ├── ui/          # Frontend: chat interface (Vercel AI SDK)
│   └── shared/      # Shared types/utilities used by both frontend and backend
├── pnpm-workspace.yaml
└── package.json
```

## Tech stack

- **Vercel AI SDK** — model calls and response streaming
- **Claude API (Anthropic)** — the LLM powering responses
- **TypeScript** across the stack
- **pnpm workspaces** for the monorepo

The specific vector store and embedding provider are still being decided as part of this study — see [Status](#status).

## Status

🚧 Early scaffolding. The monorepo layout (`server`, `ui`, `shared`) exists; the ingestion → chunking → embedding → vector store → retrieval pipeline and the Claude streaming integration are being built out layer by layer.

## Getting started

```bash
pnpm install

# Run the backend
pnpm dev:backend

# Run the frontend
pnpm dev:frontend
```

You'll need an Anthropic API key for the Claude API. Copy it into a `.env.local` file in the relevant package once the backend's environment configuration is in place (e.g. `ANTHROPIC_API_KEY=...`).

## Other scripts

```bash
pnpm build   # builds shared first, then the rest of the workspace
pnpm lint    # lint all packages
pnpm test    # test all packages
```

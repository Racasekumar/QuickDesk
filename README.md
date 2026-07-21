# QuickDesk — AI‑Assisted Helpdesk

## Overview
QuickDesk is an internal helpdesk application that uses an LLM (Groq) to assist support agents. It supports authentication, ticket submission with AI classification, RAG‑based draft replies, and real‑time updates.

## Tech Stack
- **Frontend**: Next.js + TypeScript
- **Backend**: FastAPI
- **Database**: SQLite (via SQLAlchemy)
- **Auth**: JWT with bcrypt password hashing
- **LLM**: Groq
- **RAG**: LangChain + Pinecone vector database
- **Real‑time**: Server‑Sent Events (SSE)

## Core Features
1. **Authentication & Roles**: Two roles (employee, agent) with JWT‑based auth
2. **Ticket Submission**: Employees submit tickets, which are auto‑classified by AI
3. **Agent Dashboard**: Agents view all tickets with filters/search, and override AI classifications
4. **RAG Draft Replies**: AI generates drafts using internal knowledge base
5. **Real‑time Updates**: SSE pushes new tickets and status changes
6. **Metrics**: Agent‑only metrics page showing statuses, categories, median resolution time, and AI override percentage

## Why SSE for Real‑time?
We chose **SSE** (Server‑Sent Events) over WebSockets because:
- Our use case only requires **server‑to‑client pushes** (no need for client‑to‑server messages)
- SSE is simpler, built on HTTP, and has automatic reconnection
- It’s lightweight and works seamlessly with FastAPI via `sse‑starlette`

#### Improvements 


## How did you structure the RAG 
pipeline?

I used markdown files for the knowledge base articles.also did a chunking as well as use chunk overlap, the recursive character text splitting way.

for embedding i used all-MiniLM-L6-v2 (open source model) also for llm used llama-3.1-8b-instant
for vector db i used pinecone here

#### improvements
I can improve this by using hybrid rag or some graph rag mehanism with reranker if needed to improve the ranking and reall@k good.these are all experiemental.

## How did you handle the case where the LLM returns a category that does not match your allowed list?

I enforced a strict validation layer using Pydantic parsers on the LLM call. If the model hallucinated a category outside [IT, HR, Finance, Admin, Other], the backend programmatically fell back to a default value (Other) and flagged the instance for review. But even i can use a slm to validate the category as well..there are other things which i can do as well.

## What is the worst failure mode in your system today, and what would you do to address it?

The worst failure mode is an API rate-limit exhaustion or outage from the Groq LLM provider during peak ticket submissions. To address this, I would implement a circuit breaker pattern with asynchronous Celery queue fallbacks, allowing tickets to queue up successfully and process AI tagging lazily if the external provider drops.

Rag failure may occure since the chunk sizes are so small, may miss context, but in production i need to look into it.

sructured output failure for query routing as well response drafting get wrong.

## Project Structure
```
QuickDesk/
├── backend/
│   ├── core/              # config, security, dependencies
│   ├── knowledge_base/    # KB articles (markdown)
│   ├── models/            # SQLAlchemy models
│   ├── routers/           # API endpoints (auth, tickets, events, metrics)
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # business logic (AI, RAG, event bus)
│   ├── main.py            # FastAPI entry point
│   └── requirements.txt
└── frontend/              # Next.js app
    └── src/
        ├── app/
        ├── components/
        ├── hooks/
        ├── lib/
        └── types/
```

## Setup

### Backend
1. Navigate to `backend/`
2. Crete python virtual environemnt
`python -m venv venv`
3. Activate the virtual environment
(.\venv\Scripts\Activate.ps1)
4. Create `.env` file (see `.env.example`)

5. Install dependencies: `pip install -r requirements.txt`
6. Seed the SQLite database with default users
python seed.py


7. Seed knowledge base (optional: if you want to use your own api key also you can use your own files): `python seed_kb.py`
8. Run: `uvicorn main:app --reload --port 8000`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run: `npm run dev`

## SQLite Database inspection from terminal(separate terminal)
cd backend
sqlite3 quickdesk.db
.tables
.schema users
SELECT id, full_name, email, role FROM users;

.quit

## Truncate(delete all rows)
DELETE FROM audit_logs;
DELETE FROM tickets;
DELETE FROM users;
.quit


## API Endpoints
- `/auth/register`, `/auth/login`: Authentication
- `/tickets/`: CRUD for tickets (role‑protected)
- `/events/stream`: SSE for real‑time updates
- `/metrics`: Agent‑only metrics dashboard

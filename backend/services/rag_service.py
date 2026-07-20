"""LangGraph RAG service for grounded agent draft replies."""
import os
from pathlib import Path
from typing import TypedDict

from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langgraph.graph import END, START, StateGraph

from core.config import settings

_threads: dict[str, InMemoryChatMessageHistory] = {}
_graph = None
_vector_store: PineconeVectorStore | None = None


class RagUnavailableError(Exception):
    pass


class DraftState(TypedDict):
    title: str
    description: str
    employee_id: int
    ticket_id: int
    query: str
    documents: list
    context: str
    draft: str
    citations: list[dict[str, str]]


def _get_vector_store() -> PineconeVectorStore:
    global _vector_store
    if _vector_store is not None:
        return _vector_store

    if not settings.PINECONE_API_KEY:
        raise RagUnavailableError("PINECONE_API_KEY is not configured")

    # Export to OS env so langchain_pinecone can find it internally
    os.environ["PINECONE_API_KEY"] = settings.PINECONE_API_KEY

    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    _vector_store = PineconeVectorStore.from_existing_index(
        index_name=settings.PINECONE_INDEX_NAME,
        embedding=embeddings,
        namespace=settings.PINECONE_NAMESPACE,
    )
    return _vector_store


def _citations(documents) -> list[dict[str, str]]:
    seen: set[str] = set()
    citations = []
    for document in documents:
        filename = document.metadata.get("filename") or Path(document.metadata.get("source", "article.md")).name
        if filename in seen:
            continue
        seen.add(filename)
        citations.append({
            "title": document.metadata.get("title", Path(filename).stem.replace("_", " ").title()),
            "filename": filename,
            "last_updated": document.metadata.get("last_updated", ""),
        })
    return citations


def _retrieve(state: DraftState) -> DraftState:
    store = _get_vector_store()
    results = store.similarity_search_with_relevance_scores(state["query"], k=3)
    documents = [document for document, score in results if score >= settings.RAG_RELEVANCE_THRESHOLD]
    context = "\n\n".join(document.page_content for document in documents)
    return {
        **state,
        "documents": documents,
        "context": context,
        "citations": _citations(documents),
    }


def _generate(state: DraftState) -> DraftState:
    if not state["documents"]:
        return {
            **state,
            "draft": (
                "I could not find a relevant knowledge-base article for this request. "
                "Please review it manually."
            ),
            "citations": [],
        }

    if not settings.GROQ_API_KEY:
        raise RagUnavailableError("GROQ_API_KEY is not configured")

    thread_id = f"user:{state['employee_id']}:ticket:{state['ticket_id']}"
    history = _threads.setdefault(thread_id, InMemoryChatMessageHistory())

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a helpdesk drafting assistant. Write a concise, helpful draft reply using "
            "only the knowledge-base context. If the context does not answer the ticket, say that "
            "an agent needs to review it. Do not claim actions were completed.",
        ),
        MessagesPlaceholder("history"),
        (
            "human",
            "Knowledge-base context:\n{context}\n\nTicket title: {title}\nTicket description: {description}",
        ),
    ])

    llm = ChatGroq(model=settings.GROQ_MODEL, groq_api_key=settings.GROQ_API_KEY, temperature=0)
    response = llm.invoke(
        prompt.format_messages(
            history=history.messages,
            context=state["context"],
            title=state["title"],
            description=state["description"],
        )
    )
    draft = str(response.content).strip()
    if not draft:
        raise RagUnavailableError("Groq returned an empty draft")

    history.add_user_message(state["query"])
    history.add_ai_message(draft)
    return {**state, "draft": draft}


def _build_graph():
    graph = StateGraph(DraftState)
    graph.add_node("retrieve", _retrieve)
    graph.add_node("generate", _generate)
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    return graph.compile()


def _get_graph():
    global _graph
    if _graph is None:
        _graph = _build_graph()
    return _graph


def generate_draft(title: str, description: str, employee_id: int, ticket_id: int) -> tuple[str, list[dict[str, str]]]:
    """Retrieve KB context via LangGraph and create one grounded draft per ticket thread."""
    query = f"{title}\n{description}"
    result = _get_graph().invoke({
        "title": title,
        "description": description,
        "employee_id": employee_id,
        "ticket_id": ticket_id,
        "query": query,
        "documents": [],
        "context": "",
        "draft": "",
        "citations": [],
    })
    return result["draft"], result["citations"]

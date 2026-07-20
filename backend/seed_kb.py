"""Load Markdown knowledge-base files, split them, and rebuild QuickDesk Pinecone vectors."""
import os
import re
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone

from core.config import settings

KB_DIRECTORY = Path(__file__).parent / "knowledge_base"


def load_documents():
    loader = DirectoryLoader(str(KB_DIRECTORY), glob="**/*.md", loader_cls=TextLoader, loader_kwargs={"encoding": "utf-8"})
    documents = loader.load()
    for document in documents:
        source = Path(document.metadata["source"])
        document.metadata["filename"] = source.name
        document.metadata["title"] = source.stem.replace("_", " ").title()
        match = re.search(r"Last updated:\s*(\d{4}-\d{2}-\d{2})", document.page_content)
        document.metadata["last_updated"] = match.group(1) if match else ""
    return documents


def seed_knowledge_base():
    if not settings.PINECONE_API_KEY:
        raise RuntimeError("PINECONE_API_KEY is required to seed Pinecone")

    # Export to OS env so langchain_pinecone can find it internally
    os.environ["PINECONE_API_KEY"] = settings.PINECONE_API_KEY

    documents = load_documents()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=75)
    chunks = splitter.split_documents(documents)
    for chunk_number, chunk in enumerate(chunks):
        chunk.metadata["chunk_number"] = chunk_number

    embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    pinecone = Pinecone(api_key=settings.PINECONE_API_KEY)
    index = pinecone.Index(settings.PINECONE_INDEX_NAME)

    # Rebuild only this application's namespace, avoiding duplicate chunks.
    try:
        index.delete(delete_all=True, namespace=settings.PINECONE_NAMESPACE)
    except Exception:
        pass  # Namespace doesn't exist yet on a fresh index, nothing to delete
    ids = [f"{chunk.metadata['filename']}:{chunk.metadata['chunk_number']}" for chunk in chunks]
    PineconeVectorStore.from_documents(
        documents=chunks,
        embedding=embeddings,
        index_name=settings.PINECONE_INDEX_NAME,
        namespace=settings.PINECONE_NAMESPACE,
        ids=ids,
        pinecone_api_key=settings.PINECONE_API_KEY,
    )
    print(f"Seeded {len(chunks)} chunks from {len(documents)} Markdown articles.")


if __name__ == "__main__":
    seed_knowledge_base()

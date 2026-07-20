from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from database import Base, engine
from routers import auth, tickets, users

# Create all DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="QuickDesk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])


@app.get("/health")
def health():
    return {"status": "ok"}

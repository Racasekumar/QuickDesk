import logging

from groq import Groq
from pydantic import ValidationError

from core.config import settings
from schemas.ticket import Categorization

logger = logging.getLogger(__name__)

FALLBACK_CATEGORIZATION = Categorization(category="Other", priority="Medium")


def suggest_ticket_details(title: str, description: str) -> Categorization:
    """Ask Groq for JSON, then validate it with Pydantic before saving it."""
    if not settings.GROQ_API_KEY:
        return FALLBACK_CATEGORIZATION

    prompt = f"""Classify this helpdesk ticket.

Return JSON only, with exactly these keys: category and priority.
category must be one of: IT, HR, Finance, Admin, Other.
priority must be one of: Low, Medium, High.

Title: {title}
Description: {description}
"""

    try:
        client = Groq(api_key=settings.GROQ_API_KEY)
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        return Categorization.model_validate_json(content)
    except (ValidationError, ValueError, TypeError) as exc:
        logger.warning("Groq returned invalid categorization JSON: %s", exc)
    except Exception as exc:
        # Ticket submission should still work when the LLM is unavailable.
        logger.warning("Groq categorization failed: %s", exc)

    return FALLBACK_CATEGORIZATION

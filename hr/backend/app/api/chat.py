from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.document import ChatRequest, ChatResponse, SourceItem
from app.services.document_service import search_and_answer

router = APIRouter(prefix="", tags=["Conversational AI & Policy RAG"])

@router.post("/chat", response_model=ChatResponse, summary="Ask HR AI Assistant (Policy RAG & Casual Chat)")
def chat_endpoint(payload: ChatRequest, db: Session = Depends(get_db)):
    """
    Intelligent HR Assistant supporting:
    1. Casual Conversation (Mode 2): Casual greetings and pleasantries ("Hi", "How are you?", "Tell me a joke")
       without forcing document retrieval.
    2. Policy Q&A (Mode 1): Grounded RAG search over knowledge base documents returning answers with verified source citations.
    """
    try:
        result = search_and_answer(payload.question, db)
        sources = [
            SourceItem(
                document=s["document"],
                page=s["page"],
                excerpt=s.get("excerpt")
            )
            for s in result.get("sources", [])
        ]
        return ChatResponse(
            answer=result["answer"],
            sources=sources,
            intent=result.get("intent", "POLICY_RAG")
        )
    except Exception as e:
        return ChatResponse(
            answer="I could not find this information in the available HR documents. Please upload the relevant policy document or contact HR.",
            sources=[],
            intent="POLICY_RAG"
        )

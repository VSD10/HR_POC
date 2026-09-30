"""
Automated test suite for Conversational RAG functionality in rag_application-main.
"""
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.models import ChatRequest, ChatMessage
from backend.services.chat_service import ChatService


def test_conversational_rag():
    service = ChatService()
    print("\n=======================================================")
    print("      Testing Conversational RAG Capabilities")
    print("=======================================================\n")

    # Test 1: Pure Greeting
    print("--- Test 1: Pure Greeting ('Hello! Good morning!') ---")
    req1 = ChatRequest(question="Hello! Good morning!")
    res1 = service.answer_question(req1)
    print(f"Answer: {res1.answer[:120]}...")
    print(f"Sources count: {len(res1.sources)}")
    assert len(res1.sources) == 0, "Pure greeting should not return policy sources!"
    assert "could not find information" not in res1.answer.lower(), "Greeting should not say 'could not find information'!"
    print("PASSED Test 1!\n")

    # Test 2: Capabilities / Identity
    print("--- Test 2: Capabilities Query ('Who are you and what can you help me with?') ---")
    req2 = ChatRequest(question="Who are you and what can you help me with?")
    res2 = service.answer_question(req2)
    print(f"Answer: {res2.answer[:140]}...")
    print(f"Sources count: {len(res2.sources)}")
    assert len(res2.sources) == 0, "Capabilities query should not return policy sources!"
    assert "could not find information" not in res2.answer.lower(), "Capabilities query should not say 'could not find information'!"
    print("PASSED Test 2!\n")

    # Test 3: Grounded Policy Question
    print("--- Test 3: Grounded Policy Question ('How many annual leave days do employees receive?') ---")
    req3 = ChatRequest(question="How many annual leave days do employees receive?")
    res3 = service.answer_question(req3)
    print(f"Answer: {res3.answer[:160]}...")
    print(f"Sources: {[f'{s.document} (p.{s.page})' for s in res3.sources]}")
    assert len(res3.sources) > 0, "Policy inquiry must return policy sources!"
    assert any("leave" in s.document.lower() for s in res3.sources), "Sources must include leave policy!"
    print("PASSED Test 3!\n")

    # Test 4: Multi-turn Follow-up Question with History
    print("--- Test 4: Multi-turn Follow-up ('Can I carry them forward?') ---")
    history = [
        ChatMessage(role="user", content="How many annual leave days do employees receive?"),
        ChatMessage(role="assistant", content=res3.answer),
    ]
    req4 = ChatRequest(question="Can I carry them forward?", history=history)
    res4 = service.answer_question(req4)
    print(f"Answer: {res4.answer[:160]}...")
    print(f"Sources: {[f'{s.document} (p.{s.page})' for s in res4.sources]}")
    assert len(res4.sources) > 0, "Leave carry-over follow-up must return sources!"
    print("PASSED Test 4!\n")

    # Test 5: Out of scope policy
    print("--- Test 5: Missing Policy ('What is the pet insurance policy?') ---")
    req5 = ChatRequest(question="What is the pet insurance policy?")
    res5 = service.answer_question(req5)
    print(f"Answer: {res5.answer[:140]}...")
    print(f"Sources count: {len(res5.sources)}")
    assert len(res5.sources) == 0, "Missing policy must not return misleading sources!"
    print("PASSED Test 5!\n")

    print("=======================================================")
    print("      ALL 5 TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")


if __name__ == "__main__":
    test_conversational_rag()

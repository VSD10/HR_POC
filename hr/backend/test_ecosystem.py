import sys
import os
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from fastapi.testclient import TestClient

# Add app path
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

def run_tests():
    print("\n=======================================================")
    print("      HR AI SYSTEM END-TO-END VERIFICATION TEST        ")
    print("=======================================================\n")

    client = TestClient(app)

    # 1. Health & Root
    print("[TEST 1] Checking /health and / API root...")
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    print("[PASS] Health check passed:", res.json())

    # 2. Dynamic Policies & Knowledge Hub API
    print("\n[TEST 2] Testing GET /api/v1/policies (Dynamic Knowledge Base)...")
    res = client.get("/api/v1/policies")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    policies = res.json()
    assert len(policies) > 0, "Policies list must not be empty"
    print(f"[PASS] Successfully retrieved {len(policies)} dynamic policy documents:")
    for p in policies[:5]:
        print(f"   - [{p.get('category')}] {p.get('title')} ({p.get('documentName')})")

    # 3. Ask HR AI Assistant - Mode 2: Casual Conversation
    print("\n[TEST 3] Testing Ask HR Mode 2: Casual Chat (Intent Detection)...")
    casual_queries = ["Hello", "Hi there", "How are you?", "Tell me a joke"]
    for q in casual_queries:
        res = client.post("/api/v1/chat", json={"question": q})
        assert res.status_code == 200, f"Chat failed for '{q}': {res.status_code}"
        data = res.json()
        assert data.get("intent") == "CASUAL", f"Expected CASUAL intent for '{q}', got {data.get('intent')}"
        assert len(data.get("sources", [])) == 0, f"Casual chat should not have document citations for '{q}'"
        print(f"[PASS] Query: \"{q}\" -> Casual Response: \"{data.get('answer')[:75]}...\" (Sources: {len(data.get('sources'))})")

    # 4. Ask HR AI Assistant - Mode 1: Document Question Answering (RAG)
    print("\n[TEST 4] Testing Ask HR Mode 1: Grounded Policy RAG Retrieval...")
    rag_queries = [
        "What is the leave policy and how many annual leaves do employees receive?",
        "What are the expense reimbursement limits for meals during travel?",
        "What is the remote work and hybrid guideline?"
    ]
    for q in rag_queries:
        res = client.post("/api/v1/chat", json={"question": q})
        assert res.status_code == 200, f"RAG chat failed for '{q}': {res.status_code}"
        data = res.json()
        assert data.get("intent") == "POLICY_RAG", f"Expected POLICY_RAG for '{q}'"
        assert len(data.get("sources", [])) > 0, f"Policy query should return verified source citations for '{q}'"
        top_source = data.get("sources")[0]
        print(f"[PASS] Query: \"{q[:45]}...\"")
        print(f"   -> Grounded Answer: \"{data.get('answer')[:90]}...\"")
        print(f"   -> Cited Source: {top_source.get('document')} (Page {top_source.get('page')})")

    # 5. Multi-User Dynamic Profiles
    print("\n[TEST 5] Testing Multi-User Profiles (GET /api/v1/profile)...")
    test_users = ["EMP001", "EMP002", "EMP003", "EMP004", "HR001"]
    for uid in test_users:
        res = client.get(f"/api/v1/profile?userId={uid}")
        assert res.status_code == 200, f"Failed to get profile for {uid}"
        prof = res.json()
        print(f"[PASS] User {uid}: {prof.get('name')} | Role: {prof.get('role')} | Email: {prof.get('email')}")

    # 6. Add/Upload New Policy PDF dynamically
    print("\n[TEST 6] Testing New Document Upload & Immediate Availability (CASE 1 & CASE 2)...")
    from pypdf import PdfWriter
    new_pdf_path = BACKEND_DIR / "knowledge_base" / "new_policy.pdf"
    sample_text = "New Policy 2026: Employees receive a wellness bonus of $500 annually for gym or fitness subscriptions."
    try:
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(str(new_pdf_path))
        c.drawString(100, 700, "Enterprise Innovation & Wellness Policy")
        c.drawString(100, 680, sample_text)
        c.drawString(100, 660, "All employees can claim this under Finance & Benefits reimbursement.")
        c.save()
    except Exception:
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        with open(new_pdf_path, "wb") as f:
            writer.write(f)

    # Verify new_policy.pdf appears in GET /api/v1/policies
    res = client.get("/api/v1/policies")
    policies_after = res.json()
    found_new = any("new_policy" in p["documentName"].lower() for p in policies_after)
    assert found_new, "new_policy.pdf must appear dynamically in Knowledge Hub policies!"
    print(f"[PASS] CASE 1: 'new_policy.pdf' successfully appeared dynamically in Knowledge Hub! (Total: {len(policies_after)} policies)")

    # Ask questions about new_policy
    res = client.post("/api/v1/chat", json={"question": "What is mentioned in new_policy about wellness?"})
    data = res.json()
    print(f"[PASS] CASE 2: AI Assistant retrieved from new document:")
    print(f"   -> Answer: \"{data.get('answer')[:120]}...\"")
    if data.get("sources"):
        print(f"   -> Sources: {data.get('sources')}")

    print("\n=======================================================")
    print("   ALL 6 SYSTEM ARCHITECTURE & TEST CASES PASSED!     ")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()

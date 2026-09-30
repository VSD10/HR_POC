from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.seed_service import seed_database

def run_all_tests():
    # Explicitly ensure seed
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    with TestClient(app) as client:
        # 1. Health check
        res = client.get("/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        print("[PASS] Health check passed!")

        # 2. Admin Login
        res_admin = client.post("/api/v1/auth/login", json={
            "email": "sarah.jenkins@enterprise.internal",
            "password": "SecretPassword123!"
        })
        assert res_admin.status_code == 200, f"Admin login failed: {res_admin.text}"
        admin_data = res_admin.json()
        assert admin_data["user"]["role"] == "HR_ADMIN"
        admin_token = admin_data["token"]
        print("[PASS] Admin login passed!")

        # 3. Employee Login
        res_emp = client.post("/api/v1/auth/login", json={
            "email": "alex.johnson@enterprise.internal",
            "password": "SecretPassword123!"
        })
        assert res_emp.status_code == 200, f"Employee login failed: {res_emp.text}"
        emp_data = res_emp.json()
        assert emp_data["user"]["role"] == "EMPLOYEE"
        emp_token = emp_data["token"]
        print("[PASS] Employee login passed!")

        # 4. RBAC: Requests filtering
        # HR Admin sees all requests
        res_all_reqs = client.get("/api/v1/requests", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_all_reqs.status_code == 200
        all_reqs = res_all_reqs.json()
        assert len(all_reqs) >= 4, f"Expected at least 4 requests, got {len(all_reqs)}"
        print(f"[PASS] HR Admin sees all requests: {len(all_reqs)} total tickets")

        # Employee Alex sees only his requests
        res_emp_reqs = client.get("/api/v1/requests", headers={"Authorization": f"Bearer {emp_token}"})
        assert res_emp_reqs.status_code == 200
        emp_reqs = res_emp_reqs.json()
        for r in emp_reqs:
            assert r["employee"]["email"] == "alex.johnson@enterprise.internal"
        print(f"[PASS] Employee Alex sees only own requests: {len(emp_reqs)} tickets")

        # 5. RBAC: Triage queue access control
        res_triage_admin = client.get("/api/v1/ai/triage/queue", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_triage_admin.status_code == 200
        print("[PASS] HR Admin authorized for AI triage queue")

        res_triage_emp = client.get("/api/v1/ai/triage/queue", headers={"Authorization": f"Bearer {emp_token}"})
        assert res_triage_emp.status_code == 403, f"Expected 403 Forbidden for employee, got {res_triage_emp.status_code}"
        print("[PASS] Employee correctly blocked from AI triage queue with 403 Forbidden")

        # 6. Copilot Policy Chat
        res_chat = client.post(
            "/api/v1/ai/assist/chat",
            headers={"Authorization": f"Bearer {emp_token}"},
            json={"prompt": "What is the policy on sabbatical leave eligibility?"}
        )
        assert res_chat.status_code == 200
        chat_data = res_chat.json()
        assert "sabbatical" in chat_data["text"].lower()
        assert len(chat_data["citations"]) > 0
        print("[PASS] Copilot policy chat and citations passed!")

        # 7. Deliverables RBAC
        res_deliv_admin = client.get("/api/v1/deliverables", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_deliv_admin.status_code == 200
        assert len(res_deliv_admin.json()) >= 3

        res_deliv_emp = client.get("/api/v1/deliverables", headers={"Authorization": f"Bearer {emp_token}"})
        assert res_deliv_emp.status_code == 200
        for d in res_deliv_emp.json():
            assert "Alex Johnson" in d["employeeName"]
        print("[PASS] Deliverables RBAC filtering verified!")

        print("\n=======================================================")
        print(" ALL 7 BACKEND RBAC & API ENDPOINT TESTS PASSED 100%! ")
        print("=======================================================\n")

if __name__ == "__main__":
    run_all_tests()

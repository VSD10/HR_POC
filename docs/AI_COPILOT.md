# AI Copilot System & Policy RAG Engine

The **AI Copilot System** powers intelligent decision-making, automated reply generation, and policy verification across both the HR Operations Cockpit and the Employee Portal.

---

## 1. Contextual Case Copilot (HR Cockpit)

Integrated directly inside the [Case Console](REQUESTS.md), the **Case Copilot** analyzes individual employee requests in real time.

### Key Capabilities:

- **On-Demand Expandable Badge**:
  - The AI Copilot is accessible via the **`[✨ AI Copilot]`** badge in the header.
  - When collapsed, the conversation thread and problem statement occupy the full width of the screen.
  - When expanded, the AI Copilot slides into view side-by-side with the conversation.
  - Includes a minimize button to collapse back into a badge at any time.

- **Full Case Context Injection**:
  Every AI request automatically includes:
  - Case ID, Category, Priority, and Status.
  - Employee Name, Department, and Email.
  - Full Original Request Narrative / Problem Description.
  - Chronological Conversation History (who said what, timestamps).

- **Quick Action Triggers**:
  | Action | What it Does | Example Output |
  | :--- | :--- | :--- |
  | **⚡ Draft Reply** | Drafts an empathetic, official employee reply grounded in verified policy rules. | *"Hi Rupam, according to our Leave Policy (Section 3.2), you can carry forward up to 5 days..."* |
  | **📋 Summarize** | Generates an executive bulleted breakdown of the core issue, status, and required actions. | Bullet points covering: Core Request, Status & Timeline, Key Details, Action Required. |
  | **📖 Check Policy** | Verifies applicable corporate policy clauses, entitlements, and SLA deadlines. | Exact clause references and page numbers from the knowledge base. |

- **Proper Markdown Rendering**:
  - Powered by the project's [`MarkdownRenderer`](../hr/frontend/src/components/copilot/MarkdownRenderer.tsx) (`react-markdown` + `remark-gfm`).
  - Renders bold text, glowing cyan bullet points, code blocks, and blockquotes cleanly—**with zero raw asterisks (`**`)**.

- **Verified Policy Citations**:
  - Cites exact corporate documents and page numbers (e.g., `leave_policy.pdf (p.1)`, `remote_work_policy.pdf (p.2)`).
  - Grounded directly against ChromaDB vector embeddings.

- **"Use in Reply" One-Click Workflow**:
  - Clicking **`Use in Reply`** on any generated response instantly populates the left-hand HR Reply Composer.
  - Automatically focuses the composer textarea and triggers a smooth highlight animation.

- **Interactive Follow-up Prompt Bar**:
  - Dedicated input at the bottom allowing HR to ask follow-up policy questions or request revisions (e.g., *"Make this more formal"*, *"Does this require director approval?"*).

---

## 2. Employee Portal AI Assistant ("Ask HR")

In the Employee Self-Service Portal (`employee_frontend-main` / port 3000):

- **Conversational Policy Q&A**: Employees can type natural language questions regarding leave rules, expense limits, parental leave, or remote work stipends.
- **Smart Case Escalation**: If an inquiry requires specialist intervention, the assistant offers a 1-click shortcut to auto-populate and submit an official HR request.

---

## 3. RAG Architecture & Vector Store

The AI Copilot is backed by a modular, production-ready Retrieval-Augmented Generation (RAG) backend:

- **Service**: FastAPI server on port 8001 (`rag_application-main/backend/main.py`).
- **Vector Database**: ChromaDB with persistent local storage.
- **Ingested Policy Documents (`knowledge_base/`)**:
  - `leave_policy.pdf`: Annual PTO, sick leave, carryover limits, holidays.
  - `remote_work_policy.pdf`: Hybrid schedules, equipment stipends ($500).
  - `travel_and_expense_policy.pdf`: Per diems, receipt windows, expense tiers.
  - `parental_leave_policy.pdf`: Primary/secondary caregiver entitlements.
  - `employee_handbook.pdf`: Code of conduct, grievances, performance reviews.
  - `it_equipment_policy.pdf`: Hardware provisioning and security compliance.
- **Health Verification**:
  ```bash
  curl http://127.0.0.1:8001/health
  # Response: {"status":"healthy","azure_configured":true,"vector_store_ready":true,"knowledge_base_files":6}
  ```

---

[← Back to Requests](REQUESTS.md) | [Main README](../README.md) | [Next: Employee Portal →](EMPLOYEE_PORTAL.md)

# Enterprise HR & Employee Operations AI Ecosystem

Welcome to the **Enterprise HR & Employee Operations Ecosystem**—a modern, unified AI-powered platform connecting employees, HR specialists, and autonomous AI agents in real time.

---

## 📚 Component Documentation Index

Each major component of the ecosystem is documented in detail. Click on any component below to view its dedicated documentation:

| Component | Description | Document Link |
| :--- | :--- | :--- |
| 🧠 **AI Operations & Components** | Complete breakdown of each component (AI Triage, HR Deliverables, Copilot, Case Console), differences, and benefits. | [**View Operations Guide**](docs/AI_OPERATIONS_AND_COMPONENTS.md) |
| 📊 **HR Operations Dashboard** | Real-time KPI metrics, dynamic velocity overview charts (7D/30D/90D), attention queues, and workload analytics. | [**View Dashboard Docs**](docs/DASHBOARD.md) |
| 📋 **Requests & Case Console** | Service requests queue, case investigation console, prominent problem statements, conversation threads, and resolution workflows. | [**View Requests Docs**](docs/REQUESTS.md) |
| ✨ **AI Copilot System** | Case Copilot badge, prompt engineering with full case context, 1-click reply drafts, policy RAG engine, and Markdown rendering. | [**View AI Copilot Docs**](docs/AI_COPILOT.md) |
| 👤 **Employee Self-Service Portal** | Employee-facing portal for raising requests, leave tracking, notifications, knowledge hub, and light theme default. | [**View Employee Portal Docs**](docs/EMPLOYEE_PORTAL.md) |
| ⚡ **System Architecture & Sync** | Multi-service port mapping (5173, 3000, 8000, 8001), Server-Sent Events (SSE) live sync, auth routing, and dual-theme engine. | [**View Architecture Docs**](docs/ARCHITECTURE_AND_SYNC.md) |

---

## 🚀 Quick Start Guide

### 1. Start the HR Central Sync Server & Database (Port 8000)
```bash
cd hr
node hr-sync-server.mjs
```
*Broadcasts live Server-Sent Events on `http://localhost:8000/api/v1/stream` with disk persistence at `hr/data/db.json`.*

### 2. Start the Policy RAG AI Backend (Port 8001)
```bash
cd rag_application-main
# Ensure Python virtual environment is activated
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```
*Provides vector similarity search across 6 company policy PDFs via ChromaDB.*

### 3. Start the HR Operations Cockpit (Port 5173)
```bash
cd hr/frontend
npm install
npm run dev
```
*Access at [http://localhost:5173](http://localhost:5173). Defaults to **Dark Theme**.*

### 4. Start the Employee Self-Service Portal (Port 3000)
```bash
cd employee_frontend-main
npm install
npm run dev
```
*Access at [http://localhost:3000](http://localhost:3000). Defaults to **Light Theme**.*

---

## 🌟 Key System Highlights

- **Dual-Portal Real-Time Live Sync**: When an employee submits a ticket or posts a comment, the HR Cockpit updates instantly via SSE without requiring a page reload.
- **AI Case Copilot with Policy Grounding**: Analyzes the employee's exact issue and conversation history to draft professional replies with verified policy citations (`leave_policy.pdf (p.1)`).
- **One-Click Reply Insertion**: Generated AI responses transfer seamlessly into the HR Reply Composer with overwrite protection.
- **Smart Theme Engine**: Employee portal defaults to **Light Theme**, while HR Cockpit defaults to **Dark Theme**, remembering preferences independently.

---

*(For deep dives into individual systems, navigate using the [Component Documentation Index](#-component-documentation-index) above.)*

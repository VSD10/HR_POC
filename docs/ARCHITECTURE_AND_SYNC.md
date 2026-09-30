# System Architecture & Real-Time Sync

The **HR & Employee Operations Ecosystem** is a distributed, multi-service architecture designed for real-time collaboration between employees, HR specialists, and autonomous AI agents.

---

## 1. System Architecture Diagram

```
+-----------------------------+           +-----------------------------+
|    Employee Portal          |           |   HR Operations Cockpit     |
|   (Port 3000 / :5174)       |           |        (Port 5173)          |
|  Default: Light Theme       |           |   Default: Dark Theme       |
+--------------+--------------+           +--------------+--------------+
               |                                         |
               | HTTP / SSE Stream                       | HTTP / SSE Stream
               v                                         v
+-----------------------------------------------------------------------+
|                    Central HR Sync Server (Port 8000)                  |
|                 Node.js / Express REST API + SSE Broadcaster          |
|                 Database Persistence: hr/data/db.json                 |
+-----------------------------------+-----------------------------------+
                                    |
                                    | Proxy / Direct HTTP
                                    v
+-----------------------------------------------------------------------+
|               Company Policy RAG Backend (Port 8001)                  |
|                 FastAPI + ChromaDB Vector Store                       |
|                 6 Ingested Knowledge Base Policy PDFs                 |
+-----------------------------------------------------------------------+
```

---

## 2. Port Mapping & Services

| Service | Port | Technology | Purpose |
| :--- | :--- | :--- | :--- |
| **HR Operations Cockpit** | `5173` | React 19, Vite, Tailwind CSS | HR specialist dashboard, requests queue, case console, and AI Copilot. |
| **Employee Self-Service** | `3000` / `5174` | React 19, Vite, Tailwind CSS | Employee portal for raising requests, leave tracking, and Ask HR chat. |
| **Central HR Sync Server** | `8000` | Node.js (ESM), Express, SSE | Central synchronization hub, request persistence, and real-time SSE stream. |
| **Policy RAG Backend** | `8001` | FastAPI, Python 3.12, ChromaDB | Vector search and policy question-answering with Azure OpenAI / LLM chain. |
| **Streamlit Policy UI** | `8501` | Python, Streamlit | Standalone testing interface for policy vector search and RAG chains. |

---

## 3. Real-Time Synchronization Engine (SSE)

Communication between the two portals is coordinated through the **Server-Sent Events (SSE)** stream on `http://localhost:8000/api/v1/stream`:

1. **`REQUEST_CREATED`**: Fired when an employee raises a new request.
   - HR Cockpit instantly prepends the ticket to `state.requests`.
   - Recalculates dashboard KPIs and velocity charts without a page reload.
2. **`REQUEST_UPDATED`**: Fired when a comment is added or status changes.
   - Broadcasts the updated ticket object to all connected listeners.
   - Updates the [Case Console](REQUESTS.md) and Employee Ticket Details thread simultaneously.
3. **Automatic Reconnection**: The frontend SSE client includes automatic reconnect logic with backoff to recover from network drops.

---

## 4. Authentication & Portal Routing

The unified router ([`App.tsx`](../hr/frontend/src/App.tsx)) inspects the authenticated user role and URL parameters:

- **Role: `EMPLOYEE`** (or `?portal=employee` or port `3000`/`5174`): Routes to the [Employee Portal](EMPLOYEE_PORTAL.md).
- **Role: `HR_ADMIN` / `HR_SPECIALIST`** (or `?portal=hr`): Routes to the [HR Operations Cockpit](DASHBOARD.md).
- **Split Workflow View**: `?view=split` allows side-by-side demonstration of both portals simultaneously.

---

## 5. Dual-Theme Persistence Engine

The application implements independent, per-portal theme defaults managed by [`ThemeContext.tsx`](../hr/frontend/src/context/ThemeContext.tsx):

- **Employee Portal**: Defaults to **Light Theme** (`localStorage.getItem('theme_employee') || 'light'`).
- **HR Cockpit**: Defaults to **Dark Theme** (`localStorage.getItem('theme_hr') || 'dark'`).
- **Seamless Switch**: Switching roles or navigating between views automatically switches the active DOM theme (`html.dark` vs. `html.light`) while remembering each portal's individual preference.

---

[← Back to Employee Portal](EMPLOYEE_PORTAL.md) | [Main README](../README.md)

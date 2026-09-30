# Enterprise HR Ecosystem: Architecture, Components & Operations Guide

This document provides a comprehensive technical and functional breakdown of all components within the distributed HR ecosystem. It details the purpose of each component, how each differs from the others, the specific benefits it delivers, and how they seamlessly interconnect into a single operational workflow.

---

## 1. System Ecosystem Overview

The ecosystem operates across four dedicated services with real-time bidirectional synchronization:

```
+-------------------------------------------------------------------------------------------------+
|                                        DISTRIBUTED HR ECOSYSTEM                                 |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|   EMPLOYEE PORTAL (Port 3000)                       HR OPERATIONS COCKPIT (Port 5173)           |
|   - Self-Service Ticket Intake                      - AI Triage Queue (Operational Attention)   |
|   - Leave Balances & Policies                       - HR Deliverables Workspace (Review/Send)   |
|   - Real-time Ticket Status                         - Case Console & Request AI                 |
|   - Official Dispatched Notices                     - AI Copilot (Vector Policy Grounding)      |
|                      ▲                                              ▲                           |
|                      │              REST + SSE                      │                           |
|                      └──────────────────────┬───────────────────────┘                           |
|                                             │                                                   |
|                              CENTRAL HR SYNC SERVER (Port 8000)                                 |
|                              - Express / Node.js ESM Architecture                               |
|                              - Single Source of Truth: hr/data/db.json                          |
|                              - Server-Sent Events (SSE) Bus (/api/v1/stream)                    |
|                              - Triage Classification & Sensitivity Guardrails                   |
|                              - Deliverable Lifecycle Management & Ticket Sync                   |
|                                             │                                                   |
|                                             ▼ Proxy / Vector Search                             |
|                               POLICY RAG BACKEND (Port 8001)                                    |
|                               - FastAPI + ChromaDB Vector Store                                 |
|                               - Policy PDF Ingestion & Semantic Retrieval                       |
|                               - Exact Document & Page-Level Citations                           |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+
```

---

## 2. Component Differentiation & Benefit Matrix

Each component in the HR Cockpit has a strict, non-overlapping operational role:

| Component | Primary Question Answered | Primary User | AI Role | Human HR Role | Key Output / Artifact |
|---|---|---|---|---|---|
| **AI Triage** | *"What should HR look at first and how should it be handled?"* | HR Intake Specialist / Lead | Classifies category, suggests priority, calculates confidence, and detects sensitive risk | Reviews recommendations, applies overrides with audit notes, prioritizes queue | Prioritized Operational Queue & Triage Metadata |
| **HR Deliverables** | *"What AI work has been generated, and what needs review before dispatch?"* | HR Specialist / Manager | Drafts communications, analysis briefs, investigation summaries, notices | Reviews, edits, marks ready, and signs off before delivery | Formal Deliverables (`HR Communication`, `Policy Analysis`, etc.) |
| **Case Console (Request AI)** | *"How do I resolve this specific ticket and communicate with the employee?"* | Assigned HR Specialist | Drafts case-specific reply, summarizes ticket narrative, verifies policies | Edits draft, approves resolution, and posts to discussion thread | Ticket Thread Comments & Resolved Status |
| **AI Copilot (RAG)** | *"What does company policy say across all official handbooks?"* | Any HR Specialist | Performs semantic vector retrieval across PDFs and generates grounded answers | Formulates exploratory policy queries, validates legal/HR compliance | Semantic Answers with Page Citations |
| **Service Requests** | *"What is the status and backlog of employee service requests?"* | HR Operations Team | Enriched with auto-routing tags and category labels | Assigns tickets, investigates issues, manages status lifecycle | Case Record (`Open`, `In Review`, `Resolved`) |
| **HR Actions & Dashboard** | *"What administrative tasks need execution and how fast are we operating?"* | HR Admin & Leadership | Forecasts workload volume and tracks SLA compliance metrics | Executes financial/system actions (salary adjust, leave deduction) | Executed Audit Log & SLA Telemetry |

---

## 3. Deep Dive: Component Details & Benefits

---

### Component 1: AI Triage (Operational Attention Queue)

#### What It Is
An intelligent operational intake filter that analyzes every incoming request to determine urgency, domain classification, and potential sensitivity.

#### How It Differs From Other Components
- **Not a Chatbot**: It is not a conversational chat interface. It is a structured triage queue.
- **Not a Ticketing Duplicate**: It does not recreate requests. It enriches existing requests stored in `db.json` with machine-generated metadata (`request.triage`).
- **Not Final Authority**: It labels urgency as **"AI Suggested Priority"** and allows HR to override both priority and category without wiping the original AI reasoning.

#### Key Features
1. **Intelligent Metadata Schema**:
   - `category`: Practical HR buckets (`Leave & Attendance`, `Payroll`, `Benefits`, `Reimbursement`, `Remote Work`, `Employee Relations`, `HR Documentation`, `Compliance`, `General HR`).
   - `priority`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
   - `sensitivity`: `NORMAL`, `SENSITIVE`, `HIGHLY_SENSITIVE`, `NEEDS_REVIEW`.
   - `confidence`: Confidence score (e.g. `96%`).
   - `relevantPolicy`: Exact policy name (e.g., *Medical & Statutory Sick Leave Policy*).
   - `suggestedAction`: Grounded action recommendation.
   - `reason`: Explainable justification based on text density and keyword patterns.
2. **Sensitive Case Guardrails**:
   - Identifies workplace harassment, discrimination, disputes, terminations, or medical issues.
   - Triggers the visual alert:
     > ⚠ **Sensitive HR Case:** Human review required before automated communication.
   - Locks down automated actions to protect employee privacy and company compliance.
3. **Transparent Human Override**:
   - HR can click `[Override]` on any card to update priority or category and log a specialist rationale note.
   - Stores `humanPriority`, `humanCategory`, and `overrideNotes` separately to maintain AI telemetry transparency.
4. **Seamless Connector**:
   - Clicking `[Review Request]` directly opens the primary [Case Console (ReviewDrawer)](#component-3-case-console--request-ai), ensuring no duplicated workflows.

#### Core Benefits
- **Zero Triage Lag**: Incoming tickets are categorized and urgency-ranked in milliseconds.
- **Risk Mitigation**: Sensitive legal and personnel issues are surfaced immediately before escalation.
- **Specialist Routing**: Directs technical payroll or benefits issues to the right HR specialist queue.

---

### Component 2: HR Deliverables (AI Output Workspace)

#### What It Is
An enterprise output repository that tracks and governs the lifecycle of all AI-generated work products before they are dispatched to employees, leadership, or third parties.

#### How It Differs From Other Components
- **Not a Document Dump**: It tracks the strict governance states of actionable HR work products.
- **Not Auto-Sending**: Ensures AI outputs never bypass human specialist review.
- **Bi-directional Case Sync**: When an HR communication deliverable is dispatched, it automatically posts an official comment and timeline event to the linked ticket on the employee portal.

#### Deliverable Lifecycle
$$\text{AI GENERATED} \longrightarrow \text{NEEDS REVIEW} \longrightarrow \text{EDITED} \longrightarrow \text{READY} \longrightarrow \text{SENT} \longrightarrow \text{ARCHIVED}$$

#### Supported Deliverable Types
1. **HR Communication**: Official letters or email notices sent directly to employees.
2. **Case Summary**: Executive briefs summarizing multi-message grievances or disputes.
3. **Policy Analysis**: In-depth cross-border tax, remote work, or sabbatical compliance evaluations.
4. **Compliance Checklist**: Audit verification forms for regulatory filings.
5. **Employee Notice**: Official compensation or tenure verification statements.
6. **Investigation Summary**: Confidential records of employee relations inquiries.
7. **HR Report**: Aggregate operational or benefit distribution reports.
8. **Policy Comparison**: Side-by-side analysis of policy clauses.

#### Key Features
1. **Workspace Overview**:
   - Real-time count pills: `All`, `Needs Review`, `Drafts`, `Ready`, `Sent`.
   - Responsive table displaying type, title, related request ID, status, and creation date.
   - Primary `+ Create Deliverable` modal to draft standalone or ticket-linked deliverables.
2. **Right-Side Detail Drawer (`DeliverableDrawer`)**:
   - Slides out from the right without navigating away from the current view.
   - **"AI Generated — HR Review Required"** verification banner.
   - Full editing mode for recipient, subject line, and document body.
   - Integrated Policy Grounding section displaying source documents and page references.
   - Action controls: `[Edit Content]`, `[Copy]`, `[Download .txt]`, `[Mark Ready]`, `[Send / Use]`, and `[Archive]`.

#### Core Benefits
- **Guaranteed Human Oversight**: No AI-drafted document is sent without deliberate specialist sign-off.
- **Audit Compliance**: Maintains full version tracking and author attribution (`Sarah Jenkins via AI Copilot`).
- **Unified Output Hub**: Consolidates drafts originating from Requests, Copilot, or Triage into one review screen.

---

### Component 3: Case Console & Request AI (`ReviewDrawer`)

#### What It Is
A high-contrast investigation console that opens when clicking any request from the Requests view or AI Triage queue.

#### How It Differs From Other Components
- **Context-Bound**: Focused exclusively on the single selected request.
- **Immediate Communication**: Combines employee narrative, interactive discussion thread, and reply box in a single modal.
- **Action-Oriented**: Provides one-click buttons to resolve the ticket or draft answers.

#### Key Features
1. **Case Identity Bar**:
   - Displays Ticket ID, Category pill, Priority badge, live Status, and Employee Avatar/Title.
2. **Employee Narrative & Conversation Thread**:
   - Shows the original submission un-truncated.
   - Displays alternating message bubbles between Employee and HR Specialists.
3. **Contextual Copilot Assistant**:
   - Quick prompt shortcuts: `[Draft Reply]`, `[Summarize Case]`, `[Check Policy]`.
   - Markdown rendering with clean typography.
   - Source citations showing matching policy PDFs and page numbers.
4. **Direct Response Integration**:
   - Includes **`[Use in Reply]`**, allowing specialists to seamlessly insert AI guidance directly into the ticket reply thread with one click.

#### Core Benefits
- **Faster Case Resolution**: Cuts ticket handling time by pre-generating policy-grounded replies.
- **Contextual Accuracy**: The AI receives the full ticket history, eliminating generic advice.

---

### Component 4: AI Copilot (Knowledge & Policy Assistant)

#### What It Is
An interactive, standalone knowledge assistant backed by FastAPI and ChromaDB vector embeddings.

#### How It Differs From Other Components
- **Broad Exploration**: Not tied to a single request; HR specialists can ask complex organizational questions.
- **RAG Grounded**: Uses vector search against ingested company PDFs (`employee_handbook.pdf`, `leave_policy.pdf`, etc.) rather than generic LLM knowledge.
- **Citation-Backed**: Every response includes clickable source citations with exact document names and page numbers.

#### Key Features
1. **Dynamic Metric Extraction**:
   - Automatically highlights key policy figures (e.g., `16 weeks`, `$500/day`, `20 business days`).
2. **Follow-Up Suggestions**:
   - Recommends next logical questions based on the retrieved policy.
3. **Actionable Guidance**:
   - Provides one-click clipboard copying (`[Copy Guidance]`) and thumbs-up/down quality feedback for continuous grounding evaluation.

#### Core Benefits
- **Prevents Misinformation**: Eliminates hallucination by restricting answers to ingested policy documents.
- **Self-Service HR Knowledge**: New specialists can reference complex organizational policies immediately.

---

### Component 5: Central HR Sync Server & Persistence

#### What It Is
The Node.js ESM server running on port `8000` coordinating authentication, persistent state in `hr/data/db.json`, REST endpoints, and Server-Sent Events (SSE).

#### How It Differs From Other Components
- It is the **single source of truth** across the ecosystem. Frontends never talk directly to raw files; all state changes flow through the Sync Server.

#### Key Features
1. **Real-Time SSE Broadcast (`/api/v1/stream`)**:
   - Broadcasts events to both HR Cockpit and Employee Portal:
     - `REQUEST_CREATED`
     - `REQUEST_UPDATED`
     - `DELIVERABLE_CREATED`
     - `DELIVERABLE_UPDATED`
     - `TRIAGE_UPDATED`
2. **Cross-Portal Synchronization**:
   - When HR resolves a ticket or sends a deliverable, the employee sees the updated timeline and comment instantly without manual page refreshes.

---

## 4. End-to-End Operational Lifecycle Trace

The following diagram illustrates how all components work together when an employee raises a request:

```
Step 1: Intake
Employee submits request via Employee Portal (Port 3000)
    │
    ▼ POST /api/v1/requests
Central Sync Server (Port 8000)
    │
    ├─► Generates Triage Metadata (Category, Priority, Sensitivity, Policy)
    ├─► Saves ticket to hr/data/db.json
    └─► Emits SSE Event: REQUEST_CREATED

Step 2: Attention & Triage
HR Cockpit receives REQUEST_CREATED in real time
    │
    ▼
AI Triage Queue displays ticket:
    - AI Suggested Priority: CRITICAL / HIGH / MEDIUM / LOW
    - Sensitivity Warning if sensitive case
    - Policy citation & Suggested action
    │
    ├─► [Optional] HR clicks [Override] to adjust priority/category with notes
    │
    ▼ HR clicks [Review Request]

Step 3: Investigation & Drafting
Case Console (ReviewDrawer) opens
    │
    ├─► HR reviews full employee narrative and message history
    ├─► AI Copilot generates policy-grounded reply
    │
    ▼ HR reviews reply and clicks [Use in Reply]

Step 4: Governance & Review
HR Deliverables workspace receives DELIVERABLE_CREATED
    │
    ▼
Status: NEEDS REVIEW
    │
    ├─► HR opens Deliverable Drawer
    ├─► HR edits text, verifies recipient and subject
    ├─► HR marks deliverable as READY
    │
    ▼ HR clicks [Send / Use Deliverable]

Step 5: Dispatch & Resolution
Central Sync Server marks deliverable as SENT
    │
    ├─► Appends official deliverable text to Ticket Comments
    ├─► Appends "Deliverable Dispatched" to Ticket Timeline
    ├─► Emits SSE Events: DELIVERABLE_UPDATED & REQUEST_UPDATED
    │
    ▼
Employee Portal updates live:
    - Employee views official response in ticket timeline
    - Ticket status moves to RESOLVED
```

---

## 5. Summary of Key Architectural Principles

1. **Human-in-the-Loop Authority**: AI classifies, scores, suggests, and drafts; human HR specialists review, edit, approve, and send.
2. **Single Source of Truth**: All tickets, triage intelligence, deliverables, and activities reside in `hr/data/db.json` and sync via SSE.
3. **No Redundant Interfaces**: AI Triage links directly to the existing Review Drawer; AI Copilot answers policy queries; Deliverables manages work products.
4. **Explainable AI**: AI suggestions always provide explicit reasons and policy source citations.

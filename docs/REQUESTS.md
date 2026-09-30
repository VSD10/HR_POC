# Service Requests & Case Console

The **Requests Module** provides complete lifecycle management for all employee service tickets—from intake and classification to communication, review, and resolution.

---

## 1. Service Requests Queue

The main queue table offers advanced filtering and real-time case tracking:

- **Full-Text Instant Search**: Searches across Case ID (`REQ-1058`), employee name, department, title, and narrative.
- **Category Filter**: `All`, `Leave & Time`, `Payroll`, `Benefits`, `Documents`, `Compliance`.
- **Status Filter**: `All Status`, `Open`, `In Review`, `Resolved`.
- **Priority Filter**: `All`, `High`, `Medium`, `Low`.
- **Row Actions**:
  - **Review Case**: Opens the full [Case Console](#2-ai-assisted-case-console).
  - **Direct Approve**: 1-click case resolution directly from the table.

---

## 2. AI-Assisted Case Console

Clicking any request opens the **Case Console**, a centered, high-contrast modal workspace (`max-w-6xl`) designed for focused investigation and communication.

```
+-------------------------------------------------------------------------------+
| [REQ-1058] LEAVE  HIGH PRIORITY  OPEN | Annual Leave Carryover  [Resolve] [X] |
+-------------------------------------------------------------------------------+
| [📌 Employee Issue & Problem Description]                                      |
| "I have 5 days of unused PTO from 2025. Can I carry these forward to Q1 2026?"|
+---------------------------------------------------+---------------------------+
| CONVERSATION STREAM                               | [✨ AI Copilot Badge]      |
|                                                   | [Draft] [Summary] [Policy]|
| [Employee]: Can you check my eligibility?         |                           |
| [HR Specialist]: Hi Rupam, I've checked...        | AI Generated Response     |
|                                                   | (Policy grounded, p.1)    |
|---------------------------------------------------| [➔ Use in Reply] [Copy]   |
| REPLY COMPOSER                                    |                           |
| [Write reply... (Ctrl+Enter)]       [Send Reply]  | Ask AI: [___________] [Ask|
+---------------------------------------------------+---------------------------+
```

### Key Components of the Console:

1. **Top Identity & Navigation Header**:
   - Prominent Case ID badge, Category pill, Priority badge, and live Status indicator.
   - Case Title and Employee Identity (`Name`, `Department`, `Email`).
   - Top Action Suite: Quick **Resolve Case** and **Close** controls.

2. **Employee Problem Statement (Front & Center)**:
   - Positioned directly beneath the header in a dedicated card.
   - Shows the **full, un-truncated narrative** of what the employee needs help with.

3. **Conversation Thread**:
   - Chronological message bubbles with sender avatars, timestamps, and role badges.
   - Left-aligned bubbles for **Employee** messages (subtle frosted glass).
   - Right-aligned bubbles for **HR Specialist** messages (teal/emerald gradient with "HR Ops" badge).

4. **Directly Attached Reply Composer**:
   - Sits directly beneath the message thread for natural communication flow.
   - Multiline textarea with character counter.
   - Keyboard shortcut: `Ctrl + Enter` (or `Cmd + Enter`) to instantly send.
   - Single-click integration with [AI Copilot](AI_COPILOT.md) drafts.

5. **Real-Time Live Synchronization**:
   - Submitting a reply sends `POST /api/v1/requests/:id/comments` to the Node HR Sync Server on port 8000.
   - The server appends the comment to the database and broadcasts `REQUEST_UPDATED` via Server-Sent Events (SSE).
   - The message instantly appears in both the **HR Operations Cockpit** and the **Employee Self-Service Portal** without requiring a page reload.

---

[← Back to Dashboard](DASHBOARD.md) | [Main README](../README.md) | [Next: AI Copilot System →](AI_COPILOT.md)

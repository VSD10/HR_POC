# Employee Self-Service Portal

The **Employee Self-Service Portal** is the employee-facing application designed for seamless request submission, leave tracking, company policy discovery, and direct communication with HR.

---

## 1. Key Features

- **Dashboard**:
  - Personal greeting, leave balance overview (Casual, Sick, Earned).
  - Quick action buttons: `Apply for Leave`, `Raise HR Request`, `Download Payslip`, `Update Bank Details`.
  - Upcoming holidays and pending requests summary.
- **Raise HR Request**:
  - Intuitive ticket intake form with category selection (Leave & Time, Payroll, Benefits, General Inquiry).
  - Instant dispatch to the central sync server on port 8000, creating an active case in the HR queue.
- **My Requests**:
  - Live tracking of all submitted cases with status badges (`SUBMITTED`, `IN PROGRESS`, `RESOLVED`).
  - Interactive ticket details modal with activity timeline and live conversation thread.
- **Ask HR (AI Copilot)**:
  - Instant answers to corporate policy questions powered by the [RAG Engine](AI_COPILOT.md).
- **Knowledge Hub**:
  - Searchable repository of company handbooks and official guidelines.
- **Notifications**:
  - Real-time alerts when HR responds or updates ticket status.

---

## 2. Theme & Visual Styling

- **Default Theme**: Defaults to **Light Theme** (`theme_employee`).
- **High-Contrast Button Styling**:
  - Custom CSS rules ensure all dark/colored action buttons (`bg-[#0F172A]`, `bg-slate-900`, `bg-[#0D9488]`, etc.) maintain crisp, high-contrast `#ffffff !important` text and icons.
- **Per-Portal Theme Persistence**:
  - Toggling theme preserves preferences specifically for the employee portal (`theme_employee`), independent of the HR Cockpit.

---

## 3. Real-Time Synchronization with HR

When an employee submits a ticket or posts a comment in a ticket thread:
1. The request is sent to `http://localhost:8000/api/v1/requests` (or `/comments`).
2. The Node Sync Server broadcasts a Server-Sent Event (`REQUEST_CREATED` or `REQUEST_UPDATED`).
3. The HR Operations Cockpit instantly receives the event and updates the live queue, metrics, and case console without requiring a refresh.

---

[← Back to AI Copilot](AI_COPILOT.md) | [Main README](../README.md) | [Next: Architecture & Sync →](ARCHITECTURE_AND_SYNC.md)

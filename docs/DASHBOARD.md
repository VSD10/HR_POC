# HR Operations Dashboard

The **HR Operations Dashboard** is the central command center of the HR AI Ecosystem. It provides HR administrators and specialists with real-time operational telemetry, SLA tracking, incoming workload trends, and attention queues.

---

## 1. Key Performance Metric Cards (KPIs)

The dashboard presents four high-priority operational telemetry cards:

| Metric | Description | Live Behavior |
| :--- | :--- | :--- |
| **Open Operations** | Total open/in-review requests awaiting HR resolution. | Dynamically recalculated whenever cases are created or resolved. |
| **Autonomous AI Triage** | Percentage of incoming cases auto-classified with high confidence. | Calculated from AI classification confidence (>85% automated). |
| **Resolved Overnight** | Cases processed and completed within the automated batch SLA. | Increments live on manual approval or automated script execution. |
| **Active SLA Compliance** | Overall rate of cases meeting corporate SLA target deadlines. | Real-time percentage indicator based on wait times. |

---

## 2. Real-Time Dynamic Velocity Overview Chart

Located at the core of the dashboard, the **Case Velocity Chart** displays historical throughput and incoming case volume.

- **Zero Mock Numbers**: All data points are calculated directly from live database records (`state.requests`).
- **Time Range Selector**:
  - **7D (Rolling 7 Days)**: Shows daily case receipts vs. resolutions over the past 7 days (e.g., `Today`, `Yesterday`, `-2D`, etc.).
  - **30D (4-Week Rolling Windows)**: Aggregates volume across 4 weekly windows (`Week 1` through `Week 4`).
  - **90D (3-Month Calendar Windows)**: Aggregates volume across the last 3 calendar months.
- **Visual Design**:
  - **Cyan Area Curve**: Cumulative incoming case intake.
  - **Emerald Area Curve**: Resolved case throughput.
  - **Non-Overlapping Bottom Metric Capsule**: Day labels and summary stats (`Received Today`, `Resolved Today`, `Open Total`) are isolated in dedicated containers to prevent visual overlap.

---

## 3. Attention Queue (Urgent Cases)

The **Attention Queue** surfaces high-priority, SLA-critical, and escalated cases requiring immediate human specialist review:

- Displays employee avatar, name, tenure, and department.
- Urgency badge (`High Priority`, `Urgent`, `In Review`).
- Case title and brief narrative.
- Direct **"Review Case"** action button that immediately launches the [Case Console](REQUESTS.md).

---

## 4. Operational Insights & Category Volumes

- **Category Breakdown**: Real-time volume distribution across departments (Leave & Time Off, Payroll & Compensation, Benefits, Document Verification, Compliance).
- **Recent Activity Log**: Chronological audit trail showing actor (Employee / HR Specialist / AI Gateway), action text, timestamps, and status pills.

---

[← Back to Main README](../README.md) | [Next: Requests & Case Management →](REQUESTS.md)

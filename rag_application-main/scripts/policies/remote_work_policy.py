"""Remote Work & Hybrid Workplace Policy (HR-POL-004) dense content module."""
from policies.common import make_article

def get_document():
    sections = [
        make_article(
            "Article 1. Hybrid Workplace Operating Framework & Attendance Expectations",
            "1.1 Hybrid Scheduling, Mandatory In-Office Days & Geographic Eligibility",
            "Nexus Corporation embraces a modern, flexible hybrid work philosophy that balances the productivity of focused remote work with "
            "the innovation, cultural connection, and mentorship achieved through in-person collaboration. Under our hybrid operating model, "
            "regular full-time employees in eligible roles may work remotely up to 3 days per week, with a mandatory minimum of 2 days per week "
            "spent on-site at their designated regional office hub. To maximize collaborative synergy across cross-functional teams, Tuesday and "
            "Thursday are established as corporate-wide Mandatory In-Office Days for all hybrid personnel residing within 50 miles of an office hub.",
            "Employees residing more than 50 miles from any Nexus facility may be classified as Designated Fully Remote upon written approval "
            "from the Department Vice President and Chief People Officer. Fully remote employees are required to attend quarterly on-site department "
            "summits and annual corporate kickoffs, with business travel, lodging, and meals fully covered under the corporate travel policy. "
            "Essential on-site personnel—such as data center engineers, hardware lab technicians, and facilities staff—are not eligible for hybrid schedules.",
            ["Workforce Classification", "In-Office Cadence Mandate", "Geographic Radius Rule", "Core Collaboration Expectations", "Travel Reimbursement"],
            [
                ["Hybrid Personnel (Standard)", "Tuesdays & Thursdays Mandatory (2 days/wk)", "Residing within 50 miles of hub", "In-person meetings, team design sprints", "Standard local commuting rules"],
                ["Designated Fully Remote", "Quarterly on-site summits only", "Residing > 50 miles from any hub", "Virtual attendance; quarterly travel", "Corporate travel policy covers summits"],
                ["Essential On-Site Personnel", "Monday through Friday On-Site (5 days/wk)", "Assigned to physical lab / datacenter", "Direct physical systems maintenance", "Eligible for on-site differential"],
                ["Temporary Remote Exception", "Approved duration (up to 30 days)", "Temporary personal/medical necessity", "Full remote deliverables & availability", "No travel reimbursement"],
                ["Interns & Apprentices", "Tuesdays, Wednesdays & Thursdays (3 days)", "Must reside within commute radius", "In-person mentorship & paired work", "Standard local commuting rules"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Attendance on designated mandatory in-office days is tracked via automated keycard badge swipes at facility entry turnstiles.",
                "Unexcused absenteeism on mandatory in-office days exceeding two occurrences in a quarter results in revocation of remote privileges.",
                "Employees may request to switch their designated remote days with 48 hours advance notice and written manager approval.",
            ],
            "CORE COLLABORATION DAY MANDATE:",
            "Tuesdays and Thursdays are dedicated to high-bandwidth creative collaboration, one-on-ones, sprint planning, and architectural reviews. "
            "Team leads must schedule major collaborative rituals on these days and avoid heavy all-day isolated coding blocks."
        ),
        make_article(
            "Article 2. Home Office Ergonomic Setup Stipend & High-Speed Internet Allowance",
            "2.1 One-Time Ergonomic Setup Reimbursement & Ongoing Monthly Internet Subsidy",
            "To ensure that all employees have a safe, ergonomic, and highly productive home working environment, Nexus provides a comprehensive "
            "financial subsidy package. All full-time regular hybrid and remote employees receive a One-Time Home Office Setup Stipend of $500. "
            "This stipend covers ergonomic task chairs, sit-stand motorized desks, external monitors, keyboard and mouse peripherals, laptop riser "
            "stands, and noise-canceling headsets. Purchases must be submitted via Navan Expense within 60 calendar days of employment commencement.",
            "In addition, Nexus provides all active hybrid and remote employees with an ongoing High-Speed Internet Allowance of $50 per month, "
            "disbursed automatically as a non-taxable reimbursement on the second bi-weekly payroll of each month. Remote employees must maintain "
            "a stable broadband internet connection with a minimum download speed of 100 Mbps and upload speed of 20 Mbps, capable of supporting "
            "continuous HD video conferencing, cloud development environments, and secure VPN data tunnels simultaneously without latency spikes.",
            ["Allowance Category", "Funding Allocation", "Eligibility Window", "Approved Eligible Items", "Documentation Required"],
            [
                ["Home Office Ergonomic Stipend", "$500 one-time reimbursement", "First 60 days of employment", "Ergonomic chair, desk, monitor, keyboard, riser", "Itemized retail purchase receipts"],
                ["Monthly High-Speed Internet", "$50 per month ($600 / year)", "Ongoing for all hybrid/remote staff", "Broadband ISP, fiber, cable, mesh Wi-Fi gear", "Automated payroll credit (No receipts)"],
                ["Corporate Hardware Bundle", "Provisioned by IT Logistics", "Shipped prior to start date", "MacBook Pro / ThinkPad, YubiKey, dock, monitor", "Asset custody acknowledgment signed"],
                ["Ergonomic Medical Subsidy", "Up to $300 additional", "Upon physical therapist consult", "Orthopedic chair pads, vertical mice, footrests", "PT ergonomic evaluation form"],
                ["Mobile Phone Reimbursement", "$40 per month (Role-dependent)", "Sales, On-Call Engineers, Managers", "Cellular voice & mobile hotspot data plans", "Navan Expense monthly submission"],
            ],
            [120, 105, 110, 115, 90],
            [
                "Equipment purchased with the $500 stipend becomes the personal property of the employee and does not require return upon separation.",
                "Employees are responsible for assembling and maintaining home furniture in compliance with OSHA home ergonomic safety guidelines.",
                "If home internet service suffers an extended outage exceeding 4 hours, employees must report to the nearest office hub or use mobile hotspot.",
            ],
            "BROADBAND SPEED REQUIREMENT:",
            "Remote employees must maintain broadband speeds of at least 100 Mbps down / 20 Mbps up. Conduct quarterly speed tests at speedtest.net "
            "and retain screenshots in case of network troubleshooting escalations with corporate IT support."
        ),
        make_article(
            "Article 3. International Remote Work Program ('Work from Anywhere')",
            "3.1 20-Day Global Mobility Allowance, Tax Residency Rules & Country Restrictions",
            "Nexus Corporation recognizes the profound value of global mobility and personal flexibility. Under our innovative 'Work from Anywhere' "
            "(WFA) program, full-time regular employees in good standing may work remotely from an approved international location for up to 20 "
            "business days per calendar year. This program allows employees to extend personal overseas vacations, visit extended family abroad, "
            "or explore new cultural destinations while continuing to deliver full-time business results without consuming annual PTO balances.",
            "To ensure absolute compliance with international labor laws, permanent establishment corporate tax exposure, and export control regulations, "
            "all international remote work must be pre-approved at least 30 calendar days in advance via the Global Mobility Portal. Remote work is "
            "strictly prohibited from countries subject to US Treasury Office of Foreign Assets Control (OFAC) trade sanctions or State Department "
            "Level 4 Travel Advisories. Employees must execute a statutory Tax and Legal Affidavit confirming they will not establish local tax residency.",
            ["Global Mobility Tier", "Maximum Duration", "Advance Notice SLA", "Eligible Destinations", "Approval Authority"],
            [
                ["Standard Global WFA", "Up to 20 business days / calendar year", "At least 30 calendar days prior", "Approved Tier 1 & 2 countries (EU, UK, JP, etc.)", "Manager + Global Mobility HR"],
                ["Emergency Compassionate WFA", "Up to 15 additional business days", "72 hours notice (emergency)", "Family medical crisis abroad", "VP of People Operations"],
                ["High-Risk Security Countries", "STRICTLY PROHIBITED (0 days)", "N/A (Automated network block)", "OFAC sanctioned; ITAR / EAR restricted zones", "No exceptions permitted by law"],
                ["Domestic Out-of-State WFA", "Up to 30 calendar days / year", "14 calendar days advance notice", "Any US state / territory with legal nexus", "Direct Line Manager approval"],
                ["Cross-Border Relocation", "Permanent relocation pathway", "6 months formal legal review", "Countries where Nexus maintains legal entity", "Executive Committee + Legal"],
            ],
            [120, 105, 110, 115, 90],
            [
                "Employees working abroad must maintain core collaboration hours overlapping with their home team by at least 4 contiguous hours daily.",
                "All corporate data access while abroad must route through Palo Alto GlobalProtect VPN; public Wi-Fi is strictly banned without VPN.",
                "Violating the 20-day limit triggers foreign tax withholdings, local labor law penalties, and potential employment termination.",
            ],
            "OFAC SANCTIONED COUNTRY BAN:",
            "Connecting corporate devices to Nexus systems from OFAC-sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea/Donetsk/Luhansk) "
            "is a federal crime. Automated geo-blocking terminates network access instantly upon detection and notifies federal authorities."
        ),
        make_article(
            "Article 4. Information Security, Endpoint Protection & GlobalProtect VPN",
            "4.1 Secure Remote Computing, Palo Alto VPN & Removable Media Controls",
            "Remote work environments introduce distinct cybersecurity threat vectors that require rigorous technical and behavioral safeguards. "
            "All remote work must be conducted exclusively on corporate-issued, encrypted hardware provisioned and managed by Nexus IT Operations. "
            "The use of personal desktop computers, personal laptops, shared household tablets, or public internet cafe terminals to access corporate "
            "email, Slack, GitHub, Jira, or customer databases is strictly forbidden and constitutes a terminable security violation.",
            "Whenever connecting to corporate cloud resources, remote employees must authenticate through the Palo Alto GlobalProtect Virtual "
            "Private Network (VPN) using full tunnel encryption. Multi-factor authentication via Okta Verify Push or FIDO2 hardware YubiKeys is "
            "mandatory on all logins. Endpoint protection agents—including CrowdStrike Falcon EDR, Jamf Pro (macOS), and Microsoft Intune (Windows)—"
            "must remain active, uninhibited, and updated at all times. Physical USB mass storage ports are permanently disabled on all laptops.",
            ["Security Control", "Technical Standard", "Employee Obligation", "Monitoring & Verification", "Sanction for Non-Compliance"],
            [
                ["Always-On Corporate VPN", "Palo Alto GlobalProtect AES-256", "Connect before accessing any tools", "Automated network telemetry logs", "Account lock upon external direct hit"],
                ["Multi-Factor Authentication", "FIDO2 YubiKey or Okta Verify Push", "Never share or approve unknown push", "Okta Identity Engine risk scoring", "Immediate credential revocation"],
                ["Endpoint Detection & EDR", "CrowdStrike Falcon active sensor", "Never attempt to disable or tamper", "24/7/365 SOC continuous monitoring", "Immediate device isolation by SOC"],
                ["Screen Privacy & Clean Desk", "3M Privacy filters in public spaces", "Lock screen when leaving desk (Win+L)", "Periodic remote audit checks", "Formal written security warning"],
                ["Local Data Storage Bans", "All files saved to Google Drive / Git", "Zero customer PII on local desktop", "DLP automated file scanning agent", "Forensic wipe; disciplinary action"],
            ],
            [110, 115, 125, 100, 90],
            [
                "Laptops must never be left unattended in vehicles, coffee shops, airport waiting lounges, or hotel conference rooms.",
                "In the event of a lost, stolen, or compromised device, notify security@nexus-corp.internal immediately (within 1 hour max).",
                "IT Security initiates automated cryptographic remote wipes within 15 minutes of any confirmed device loss report.",
            ],
            "PUBLIC WI-FI SECURITY WARNING:",
            "Connecting to unencrypted public Wi-Fi networks (airports, hotels, cafes) without active GlobalProtect VPN is strictly prohibited. "
            "Use cellular mobile hotspot tethering whenever secure, password-protected private Wi-Fi is unavailable."
        ),
        make_article(
            "Article 5. Core Collaboration Hours, Asynchronous Communication & Availability",
            "5.1 Synchronous Overlap, Slack Protocols & Response Time Service Levels",
            "Effective distributed teamwork requires clear, transparent communication norms and shared expectations around availability. "
            "All hybrid and remote employees are required to be online, logged into Slack and Google Workspace, and actively accessible during "
            "Corporate Core Collaboration Hours from 10:00 AM to 4:00 PM local time across their designated regional operational time zone. "
            "Core hours represent the designated window for cross-functional standups, client meetings, design reviews, and synchronous alignment.",
            "Outside core collaboration hours, Nexus champions asynchronous communication workflows to promote sustained deep focus and work-life "
            "balance. Employees are not expected to monitor or respond to work emails or Slack messages outside their standard 8-hour workday, "
            "during weekends, or while on approved PTO. For urgent operational emergencies outside standard hours, documented on-call rotations "
            "utilizing PagerDuty will alert designated engineers via phone calls with accompanying on-call premium compensation.",
            ["Communication Channel", "Primary Purpose", "Expected Response Time (Core)", "Etiquette Standard", "Off-Hours Expectation"],
            [
                ["Slack Direct Messages", "Urgent questions, real-time unblocking", "Within 60 minutes during core hours", "Clear, professional, concise text", "Do Not Disturb (DND) respected"],
                ["Slack Public Channels", "Project discussions, team updates", "Within 2 to 4 business hours", "Threaded replies; tag @here sparingly", "No response expected off-hours"],
                ["Corporate Email (Gmail)", "Formal agreements, external client notes", "Within 24 business hours", "Professional formatting, clear subjects", "No response expected off-hours"],
                ["Zoom Video Conferences", "Interactive design, 1-on-1s, sprints", "Punctual attendance at scheduled time", "Camera on during small meetings", "Scheduled within core hours only"],
                ["PagerDuty Emergency Alert", "Critical production outages (Sev-1)", "Acknowledge within 15 minutes", "On-call engineer immediate triage", "Compensated on-call rotation"],
            ],
            [110, 115, 110, 115, 90],
            [
                "Employees stepping away from their desk for more than 30 minutes during core hours must update their Slack status accordingly.",
                "Meeting-Free Thursdays: All Thursdays from 1:00 PM to 5:00 PM are designated focus time with zero internal meetings permitted.",
                "Non-exempt employees must never send Slack messages or check email after clocking out at the end of their shift.",
            ],
            "MEETING ETIQUETTE & RECORDING CONSENT:",
            "All virtual meetings with external parties or team recordings require explicit notification of attendees prior to recording. "
            "Recordings must be saved to authorized secure corporate repositories with 90-day automated lifecycle deletion policies."
        ),
        make_article(
            "Article 6. Ergonomic Standards, Workspace Safety & Remote Workers' Compensation",
            "6.1 OSHA Remote Work Compliance, Home Hazard Mitigation & Injury Reporting",
            "Nexus Corporation is committed to protecting the occupational health and physical safety of remote employees in full compliance "
            "with OSHA standards. Remote employees are required to maintain a dedicated, clean, quiet, and hazard-free home workspace. The home "
            "workstation must feature adequate illumination, properly grounded electrical outlets (prohibiting daisy-chained extension cords), "
            "clear walking pathways free of trip hazards, and ergonomic positioning of computer monitors, seating, and input peripherals.",
            "Remote employees are covered by Workers' Compensation Insurance for work-related injuries or occupational illnesses sustained while "
            "performing official job duties within their designated home workspace during scheduled working hours. Coverage does not extend to non-work "
            "areas of the home (kitchens, yards, garages) or injuries sustained during personal activities. Any work-related injury must be reported "
            "to People Operations and Facilities within 24 hours of occurrence via the Safety Desk portal to ensure prompt statutory claim filing.",
            ["Safety & Health Dimension", "OSHA Regulatory Reference", "Home Workstation Standard", "Verification & Self-Audit", "Reporting Channel"],
            [
                ["Ergonomic Posture & Seating", "OSHA Ergonomics Guidelines", "Adjustable chair with lumbar support; 90° elbow", "Annual self-assessment photo audit", "Safety Desk portal ticket"],
                ["Electrical Safety & Outlets", "OSHA 29 CFR 1910.303", "Grounded 3-prong outlets; UL-listed surge strips", "Self-certified inspection checklist", "Facilities advisory ticket"],
                ["Fire Prevention & Egress", "OSHA 29 CFR 1910.36", "Working smoke detector; clear 36\" exit pathway", "Annual home safety attestation", "HR Annual Attestation module"],
                ["Work-Related Injury at Home", "State Workers' Comp Statutes", "Occurring during official work performance", "Formal incident investigation by HR", "Report in 24 hours to People Ops"],
                ["Virtual PT Ergonomic Consult", "Corporate Wellness Program", "1-on-1 virtual evaluation by licensed PT", "Available upon employee request", "Modern Health / Hinge Health app"],
            ],
            [110, 110, 130, 100, 90],
            [
                "All remote employees must complete the mandatory Home Office Ergonomic Self-Assessment in Workday within 30 days of hire.",
                "Nexus reserves the right to conduct virtual or in-person health and safety inspections of home workspaces upon reasonable notice.",
                "Ergonomic accessories recommended by a licensed physical therapist are 100% reimbursed up to the $300 supplemental limit.",
            ],
            "WORKERS' COMP INJURY REPORTING SLA:",
            "Report any occupational accident or injury sustained while working remotely to People Operations at hr-safety@nexus-corp.internal "
            "within 24 hours. Failure to report promptly may jeopardize statutory workers' compensation insurance claim validity."
        ),
        make_article(
            "Article 7. Interstate Domestic Relocation, Tax Nexus & Geographic Pay Banding",
            "7.1 Mandatory 60-Day Relocation Notice, Corporate Tax Nexus & State Withholding",
            "Because employee residence locations trigger complex state and municipal payroll tax withholding, corporate income tax nexus, "
            "unemployment insurance liabilities, and state-specific labor law obligations, remote employees may not relocate their primary "
            "residence without prior written authorization from People Operations and Legal Compliance. Employees planning an interstate "
            "relocation must submit a formal Relocation Request via the Employee Portal at least 60 calendar days prior to the planned move date.",
            "Nexus Corporation maintains legal employment entities in designated US states. If an employee requests relocation to a jurisdiction "
            "where Nexus does not currently maintain a registered business entity, the request may be denied or require executive approval. "
            "Additionally, compensation at Nexus is benchmarked against regional geographic cost-of-labor tiers (Tier 1: SF/NYC/Seattle; "
            "Tier 2: Austin/Denver/Chicago; Tier 3: General US). Relocating across tiers triggers an automatic base salary calibration.",
            ["Geographic Pay Tier", "Metropolitan Reference Markets", "Pay Differential Benchmark", "Tax Nexus Registration", "Relocation Notice Window"],
            [
                ["Tier 1 (High Cost of Labor)", "San Francisco, New York City, Seattle, San Jose", "100% Base Benchmark (Standard)", "Nexus active corporate entity", "60 Calendar Days advance notice"],
                ["Tier 2 (Medium Cost of Labor)", "Austin, Denver, Boston, Chicago, Los Angeles", "90% - 95% of Tier 1 Benchmark", "Nexus active corporate entity", "60 Calendar Days advance notice"],
                ["Tier 3 (National Standard)", "All other US metropolitan and rural regions", "80% - 85% of Tier 1 Benchmark", "Registration check required", "60 Calendar Days advance notice"],
                ["Unregistered State Request", "Jurisdictions without current Nexus entity", "Case-by-case legal review", "Requires Secretary of State filing", "90 Calendar Days advance notice"],
                ["Temporary Relocation (<60d)", "Temporary stay while maintaining primary home", "No salary adjustment applied", "No state tax nexus triggered", "14 Calendar Days advance notice"],
            ],
            [110, 115, 115, 110, 90],
            [
                "Relocating without prior HR authorization constitutes unauthorized absence and gross misconduct resulting in termination.",
                "Salary adjustments resulting from geographic tier moves take effect on the first payroll cycle following confirmed residency.",
                "Nexus does not provide moving or relocation expense reimbursements for voluntary employee-initiated relocations.",
            ],
            "UNAUTHORIZED RELOCATION PENALTIES:",
            "Moving your primary tax residence without notifying People Operations creates severe tax penalties and civil liability for "
            "unpaid state payroll taxes. Employees are personally liable for back taxes and penalties arising from undisclosed relocations."
        ),
        make_article(
            "Article 8. Performance Accountability, Deliverables Tracking & Remote Eligibility",
            "8.1 Objective Milestones, Productivity Metrics & Revocation of Remote Privileges",
            "Remote work at Nexus Corporation is an earned operational privilege, not an unconditional statutory entitlement. Continued "
            "eligibility for remote and hybrid work is contingent upon sustained high performance, punctuality, active communication, and the "
            "consistent attainment of quarterly Objectives and Key Results (OKRs). Performance is evaluated based on concrete work output, "
            "code commits, customer deliverables, and milestone completion, rather than mere physical or digital presence.",
            "If an employee performance drops below acceptable standards—evidenced by an overall rating of Tier 2 (Partially Meets) or Tier 1 "
            "(Unsatisfactory), missed deadlines, unresponsiveness during core hours, or placement on a Performance Improvement Plan (PIP)—the "
            "department manager, in consultation with People Operations, may immediately suspend or permanently revoke remote work privileges. "
            "Employees whose remote privileges are revoked must report to the nearest regional office hub on a full-time 5-day on-site basis.",
            ["Performance Criterion", "Measurement Metric", "Satisfactory Standard", "Underperformance Trigger", "Action / Sanction"],
            [
                ["OKR Goal Attainment", "Quarterly deliverable completion %", "At least 85% of planned deliverables", "Below 70% completion for two quarters", "Placement on 30-day PIP; remote review"],
                ["Core Hours Availability", "Slack responsiveness & standup attendance", "Active 10:00 AM - 4:00 PM local", "Unexplained unreachability > 3 times", "Formal counseling; in-office mandate"],
                ["Quality of Deliverables", "Peer review scores & QA error rates", "Meets or exceeds team engineering SLAs", "Frequent rework, high bug escape rates", "Mandatory paired work on-site"],
                ["Meeting Participation", "Attendance at required team ceremonies", "100% attendance (absences pre-excused)", "Missed client meetings or sprint standups", "Manager written warning in file"],
                ["Overall Performance Rating", "Annual Lattice appraisal score", "Tier 3 (Meets Expectations) or above", "Tier 1 or Tier 2 rating", "Revocation of remote work status"],
            ],
            [110, 110, 110, 110, 100],
            [
                "Revocation of remote privileges requires 14 calendar days written advance notice to allow the employee to arrange commuting.",
                "Employees on a formal PIP are required to work on-site 5 days a week during the PIP duration to facilitate intensive coaching.",
                "Remote privileges may be reinstated after 6 months of sustained Tier 3+ performance and Department Director approval.",
            ],
            "MANAGEMENT PREROGATIVE ON REVOCATION:",
            "Department Vice Presidents possess full operational authority to modify or revoke remote arrangements for teams or individuals "
            "when business needs, customer escalation trends, or collaborative deliverables require sustained in-person co-location."
        ),
        make_article(
            "Article 9. Company Hardware Custody, Equipment Refresh & Offboarding Asset Recovery",
            "9.1 Asset Tracking, 3-Year Refresh Cadence & Prepaid Return Logistics",
            "All hardware equipment provisioned by Nexus—including MacBook Pro and Lenovo ThinkPad laptops, external monitors, docking "
            "stations, and security hardware tokens—remains the sole legal property of Nexus Corporation. Employees are designated as custodial "
            "trustees of company assets and are responsible for exercising reasonable care to prevent damage, loss, or unauthorized access. "
            "All assets are assigned a unique barcode asset tag registered in the enterprise IT Asset Management (ITAM) database.",
            "Nexus operates a standard 36-month hardware refresh lifecycle for engineering and technical roles, and a 48-month lifecycle for "
            "operational roles. Upon reaching the refresh threshold, IT Logistics automatically ships a new, pre-configured laptop to the employee "
            "residence with automated data migration software. Upon separation from employment—whether voluntary or involuntary—all corporate "
            "hardware must be securely returned to Nexus within 5 business days using prepaid, insured shipping containers dispatched by IT.",
            ["Hardware Asset Type", "Standard Provisioning Spec", "Refresh Lifecycle", "Employee Custody Obligation", "Offboarding Return Mandate"],
            [
                ["Engineering Laptop", "Apple MacBook Pro 16\" M3 Max / 64GB", "36 Months (3 Years)", "Keep encrypted; no personal use", "Must return within 5 business days"],
                ["Business / Operations Laptop", "Lenovo ThinkPad X1 Carbon / 32GB", "48 Months (4 Years)", "Keep encrypted; install corporate software", "Must return within 5 business days"],
                ["Hardware Security Key", "Yubico YubiKey 5C NFC (Pair)", "Replace upon damage/loss", "Attach to personal keychain; protect credentials", "Must return or verify destruction"],
                ["Dual Display Monitors", "Dell UltraSharp 27\" 4K USB-C Hub", "60 Months (5 Years)", "Maintain in home workspace", "Employee may retain if tenure > 2 yrs"],
                ["Peripherals & Cables", "Logitech MX Master 3S Mouse & Keys", "Replaced as needed", "Careful daily operation", "Employee may retain upon departure"],
            ],
            [110, 115, 95, 110, 110],
            [
                "Laptops not returned within 10 business days of separation are declared stolen property, remotely wiped, and referred to law enforcement.",
                "Employees are not held financially liable for accidental hardware damage covered under AppleCare+ or Lenovo Accidental Damage Protection.",
                "Gross negligence, intentional destruction, or loss of equipment may result in payroll deductions to the extent permitted by law.",
            ],
            "EQUIPMENT RETURN LOGISTICS:",
            "Upon resignation or termination, IT Logistics dispatches prepaid FedEx shipping boxes with custom molded foam to your home address. "
            "Pack all hardware securely and drop off at any authorized FedEx location within 5 business days of your final day of employment."
        ),
        make_article(
            "Article 10. Medical Remote Accommodations, Caregiver Flexibility & Temporary Exceptions",
            "10.1 ADA Remote Work Accommodations, Interactive Dialogue & Temporary Flexibility",
            "Nexus Corporation is deeply dedicated to providing reasonable accommodations to qualified individuals with physical or mental "
            "disabilities under Title I of the Americans with Disabilities Act (ADA) and the ADA Amendments Act (ADAAA). When an employee "
            "documented medical condition prevents regular commuting or physical on-site presence, full-time remote work may be evaluated "
            "and granted as a reasonable accommodation through a structured, good-faith interactive process with People Operations.",
            "Employees seeking medical remote accommodations must submit a formal Accommodation Request through the HR Benefits Portal, "
            "accompanied by documentation from a licensed healthcare provider outlining the functional limitations and duration. In addition, "
            "Nexus provides Temporary Caregiver Flexibility allowing employees experiencing family medical emergencies or childcare crises to "
            "work 100% remotely for up to 30 calendar days upon Department Director approval, without requiring formal ADA certification.",
            ["Accommodation Category", "Qualifying Criteria", "Medical Documentation", "Approval Timeline", "Review & Recertification"],
            [
                ["Permanent ADA Remote Track", "Documented physical or mental disability", "Licensed physician medical certification", "Interactive dialogue in 5 business days", "Annual medical recertification"],
                ["Temporary Medical Remote", "Post-surgical recovery, pregnancy, injury", "Physician note with estimated return date", "Expedited approval within 48 hours", "Re-evaluated every 60 days"],
                ["Emergency Caregiver Exception", "Acute family medical emergency or crisis", "Self-certification form in HR Portal", "Director approval within 24 hours", "Maximum 30 days per event"],
                ["Immunocompromised Protection", "Documented immunosuppressive therapy", "Oncologist / Specialist clinical note", "Immediate temporary remote status", "Biannual clinical review"],
                ["Neurodivergent Work Modality", "ADHD, autism spectrum, sensory needs", "Clinical psychologist assessment report", "Interactive workspace adaptation", "Annual check-in with HR Lead"],
            ],
            [115, 115, 110, 100, 100],
            [
                "Remote accommodation determinations are made on an individualized, case-by-case basis considering essential job functions.",
                "Medical documentation is stored in an encrypted HIPAA-compliant vault accessible exclusively to the HR Benefits team.",
                "Denial of a requested accommodation is reviewed by the Chief Legal Officer and Chief People Officer before final notice.",
            ],
            "ADA INTERACTIVE PROCESS SLA:",
            "People Operations initiates the interactive accommodation dialogue within 5 business days of receiving medical documentation. "
            "During the evaluation period, temporary remote work is granted to safeguard employee health without prejudice."
        ),
        make_article(
            "Article 11. Compliance Auditing, Spot Inspections & Revocation of Remote Privileges",
            "11.1 Quarterly Badge Telemetry Audits, Spot Security Checks & Formal Appeals",
            "To maintain equity, transparency, and operational accountability across our hybrid workforce, People Operations conducts regular "
            "Quarterly Compliance Audits of on-site attendance data. Badge swipe telemetry from facility turnstiles is cross-referenced with "
            "approved remote schedules in Workday to verify adherence to mandatory Tuesday and Thursday in-office commitments. Employees who "
            "fall below 80% compliance with mandatory on-site days within a single quarter are flagged for supervisory compliance review.",
            "First compliance flags trigger a documented counseling conversation between the employee and manager. Continued non-compliance "
            "in the subsequent quarter triggers formal revocation of remote privileges and a mandatory 5-day on-site requirement for a minimum "
            "of 90 calendar days. Employees who believe a revocation was issued in error or due to extenuating personal circumstances may submit "
            "a formal written appeal to the Employee Relations Appeals Panel within 7 business days of revocation notice.",
            ["Audit Dimension", "Audit Mechanism", "Audit Frequency", "Accountability Authority", "Escalation & Consequences"],
            [
                ["Badge Swipe Verification", "Automated turnstile security logs", "Monthly data pulls / Quarterly audit", "People Operations Operations Lead", "Compliance flag sent to manager"],
                ["Security Endpoint Posture", "CrowdStrike & Jamf posture scans", "Continuous automated telemetry", "Security Operations Center (SOC)", "Automated VPN block upon failure"],
                ["Workday Time Tracking", "Daily timesheet clock-in audits", "Bi-weekly payroll close review", "Payroll Compliance Manager", "Mandatory overtime correction / PIP"],
                ["Broadband Speed Validation", "Self-reported quarterly speedtest", "Quarterly attestation check", "IT Service Desk Operations", "Follow-up ISP review / subsidy review"],
                ["Home Safety Attestation", "Annual virtual ergonomic checklist", "Annual attestation in January", "Facilities Safety Operations", "Mandatory ergonomic retraining"],
            ],
            [110, 110, 110, 110, 100],
            [
                "Badge data is used strictly for aggregate policy compliance verification and never for micromanaging individual movement.",
                "Managers cannot grant permanent verbal exemptions from mandatory in-office days; all exemptions require written VP approval.",
                "Appeals submitted to the Employee Relations Appeals Panel receive a final binding written decision within 10 business days.",
            ],
            "ANNUAL REMOTE WORK AGREEMENT:",
            "All hybrid and remote employees must review, sign, and re-certify their Remote Work Agreement by January 31st of each calendar year. "
            "Failure to complete the annual re-certification will result in automatic suspension of remote privileges."
        ),
        make_article(
            "Article 12. Corporate Governance, Statutory Tax Disclosures & Executive Authorization",
            "12.1 Regulatory Alignment, Telecommuting Tax Compliance & Policy Governance",
            "This Remote Work & Hybrid Workplace Policy operates under the legal governance of the Executive Leadership Team and the Board "
            "Compensation Committee of Nexus Corporation. The policy is designed in strict compliance with federal, state, and local employment "
            "regulations, including the Fair Labor Standards Act (FLSA), Occupational Safety and Health Act (OSHA), Americans with Disabilities "
            "Act (ADA), Internal Revenue Code Section 132 (fringe benefits), and international telework directives across our operating entities.",
            "Employees are reminded that home office tax deductions under federal IRS rules are generally restricted for W-2 corporate employees "
            "under the Tax Cuts and Jobs Act (TCJA). Nexus does not provide personal tax advice, and employees are advised to consult a certified "
            "tax professional regarding state tax withholdings, local commuter taxes, and home office considerations. This policy supersedes all "
            "prior local agreements, manager exceptions, and verbal representations regarding remote work cadence and arrangements.",
            ["Governance Pillar", "Statutory Framework", "Oversight Committee", "Enforcement Responsibility", "Annual Calibration Cycle"],
            [
                ["Fair Labor Standards (FLSA)", "29 U.S.C. Chapter 8 (Overtime)", "Wage & Hour Compliance Board", "People Operations & Payroll", "Biannual audit of non-exempt hours"],
                ["Occupational Safety (OSHA)", "29 U.S.C. 654 (General Duty)", "Facilities Safety Committee", "Director of Global Facilities", "Annual home safety audit report"],
                ["Tax Nexus & Withholding", "IRS Code & State Tax Statutes", "Corporate Tax & Finance Team", "Chief Financial Officer (CFO)", "Quarterly multi-state tax review"],
                ["Data Security & Export", "NIST 800-53 & OFAC Regulations", "Cybersecurity Governance Board", "Chief Information Security Officer", "Continuous automated compliance"],
                ["Disability Accommodations", "ADA Title I & Rehabilitation Act", "Accommodations Review Board", "VP of People Operations", "Annual EEO calibration review"],
            ],
            [115, 115, 110, 100, 100],
            [
                "Nexus reserves the right to amend, suspend, or terminate this policy at any time upon 30 days written notice to employees.",
                "Questions regarding policy interpretation should be submitted via the HR Help Desk portal under 'Workforce Mobility'.",
                "Retaliation against any employee exercising statutory rights under telework accommodation provisions is strictly forbidden.",
            ],
            "EXECUTIVE RATIFICATION CLAUSE:",
            "This policy has been formally ratified by the Chief People Officer, General Counsel, and Chief Financial Officer of Nexus Corporation "
            "effective January 1, 2026, establishing binding operational standards for all global operations and operating subsidiaries."
        ),
    ]

    return {
        "filename": "remote_work_policy.pdf",
        "meta": {
            "id": "HR-POL-004",
            "title": "Remote Work & Hybrid Workplace Policy",
            "category": "Workforce Flexibility | Hybrid Work Operations",
            "eff_date": "January 1, 2026",
        },
        "sections": sections,
    }

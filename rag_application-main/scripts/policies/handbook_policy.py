"""Employee Handbook & Corporate Code of Conduct (HR-POL-002) dense content module."""
from policies.common import make_article

def get_document():
    sections = [
        make_article(
            "Article 1. Corporate Mission, Values, Code of Conduct & Anti-Harassment Policy",
            "1.1 Organizational Mission & Core Values Framework",
            "Welcome to Nexus Corporation. Our mission is to architect transformative enterprise technology solutions that empower our "
            "clients to operate at peak efficiency, competitive agility, and strategic foresight. We pursue this mission with an unwavering "
            "commitment to five foundational corporate values: (1) Integrity -- we operate with complete transparency and honor all commitments; "
            "(2) Innovation -- we challenge conventional thinking and reward intellectual curiosity; (3) Accountability -- every team member "
            "owns their work, decisions, and impact; (4) Inclusion -- we actively cultivate a workforce reflecting the diversity of human experience; "
            "and (5) Customer Centricity -- every product decision is measured against customer value delivered. All personnel are required to "
            "internalize and consistently demonstrate these values in all professional interactions.",
            "Nexus Corporation maintains absolute zero-tolerance for harassment of any form -- verbal, visual, physical, electronic, or psychological. "
            "Harassment includes unwelcome sexual advances, requests for sexual favors, offensive slurs or epithets regarding protected characteristics, "
            "intimidating or hostile conduct, and posting derogatory content in physical or digital workspaces. Any retaliatory action taken "
            "against an employee who in good faith reports harassment or participates in an investigation results in immediate summary dismissal, "
            "regardless of seniority or organizational standing. Objective investigations are led by People Operations outside the reporting chain.",
            ["Core Value Pillar", "Behavioral Standard Expected", "Prohibited Conduct", "Accountability Metric"],
            [
                ["1. Integrity", "Uncompromising honesty, truth in billing and reporting", "Falsification of data, misleading clients or peers", "Zero audit findings in annual audit"],
                ["2. Innovation", "Proactive experimentation, customer-driven iteration", "Stifling team ideas, resisting necessary changes", "Patent & innovation program engagement"],
                ["3. Accountability", "Owning deadlines, transparent status reporting", "Shifting blame, concealing errors or missed SLAs", "OKR completion & peer review ratings"],
                ["4. Inclusion", "Respectful active listening, welcoming diverse voices", "Exclusionary behavior, microaggressions, bias", "Inclusion index in annual pulse survey"],
                ["5. Customer Centricity", "Delivering robust quality, rapid customer response", "Shipping substandard work, ignoring feedback", "Client satisfaction (CSAT) scores"],
            ],
            [95, 160, 155, 130],
            [
                "All employees must complete mandatory anti-harassment training within 30 days of hire and annually thereafter.",
                "Reports of harassment may be filed with any HR partner or via the confidential Ethics Hotline at 1-800-555-0199.",
                "Managers who witness or receive harassment allegations must report them to People Operations within 24 hours.",
            ],
            "ZERO-TOLERANCE HARASSMENT MANDATE:",
            "Harassment in any form destroys psychological safety and organizational trust. Nexus strictly investigates every report with full "
            "confidentiality. Substantiated harassment results in immediate disciplinary action up to termination and legal prosecution."
        ),
        make_article(
            "Article 2. Working Hours, Attendance, Overtime & Rest Break Standards",
            "2.1 Standard Workweek, Core Collaboration Hours & Timekeeping Governance",
            "The standard workweek at Nexus consists of 40 scheduled working hours for all full-time regular personnel, Monday through "
            "Friday. Standard business hours for office-based staff are 9:00 AM to 6:00 PM local time, inclusive of a 60-minute unpaid meal break. "
            "Core collaboration hours -- during which all hybrid and remote personnel must be digitally reachable via Slack, Zoom, and email -- "
            "are 10:00 AM to 4:00 PM local time. Flexible scheduling outside core hours must receive written manager approval.",
            "Non-exempt employees must accurately record daily start times, meal breaks, and end times in Workday Time Tracking. Working "
            "off-the-clock is strictly prohibited. Overtime work in excess of 40 hours in a single workweek requires prior written manager "
            "authorization. Authorized overtime is compensated at 1.5 times regular hourly pay for hours 40 through 50, and 2.0 times regular "
            "hourly pay for hours beyond 50 in a single workweek, consistent with the Fair Labor Standards Act (FLSA) and applicable state laws.",
            ["Employee Classification", "Standard Weekly Hours", "Time Recording Channel", "Overtime Eligibility", "Meal & Rest Break Mandate"],
            [
                ["Exempt (Professional / Exec)", "40+ hours as needed for deliverables", "Exception reporting only (PTO/Sick)", "Exempt from statutory overtime", "Discretionary self-managed breaks"],
                ["Non-Exempt (Hourly Staff)", "40 scheduled hours standard", "Daily clock-in/out via Workday", "1.5x pay over 40 hrs; 2x over 50 hrs", "Mandatory 30m meal + two 15m breaks"],
                ["Part-Time Regular Staff", "20 to 29 scheduled hours", "Daily clock-in/out via Workday", "1.5x pay over 40 hrs in workweek", "Mandatory 30m meal if shift > 5 hrs"],
                ["Interns / Co-op Students", "Up to 40 hours during term", "Daily clock-in/out via Workday", "1.5x pay over 40 hrs in workweek", "Mandatory 30m meal + two 15m breaks"],
                ["Contractor Workforce", "As stipulated in SOW / Vendor contract", "Vendor timekeeping system", "Governed by master vendor agreement", "Governed by third-party agency"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Non-exempt personnel must take their 30-minute unpaid meal break no later than the start of their fifth hour of continuous work.",
                "Two 15-minute paid rest breaks are provided per 8-hour shift and may not be combined or used to shorten scheduled working hours.",
                "Punctual attendance is critical; unexcused tardiness exceeding 15 minutes more than twice per quarter triggers formal counseling.",
            ],
            "OFF-THE-CLOCK WORK PROHIBITION:",
            "Non-exempt personnel are strictly forbidden from performing any work, answering emails, or checking Slack messages outside "
            "clocked-in hours. Managers who request or coerce off-the-clock work face immediate disciplinary sanctions including demotion."
        ),
        make_article(
            "Article 3. Professional Development, Tuition Assistance & Learning Stipend",
            "3.1 Annual Learning Budget, Eligibility Criteria & Tuition Reimbursement",
            "Nexus Corporation believes continuous learning is central to our competitive advantage and employee fulfillment. Every full-time "
            "regular employee with at least 6 months of continuous service is entitled to an Annual Professional Development Stipend of $1,200 "
            "per calendar year. This stipend covers job-relevant technical certifications, professional conference attendance, technical books, "
            "and accredited online courses. Stipend funds reset on January 1st annually, do not roll over, and are not payable upon separation.",
            "In addition, Nexus provides an advanced Tuition Assistance Program reimbursing up to $5,250 annually for accredited undergraduate "
            "or graduate degree coursework in relevant disciplines (Computer Science, Data Science, Cybersecurity, Business, and HR Management). "
            "Coursework must receive VP of People Operations pre-approval. Employees must achieve a grade of 'B' or higher to receive reimbursement. "
            "Employees receiving tuition assistance in excess of $2,500 must execute a 12-month post-completion retention commitment agreement.",
            ["Development Program", "Annual Funding Cap", "Eligibility Threshold", "Approved Expenses", "Retention Obligation"],
            [
                ["Annual Learning Stipend", "$1,200 per calendar year", "6 months continuous service", "Certifications, courses, books, seminars", "None (100% company funded)"],
                ["Tuition Assistance Program", "$5,250 per calendar year", "12 months continuous service", "Accredited degree courses, lab fees", "12-month retention agreement"],
                ["Executive Leadership Track", "Up to $10,000 per program", "Nomination by C-Suite / EVP", "Executive MBA modules, leadership seminars", "24-month retention agreement"],
                ["Technical Certification Bonus", "$500 one-time per cert", "Full-time technical staff", "AWS Pro, CISSP, PMP, CISA, Kubernetes", "Must remain active 6 months"],
                ["Conference Attendance Grant", "Up to $2,500 per year", "Department Director approval", "Approved major industry conferences", "Post-conference team tech talk"],
            ],
            [120, 105, 110, 115, 90],
            [
                "Expense claims for learning stipends must be submitted within 30 days of completion via Navan Expense with proof of passing/completion.",
                "Voluntary departure within 12 months of receiving tuition reimbursement results in pro-rated repayment deducted from final wages.",
                "Employees are allocated up to 4 paid hours per month during standard work hours for verified professional development study.",
            ],
            "LEARNING REIMBURSEMENT SLA:",
            "Submit tuition reimbursement pre-approval requests at least 30 days prior to course registration through the Employee Portal. "
            "People Operations reviews and approves applications within 5 business days of submission."
        ),
        make_article(
            "Article 4. Performance Management, Career Progression & Appraisal Cycles",
            "4.1 Evaluation Architecture, Biannual Reviews & Merit Linkage",
            "Nexus Corporation operates a structured, continuous performance management model anchored by bi-weekly 1-on-1 check-ins and "
            "two formal biannual appraisal cycles: Mid-Year Review in June (focusing on mid-course OKR calibration and development) and End-of-Year "
            "Review in December (yielding final performance ratings, merit salary adjustments, and promotional outcomes). Reviews are conducted "
            "in the Lattice platform and utilize a calibrated 5-tier evaluation rating scale.",
            "Overall annual performance ratings are weighted across three core pillars: 50% Quantitative OKR Attainment, 30% Core Leadership "
            "Competencies, and 20% Peer Contribution & Cultural Values (requiring a minimum of 3 cross-functional peer reviews). Rating calibration "
            "committees meet in January to eliminate grading bias across departments. Annual merit salary adjustments and promotions take "
            "effect on February 1st following December calibration completion.",
            ["Performance Tier", "Rating Score", "Performance Definition", "Target Merit Adjustment", "Bonus Multiplier"],
            [
                ["Tier 5: Exceptional", "4.8 - 5.0", "Consistently exceeds exceptional standards; industry-leading impact", "7.0% - 10.0% Base Increase", "130% - 150% Target Bonus"],
                ["Tier 4: Exceeds Expectations", "3.8 - 4.7", "Consistently outperforms standard deliverables and role scope", "4.5% - 6.5% Base Increase", "110% - 125% Target Bonus"],
                ["Tier 3: Meets Expectations", "2.8 - 3.7", "Fully meets all key role requirements and project OKRs", "2.5% - 4.0% Base Increase", "95% - 105% Target Bonus"],
                ["Tier 2: Partially Meets", "2.0 - 2.7", "Inconsistent delivery; performance gaps in core deliverables", "0.0% Merit Increase", "0% - 50% Target Bonus (PIP)"],
                ["Tier 1: Unsatisfactory", "1.0 - 1.9", "Fails to meet minimum requirements; urgent remediation needed", "0.0% Merit Increase", "0% Target Bonus (Immediate PIP)"],
            ],
            [105, 75, 160, 105, 95],
            [
                "Employees rated Tier 2 or Tier 1 are placed on a structured 30-to-60 day Performance Improvement Plan (PIP).",
                "Employees must be employed in their role for at least 90 calendar days prior to cycle close to receive a formal merit rating.",
                "Rating disputes may be formally appealed to People Operations within 10 business days of the review meeting.",
            ],
            "PERFORMANCE FAIRNESS GUARANTEE:",
            "Calibration committees include HR Business Partners and independent department leads to ensure rating equity across all teams. "
            "Unconscious bias audits are performed across demographic groups before any compensation adjustments are finalized."
        ),
        make_article(
            "Article 5. Disciplinary Standards, Corrective Action Framework & Termination",
            "5.1 Four-Stage Progressive Discipline Process & Summary Dismissal Grounds",
            "Nexus Corporation believes in providing employees with transparent feedback and structured opportunities to correct performance "
            "or conduct deficiencies through our Four-Stage Progressive Disciplinary Framework. The stages include: (1) Documented Verbal Counseling, "
            "(2) Formal Written Warning, (3) Final Written Warning with Discretionary Unpaid Suspension (1 to 5 days), and (4) Involuntary Termination "
            "for Cause. Each stage involves written documentation in the personnel file and an opportunity for the employee to provide a written response.",
            "Certain severe offenses constitute Gross Misconduct and bypass progressive discipline entirely, triggering immediate suspension "
            "pending investigation and summary termination for cause upon substantiation. Summary termination offenses include: physical violence, "
            "theft, willful breach of customer confidential data or trade secrets, material falsification of expense reports or timesheets, "
            "unlawful discrimination, and possession of controlled substances on corporate premises.",
            ["Disciplinary Stage", "Issuing Authority", "Documentation Requirement", "Active Duration in File", "Impact on Merit / Promotion"],
            [
                ["Stage 1: Documented Counseling", "Direct Line Manager", "Written counseling summary signed by employee", "6 Months active duration", "No impact on merit eligibility"],
                ["Stage 2: Written Warning", "Manager + HR Business Partner", "Formal warning with specific cure milestones", "12 Months active duration", "Ineligible for promotion for 6 mos"],
                ["Stage 3: Final Warning & Suspension", "Department VP + People Ops Lead", "Final notice with 1-5 day unpaid suspension", "24 Months active duration", "Ineligible for merit or promo 12 mos"],
                ["Stage 4: Termination for Cause", "VP People Ops + General Counsel", "Formal separation dossier with full evidence", "Permanent corporate record", "Immediate forfeiture of bonus/severance"],
                ["Summary Gross Misconduct", "Chief People Officer & Legal", "Immediate suspension & expedited investigation", "Permanent corporate record", "Immediate dismissal without severance"],
            ],
            [110, 110, 125, 95, 100],
            [
                "Employees have the statutory right to submit a written rebuttal within 5 business days of receiving any written warning.",
                "Disciplinary records are expunged from active consideration after the specified duration if no further infractions occur.",
                "Severance benefits are never provided for terminations resulting from gross misconduct or disciplinary cause.",
            ],
            "RIGHT TO REBUTTAL & APPEAL:",
            "Employees who dispute a disciplinary action may file a formal grievance with the Employee Relations Appeals Panel within 7 "
            "business days. The panel conducts an independent review and issues a final written determination within 10 business days."
        ),
        make_article(
            "Article 6. Corporate Systems, Acceptable Use, IT Security & Workplace Safety",
            "6.1 Technology Asset Custody, Electronic Communications & Facility Safety",
            "All computers, mobile devices, communication accounts (Slack, Google Workspace, email), cloud repositories, and networks "
            "provisioned by Nexus remain sole corporate property throughout employment. Employees are granted a non-exclusive license to use "
            "these systems strictly for legitimate business purposes. Nexus reserves the legal right to monitor, log, audit, and inspect all "
            "communications and activities conducted on corporate hardware or networks without prior notice.",
            "Employees must adhere strictly to information security protocols: passwords must be a minimum of 14 characters and rotated every "
            "90 days; multi-factor authentication (MFA) via Okta Push or hardware YubiKeys is mandatory; screens must be locked (Win+L / Ctrl+Cmd+Q) "
            "whenever stepping away from workstations; and USB mass storage devices are strictly prohibited. In physical facilities, all personnel "
            "must wear security badges, report hazards to Facilities via Safety Desk, and adhere to OSHA 29 CFR Part 1910 safety standards.",
            ["IT & Safety Domain", "Mandatory Security Standard", "Restricted / Prohibited Activity", "Enforcement & Monitoring"],
            [
                ["Workstation Security", "Clean Desk Policy; screen lock after 5m idle", "Leaving unencrypted sensitive documents visible", "Automated screen lock; physical audit"],
                ["Password & Authentication", "14+ chars; Okta MFA; 90-day password rotation", "Password sharing; SMS 2FA; writing down creds", "Okta Identity Engine automated block"],
                ["External Media & Storage", "Removable USB mass storage disabled", "Connecting unauthorized USB drives or hard drives", "CrowdStrike endpoint agent block"],
                ["Email & Cloud Storage", "Use corporate Google Drive & Slack exclusively", "Auto-forwarding email to personal accounts", "Google Workspace DLP automated alerts"],
                ["Physical Facility Safety", "Display corporate badge at all times; report hazards", "Tailgating through secure doors; blocking exits", "CCTV monitoring; keycard badge logs"],
            ],
            [100, 125, 145, 170],
            [
                "Loss or theft of any corporate laptop or mobile device must be reported to IT Security within 1 hour of discovery.",
                "Company-provisioned hardware is refreshed every 36 months for engineering staff and 48 months for general staff.",
                "Physical safety incidents and workplace injuries must be reported to Facilities within 24 hours to comply with OSHA.",
            ],
            "SECURITY BREACH REPORTING SLA:",
            "Any suspected phishing attack, credential compromise, or data loss incident must be reported immediately to security@nexus-corp.internal "
            "or via the PhishAlarm button in email. The Security Operations Center (SOC) operates 24/7/365 with a 15-minute response SLA."
        ),
        make_article(
            "Article 7. Intellectual Property, Patents, Proprietary Data & Inventions Assignment",
            "7.1 Corporate Ownership of Inventions, Confidential Information & Trade Secrets",
            "As a condition of employment, all employees execute the Nexus Employee Proprietary Information and Inventions Agreement (PIIA). "
            "Under this binding agreement, all inventions, software code, algorithms, designs, documentation, discoveries, and improvements "
            "developed by an employee during their tenure—whether during standard work hours or using company resources—are the sole and "
            "exclusive intellectual property of Nexus Corporation worldwide. Employees assign all patent, copyright, and trade secret rights to Nexus.",
            "Employees are strictly prohibited from utilizing, copying, or disclosing corporate proprietary information, source code, customer data, "
            "financial models, or business strategies outside authorized corporate channels. Upon separation from Nexus, employees must immediately "
            "surrender all corporate devices, documents, storage media, and confidential files, and certify that no proprietary information has "
            "been retained on personal cloud accounts, external drives, or home systems. Violations trigger immediate civil and criminal litigation.",
            ["IP Protection Area", "Corporate Legal Standard", "Employee Obligation", "Remedies for Breach"],
            [
                ["Software Code & Algorithms", "Sole corporate ownership under work-for-hire", "Commit all code to corporate GitHub repositories", "Immediate termination; injunctive relief"],
                ["Patentable Inventions", "Worldwide patent rights assigned to Nexus", "Disclose inventions promptly via Legal IP Portal", "Patent inventor cash awards ($1,500/filing)"],
                ["Customer Data & PII", "Strict confidentiality under GDPR, CCPA, SOC 2", "Access on strict need-to-know basis via Okta", "Immediate dismissal; regulatory penalties"],
                ["Trade Secrets & Roadmaps", "Strict confidentiality under Defend Trade Secrets Act", "Mark sensitive docs 'Confidential - Nexus'", "Civil damages, criminal prosecution"],
                ["Prior Inventions Exclusions", "Exempted only if listed on PIIA Exhibit A at hire", "Declare prior inventions during onboarding", "Unlisted inventions assigned to Nexus"],
            ],
            [110, 120, 130, 180],
            [
                "Nexus rewards employee innovation through our Patent Incentive Program, awarding $1,500 upon filing and $3,000 upon grant.",
                "Using open-source libraries with copyleft licenses (GPL/AGPL) requires pre-approval from the Open Source Review Board (OSRB).",
                "Non-disclosure obligations regarding trade secrets survive indefinitely following employment separation.",
            ],
            "PROPRIETARY INFORMATION MANDATE:",
            "Exfiltrating company source code, client lists, or internal roadmaps to personal email or cloud drives is a felony under the Economic "
            "Espionage Act and Defend Trade Secrets Act. Nexus monitors file transfers via CrowdStrike DLP with automated law enforcement referrals."
        ),
        make_article(
            "Article 8. Social Media, External Communications, Media Inquiries & Public Representation",
            "8.1 Guidelines for Public Posts, Professional Social Profiles & Media Spokespersons",
            "Nexus recognizes the role of social media in professional networking and personal expression. However, employees must exercise "
            "discretion and sound judgment whenever engaging online in ways that could implicate Nexus Corporation. Employees posting on "
            "personal platforms (LinkedIn, X/Twitter, Instagram, YouTube) must make clear that their opinions are personal and do not represent "
            "the company, using disclaimers such as 'Views expressed are my own.' Never disclose confidential corporate data or roadmap details.",
            "Only designated corporate spokespersons authorized by the VP of Corporate Communications may speak on behalf of Nexus to journalists, "
            "news organizations, industry analysts, or conference press panels. If contacted by a reporter, journalist, or media outlet, employees "
            "must decline comment politely and immediately forward the inquiry to press@nexus-corp.internal. Employees participating as technical "
            "conference speakers must obtain Corporate Communications slide review at least 10 business days prior to the presentation date.",
            ["Communication Channel", "Authorized Personnel", "Content Pre-Approval Rule", "Prohibited Activities"],
            [
                ["Press & News Media", "CEO, CFO, VP Corporate Comms only", "100% pre-approved by PR Team", "Unofficial interviews, 'off-the-record' comments"],
                ["Technical Conferences", "Approved technical leaders / speakers", "Slide deck review 10 days prior", "Revealing unannounced features or architectures"],
                ["Personal Social Media", "All employees (in personal capacity)", "No approval needed for personal views", "Posting customer logos, internal Slack screenshots"],
                ["Product Reviews / Glassdoor", "All employees (in personal capacity)", "Personal opinion; maintain confidentiality", "Disclosing non-public financial or customer data"],
                ["Investor & Analyst Calls", "Investor Relations & Executive Team", "Formal SEC filings & scripts", "Any unauthorized forward-looking commentary"],
            ],
            [110, 115, 120, 195],
            [
                "Posting screenshots of internal Slack conversations, Jira tickets, or confidential dashboards is strictly prohibited.",
                "Employees must not post negative comments or disparaging remarks about competitors using fake or undisclosed identities.",
                "LinkedIn professional profiles may accurately cite your role, department, and general non-confidential project scope.",
            ],
            "MEDIA INQUIRY PROTOCOL:",
            "All media and journalist inquiries must be forwarded immediately to press@nexus-corp.internal without comment. Never provide "
            "background quotes or anonymous commentary regarding Nexus operations, finances, or executive decisions."
        ),
        make_article(
            "Article 9. Conflict of Interest, Outside Business Activities, Moonlighting & Gifts",
            "9.1 Governance of Outside Employment, Board Memberships & Vendor Gifts",
            "Nexus employees owe an undivided duty of loyalty to the corporation. Employees must avoid any outside business activity, "
            "investment, or personal relationship that creates an actual or perceived conflict of interest with their corporate duties. "
            "Full-time employees may not engage in outside commercial employment, consulting, or freelance work ('moonlighting') that: "
            "(a) competes directly with Nexus products; (b) utilizes company time, equipment, or facilities; or (c) impairs job performance.",
            "All secondary employment, advisory roles, and board directorships require prior written disclosure and approval via the Conflict "
            "of Interest Portal. Regarding business courtesies, employees may not accept gifts, entertainment, or travel from vendors, suppliers, "
            "or clients with an aggregate value exceeding $75 per calendar year. Any gift exceeding this threshold must be politely declined "
            "or reported to Legal Compliance. Cash, gift cards, and loan accommodations from vendors or clients are strictly banned.",
            ["Activity Category", "Approval Requirement", "Reviewing Authority", "Annual Limit / Restriction"],
            [
                ["Secondary Employment / Consulting", "Mandatory pre-approval before commencing", "Manager & VP of People Ops", "Must not exceed 10 hrs/week; zero overlap"],
                ["Advisory Board / Directorships", "Mandatory pre-approval before accepting", "General Counsel & CEO", "Must not be a customer, competitor, or vendor"],
                ["Vendor Business Courtesies", "Pre-approval required if > $75", "Legal Compliance Officer", "$75 aggregate annual limit per vendor"],
                ["Client Business Dinners", "No prior approval if under $100/person", "Expense report review by Director", "$100 per person; business purpose required"],
                ["Stock Ownership in Vendors", "Mandatory disclosure if > 1% equity", "Legal Compliance & Audit", "Prohibited from participating in vendor selection"],
            ],
            [120, 120, 115, 185],
            [
                "Employees participating in vendor purchasing decisions must recuse themselves if they have a personal tie to the vendor.",
                "Bribery, kickbacks, and improper payments to public officials or commercial partners violate the FCPA and UK Bribery Act.",
                "Annual conflict of interest disclosure certifications are mandatory for all employees at the Director level and above.",
            ],
            "ANTI-BRIBERY & FCPA COMPLIANCE:",
            "Nexus enforces a strict zero-tolerance policy against commercial bribery and foreign corrupt practices under the Foreign Corrupt "
            "Practices Act (FCPA). Bribes, facilitation payments, and inappropriate gifts will result in immediate termination and DOJ referral."
        ),
        make_article(
            "Article 10. Equal Employment Opportunity, Accommodations & Non-Retaliation Policy",
            "10.1 EEO Commitments, Disability Accommodations & Religious Protections",
            "Nexus Corporation is an equal opportunity employer committed to creating an inclusive, barrier-free workplace. All employment decisions—"
            "including recruitment, hiring, compensation, promotion, training, and separation—are made strictly on the basis of merit, competence, "
            "and business needs, without regard to race, color, religion, sex, sexual orientation, gender identity, national origin, age, disability, "
            "veteran status, marital status, or genetic information. We comply fully with Title VII, ADA, ADEA, PWFA, and applicable state laws.",
            "Nexus provides reasonable accommodations to qualified individuals with physical or mental disabilities, pregnancy-related medical "
            "conditions, and sincerely held religious beliefs, unless doing so creates an undue hardship on company operations. Employees seeking "
            "accommodations should initiate an interactive dialogue by submitting an accommodation request through People Operations. The company "
            "strictly prohibits retaliation against any employee who requests an accommodation, files an EEO charge, or participates in an investigation.",
            ["Accommodation Category", "Legal Foundation", "Application Channel", "Interactive Process Timeline", "Reviewing Authority"],
            [
                ["Disability / Physical Needs", "ADA Title I & ADAAA", "People Ops Accommodations Desk", "Initial dialogue within 5 business days", "HR Benefits & Facilities Team"],
                ["Mental Health Accommodations", "ADA & Section 503", "Confidential HR Benefits Portal", "Initial dialogue within 5 business days", "Accommodations Committee"],
                ["Pregnancy & Postpartum (PWFA)", "Pregnant Workers Fairness Act", "HR Benefits Specialist", "Expedited review within 3 business days", "People Operations Lead"],
                ["Religious Schedule Adjustments", "Title VII of Civil Rights Act", "Direct Manager + HR Partner", "Determination within 7 business days", "Department Director + HR"],
                ["Ergonomic Workstation Support", "OSHA & Corporate Health Standards", "Facilities Safety Desk ticket", "Assessment scheduled within 5 days", "Facilities Ergonomics Lead"],
            ],
            [110, 110, 110, 110, 100],
            [
                "Accommodations are customized through an ongoing, good-faith dialogue between the employee, healthcare provider, and HR.",
                "Medical records related to accommodation requests are stored separately from personnel files and held in strict confidence.",
                "Nexus regularly monitors promotion, retention, and compensation parity across all protected employee demographic groups.",
            ],
            "EEO & ACCOMMODATION SLA:",
            "People Operations responds to all accommodation requests within 5 business days. Retaliation against any employee exercising "
            "accommodation rights will result in immediate termination of the offending party under corporate non-retaliation rules."
        ),
        make_article(
            "Article 11. Workplace Safety, Violence Prevention, Drug-Free Environment & Crisis Response",
            "11.1 Physical Safety, Zero-Tolerance Violence Policy & Substance Abuse Standards",
            "Nexus Corporation is dedicated to providing a safe, healthy, and secure working environment for all employees, contractors, "
            "and visitors. We maintain absolute zero-tolerance for workplace violence, threatening conduct, intimidation, stalking, harassment, "
            "or the brandishing of weapons on company premises or at corporate events. Any employee who engages in violent or threatening behavior "
            "will be removed immediately from company premises, placed on unpaid investigatory suspension, and terminated upon substantiation.",
            "Nexus is committed to maintaining a drug-free and alcohol-free workplace. The manufacture, distribution, dispensing, possession, "
            "or use of illegal drugs, unauthorized controlled substances, or alcohol on company premises or during work hours is strictly prohibited. "
            "Employees suffering from substance dependency are urged to voluntarily seek assistance through the confidential Modern Health "
            "Employee Assistance Program (EAP) before dependency impairs job performance or causes safety hazards.",
            ["Workplace Safety Area", "Operational Policy Standard", "Immediate Action Required", "Reporting Mechanism"],
            [
                ["Workplace Violence & Threats", "Zero tolerance; immediate facility removal", "Contact Security / Call 911 in emergency", "Emergency Security: ext 5555"],
                ["Weapons & Firearms", "Strictly banned on all company property", "Immediate facility lockdown and police dispatch", "Security Operations Center"],
                ["Drug & Alcohol Abuse", "Zero tolerance during working hours", "Referral to EAP / Mandatory fitness-for-duty", "Manager + People Operations"],
                ["Fire & Emergency Evacuation", "Quarterly drills; maintain clear 36\" egress", "Evacuate via marked stairwells to assembly point", "Building Safety Wardens"],
                ["Occupational Injury / Illness", "Immediate first aid; OSHA 300 log entry", "Seek medical attention; notify HR in 24 hours", "Safety Desk portal ticket"],
            ],
            [115, 130, 145, 150],
            [
                "Employees observing safety hazards, blocked exits, or suspicious persons must report them to Facilities Security immediately.",
                "Nexus maintains emergency automated alert systems (Everbridge) to notify all personnel during active crises or severe weather.",
                "Employees are required to keep emergency contact information updated in Workday at all times.",
            ],
            "EMERGENCY RESPONSE PROTOCOL:",
            "In case of immediate physical danger, medical emergency, or fire, call 911 first, then alert the Nexus Security Operations Center "
            "at 1-800-555-5555. Security personnel are trained in CPR, AED operation, and emergency building evacuation protocols."
        ),
        make_article(
            "Article 12. Employee Personnel Records, Privacy Safeguards, Whistleblower Protections & Hotline",
            "12.1 Record Inspection Rights, Digital Privacy Safeguards & Whistleblower Reporting",
            "Nexus Corporation safeguards employee personal records in strict compliance with federal and state privacy statutes. Personnel "
            "files—including employment contracts, performance appraisals, compensation records, and disciplinary warnings—are maintained in "
            "an encrypted digital repository within Workday. Active employees have the legal right to inspect their personnel records upon "
            "written request to People Operations, with inspection scheduled within 5 business days during regular business hours.",
            "Nexus maintains robust Whistleblower Protections under the Sarbanes-Oxley Act, Dodd-Frank Act, and corporate governance rules. "
            "Employees are empowered and legally protected to report good-faith concerns regarding accounting fraud, financial misstatements, "
            "insider trading, statutory violations, corruption, or gross ethical breaches without fear of retaliation. Reports may be submitted "
            "24/7/365 through the independent, confidential, and anonymous Nexus Ethics Hotline at 1-800-555-0199 or online at ethics.nexus-corp.internal.",
            ["Governance Channel", "Legal Standard & Scope", "Access / Reporting Protocol", "Confidentiality & Protection"],
            [
                ["Personnel File Inspection", "State Labor Code inspection rights", "Submit written request via HR Help Desk", "Inspection completed within 5 business days"],
                ["Confidential Medical Records", "HIPAA & ADA separate storage rule", "Encrypted medical vault; HR access only", "Zero manager access; strict encryption"],
                ["Anonymous Ethics Hotline", "Sarbanes-Oxley & Whistleblower Acts", "Toll-free 1-800-555-0199 / Web portal", "Third-party managed; 100% anonymous option"],
                ["Retaliation Investigations", "Corporate Non-Retaliation Policy", "Direct escalation to Audit Committee", "Summary dismissal for retaliating managers"],
                ["External Regulatory Reporting", "Statutory reporting rights (SEC, EEOC)", "Employees may contact agencies directly", "No prior company approval required by law"],
            ],
            [115, 115, 130, 180],
            [
                "Nexus will never attempt to identify anonymous whistleblowers who submit reports through the independent hotline service.",
                "Retaliation against any employee who in good faith reports misconduct is a terminable offense and subject to civil penalties.",
                "Personnel records are retained for a minimum of 7 years following employment separation to comply with statutory requirements.",
            ],
            "WHISTLEBLOWER PROTECTION ASSURANCE:",
            "Nexus strictly guarantees that no employee will suffer discharge, demotion, suspension, threat, harassment, or discrimination "
            "for providing truthful information to investigators or regulatory authorities regarding corporate misconduct."
        ),
        make_article(
            "Article 13. Corporate Sustainability, Environmental ESG Standards & Volunteer Time Off",
            "13.1 Net-Zero Carbon Commitment, Electronic Recycling & Paid Volunteer Days",
            "Nexus Corporation is committed to environmentally responsible business operations and positive community impact. We pursue "
            "a formal Environmental, Social, and Governance (ESG) strategy targeting net-zero carbon operations by 2030. All corporate facilities "
            "utilize 100% renewable energy contracts, motion-activated LED lighting, and comprehensive single-stream recycling programs. "
            "Employees are expected to minimize unnecessary printing, conserve energy, and participate in corporate conservation initiatives.",
            "To empower workforce members to give back to their local communities, Nexus provides all full-time regular employees with 2 paid "
            "Volunteer Time Off (VTO) days (16 hours) per calendar year. VTO may be used to support accredited 501(c)(3) non-profit charities, "
            "environmental cleanup efforts, educational STEM mentorship programs, or disaster relief initiatives. VTO is requested through "
            "Workday Absence and must be coordinated with managers at least 14 days in advance to ensure team operational continuity.",
            ["ESG Program Domain", "Corporate Objective", "Employee Opportunity", "Governance Authority", "Impact Metric"],
            [
                ["Carbon Neutrality 2030", "100% Renewable energy in hubs", "Energy conservation practices", "Global Facilities & ESG Lead", "Annual ESG Corporate Report"],
                ["Volunteer Time Off (VTO)", "16 Hours paid community service / yr", "Support 501(c)(3) accredited charities", "Direct Line Manager in Workday", "Total community hours tracked"],
                ["E-Waste Responsible Disposal", "100% Certified R2 electronic recycling", "Turn in retired hardware for recycling", "IT Logistics Operations Team", "Zero e-waste landfill policy"],
                ["Matching Gift Program", "Dollar-for-dollar corporate match to $1,000", "Charitable donations via Benevity portal", "Nexus Corporate Foundation", "Annual foundation audit report"],
                ["Sustainable Commuting", "Subsidies for mass transit and cycling", "Participate in Edenred transit programs", "People Operations Benefits Team", "Commuter emissions reduction %"],
            ],
            [115, 120, 125, 100, 80],
            [
                "VTO hours must be logged in Workday as 'Volunteer Time Off' and do not deduct from your accrued annual PTO balance.",
                "Charitable donations eligible for corporate matching must be submitted via the Nexus Benevity Giving Portal by December 15th.",
                "Electronic hardware must never be discarded in municipal trash; return all end-of-life electronics to IT for R2 certified recycling.",
            ],
            "COMMUNITY IMPACT COMMITMENT:",
            "We believe business should be a force for good. Take advantage of your 16 hours of paid VTO annually to mentor young technologists, "
            "assist local food banks, or participate in environmental conservation efforts in your local neighborhood."
        ),
    ]

    return {
        "filename": "employee_handbook.pdf",
        "meta": {
            "id": "HR-POL-002",
            "title": "Employee Handbook & Corporate Code of Conduct",
            "category": "Employee Relations | Corporate Governance",
            "eff_date": "January 1, 2026",
        },
        "sections": sections,
    }

"""Leave of Absence Policy (HR-POL-001) dense content module."""
from policies.common import make_article

def get_document():
    sections = [
        make_article(
            "Article 1. Preamble, Statutory Scope & Regulatory Governance Framework",
            "1.1 Legislative Foundation & Policy Statement of Intent",
            "Nexus Corporation is firmly committed to safeguarding the physical health, mental well-being, and family stability "
            "of every member of our global workforce. We recognize that restorative time away from work is not merely a benefit but an "
            "operational prerequisite for sustained employee productivity, occupational safety, and long-term organizational performance. "
            "This comprehensive Leave of Absence Policy establishes binding, legally enforceable governance standards across all statutory, "
            "semi-statutory, and discretionary leave categories for all Nexus workforce members operating across domestic and international "
            "jurisdictions. The policy integrates and supersedes all prior leave schedules, manager advisories, and verbal representations.",
            "The policy is constructed in full compliance with: the Family and Medical Leave Act (FMLA) as amended; the Americans with Disabilities "
            "Act (ADA) and ADAAA; USERRA; the Pregnancy Discrimination Act; the Pregnant Workers Fairness Act (PWFA); applicable state "
            "Paid Family and Medical Leave statutes (CA PFL, NY PFL, WA PFML, CO FAMLI, MA PFML); and international statutes including "
            "the UK Employment Rights Act, Germany Bundesurlaubsgesetz, and the EU Working Time Directive. Classification disputes "
            "regarding employee vs. contractor status should be referred to People Operations for formal determination within 5 business days.",
            ["Statutory Mandate", "Jurisdictional Scope", "Nexus Policy Alignment", "Audit Frequency"],
            [
                ["Family & Medical Leave Act (FMLA)", "Federal United States", "12 Weeks job-protected unpaid leave with active benefit maintenance", "Quarterly HR Audit"],
                ["Americans with Disabilities Act (ADA)", "Federal United States", "Interactive reasonable accommodation; medical leave as ADA accommodation", "Biannual Review"],
                ["Uniformed Services (USERRA)", "Federal United States", "Job restoration and full pay differential for active service up to 12 months", "Case-by-Case"],
                ["Pregnant Workers Fairness Act (PWFA)", "Federal US (eff. 2023)", "Temporary accommodations for pregnancy-related limitations without mandatory leave", "Annual Calibration"],
                ["State Paid Family Leave Programs", "CA, NY, WA, MA, CO, OR", "Integrated with 16-week 100% paid parental continuation via top-up", "Annual Calibration"],
                ["EU Working Time Directive", "European Union Ops", "Minimum 4 weeks statutory paid leave; Nexus 20 days standard exceeds minimum", "Biannual Audit"],
            ],
            [130, 115, 185, 110],
            [
                "Compliance with all statutory leave regulations is monitored through quarterly corporate internal audits.",
                "Non-exempt employees taking leave must ensure precise electronic timecard logging in Workday Time Tracking.",
                "Leave taken under false pretenses or fraudulent medical documentation triggers immediate summary termination for cause.",
            ],
            "ADA INTERACTIVE ACCOMMODATION MANDATE:",
            "Employees who require leave as a reasonable accommodation under the ADA must contact People Operations at hr-accommodations@nexus-corp.internal. "
            "Federal law requires a structured, good-faith interactive dialogue exploring all feasible accommodation options before any adverse employment action."
        ),
        make_article(
            "Article 2. Annual Paid Time Off (PTO) Framework, Accrual Rules & Carryover Governance",
            "2.1 PTO Entitlement by Tenure Band & Monthly Accrual Calculation",
            "All full-time permanent employees working 40 hours per week are entitled to paid annual leave (PTO) in accordance with "
            "the tenure-based entitlement schedule below. PTO accrues monthly at the applicable rate on the final calendar day of each "
            "completed month of active service. Periods of unpaid personal leave, unpaid disciplinary suspension, or unauthorized absence "
            "exceeding 15 consecutive calendar days within a single month result in suspension of accrual for that calendar month only. "
            "Part-time employees working between 20 and 39 contracted hours per week receive pro-rated leave entitlement based on the ratio "
            "of contracted hours to a standard 40-hour week.",
            "Employees may carry forward a maximum of 5 unused PTO days (40 hours) into the subsequent calendar year. Carryover days "
            "are automatically transferred to the following year balance in Workday on January 1st. All carryover days must be utilized "
            "prior to March 31st (end of Q1) of the new calendar year. Any carryover balance remaining unused at 11:59 PM on March 31st "
            "will be automatically forfeited without monetary compensation. Carryover forfeiture is irreversible and cannot be reinstated.",
            ["Tenure Band", "Annual PTO Entitlement", "Monthly Accrual Rate", "Maximum Accrual Ceiling", "Part-Time Pro-Rate"],
            [
                ["0-3 Years (Standard Staff)", "20 Business Days (160 Hours)", "1.67 Days / Completed Month", "30 Days (240 Hours)", "FTE% x 160 Hours"],
                ["4-6 Years (Senior Staff)", "23 Business Days (184 Hours)", "1.92 Days / Completed Month", "35 Days (280 Hours)", "FTE% x 184 Hours"],
                ["7-10 Years (Veteran Staff)", "26 Business Days (208 Hours)", "2.17 Days / Completed Month", "40 Days (320 Hours)", "FTE% x 208 Hours"],
                ["11+ Years (Distinguished)", "28 Business Days (224 Hours)", "2.33 Days / Completed Month", "42 Days (336 Hours)", "FTE% x 224 Hours"],
                ["Executive / Director Tier", "30 Business Days (240 Hours)", "2.50 Days / Completed Month", "45 Days (360 Hours)", "Not Applicable"],
            ],
            [110, 105, 110, 115, 100],
            [
                "Planned PTO exceeding 3 consecutive days requires 14 calendar days advance submission via Workday Absence module.",
                "Managers must approve or deny PTO requests within 3 business days; pending requests auto-escalate after 5 business days.",
                "PTO balances do not pay out as cash during active employment; unused earned PTO pays out upon separation per state law.",
                "Blackout periods apply during Q4 financial close (Dec 1-31) and critical client delivery sprints unless VP-approved.",
            ],
            "CARRYOVER FORFEITURE NOTICE:",
            "Maximum 5 unused PTO days carry forward into the following calendar year and MUST be utilized before March 31st (Q1 end). "
            "Any carryover balance remaining after this date is permanently forfeited without monetary compensation. Monitor your Workday balance monthly."
        ),
        make_article(
            "Article 3. Sick Leave, Medical Absences & Health Certification Requirements",
            "3.1 Annual Sick Leave Allocation & Permitted Medical Purposes",
            "All eligible employees receive a bank of 10 paid sick days (80 hours) per calendar year, front-loaded in full on January 1st. "
            "Employees joining mid-year receive a pro-rated allocation based on complete calendar months remaining in the year. "
            "Sick leave is designated for: (a) acute personal injury, illness, or chronic flare-ups; (b) scheduled diagnostic or clinical "
            "appointments; (c) care for an immediate family member experiencing medical incapacity; and (d) acute mental health recovery days. "
            "Sick leave does not roll over, accrue into future years, or pay out upon separation.",
            "Employees absent due to illness or injury for more than 3 consecutive working days are required to obtain an official medical "
            "certificate signed by a licensed healthcare provider (physician, nurse practitioner, or physician assistant). The certificate "
            "must be submitted to People Operations via the secure HR Portal within 48 hours of return to active duty. Diagnostic details, "
            "clinical test results, and prescription names are strictly confidential and must never be requested by or disclosed to managers.",
            ["Absence Duration", "Documentation Requirement", "Submission Deadline", "Approval Authority"],
            [
                ["1-2 Calendar Days", "Employee self-certification via Workday Absence portal", "Day of return before 5:00 PM", "Direct Line Manager"],
                ["3 Consecutive Days", "Manager wellness check-in call or virtual meeting", "Day 3 of absence before 12:00 PM", "Direct Line Manager"],
                ["More than 3 Days", "Licensed Medical Practitioner Certificate (GP, NP, or PA signed)", "Within 48 business hours of return", "People Operations Benefits"],
                ["10+ Calendar Days", "FMLA Certification OR Short-Term Disability (STD) claim", "Before Day 10 of continuous absence", "Third-Party STD Administrator"],
                ["Hospitalization", "Hospital discharge summary or admission confirmation note", "Within 5 days of discharge", "People Operations Benefits"],
            ],
            [105, 160, 135, 140],
            [
                "Sick leave hours may be taken in increments as small as one hour to accommodate recurring clinical appointments.",
                "Chronic medical conditions requiring recurring intermittent absences should be documented under intermittent FMLA.",
                "Falsification of medical notes constitutes gross misconduct resulting in immediate termination and benefits forfeiture.",
            ],
            "MEDICAL PRIVACY & HIPAA COMPLIANCE:",
            "Nexus strictly safeguards employee medical privacy under HIPAA and applicable state laws. Managers must never inquire into specific "
            "diagnoses, treatments, or medication regimens. Direct all medical inquiries and notes exclusively to People Operations."
        ),
        make_article(
            "Article 4. Parental Leave, Adoption Support & Family Bonding Entitlements",
            "4.1 Primary & Secondary Caregiver Entitlements and Wage Continuation",
            "Nexus Corporation provides industry-leading paid parental leave that reflects our deep commitment to supporting all parents. "
            "Primary caregivers are entitled to 16 consecutive weeks of 100% base salary paid parental leave, commencing on the birth, "
            "legal adoption finalization, or court-authorized foster care placement date. Secondary caregivers are entitled to 6 consecutive "
            "weeks of 100% base salary paid leave commencing within 12 months of the child arrival. Both parents employed by Nexus may "
            "exercise their respective leave entitlements independently and simultaneously.",
            "All health insurance, dental, vision, life insurance, 401(k) employer matching contributions, and equity vesting schedules "
            "continue uninterrupted throughout the full period of paid parental leave. Employees are restored to the same or an equivalent "
            "position with equivalent compensation, benefits, and responsibilities upon return to active duty. Performance review cycles "
            "and merit increase eligibility are not penalized by parental leave absences.",
            ["Caregiver Category", "Paid Leave Duration", "Salary Continuation", "Adoption Legal Reimbursement", "Commencement Timing"],
            [
                ["Primary Caregiver", "16 Consecutive Weeks", "100% Regular Base Salary", "Up to $10,000 per adoption", "Within 12 months of birth/placement"],
                ["Secondary Caregiver", "6 Consecutive Weeks", "100% Regular Base Salary", "Up to $5,000 per adoption", "Within 12 months of arrival"],
                ["Both Parents at Nexus", "16 wks (Primary) + 6 wks (Secondary)", "100% Base Salary each", "Up to $10,000 joint cap", "Coordinated with HR 30 days prior"],
                ["Foster Placement", "6 Consecutive Weeks", "100% Regular Base Salary", "N/A (Court placement order)", "Effective date of court placement"],
                ["Surrogacy Intended Parent", "16 Consecutive Weeks", "100% Regular Base Salary", "Up to $10,000 surrogacy stipend", "Effective date of child birth"],
            ],
            [110, 105, 110, 115, 100],
            [
                "Employees must complete 6 consecutive months of full-time service prior to birth/placement to access paid parental leave.",
                "Primary caregiver leave may be split into two blocks within the first 12 months with 14 calendar days advance notice.",
                "Parental leave runs concurrently with statutory FMLA leave where applicable under federal and state regulations.",
            ],
            "JOB RESTORATION GUARANTEE:",
            "Nexus guarantees full job restoration to the same position or an equivalent role with identical pay and status upon return "
            "from parental leave. Retaliation or adverse action against employees taking parental leave is strictly prohibited under federal law."
        ),
        make_article(
            "Article 5. Bereavement, Compassionate Absences, Jury Duty & Civic Leave",
            "5.1 Bereavement Leave Entitlements by Family Relationship",
            "Nexus Corporation provides compassionate bereavement leave to employees experiencing the loss of a family member. "
            "Employees are granted paid bereavement leave in accordance with the relationship-based schedule below. Bereavement leave "
            "days need not be taken consecutively but must be utilized within 30 calendar days of the date of death. Up to 5 additional "
            "unpaid days may be approved by the Department Director for international travel or complex estate administration.",
            "For civic obligations, full-time employees summoned for jury duty receive full salary continuation for up to 10 consecutive "
            "working days. For jury service extending beyond 10 days, employees receive 60% salary continuation. Employees must submit a copy "
            "of the official court summons to People Operations within 5 business days of receipt. In addition, employees whose shifts do not "
            "provide 2 consecutive non-work hours while polls are open receive up to 2 paid hours to vote in federal and state elections.",
            ["Relationship to Deceased", "Paid Bereavement Entitlement", "Additional Unpaid Extension", "Required Documentation"],
            [
                ["Spouse, Domestic Partner, Child, Parent", "5 Consecutive Working Days", "Up to 5 additional business days", "Obituary, memorial program, or death certificate"],
                ["Sibling, Grandparent, Grandchild", "3 Consecutive Working Days", "Up to 3 additional business days", "Memorial program or family verification"],
                ["Aunt, Uncle, Niece, Nephew, Cousin, In-Law", "2 Consecutive Working Days", "Up to 2 additional business days", "Self-certification via Workday Absence"],
                ["Close Personal Friend or Mentor", "1 Working Day (Discretionary)", "Manager discretion for PTO usage", "Manager written concurrence in Workday"],
                ["Miscarriage / Pregnancy Loss", "5 Consecutive Working Days", "Up to 5 additional unpaid days", "Confidential notification to Benefits team"],
            ],
            [130, 125, 135, 150],
            [
                "Employees experiencing profound grief may access 8 free confidential counseling sessions through Modern Health EAP.",
                "Jury duty compensation from the court may be retained by the employee to offset transit and meal incidentals.",
                "Military reserve leave is granted in full compliance with USERRA, providing up to 12 months salary differential continuation.",
            ],
            "CIVIC DUTY PROTECTION:",
            "No employee will experience disciplinary action, loss of seniority, or adverse rating due to court-mandated jury service "
            "or active military training deployment. Summonses must be forwarded to People Operations within 5 business days of receipt."
        ),
        make_article(
            "Article 6. Unpaid Personal Leave, Sabbaticals & FMLA Statutory Rights",
            "6.1 Discretionary Personal Sabbaticals & Hardship Leaves of Absence",
            "Employees may apply for an unpaid personal leave of absence for compelling personal emergencies, extended family care "
            "needs, or approved educational sabbaticals for a period of up to 90 calendar days. Approval requires written concurrence "
            "of the Department Director and the Head of People Operations. To be eligible, applicants must have completed a minimum of "
            "24 consecutive months of full-time regular service in good standing.",
            "Under federal FMLA, eligible employees are entitled to up to 12 work-weeks of job-protected, unpaid leave within a rolling 12-month "
            "period for: birth of a child; adoption/foster placement; serious health condition of the employee or immediate family member; "
            "or qualifying military exigency. Eligibility requires 12 months of service and at least 1,250 hours worked in the prior 12 months. "
            "Health benefits continue during FMLA with the employee paying their standard active cost-share portion.",
            ["Leave Category", "Maximum Duration", "Job Restoration Guarantee", "Benefit Cost-Share During Leave"],
            [
                ["Federal FMLA Medical/Family", "12 Weeks in 12-Month Period", "Full job restoration guaranteed", "Active employee rate maintained"],
                ["FMLA Military Caregiver", "26 Weeks in Single 12-Mo Period", "Full job restoration guaranteed", "Active employee rate maintained"],
                ["Discretionary Personal Leave", "Up to 90 Calendar Days", "Subject to business availability", "Employee pays 100% COBRA premium"],
                ["Educational Sabbatical", "Up to 180 Calendar Days", "Written return agreement required", "Employee pays 100% COBRA premium"],
                ["Emergency Hardship Leave", "Up to 30 Calendar Days", "Reinstatement to equivalent role", "Company subsidizes first 30 days"],
            ],
            [125, 130, 140, 145],
            [
                "Employees on unpaid personal leave do not accrue PTO or sick leave during the duration of their absence.",
                "Failure to return to active duty on the agreed return date without written extension constitutes voluntary resignation.",
                "Intermittent FMLA leave requires physician certification outlining frequency, estimated duration, and clinical necessity.",
            ],
            "FMLA ELIGIBILITY CONFIRMATION:",
            "FMLA leave requests must be submitted 30 days in advance when foreseeable, or as soon as practicable in emergencies. "
            "People Operations issues the official Notice of Eligibility and Rights within 5 business days of receiving the request."
        ),
        make_article(
            "Article 7. Corporate Public Holidays, Cultural Floating Days & Religious Observance",
            "7.1 Corporate Public Holiday Schedule & Floating Cultural Days",
            "Nexus Corporation observes 11 standard corporate public holidays annually, during which all corporate offices are closed "
            "and all full-time regular personnel receive full holiday pay. In addition, every full-time employee receives 2 Floating Cultural "
            "Holidays per calendar year to observe religious holy days, heritage celebrations, or cultural observances of personal significance. "
            "Floating holidays are credited on January 1st, do not roll over, and must be scheduled at least 5 business days in advance.",
            "Recognized standard holidays include: New Year's Day, Martin Luther King Jr. Day, Presidents' Day, Memorial Day, Juneteenth, "
            "Independence Day, Labor Day, Thanksgiving Day, Day After Thanksgiving, Christmas Eve, and Christmas Day. When a holiday falls "
            "on a Saturday, it is observed on the preceding Friday; when it falls on a Sunday, it is observed on the following Monday.",
            ["Corporate Holiday", "Standard Date Observed", "Operating Status", "Compensation Standard"],
            [
                ["New Year's Day", "January 1st", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Martin Luther King Jr. Day", "Third Monday in January", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Memorial Day", "Last Monday in May", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Juneteenth National Freedom", "June 19th", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Independence Day", "July 4th", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Labor Day", "First Monday in September", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Thanksgiving & Day After", "Fourth Thursday & Friday in Nov", "All Offices Closed", "Full Regular Pay Continuation"],
                ["Christmas Eve & Christmas Day", "December 24th & 25th", "All Offices Closed", "Full Regular Pay Continuation"],
            ],
            [130, 130, 130, 150],
            [
                "Essential personnel required to work on recognized holidays receive 1.5x regular pay plus an alternative compensatory day off.",
                "Floating holidays cannot be cashed out upon separation and cannot be combined into PTO carryover balances.",
                "Religious accommodation requests for holy days not covered above should be submitted to People Operations under Title VII.",
            ],
            "RELIGIOUS ACCOMMODATION GUARANTEE:",
            "Nexus respects all religious traditions and will grant reasonable schedule modifications or unpaid time off for religious "
            "observances unless doing so imposes an undue operational hardship on the department. Submit requests via the Employee Portal."
        ),
        make_article(
            "Article 8. Statutory State PFL/PFML Integration with Corporate Paid Leave",
            "8.1 Statutory State PFL/PFML Integration with Corporate Paid Leave",
            "Multiple jurisdictions where Nexus operates enforce mandatory statutory Paid Family and Medical Leave (PFML) programs "
            "funded via payroll contributions. Nexus coordinates its company-provided paid leave benefits with these statutory programs "
            "using a 'top-up' mechanism to ensure employees receive 100% of their regular base pay without duplicate windfall payments. "
            "Employees in qualifying states must file claims with their state program within mandated statutory deadlines.",
            "Under the top-up methodology, the employee receives the statutory benefit check directly from the state insurance authority. "
            "Nexus payroll calculates the difference between the statutory payment and the employee regular base salary and issues a "
            "supplemental corporate payroll credit. Employees must upload their official state award notice to Workday within 10 days of receipt.",
            ["Jurisdiction", "Statutory Program", "Maximum Weekly Benefit", "Nexus Top-Up Policy", "Employee Contribution"],
            [
                ["California", "CA Paid Family Leave (PFL)", "Up to $1,620 / week (approx 60-70%)", "Nexus tops up to 100% base pay", "State Disability Payroll Tax"],
                ["New York", "NY Paid Family Leave (PFL)", "Up to $1,151 / week (67% AWW)", "Nexus tops up to 100% base pay", "Statutory employee deduction"],
                ["Washington State", "WA Paid Family & Medical Leave", "Up to $1,456 / week (up to 90%)", "Nexus tops up to 100% base pay", "Shared employer/employee tax"],
                ["Massachusetts", "MA Paid Family & Medical Leave", "Up to $1,149 / week", "Nexus tops up to 100% base pay", "Shared statutory payroll tax"],
                ["Colorado", "CO FAMLI Program", "Up to $1,100 / week", "Nexus tops up to 100% base pay", "Shared 0.45% payroll tax"],
            ],
            [85, 120, 125, 115, 95],
            [
                "Employees are required to file state claims promptly upon commencement of qualifying family or medical leave.",
                "Failure to apply for available state benefits will result in corporate top-up calculations assuming maximum state entitlement.",
                "International employees in the UK and Germany are covered under statutory sick pay and statutory parental allowance schemes.",
            ],
            "TOP-UP SUBMISSION TIMELINE:",
            "Upload your state PFML determination letter to Workday Absence within 10 business days of issuance. Delayed submissions "
            "may result in temporary payroll calculation adjustments until statutory payment amounts are formally verified."
        ),
        make_article(
            "Article 9. Leave Request Workflows, Absence Management & Manager Approvals",
            "9.1 Step-by-Step Employee Leave Request Workflow",
            "All planned and emergency leaves of absence must be processed through the formal enterprise workflow outlined below. "
            "Adherence to these procedural milestones guarantees uninterrupted salary disbursement, proper statutory benefit integration, "
            "and flawless coverage transitions. Advance communication with supervisors and team members ensures departmental continuity "
            "and prevents customer service disruptions.",
            "Managers are obligated to act on leave requests within 3 business days of receipt in Workday. Requests remaining pending after "
            "5 business days are auto-escalated to the Department Director. If an operational conflict prevents approval of requested PTO dates, "
            "the manager must schedule an interactive alignment discussion with the employee within 2 business days to find alternative dates.",
            ["Leave Stage", "Required Employee Action", "System / Document", "Mandatory Deadline"],
            [
                ["1. Balance Review", "Review current PTO, sick, and leave balances in Workday", "Employee Portal > Time Off > Balances", "21 days before planned leave start"],
                ["2. Manager Discussion", "Discuss planned absence, coverage, and handover plan", "Slack DM or 1:1 calendar meeting", "14 days before planned leave start"],
                ["3. Portal Submission", "Submit formal leave request via Workday Absence module", "Workday > Absence > Request Leave", "14 days prior (7 days for urgent)"],
                ["4. Manager Approval", "Receive explicit written system approval in Workday", "Workday Absence auto-notification", "Within 3 business days of submission"],
                ["5. Coverage Handover", "Designate back-up, update Jira boards, set OOO auto-reply", "Slack status, email auto-reply, Jira notes", "At least 48 hours before departure"],
                ["6. Return to Work", "Confirm return, submit medical cert if required, brief manager", "Email to manager + HR Portal cert upload", "On or before first day of return"],
            ],
            [85, 155, 145, 155],
            [
                "Emergency leave: In acute crises where advance submission is impossible, notify manager and HR within 24 hours of absence.",
                "Out-of-office automated email responses must indicate designated peer coverage contacts and emergency escalation paths.",
                "Managers must reassign active Jira tickets, approval workflows, and administrative queues during extended employee absences.",
            ],
            "DELEGATED APPROVAL AUTHORITY:",
            "When a line manager is on leave, their approval authority automatically cascades to the Department Director in Workday. "
            "Leave requests will never remain stalled in the workflow due to supervisory absences."
        ),
        make_article(
            "Article 10. Frequently Asked Leave Questions & Edge Case Determination Matrix",
            "10.1 Common Leave Scenarios & Official Policy Determinations",
            "This comprehensive determination matrix provides binding corporate HR resolutions for frequently encountered leave scenarios. "
            "Employees and managers should consult this matrix prior to contacting People Operations. Scenarios not addressed in this matrix "
            "should be submitted via the HR Help Desk portal for formal written guidance within 5 business days.",
            "All determinations rendered by People Operations in accordance with this matrix are final and binding across all corporate divisions. "
            "Employees disputing an interpretation may request an administrative review by the Head of People Operations within 10 business days "
            "of the initial determination.",
            ["Situation / Question", "Official Policy Determination", "Required Employee Action", "Escalation Point"],
            [
                ["Public holiday falls during approved PTO", "Holiday is not charged against PTO; Workday auto-credits the day", "No action required -- auto-adjusted", "None required"],
                ["Sick leave for acute mental health day", "Yes -- acute mental health days are explicitly covered under Art 3.1", "Log as Sick Leave; no diagnosis required", "People Operations if recurring"],
                ["Unused PTO payout upon resignation", "Earned accrued unused PTO is paid out in final paycheck per state law", "Complete separation checklist in Portal", "Payroll & People Operations"],
                ["PTO and parental leave back-to-back", "Yes -- PTO may follow parental leave with prior manager approval", "Submit combined plan 30 days prior", "People Operations Lead"],
                ["Extend bereavement leave with PTO", "Yes -- approved PTO may immediately follow bereavement leave", "Submit PTO request on return day", "Direct Line Manager"],
                ["Intermittent FMLA schedule modifications", "Permitted with licensed physician certification of necessity", "File FMLA Intermittent Request form", "People Operations FMLA Coord"],
                ["Manager denies statutory leave entitlement", "File formal dispute via HR Help Desk within 10 business days", "Submit dispute form with all records", "People Operations Director"],
            ],
            [140, 150, 130, 120],
            [
                "Disputes regarding leave balances must be raised within 30 days of the relevant payroll cycle close.",
                "Employees on approved leave must not be contacted by managers for routine work matters; respecting leave boundaries is mandatory.",
                "Violations of employee leave rights by supervisory personnel should be reported immediately to the Ethics Hotline.",
            ],
            "ETHICS HOTLINE & NON-RETALIATION:",
            "Employees who believe their leave entitlements have been interfered with or denied in bad faith may submit a confidential report "
            "to the Nexus Ethics Hotline at 1-800-555-0199 or ethics@nexus-corp.internal. Strict statutory non-retaliation protections apply."
        ),
        make_article(
            "Article 11. Return to Work Protocols, Phased Re-Entry & Workplace Ergonomic Transition Plans",
            "11.1 Medical Clearance, Light Duty and Structured Phased Re-Entry Milestones",
            "Employees returning to active duty following continuous medical leave, parental leave, or personal sabbatical exceeding 15 "
            "consecutive calendar days must complete the formal Nexus Return-to-Work (RTW) protocol. For medical leaves, an official "
            "Fitness-for-Duty Certification completed and signed by the attending licensed healthcare provider must be submitted to People "
            "Operations at least 3 business days prior to the anticipated return date. The certification must specify whether the employee "
            "is cleared for full unrestricted duty or requires temporary physical or cognitive accommodations.",
            "To ensure sustainable re-integration, employees returning from primary parental leave or extended medical recovery are eligible "
            "for a Structured Phased Re-Entry Plan over a 3-week transition window. The phased schedule allows: Week 1 at 50% contracted "
            "hours, Week 2 at 75% contracted hours, and Week 3 at 100% contracted hours, with 100% base salary maintained throughout the "
            "transition period. Managers must conduct a formal re-onboarding briefing on Day 1 to review team objectives, project changes, "
            "and system access updates. Ergonomic workstation evaluations are scheduled through Facilities within the first 5 business days.",
            ["Re-Entry Phase", "Working Hours Schedule", "Compensation Basis", "Manager & HR Milestones", "Documentation Required"],
            [
                ["Week 1 (Transition Kickoff)", "50% Standard Hours (20 hrs)", "100% Full Base Salary", "Day 1 Welcome 1:1, system access verification", "Fitness-for-Duty Certificate"],
                ["Week 2 (Ramping Velocity)", "75% Standard Hours (30 hrs)", "100% Full Base Salary", "Mid-transition check-in, workload calibration", "Ergonomic self-evaluation"],
                ["Week 3 (Full Integration)", "100% Standard Hours (40 hrs)", "100% Full Base Salary", "End-of-transition review, regular 1:1 cadence", "Formal RTW sign-off in Portal"],
                ["Modified / Light Duty", "As clinically prescribed", "100% Base Salary (pro-rated if pt)", "Weekly interactive dialogue with People Ops", "Physician restriction schedule"],
                ["Ergonomic Adjustment Tier", "Standard full schedule", "100% Full Base Salary", "Facilities dispatch of requested ergonomic gear", "Workstation assessment form"],
            ],
            [105, 115, 110, 115, 95],
            [
                "Line managers are strictly prohibited from demanding that an employee perform work duties prior to official RTW clearance.",
                "System credentials, email access, and security tokens are reactivated by IT Security 24 hours prior to the certified return date.",
                "Employees requiring ongoing permanent physical or psychological accommodations transition to the formal ADA interactive track.",
            ],
            "RETURN-TO-WORK NOTICE SLA:",
            "Notify People Operations and your manager of your confirmed return date at least 5 business days in advance. Submit your medical "
            "release via the HR Portal to ensure IT accounts, badge access, and payroll schedules are synchronized prior to your arrival."
        ),
        make_article(
            "Article 12. Compliance Enforcement, Fraud Prevention & Audit Governance Matrix",
            "12.1 Regulatory Audit Assurance, Record Retention and Whistleblower Safeguards",
            "In strict compliance with statutory mandates under the FMLA, FLSA, EEOC, and Department of Labor regulations, Nexus Corporation "
            "maintains comprehensive digital records of all leave requests, medical certifications, approvals, and payroll adjustments for a "
            "minimum statutory retention period of 7 years. All medical documentation is stored in an encrypted, HIPAA-compliant digital vault "
            "with zero access granted to operational managers. People Operations conducts annual compliance audits across all departments "
            "to ensure leave decisions are rendered equitably and without discriminatory bias.",
            "Leave fraud—including falsification of medical notes, engaging in secondary unauthorized commercial employment while receiving "
            "paid company leave, or misrepresenting personal circumstances—constitutes gross ethical misconduct. Suspected leave abuse triggers "
            "a formal forensic investigation by People Operations and Legal Counsel. Confirmed violations result in immediate termination of "
            "employment for cause, forfeiture of accrued bonuses, mandatory financial restitution of unearned wages, and referral to civil authorities.",
            ["Audit Governance Focus", "Regulatory Mandate", "Audit Frequency", "Investigative Authority", "Consequence of Violation"],
            [
                ["FMLA / ADA Record Keeping", "29 CFR 825.500 & ADA Title I", "Annual Internal HR Audit", "People Ops Compliance Team", "Mandatory corrective filing with DOL"],
                ["Medical Privacy / HIPAA", "HIPAA Security Rule 45 CFR", "Biannual Security Review", "Chief Information Security Officer", "Disciplinary action up to termination"],
                ["Paid Leave Fraud & Misuse", "Nexus Code of Conduct Art 5", "Continuous automated triggers", "Internal Audit & General Counsel", "Summary dismissal & wage clawback"],
                ["Supervisory Non-Compliance", "Title VII & State PFML statutes", "Quarterly spot audit", "VP of People Operations", "Mandatory retraining / PIP for manager"],
                ["Whistleblower Allegations", "Sarbanes-Oxley & Dodd-Frank", "Immediate upon report (24h)", "Independent Audit Committee", "Sanctions against retaliating party"],
            ],
            [110, 105, 95, 115, 115],
            [
                "Employees aware of fraudulent leave claims or supervisory retaliation are protected under corporate whistleblower policies.",
                "Reports may be submitted 24/7/365 to the anonymous Ethics Hotline (1-800-555-0199) or online at ethics.nexus-corp.internal.",
                "Managers who retaliate against employees reporting leave violations face immediate termination and personal legal exposure.",
            ],
            "MANDATORY ANNUAL COMPLIANCE ATTESTATION:",
            "All Nexus employees must complete the annual Leave Governance Attestation module by January 31st of each calendar year. "
            "Failure to complete the attestation within the designated window will result in temporary suspension of discretionary leave privileges."
        ),
        make_article(
            "Article 13. Multi-Jurisdictional Leave Coordination & Employee Guidance Index",
            "13.1 Complex Cross-Jurisdictional Interaction Protocols & Remote Worker Claims",
            "In modern enterprise workforce environments where employees frequently relocate or maintain hybrid residencies across multiple "
            "state or international boundaries, leave coordination requires meticulous alignment between state disability insurance (SDI), "
            "corporate wage replacement policies, and federal statutory mandates. Nexus Corporation administers a unified cross-jurisdictional "
            "clearinghouse within People Operations to ensure that employees receive maximum statutory entitlements without administrative delay.",
            "Employees working remotely from states with mandatory PFML programs (such as California, New York, Washington, and Massachusetts) "
            "are classified under the labor jurisdiction of their primary physical work location, regardless of where their corporate department "
            "or manager is based. Nexus payroll coordinates state statutory claims with corporate benefits so that regular base salary continuation "
            "remains uninterrupted throughout all approved family, medical, and parental leaves of absence.",
            ["Jurisdictional Challenge", "Statutory Precedence Rule", "Nexus Coordination Action", "Employee Action Required"],
            [
                ["Dual-State Residency & Commute", "Tax home / primary work location governs", "Payroll registers with employee state PFML", "Verify work address in Workday Profile"],
                ["FMLA vs. State Leave Duration", "State leave runs concurrently with FMLA", "Benefits team tracks both clocks in Workday", "File state claim concurrently with HR FMLA"],
                ["Workers' Comp vs. Sick Leave", "Workers' Comp is exclusive statutory remedy", "Injury claims route to Travelers Insurance", "Report injury within 24h to Facilities"],
                ["International Remote Leave", "Governed by local subsidiary employment contract", "Global Mobility coordinates statutory entitlements", "Contact global-mobility@nexus-corp.internal"],
            ],
            [130, 130, 140, 140],
            [
                "Cross-jurisdictional leave inquiries are assigned to specialized Leave Case Managers with a guaranteed 24-hour response SLA.",
                "Employees transitioning between domestic states must update their residential address in Workday at least 30 days prior.",
                "Corporate supplemental leave benefits are never reduced or penalized due to delays in state statutory claim adjudication.",
            ],
            "MULTI-JURISDICTIONAL SUPPORT DESK:",
            "For personalized coordination assistance regarding multi-state leave claims, email leave-mobility@nexus-corp.internal or "
            "schedule a virtual 1-on-1 consultation through the Workday Benefits Appointment Desk."
        ),
    ]

    return {
        "filename": "leave_policy.pdf",
        "meta": {
            "id": "HR-POL-001",
            "title": "Leave of Absence Policy",
            "category": "Workforce Management | Leave Administration",
            "eff_date": "January 1, 2026",
        },
        "sections": sections,
    }

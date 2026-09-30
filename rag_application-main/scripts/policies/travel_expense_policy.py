"""Travel & Expense Reimbursement Policy (HR-POL-005) dense content module."""
from policies.common import make_article

def get_document():
    sections = [
        make_article(
            "Article 1. Business Travel Governance, Pre-Approval Tiers & Navan Booking Platform",
            "1.1 Executive Mandate, Pre-Trip Authorization & Mandatory Navan Portal",
            "Nexus Corporation authorizes business travel that directly advances customer partnerships, enterprise sales execution, technical "
            "implementations, and strategic corporate objectives. All business travel must be prudent, economically justified, and aligned with "
            "corporate budget allocations. Prior to booking any reservations or incurring travel commitments, employees must secure formal "
            "written pre-approval in accordance with established financial authorization thresholds: Domestic travel under $2,000 requires "
            "Department Director approval at least 14 days in advance; domestic travel over $2,000 requires Department VP approval at least 21 "
            "days in advance; and all international business travel requires CFO and EVP authorization at least 30 calendar days in advance.",
            "All commercial flights, hotel accommodations, rail journeys, and rental vehicles must be booked exclusively through Navan "
            "(formerly TripActions), the official enterprise travel management portal. Off-platform bookings made directly through airline or "
            "hotel consumer websites are strictly non-reimbursable, unless Navan customer support explicitly certifies a verified technical system "
            "outage. Mandatory centralized booking through Navan enables corporate security to maintain real-time Duty of Care visibility to "
            "locate and extract travelers during geopolitical crises, civil unrest, natural disasters, or airline operational shutdowns.",
            ["Travel Category", "Estimated Budget Ceiling", "Pre-Approval Lead Time", "Mandatory Sign-Off Authority", "Booking Channel"],
            [
                ["Domestic Travel (Standard)", "Under $2,000 total trip cost", "At least 14 calendar days prior", "Department Director / Lead", "Navan Corporate Portal exclusively"],
                ["Domestic Travel (High Cost)", "$2,000 to $5,000 trip cost", "At least 21 calendar days prior", "Department Vice President (VP)", "Navan Corporate Portal exclusively"],
                ["International Travel (Americas)", "$3,000 to $7,500 trip cost", "At least 30 calendar days prior", "Department VP & Finance Director", "Navan Corporate Portal exclusively"],
                ["Intercontinental / Transatlantic", "Over $7,500 total trip cost", "At least 30 calendar days prior", "Chief Financial Officer & EVP", "Navan Corporate Portal exclusively"],
                ["Emergency Client Outage Trip", "Emergency mission-critical fix", "Immediate notification (verbal/Slack)", "Department VP written concurrence", "Navan 24/7 VIP Emergency Concierge"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Off-platform travel bookings will be rejected by Finance and will not be reimbursed under any circumstances.",
                "Travelers must maintain active mobile alerts within the Navan mobile application throughout the duration of all trips.",
                "Combining personal vacation days with business travel is permitted only if business dates are justified and airfare costs do not increase.",
            ],
            "DUTY OF CARE MANDATE:",
            "Booking through Navan is a non-negotiable safety requirement. In global crises, corporate security uses Navan manifest telemetry "
            "to coordinate emergency medical evacuations and charter extraction flights for Nexus personnel."
        ),
        make_article(
            "Article 2. Commercial Airfare Standards, Class of Service & Rail Travel",
            "2.1 Cabin Class Eligibility, Flight Duration Thresholds & High-Speed Rail",
            "Commercial airfare represents a substantial operational commitment and must be booked in strict adherence to corporate class-of-service "
            "regulations. For all domestic flights and international itineraries where the scheduled flight duration is under 6 continuous hours, "
            "employees must book standard Economy (Coach) class. Basic Economy fares that prohibit carry-on luggage or seat assignments are discouraged, "
            "and standard Main Cabin / Economy fares should be selected. Travelers may purchase Economy seats with extra legroom (e.g., Comfort+, "
            "Main Cabin Extra) for flights exceeding 4 continuous hours at company expense.",
            "Business Class travel is authorized exclusively for non-stop, continuous one-way flight segments exceeding 6 flight hours (e.g., "
            "transatlantic, transpacific, or deep South American itineraries). Connecting flights where individual segments are under 6 hours "
            "do not qualify for Business Class upgrades based on cumulative travel time. For intercity transit along established high-speed rail "
            "corridors (e.g., Amtrak Acela along the Northeast Corridor, Eurostar, TGV, DB ICE in Europe), employees are encouraged to book rail "
            "in lieu of air travel, with standard business class rail seating authorized for trips exceeding 2 hours.",
            ["Travel Segment Type", "Scheduled Continuous Flight Duration", "Authorized Cabin Class", "Pre-Approval Authority", "Exceptions / Add-Ons"],
            [
                ["Domestic Short-Haul Flight", "Under 4 continuous flight hours", "Standard Economy / Coach Class", "Department Director in Navan", "Extra legroom paid by traveler"],
                ["Domestic Medium-Haul Flight", "4 to 6 continuous flight hours", "Economy Plus / Extra Legroom", "Department Director in Navan", "Checked bag fee (1 bag) covered"],
                ["International Flight (Long-Haul)", "Exceeding 6 continuous flight hours", "Commercial Business Class", "Department VP & CFO in Navan", "Lie-flat seating; lounge access"],
                ["Executive Leadership Travel", "All business flights > 3 hours", "Commercial Business Class", "Standing executive authorization", "First Class strictly prohibited"],
                ["High-Speed Passenger Rail", "Any intercity rail journey > 2 hours", "Business Class Rail (Acela/Eurostar)", "Department Director in Navan", "Quiet car seating recommended"],
            ],
            [120, 115, 110, 105, 90],
            [
                "First Class airfare is strictly prohibited across all employee tiers, including the Executive Leadership Team and Board members.",
                "Employees may use personal frequent flyer miles, airline credit cards, or personal funds to upgrade cabins at their own expense.",
                "Airline cancellation credits resulting from changed business trips remain corporate property and must be applied to future business travel.",
            ],
            "AIRFARE BOOKING ADVANCE RULE:",
            "All commercial flights must be booked at least 14 days in advance of departure. Navan algorithms flag last-minute bookings (<7 days) "
            "for executive review. Unjustified last-minute bookings may be rejected or require written VP justification."
        ),
        make_article(
            "Article 3. Lodging Standards, Nightly Room Caps & Tier 1 Metropolitan Exceptions",
            "3.1 Nightly Hotel Rate Ceilings, Tier 1 Metropolitan Caps & Corporate Rate Discounts",
            "Employees traveling on corporate business are entitled to safe, clean, comfortable, and professionally managed hotel accommodations. "
            "All hotel reservations must be booked through Navan, which automatically surfaces preferred corporate partner hotels offering "
            "contracted corporate discounts, complimentary Wi-Fi, and flexible cancellation terms. Standard single-occupancy rooms are authorized; "
            "suites, executive club floors, and luxury concierge upgrades are strictly non-reimbursable without prior VP authorization.",
            "Nexus establishes standard nightly lodging caps based on destination cost-of-living tiers: The Standard Lodging Cap is $200 per night "
            "(excluding mandatory room taxes and local occupancy fees) for the majority of domestic and international destinations. For designated "
            "Tier 1 High-Cost Metropolitan Markets (New York City, San Francisco, London, Tokyo, Zurich, Paris, Geneva, Singapore), the nightly cap "
            "is increased to $320 per night. If no partner hotel is available within the designated cap due to a citywide conference or peak event, "
            "the traveler must document market availability in Navan to secure an automated high-rate exception.",
            ["Metropolitan Tier", "Designated Urban Markets", "Nightly Room Cap (Excl. Tax)", "Authorized Room Type", "Rate Exception Pathway"],
            [
                ["Standard Domestic Cities", "Austin, Denver, Chicago, Atlanta, Dallas, Phoenix", "Up to $200 / Night standard cap", "Standard King / Queen room", "Director exception in Navan"],
                ["Tier 1 High-Cost Domestic", "New York City, San Francisco, Boston, Washington DC", "Up to $320 / Night enhanced cap", "Standard single-occupancy room", "Navan auto-exception if >90% sold"],
                ["Tier 1 International Cities", "London, Zurich, Tokyo, Paris, Singapore, Geneva", "Up to $320 / Night (or local currency eq)", "Standard business room with Wi-Fi", "VP approval required for > $320"],
                ["Secondary International", "Berlin, Dublin, Toronto, Sydney, Amsterdam", "Up to $240 / Night standard cap", "Standard business hotel room", "Director approval in Navan"],
                ["Conference Host Hotels", "Designated official conference partner hotel", "Published negotiated conference rate", "Standard conference attendee block", "Attach conference agenda to expense"],
            ],
            [110, 120, 110, 105, 95],
            [
                "Airbnb and private home-share rentals are permitted only for team offsites or stays exceeding 14 continuous days with VP approval.",
                "Incidental personal charges on hotel bills—such as in-room movies, minibar snacks, laundry for trips under 5 days—must be paid personally.",
                "Hotel laundry service is reimbursable only for business trips exceeding 5 consecutive business days, up to $30 per week.",
            ],
            "HOTEL FOLIO ITEMIZED RECEIPT RULE:",
            "Credit card slips showing only the final dollar total are unacceptable for hotel expenses. Travelers must obtain and upload an itemized "
            "zero-balance hotel folio breaking down nightly room rates, state and local taxes, parking, and dining charges."
        ),
        make_article(
            "Article 4. Daily Meal Allowances, Per Diem Schedules & Client Entertainment",
            "4.1 $75 Daily Meal Allowance Schedule & $100 Client Entertainment Cap",
            "Nexus Corporation reimburses actual, reasonable, and necessary meal expenses incurred during authorized business travel. The standard "
            "Daily Meal Allowance is $75 per full day of travel, structured across the following suggested meal allocations: Breakfast up to $15, "
            "Lunch up to $25, and Dinner up to $35 (including food, non-alcoholic beverages, applicable sales taxes, and customary gratuities). "
            "On travel departure and return days, the daily meal allowance is pro-rated to 75% ($56.25) to account for meals consumed at home.",
            "Gratuities for dining are reimbursable up to a maximum of 20% of the pre-tax bill in the United States and Canada (or local customary "
            "tipping norms internationally). When entertaining prospective or existing enterprise clients, business dining is authorized up to "
            "a maximum of $100 per attendee (inclusive of tax and tip). Client entertainment expense submissions must include an itemized receipt, "
            "the full names and company affiliations of all attendees, and a specific business justification or project discussion topic.",
            ["Meal Category", "Daily Allocation Standard", "Itemized Receipt Rule", "Pro-Rated Travel Days", "Alcohol Policy"],
            [
                ["Breakfast", "Up to $15.00 per day", "Receipt required if > $25", "Covered on travel departure day", "Alcohol strictly prohibited"],
                ["Lunch", "Up to $25.00 per day", "Receipt required if > $25", "Covered on travel departure day", "Alcohol strictly prohibited"],
                ["Dinner", "Up to $35.00 per day", "Receipt required if > $25", "Covered on full travel days", "Moderate beer/wine with meal allowed"],
                ["Full Day Total Allowance", "Up to $75.00 per full travel day", "Itemized receipts for all expenses", "75% ($56.25) on partial travel days", "Max 1 glass beer/wine at dinner"],
                ["Client Business Entertainment", "Up to $100.00 per attendee", "MANDATORY itemized receipt + names", "Requires Director pre-approval", "Reasonable wine/drinks with dinner"],
            ],
            [110, 115, 115, 110, 90],
            [
                "Alcohol consumed outside of client business dinners or solo evening travel meals is strictly non-reimbursable.",
                "Meals provided by a conference, seminar, airline, or hotel must not be re-expensed as an individual dining charge.",
                "Group team dinners where multiple Nexus colleagues dine together must be paid and expensed by the most senior employee present.",
            ],
            "CLIENT ENTERTAINMENT RECEIPT MANDATE:",
            "IRS regulations strictly require that client entertainment expense reports document: (1) itemized receipt, (2) business purpose, "
            "(3) exact names, titles, and company affiliations of all attendees. Incomplete submissions will be rejected by Audit."
        ),
        make_article(
            "Article 5. Ground Transportation, Rental Vehicles & Ride-Hailing Guidelines",
            "5.1 Ride-Hailing Apps, Intermediate Rental Vehicles & Personal Mileage Reimbursement",
            "Employees are expected to utilize the most economical, safe, and efficient ground transportation options available when traveling. "
            "For airport transfers and local transit between hotels and client sites, ride-hailing services (Uber, Lyft) or public airport transit "
            "should be used. Travelers must select standard ride-hailing tiers (UberX, Lyft Standard); premium vehicle tiers (Uber Black, Lyft Lux, "
            "SUV) are non-reimbursable unless traveling with a team of 4 or more colleagues or transporting bulky company trade show equipment.",
            "Rental vehicles are authorized when ride-hailing or public transit is impractical or more expensive than driving. All car rentals "
            "must be booked through Navan with preferred corporate rental partners (Enterprise, National, Hertz). Travelers must reserve Compact "
            "or Intermediate / Mid-Size vehicle classes; luxury, convertible, or large SUV rentals are prohibited. In the US, corporate contracts "
            "include Collision Damage Waiver (CDW) and Loss Damage Waiver (LDW); employees must decline optional rental agency insurance.",
            ["Ground Transit Mode", "Authorized Standard", "Restricted / Prohibited Class", "Insurance Requirement", "Mileage Reimbursement"],
            [
                ["Ride-Hailing (Uber / Lyft)", "Standard UberX / Lyft Standard", "Uber Black, Lux, Executive SUV", "Covered by ride-share platform", "N/A (Direct receipt reimbursement)"],
                ["Rental Vehicle (Navan)", "Intermediate / Mid-Size Sedan", "Luxury, Sports, Full-Size SUV", "Decline CDW/LDW (Corporate covered)", "Refuel prior to return; save receipt"],
                ["Personal Vehicle Usage", "Business driving > commute", "Driving with suspended license", "Personal auto insurance is primary", "IRS Standard Rate: 67¢ / Mile (2026)"],
                ["Public Airport Transit", "Airport express trains, shuttles", "Private luxury limousine service", "N/A (Public mass transit)", "Actual fare receipt uploaded"],
                ["Tolls & Airport Parking", "Standard economy / terminal parking", "Valet parking at airports", "N/A (Standard corporate expense)", "Itemized parking ticket / toll receipt"],
            ],
            [110, 115, 115, 105, 95],
            [
                "Personal vehicle mileage is reimbursed at the official IRS standard mileage rate of 67.0 cents per mile for business travel.",
                "Daily commuting mileage between an employee home and designated regional office is non-reimbursable per federal IRS regulations.",
                "Rental vehicles must be refueled at a local commercial gas station prior to return; rental agency refueling fees are non-reimbursable.",
            ],
            "RENTAL VEHICLE INSURANCE INSTRUCTION:",
            "When renting vehicles in the United States and Canada using the corporate credit card through Navan, DECLINE optional CDW/LDW "
            "insurance coverage. Nexus maintains master corporate commercial insurance that automatically covers rental vehicle damage."
        ),
        make_article(
            "Article 6. Expense Report Submission Windows, Itemized Receipts & Navan Workflow",
            "6.1 30-Day Submission Deadline, Itemized Receipt Rules & Expensify/Navan Processing",
            "To comply with corporate financial reporting standards and federal IRS Accountable Plan rules, all business expenses incurred during "
            "travel must be documented and submitted through Navan Expense within 30 calendar days following the completion of the business trip. "
            "Expenses submitted between 31 and 60 days require written Department Vice President exception approval. Expenses submitted after "
            "60 calendar days will be strictly and permanently rejected without reimbursement, in accordance with corporate fiscal governance.",
            "Itemized receipts are mandatory for all individual expense items exceeding $25. A credit card summary slip showing only the merchant "
            "name and total charged amount is insufficient under IRS substantiation rules. Receipts must clearly display the vendor name, transaction "
            "date, individual items purchased with unit prices, applicable sales taxes, and total payment. Receipt images must be uploaded via "
            "the Navan mobile app using optical character recognition (OCR) scanning immediately upon receipt generation.",
            ["Submission Milestone", "Mandatory Timeline", "Required Approval Authority", "Audit & Processing SLA", "Consequence of Lateness"],
            [
                ["Standard Expense Filing", "Within 30 calendar days of trip end", "Direct Line Manager in Navan", "Finance review within 5 business days", "Direct deposit on next payroll cycle"],
                ["Late Submission Window", "31 to 60 calendar days post-trip", "Department Vice President required", "Finance manual compliance audit", "Potential delay in reimbursement"],
                ["Strict Rejection Threshold", "Beyond 60 calendar days post-trip", "CFO Exception Committee only", "Formal financial audit review", "Permanent forfeiture of reimbursement"],
                ["Itemized Receipt Threshold", "Any expense item exceeding $25.00", "Uploaded with expense line item", "Automated AI receipt scanning", "Expense rejected without itemized receipt"],
                ["Corporate Card Reconciliation", "Monthly card statement cycle (15th)", "Employee submits within 10 days", "Automated card reconciliation", "Suspension of corporate card charging"],
            ],
            [110, 115, 110, 110, 95],
            [
                "Lost receipts: For lost receipts under $75, employees may complete a Missing Receipt Affidavit in Navan (maximum 2 per year).",
                "Receipts in foreign languages are automatically translated and converted to USD using official OANDA exchange rates in Navan.",
                "Reimbursements are disbursed directly to employee bank accounts via automated clearing house (ACH) electronic transfer.",
            ],
            "IRS 60-DAY ACCOUNTABLE PLAN RULE:",
            "Under IRS Publication 463 regulations, expenses substantiated after 60 days lose tax-free status and must be reported as taxable "
            "gross income on employee W-2 forms. Submit all expense reports within 30 days to avoid adverse personal tax liabilities."
        ),
        make_article(
            "Article 7. Non-Reimbursable Expenses, Prohibited Charges & Corporate Card Governance",
            "7.1 Explicit Non-Reimbursable Charges, Corporate Card Sanctions & Dispute Protocols",
            "Corporate funds and corporate credit cards must never be utilized for personal convenience, luxury upgrades, or non-business activities. "
            "Nexus strictly enforces a comprehensive schedule of Non-Reimbursable Expenses. Any prohibited charges appearing on corporate cards "
            "or expense reports will be flagged during automated audits, rejected for payment, and must be immediately repaid by the employee. "
            "Intentional submission of fraudulent or personal expenses constitutes gross misconduct resulting in termination and legal action.",
            "Explicit non-reimbursable expenses include: (1) Airline seat upgrades, early boarding fees, or preferred seat fees on flights < 4 hrs; "
            "(2) Hotel minibar snacks, in-room movies, gaming, spa treatments, or gym fees; (3) Personal entertainment, tourist excursions, or "
            "theater tickets; (4) Traffic citations, speeding tickets, parking fines, or towing fees; (5) Travel expenses for spouses, partners, or "
            "family members traveling with the employee; (6) Alcohol consumed outside authorized business meals; and (7) Credit card late fees.",
            ["Prohibited Expense Category", "Specific Examples", "Policy Governance Rule", "Remediation Action", "Disciplinary Sanction"],
            [
                ["Personal Upgrades & Comfort", "First Class flights, hotel suites, luxury cars", "Strictly non-reimbursable", "Employee pays cost differential", "Finance warning on first occurrence"],
                ["Hotel Incidental Luxuries", "In-room movies, minibar items, massage, spa", "Strictly personal expense", "Deducted from hotel reimbursement", "Charge rejected by Navan AI"],
                ["Traffic / Parking Violations", "Speeding tickets, red-light fines, meter fines", "Driver personal legal liability", "Employee pays fine personally", "No corporate reimbursement allowed"],
                ["Spousal / Companion Travel", "Companion airfare, extra meals, extra rooms", "Strictly personal expense", "Companion costs itemized out", "Separate personal credit card required"],
                ["Card Delinquency Fees", "Late payment penalties on individual bill cards", "Employee timeliness responsibility", "Employee pays late penalty", "Card suspension upon 2 late cycles"],
            ],
            [110, 120, 110, 105, 95],
            [
                "Nexus corporate credit cards are issued for business travel expenses only and must never be used for personal retail purchases.",
                "Personal charges mistakenly placed on corporate cards must be declared immediately in Navan and reimbursed within 10 days.",
                "Employees with unresolved delinquent corporate card balances exceeding 30 days will have card charging privileges revoked.",
            ],
            "CORPORATE CARD MISUSE WARNING:",
            "Using corporate credit cards for personal retail purchases, gambling, adult entertainment, or unauthorized cash advances is a criminal "
            "offense and an immediate ground for termination of employment with full payroll clawback and referral to law enforcement."
        ),
        make_article(
            "Article 8. International Travel Governance, Currency Conversion & Medical Security",
            "8.1 International SOS Coverage, Foreign Exchange Protocols & Passport/Visa Support",
            "International business travel requires additional operational rigor, health precautions, and statutory compliance. Prior to departure "
            "for international assignments, employees must verify passport validity (minimum 6 months validity required beyond planned departure) "
            "and obtain all required business visas. Nexus reimburses 100% of passport renewal fees, international business visa application fees, "
            "consular expedite fees, and required traveler immunizations or prophylactic medications prescribed by a travel medicine clinic.",
            "All Nexus employees traveling abroad on authorized business are automatically enrolled in International SOS, our global emergency "
            "medical, security assistance, and travel support partner. International SOS provides 24/7/365 access to multilingual emergency medical "
            "assistance, English-speaking clinician referrals, medical evacuation coordination, and real-time security alerts. Foreign currency "
            "expenses are automatically converted to USD within Navan using official historical OANDA interbank exchange rates for transaction dates.",
            ["International Travel Domain", "Corporate Standard / Partner", "Coverage & Support Provided", "Cost Responsibility", "Emergency Escalation"],
            [
                ["Emergency Medical & Evacuation", "International SOS (Membership #11BCAS000001)", "Emergency medical care, air ambulance evacuation", "100% Paid by Nexus Corporation", "Call SOS 24/7: +1-215-942-8226"],
                ["Passports, Visas & Consular", "CIBTvisas Enterprise Partnership", "Business visa procurement, passport expedite", "100% Reimbursed via Navan", "CIBT corporate portal login"],
                ["Travel Health & Immunizations", "Passport Health / Travel Medicine", "Required yellow fever, typhoid, malaria prophylaxis", "100% Reimbursed via Navan", "Schedule 30 days before departure"],
                ["Foreign Exchange & Fees", "OANDA Interbank Rates in Navan", "Credit card foreign transaction fees reimbursed", "100% Reimbursed via Navan", "Navan auto-calculates rate"],
                ["High-Risk Security Briefings", "Global Security Operations Center", "Mandatory pre-trip threat briefing for Tier 3 nations", "100% Company Coordinated", "Mandatory GSOC sign-off"],
            ],
            [110, 115, 120, 105, 90],
            [
                "Download the International SOS Assistance App to your mobile device prior to departure for real-time localized push alerts.",
                "Employees traveling internationally must register their travel itinerary with the US State Department STEP program (or home nation equivalent).",
                "Keep paper copies of passport identification pages and visa stamps in a separate carry-on compartment from physical passports.",
            ],
            "INTERNATIONAL SOS EMERGENCY HOTLINE:",
            "In any international medical emergency, security evacuation, or lost passport scenario, contact the International SOS 24/7 "
            "Alarm Center at +1-215-942-8226 (Philadelphia) or +44-20-8762-8008 (London). Cite Nexus Corporation Membership #11BCAS000001."
        ),
        make_article(
            "Article 9. Expense Auditing Framework, Automated AI Scanning & Compliance Sampling",
            "9.1 Navan AI Pre-Audit, Random Forensic Sampling & Audit Resolution SLA",
            "Nexus Corporation maintains a multi-layered, technologically advanced expense auditing framework to ensure absolute fiscal integrity, "
            "prevent fraudulent transactions, and verify regulatory tax compliance. All expense submissions undergo 100% Automated AI Pre-Audit "
            "scanning within Navan Expense upon upload. The AI engine inspects receipt images for: duplicate submissions across employees, altered "
            "receipt numbers, unauthorized alcohol line items, weekend transactions, and merchant category code (MCC) policy mismatches.",
            "In addition to automated AI scanning, the Finance Compliance & Audit Team conducts Random Forensic Sampling, subjecting at least "
            "15% of all approved expense reports and 100% of reports exceeding $3,000 to comprehensive manual forensic audits. When an expense item "
            "is flagged by the audit engine or audit staff, an automated Request for Information (RFI) is dispatched to the employee. Employees "
            "must respond with clarifying documentation within 5 business days; unresolved audit flags result in reimbursement suspension.",
            ["Audit Stage", "Audit Technology / Team", "Inspection Scope", "Resolution SLA", "Escalation Pathway"],
            [
                ["Stage 1: Automated AI Scan", "Navan AI Computer Vision OCR", "100% of all submitted receipts and folios", "Instant real-time check upon upload", "Automated rejection of policy flags"],
                ["Stage 2: Manager Review", "Direct Line Manager in Navan", "Business purpose, project billing code verification", "3 Business Days from submission", "Manager approval or return to employee"],
                ["Stage 3: Forensic Sampling", "Finance Internal Audit Specialists", "Random 15% sample + 100% of reports > $3K", "5 Business Days from manager sign-off", "RFI audit query dispatched"],
                ["Stage 4: Compliance Review", "Head of Internal Financial Controls", "Suspected duplicates, altered receipts, fraud", "10 Business Days formal review", "Referral to Legal & People Ops"],
                ["Executive Expense Audit", "Audit Committee of Board of Directors", "100% of C-Suite and VP expense reports", "Quarterly audit review cycle", "Formal Board Audit Committee report"],
            ],
            [110, 115, 120, 105, 90],
            [
                "Audit telemetry is tracked quarterly to measure departmental policy adherence, submission velocity, and error rates.",
                "Employees with more than 3 rejected expense submissions in a calendar year must complete mandatory expense retraining.",
                "Internal Audit reserves the right to request original physical paper receipts up to 12 months following expense reimbursement.",
            ],
            "AUDIT QUERY RESPONSE SLA:",
            "Employees receiving an expense audit query from the Finance Compliance Team must provide requested itemized receipts or explanations "
            "within 5 business days. Unresolved queries will result in the disputed amount being deducted from subsequent payroll disbursements."
        ),
        make_article(
            "Article 10. Fraud Prevention, Clawback Enforcement & Disciplinary Sanctions",
            "10.1 Zero-Tolerance Expense Fraud, Payroll Restitution & Legal Prosecution",
            "Expense reporting is an exercise in absolute fiduciary trust. Nexus Corporation maintains a strict zero-tolerance policy regarding "
            "expense fraud, falsification of records, and intentional misrepresentation of corporate expenditures. Expense fraud includes: submitting "
            "fabricated or altered receipts, submitting personal charges disguised as business expenses, claiming reimbursement for canceled or "
            "refunded bookings, colluding with vendors or peers to inflate invoices, and claiming mileage for personal trips.",
            "Any substantiated instance of expense fraud triggers immediate disciplinary action up to and including summary termination of "
            "employment for cause, forfeiture of unpaid bonuses and equity vesting, and mandatory payroll clawback restitution under corporate "
            "governance provisions. In addition, Nexus Corporation vigorously pursues civil litigation to recover misappropriated funds and refers "
            "material expense fraud cases exceeding $1,000 to municipal, state, and federal law enforcement authorities for criminal prosecution.",
            ["Fraud Category", "Forensic Investigation Trigger", "Investigative Authority", "Financial Restitution Mechanism", "Disciplinary Sanction"],
            [
                ["Falsified / Altered Receipts", "AI forensic image metadata mismatch", "Internal Audit & Forensic IT", "100% Wage deduction clawback", "Immediate summary termination"],
                ["Personal Charges Expensed", "Vendor itemization forensic review", "Internal Audit & HR Lead", "Immediate payroll deduction offset", "Written warning to termination"],
                ["Duplicate Expense Claims", "Cross-employee receipt hash match", "Finance Compliance Team", "Reversal of duplicate payment", "Formal written warning in personnel file"],
                ["Refunded Flight / Hotel Claims", "Airline ticket status telemetry check", "Internal Audit Specialists", "100% Clawback of refunded funds", "Termination for cause upon intent"],
                ["Collusive Client Entertainment", "Whistleblower report / Ethics hotline", "Audit Committee & General Counsel", "Full restitution plus civil damages", "Termination, civil lawsuit, DOJ referral"],
            ],
            [110, 115, 115, 110, 90],
            [
                "Employees are protected under corporate whistleblower policies when reporting expense fraud observed in their department.",
                "Confidential reports may be submitted 24/7/365 to the Ethics Hotline at 1-800-555-0199 or online at ethics.nexus-corp.internal.",
                "Managers who knowingly approve fraudulent or non-compliant expense reports share equal disciplinary liability with the submitter.",
            ],
            "MANDATORY PAYROLL CLAWBACK AUTHORIZATION:",
            "In executing the corporate onboarding agreement, all employees grant Nexus Corporation legal authorization to deduct improper, "
            "fraudulent, or unverified expense advances and non-compliant card charges directly from final wages and severance payments."
        ),
        make_article(
            "Article 11. Emergency Travel Support, Trip Interruption & Medical Evacuation Protocols",
            "11.1 24/7 Navan VIP Support, Crisis Extraction Protocols & Emergency Cash Advances",
            "Travel disruptions, severe weather events, medical emergencies, and geopolitical instability can arise without warning during "
            "domestic and international travel. Nexus Corporation provides comprehensive 24/7/365 emergency travel support to ensure employee "
            "safety and rapid crisis response. If a traveler encounters a canceled flight, closed airport, natural disaster, or medical emergency, "
            "immediate operational assistance is available through Navan 24/7 VIP Traveler Support and International SOS.",
            "Navan travel counselors possess full authority to re-book stranded travelers on alternative airlines, secure emergency lodging, and "
            "arrange ground transportation during major carrier operational meltdowns without requiring real-time supervisory approval. In the "
            "event of an acute medical crisis, International SOS coordinates immediate hospital admission, guarantees medical payment deposits, "
            "dispatches emergency medical transport, and coordinates emergency family bedside visits for critically injured employees.",
            ["Crisis Scenario", "Primary Emergency Contact", "Immediate Operational Action", "Financial Authorization", "Corporate Response Protocol"],
            [
                ["Airline Operational Meltdown", "Navan In-App Chat / Phone Support", "Automated alternative re-booking on any carrier", "Pre-authorized up to $1,500 override", "Navan travel concierge priority queue"],
                ["Acute Medical Emergency", "International SOS (+1-215-942-8226)", "Hospital dispatch, medical monitoring", "Direct corporate billing of hospital", "Global Health team notified in 1 hr"],
                ["Geopolitical / Civil Unrest", "Nexus GSOC / International SOS", "Shelter-in-place instructions; extraction flights", "Unlimited corporate crisis charter budget", "Evacuation to nearest safe haven"],
                ["Lost Corporate Credit Card", "Navan Card Support / Silicon Valley Bank", "Instant card freeze; digital card reissued", "Emergency Western Union wire ($1,000)", "Digital Apple Pay / Google Wallet active"],
                ["Passport / Travel Doc Loss", "CIBTvisas & Local US Embassy", "Emergency consular appointment scheduling", "100% Expedite fees paid by Nexus", "International SOS consular escort"],
            ],
            [110, 115, 120, 105, 90],
            [
                "Always save emergency contacts in your mobile device: Navan Support: 1-888-535-0179; International SOS: +1-215-942-8226.",
                "Employees injured during business travel are covered under Nexus Workers' Compensation and corporate travel accident policies.",
                "Never leave a secure hotel or safe location during active civil unrest or riots without explicit guidance from corporate security.",
            ],
            "TRAVEL EMERGENCY PROTOCOL:",
            "In any acute crisis where personal safety is endangered, your first priority is immediate physical safety. Contact local authorities "
            "(911 or international equivalent), then alert the Nexus Global Security Operations Center (GSOC) at +1-800-555-GSOC."
        ),
        make_article(
            "Article 12. Statutory Tax Compliance, IRS Accountable Plan Governance & Financial Authorization",
            "12.1 Internal Revenue Code Section 62 Compliance, Executive Approvals & Governance",
            "This Travel & Expense Reimbursement Policy is established in strict conformity with Internal Revenue Code (IRC) Section 62 and "
            "Treasury Regulation § 1.62-2 as a formal IRS Accountable Plan. Under these statutory regulations, reimbursements and allowances "
            "paid to employees under this policy are completely excluded from employee gross income, are not subject to federal or state income "
            "tax withholding, and are not reported as taxable wages on Form W-2, provided that business expenses meet all substantiation criteria.",
            "To qualify for tax-free Accountable Plan treatment, three mandatory statutory conditions must be satisfied: (1) Business Connection: "
            "expenses must have a verified business purpose and be incurred while performing services for Nexus; (2) Substantiation: expenses "
            "must be substantiated with itemized receipts within 30 days (maximum 60 days); and (3) Return of Excess: any unspent travel advances "
            "must be returned to the company within 120 days. Expenses failing these criteria will be reclassified as taxable W-2 compensation. "
            "Nexus adheres strictly to IRS Publication 463 substantiation rules; personal mileage claims require documented odometer start/end "
            "readings or Google Maps route verifications uploaded with the expense claim to maintain audit-proof tax deductibility.",
            ["Governance Pillar", "Statutory Reference", "Compliance Requirement", "Responsible Oversight Body", "Audit Frequency"],
            [
                ["IRS Accountable Plan Rules", "IRC Section 62 & Treas. Reg. 1.62-2", "Valid business connection & substantiation", "Finance Compliance Committee", "Continuous automated audit"],
                ["Foreign Corrupt Practices (FCPA)", "15 U.S.C. § 78dd-1 (Anti-Bribery)", "Zero gifts or favors to foreign officials", "Legal Compliance & Audit", "100% Audit of international expenses"],
                ["UK Bribery Act Compliance", "UK Bribery Act 2010 Section 7", "Adequate anti-corruption procedures in place", "General Counsel & Audit", "Annual international risk review"],
                ["Sales & VAT Tax Reclaim", "EU VAT Directives & Canadian GST", "Itemized VAT invoices uploaded to Navan", "Corporate Tax Operations", "Quarterly international VAT reclaim"],
                ["Executive Expense Governance", "Sarbanes-Oxley Act Section 404", "Independent Audit Committee oversight", "Board Audit Committee", "Biannual Board audit review"],
            ],
            [110, 115, 120, 105, 90],
            [
                "Nexus Corporation reserves the right to amend, interpret, or revoke any provision of this policy at its sole discretion.",
                "Questions regarding travel policy interpretation should be directed to the Travel Operations Team at travel-desk@nexus-corp.internal.",
                "This policy supersedes all prior travel schedules, divisional expense guidelines, and verbal manager commitments.",
                "Tax implications regarding prolonged travel (>365 days in single location triggering taxable travel status) must be reviewed with Tax.",
                "Annual 1099 and W-2 reporting reconciliations are audited by an independent certified public accounting firm.",
            ],
            "EXECUTIVE RATIFICATION & APPROVAL:",
            "This policy has been ratified by the Chief Financial Officer, General Counsel, and Chief People Officer of Nexus Corporation "
            "effective January 1, 2026, establishing mandatory operational standards across all operating divisions and global subsidiaries."
        ),
    ]

    return {
        "filename": "travel_expense_policy.pdf",
        "meta": {
            "id": "HR-POL-005",
            "title": "Travel & Expense Reimbursement Policy",
            "category": "Finance | Travel Operations and Expense Governance",
            "eff_date": "January 1, 2026",
        },
        "sections": sections,
    }

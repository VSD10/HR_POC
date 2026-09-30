"""Total Rewards & Employee Benefits Guide (HR-POL-003) dense content module."""
from policies.common import make_article

def get_document():
    sections = [
        make_article(
            "Article 1. Group Medical Insurance, Preferred Provider Networks & Deductible Tiers",
            "1.1 Comprehensive Health Plans, Coverage Options & Teladoc Telemedicine",
            "Nexus Corporation is dedicated to supporting the holistic physical health and economic security of all employees and their families "
            "by offering comprehensive, competitive group health insurance coverage. Full-time regular employees working 30 or more hours per "
            "week are eligible for group healthcare benefits effective on their first calendar day of active employment. Nexus sponsors two "
            "nationwide medical plan options administered through Blue Cross Blue Shield (BCBS): (1) The Nexus Premier PPO Plan, and (2) The "
            "Nexus Consumer High Deductible Health Plan (HDHP) paired with an employer-funded Health Savings Account (HSA).",
            "Under both plans, 100% of in-network preventive care—including annual wellness physicals, routine immunizations, mammograms, "
            "colonoscopies, well-child visits, and standard laboratory panels—is covered at zero out-of-pocket cost to the employee, consistent "
            "with the Affordable Care Act (ACA). In addition, all enrolled employees and their covered dependents receive 24/7/365 access to "
            "board-certified physicians and pediatricians via the Teladoc virtual telehealth app with a $0 copay under the PPO plan.",
            ["Plan Option", "Individual / Family Deductible", "In-Network Coinsurance", "Out-of-Pocket Max (Ind / Fam)", "Company HSA Seed"],
            [
                ["Nexus Premier PPO", "$500 / $1,000", "90% In-Network / 10% Member", "$2,500 / $5,000", "Not Eligible for HSA (FSA Only)"],
                ["Nexus Consumer HDHP", "$1,600 / $3,200", "80% In-Network / 20% Member", "$3,500 / $7,000", "$750 Indiv / $1,500 Family Seed"],
                ["Prescription Tier 1 (Generic)", "$10 Copay (PPO) / 20% (HDHP)", "100% after copay/coinsurance", "Integrated with Medical OOP", "90-day mail order discount (2x copay)"],
                ["Prescription Tier 2 (Preferred)", "$35 Copay (PPO) / 20% (HDHP)", "100% after copay/coinsurance", "Integrated with Medical OOP", "Specialty pharmacy review required"],
                ["Prescription Tier 3 (Non-Pref)", "$60 Copay (PPO) / 30% (HDHP)", "100% after copay/coinsurance", "Integrated with Medical OOP", "Prior authorization by Express Scripts"],
            ],
            [120, 110, 105, 110, 95],
            [
                "Nexus subsidizes approximately 85% of employee-only premiums and 75% of dependent family coverage premiums.",
                "Medical plan elections remain binding for the calendar year unless an employee experiences a verified Qualifying Life Event.",
                "Employees enrolling in the HDHP plan receive the employer HSA contribution in two semi-annual installments (Jan & July).",
            ],
            "ACA ESSENTIAL HEALTH COVERAGE NOTICE:",
            "All health plans offered by Nexus Corporation meet or exceed the Affordable Care Act (ACA) Minimum Essential Coverage and "
            "Affordability standards. Form 1095-C tax documentation is distributed annually to all covered employees prior to January 31st."
        ),
        make_article(
            "Article 2. Comprehensive Dental & Vision Care Coverage",
            "2.1 Delta Dental Premier Network & VSP Vision Hardware Allowances",
            "Oral health and vision wellness are foundational to overall health and systemic disease prevention. Nexus provides all eligible "
            "employees with comprehensive dental insurance administered through Delta Dental and premier vision coverage through VSP Vision "
            "Care. Coverage begins on the first day of the calendar month following employment commencement. Diagnostic and preventive dental "
            "procedures are covered at 100% with no deductible applied, incentivizing regular semi-annual cleanings and check-ups.",
            "Delta Dental provides an annual maximum benefit of $2,500 per covered individual per calendar year. Orthodontic benefits for "
            "dependent children under age 19 are covered at 50% coinsurance with a lifetime maximum of $2,000. Through the VSP Choice Network, "
            "employees receive an annual comprehensive eye exam with a $10 copay, plus an annual retail frame and lens allowance of $200 (or $250 "
            "for featured designer frames), and discounts of up to 20% on laser vision correction (LASIK/PRK) through approved network providers.",
            ["Coverage Category", "Delta Dental Plan In-Network", "Delta Dental Out-of-Network", "VSP Vision In-Network", "Frequency Limits"],
            [
                ["Preventive / Cleanings", "100% Covered (No deductible)", "80% Usual, Customary & Reas.", "100% after $10 Copay (Exam)", "Twice per calendar year (every 6 mos)"],
                ["Basic Restorative / Fillings", "80% Coverage after $50 Ded.", "60% Coverage after $50 Ded.", "Lenses: $10 copay (single, bifocal)", "Once every 12 months"],
                ["Major Services (Crowns, Endo)", "50% Coverage after $50 Ded.", "40% Coverage after $50 Ded.", "Progressive lenses covered at 80%", "Once every 60 months per tooth"],
                ["Orthodontia (Under Age 19)", "50% Coverage (No deductible)", "50% Coverage (No deductible)", "N/A (Dental benefit)", "$2,000 Lifetime maximum per child"],
                ["Frames & Hardware Allowance", "N/A", "N/A", "$200 Frame Allowance + 20% off bal.", "Once every 12 calendar months"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Dental implants are covered under major restorative services at 50% coinsurance up to the $2,500 annual plan maximum.",
                "Contact lenses may be elected in lieu of prescription eyeglass lenses, with an annual allowance of $200 for materials.",
                "Out-of-network claims must be submitted to Delta Dental or VSP within 90 days of service for reimbursement.",
            ],
            "DENTAL PREVENTIVE INCENTIVE:",
            "Delta Dental features a rollover incentive: if you receive at least one cleaning per year and total claims remain under $800, "
            "$500 rolls into your qualifying dental reserve balance, increasing your future annual maximum benefit up to $3,500."
        ),
        make_article(
            "Article 3. Health Savings Accounts (HSA) & Flexible Spending Accounts (FSA)",
            "3.1 Tax-Advantaged Pre-Tax Spending Vehicles & Annual IRS Contribution Limits",
            "Nexus Corporation enables employees to significantly reduce taxable gross income and optimize medical spending through pre-tax "
            "savings vehicles administered via HealthEquity. Employees enrolled in the Nexus Consumer HDHP are eligible to establish a triple-tax-"
            "advantaged Health Savings Account (HSA). Contributions are pre-tax, investment growth is tax-free, and distributions for qualified "
            "medical expenses are 100% tax-free at federal, state, and local levels (excluding CA and NJ state income taxes).",
            "Nexus provides an annual seed contribution of $750 for individual HDHP enrollees and $1,500 for family HDHP enrollees. Employees "
            "may contribute additional payroll deductions up to the statutory IRS annual limits ($4,150 Individual / $8,300 Family for 2026, plus "
            "a $1,000 catch-up for age 55+). HSA funds are 100% employee-owned immediately, roll over indefinitely, and never expire. For employees "
            "enrolled in the PPO plan, Nexus offers a Healthcare Flexible Spending Account (FSA) with a $3,200 annual limit and a $640 rollover cap.",
            ["Account Type", "2026 IRS Maximum Limit", "Employer Seed Contribution", "Rollover / Portability Rule", "Eligible Expenses"],
            [
                ["Health Savings Account (HSA)", "$4,150 (Ind) / $8,300 (Fam)", "$750 (Ind) / $1,500 (Fam)", "100% Portable; never expires; rolls over", "Deductibles, dental, vision, Rx, OTC"],
                ["HSA Catch-Up (Age 55+)", "$1,000 additional annual", "N/A (Employee contribution)", "100% Portable; rolls over indefinitely", "Qualified healthcare expenses"],
                ["Healthcare FSA (PPO Only)", "$3,200 annual maximum", "None (Employee funded)", "$640 maximum rollover; rest forfeited", "Medical, dental, vision copays/deductibles"],
                ["Limited Purpose FSA (HDHP)", "$3,200 annual maximum", "None (Employee funded)", "$640 maximum rollover; rest forfeited", "Dental & Vision expenses ONLY (pairs w/ HSA)"],
                ["Dependent Care FSA (DCFSA)", "$5,000 per household / yr", "None (Employee funded)", "Use-it-or-lose-it (Grace period to Mar 15)", "Licensed daycare, preschool, elder care"],
            ],
            [120, 110, 105, 110, 95],
            [
                "HSA balances exceeding $1,000 can be invested across low-cost Vanguard mutual funds and ETFs within the HealthEquity portal.",
                "Healthcare FSA funds are pre-funded on January 1st and available immediately; HSA funds become available as deposited each pay period.",
                "Dependent Care FSA claims must be filed before the April 30th run-out deadline following the close of the calendar year.",
            ],
            "IRS FSA 'USE-IT-OR-LOSE-IT' RULE:",
            "Healthcare FSA funds exceeding the $640 rollover threshold and unspent Dependent Care FSA balances are permanently forfeited "
            "to the plan after the plan run-out deadline per IRS Section 125 regulations. Plan your annual elections carefully during Open Enrollment."
        ),
        make_article(
            "Article 4. 401(k) Retirement Savings, Employer Match & Investment Governance",
            "4.1 Enterprise 401(k) Plan Architecture, 100% Match up to 4% & Immediate Vesting",
            "Preparing for long-term financial security is a critical priority for Nexus workforce members. Nexus sponsors the Nexus Enterprise "
            "401(k) Retirement Savings Plan administered through Fidelity Investments. All regular full-time and part-time employees are eligible "
            "to participate immediately upon hire. To encourage sound savings habits, new hires are automatically enrolled at a 6% pre-tax "
            "contribution rate with an annual 1% automatic escalation on July 1st up to a 10% ceiling, unless the employee elects otherwise in Fidelity.",
            "Nexus provides an industry-leading dollar-for-dollar employer matching contribution: Nexus matches 100% of employee contributions up "
            "to 4% of eligible base salary. Best-in-class feature: Company matching contributions are 100% immediately vested from Day 1 of employment, "
            "with zero vesting waiting periods or golden handcuffs. Employees may elect traditional pre-tax contributions, Roth post-tax contributions, "
            "or a combination of both up to the annual IRS elective deferral limit ($23,500 for 2026, plus $7,500 catch-up for age 50+).",
            ["Contribution Dimension", "Pre-Tax Traditional 401(k)", "Roth Post-Tax 401(k)", "Company Matching Policy", "Vesting Schedule"],
            [
                ["Tax Treatment of Contributions", "Immediate income tax deduction", "Contributed from after-tax pay", "Pre-tax company contribution", "100% Immediate Vesting Day 1"],
                ["Tax Treatment of Withdrawals", "Taxed as ordinary income at retirement", "100% Tax-Free growth & withdrawals", "Taxed as ordinary income at retirement", "Employee owns 100% of match"],
                ["2026 IRS Elective Limit", "$23,500 annual limit (combined)", "$23,500 annual limit (combined)", "100% match up to 4% of base pay", "Zero graded vesting cliff"],
                ["Age 50+ Catch-Up Limit", "$7,500 additional elective deferral", "$7,500 additional elective deferral", "Standard matching formula applies", "100% Immediate Vesting"],
                ["Fidelity Investment Menu", "Vanguard Index Funds, Target Date", "Vanguard Index Funds, Target Date", "Invested per employee allocation", "BrokerageLink active trading option"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Employees may adjust contribution percentages, investment fund allocations, or loan options at any time via NetBenefits.fidelity.com.",
                "Fidelity BrokerageLink enables experienced investors to access individual stocks, bonds, and mutual funds outside core menu funds.",
                "401(k) participant loans are permitted up to 50% of vested account balance or $50,000 maximum, repayable over 5 years via payroll.",
            ],
            "FIDELITY NETBENEFITS ENROLLMENT:",
            "Access NetBenefits at www.netbenefits.com to select your contribution rate and investment portfolio. Failure to actively choose "
            "investments results in automated placement in the Vanguard Target Retirement Fund closest to your estimated age-65 retirement date."
        ),
        make_article(
            "Article 5. Mental Health Services, Wellbeing Programs & Lifestyle Stipends",
            "5.1 Modern Health Comprehensive Mental Wellness & $75 Monthly Lifestyle Stipend",
            "Mental health is just as critical as physical wellbeing. Nexus Corporation provides all employees and their dependents with comprehensive, "
            "confidential mental health coverage through our enterprise partner, Modern Health. Every employee and their covered household family "
            "members are entitled to 8 free, fully covered 1-on-1 virtual or in-person therapy sessions per calendar year with licensed clinicians "
            "(psychologists, LCSWs, and LMFTs), plus 8 free 1-on-1 certified professional life and executive coaching sessions annually.",
            "Beyond therapy sessions, Modern Health provides unlimited access to digital mental wellbeing toolkits, audio courses, guided meditation, "
            "and clinician-led community circles. In addition, Nexus provides every full-time regular employee with a $75 Monthly Lifestyle & Wellness "
            "Stipend disbursed automatically via payroll. This post-tax stipend may be utilized for gym memberships, fitness classes, Peloton apps, "
            "ergonomic home accessories, athletic footwear, massage therapy, or nutritional meal subscriptions without receipt submission.",
            ["Wellness Program", "Provider / Channel", "Coverage / Entitlement", "Target Audience", "Access Protocol"],
            [
                ["Clinical Mental Health Therapy", "Modern Health Clinician Network", "8 Free 1-on-1 sessions / yr / person", "Employees & covered dependents", "Modern Health app / 24h booking"],
                ["Professional Executive Coaching", "Modern Health Certified Coaches", "8 Free 1-on-1 coaching sessions / yr", "All active full-time staff", "Modern Health app / self-schedule"],
                ["Lifestyle & Fitness Stipend", "Disbursed via bi-weekly payroll", "$75 / Month ($900 / Year)", "Full-time regular personnel", "Automated payroll credit line"],
                ["Guided Mindfulness & Sleep", "Headspace Enterprise Subscription", "100% Free corporate subscription", "All global employees & interns", "SSO login via Okta dashboard"],
                ["Ergonomic Virtual Physical Therapy", "Hinge Health Digital Clinic", "100% Free digital sensor & PT care", "Personnel with joint/back pain", "Hinge Health app direct registration"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Modern Health clinical therapy sessions are 100% strictly confidential; Nexus HR receives zero diagnostic or attendance data.",
                "Employees requiring therapy beyond 8 free sessions can transition seamlessly to in-network BCBS PPO mental health coverage.",
                "Crisis support is accessible 24/7/365 via the Modern Health emergency crisis intake line at 1-888-555-MODERN.",
            ],
            "CONFIDENTIALITY GUARANTEE:",
            "Utilization of Modern Health services is entirely confidential under federal HIPAA privacy laws. Nexus receives only aggregated, "
            "anonymized demographic reporting and will never know which employees access therapy, counseling, or coaching services."
        ),
        make_article(
            "Article 6. Group Life, AD&D, Short-Term Disability & Long-Term Disability",
            "6.1 Corporate Life Insurance, Salary Continuation & Income Protection Tiers",
            "To safeguard employees and their families against unexpected catastrophic events, Nexus Corporation provides comprehensive group "
            "life insurance, accidental death and dismemberment (AD&D), and disability income protection administered through Prudential Financial. "
            "Nexus covers 100% of the premium cost for Basic Life and AD&D coverage equal to 2 times the employee regular annual base salary, "
            "up to a maximum benefit ceiling of $750,000. Coverage takes effect on the first day of employment without medical underwriting.",
            "Nexus also provides 100% company-funded Short-Term Disability (STD) and Long-Term Disability (LTD) coverage. STD provides 60% of "
            "regular base salary (up to $2,500/week) following a 7-day elimination period, continuing for up to 26 weeks. For extended disabilities "
            "exceeding 26 weeks, LTD provides 60% of regular base salary (up to $10,000/month) continuing until age 65 or Social Security Normal "
            "Retirement Age. Supplemental voluntary life insurance up to an additional 5x salary ($1,000,000 max) is available via payroll deduction.",
            ["Insurance Coverage Tier", "Underwriter / Carrier", "Benefit Amount / Salary Formula", "Cost Responsibility", "Waiting / Elimination Period"],
            [
                ["Basic Life & AD&D Insurance", "Prudential Financial Group", "2.0x Annual Regular Base Salary (Max $750K)", "100% Company Paid by Nexus", "Effective Day 1 of employment"],
                ["Short-Term Disability (STD)", "Prudential Financial Group", "60% of Regular Base Pay (Max $2,500/wk)", "100% Company Paid by Nexus", "7 Calendar Days elimination period"],
                ["Long-Term Disability (LTD)", "Prudential Financial Group", "60% of Regular Base Pay (Max $10,000/mo)", "100% Company Paid by Nexus", "180 Calendar Days (26 weeks) elimination"],
                ["Supplemental Voluntary Life", "Prudential Financial Group", "1x to 5x Salary ($1,000,000 maximum cap)", "100% Employee Paid (Pre-tax)", "Effective first of month after approval"],
                ["Spouse / Dependent Life", "Prudential Financial Group", "$25,000 to $100,000 coverage increments", "100% Employee Paid (Post-tax)", "Evidence of Insurability if > $50K"],
            ],
            [120, 105, 115, 105, 95],
            [
                "Beneficiary designations for Basic Life and AD&D must be completed in Workday during onboarding and updated after life events.",
                "Disability benefits coordinate with statutory state disability insurance (CA SDI, NY DBL) so total payments equal 60% of pay.",
                "LTD benefits include rehabilitation incentives, return-to-work bonuses, and workplace ergonomic modification allowances.",
            ],
            "ANNUAL BENEFICIARY DESIGNATION REVIEW:",
            "It is the employee sole responsibility to keep beneficiary designations current in Workday. In the event of an employee demise, "
            "life insurance proceeds are distributed strictly according to the legally binding beneficiary designation on file with Prudential."
        ),
        make_article(
            "Article 7. Family Building, Fertility Support, Adoption Assistance & Surrogacy Support",
            "7.1 Carrot Fertility Partnership, $10,000 Lifetime Benefit & Surrogacy Assistance",
            "Nexus Corporation is deeply committed to supporting employees through all pathways to parenthood. In partnership with Carrot Fertility, "
            "Nexus provides every full-time employee with an inclusive $10,000 Lifetime Family-Building Benefit. This benefit covers clinical fertility "
            "treatments, egg and sperm freezing, in-vitro fertilization (IVF), intrauterine insemination (IUI), donor materials, gestational "
            "surrogacy arrangements, and legal domestic or international adoption processes, regardless of sexual orientation or gender identity.",
            "Carrot Fertility provides each employee with a dedicated care navigator who coordinates clinical consultations, assists with provider "
            "negotiations, and processes direct financial reimbursements through the secure Carrot Card. In addition to clinical funding, Nexus "
            "reimburses up to $10,000 in qualifying legal, agency, and court fees per finalized adoption. Nexus also partners with Maven Clinic to "
            "provide comprehensive virtual doula support, lactation counseling, and post-partum return-to-work coaching for new parents.",
            ["Family Building Support Area", "Partner Provider", "Financial Benefit Allocation", "Eligible Services Covered", "Taxation Status"],
            [
                ["Clinical Fertility & IVF", "Carrot Fertility Network", "$10,000 Lifetime Maximum", "IVF, IUI, egg/sperm freezing, genetic testing", "Subject to IRS medical expense rules"],
                ["Adoption Legal Reimbursement", "Nexus People Operations", "Up to $10,000 per adoption", "Legal fees, court filing, agency placement costs", "Tax-exempt under IRC Section 137"],
                ["Gestational Surrogacy Support", "Carrot Fertility Network", "$10,000 Lifetime Maximum", "Surrogate medical screening, agency fees, legal", "Taxable corporate benefit under IRS"],
                ["Virtual Doula & Midwife Care", "Maven Clinic Virtual Platform", "100% Free virtual consultations", "Prenatal doula, postpartum support, birth plan", "100% Company Funded"],
                ["Lactation Support & Shipping", "Milk Stork Corporate Account", "100% Free milk delivery / travel", "Refrigerated breast milk shipping while traveling", "100% Company Funded"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Carrot Fertility benefits are accessible on Day 1 of full-time employment with zero waiting periods or diagnostic hurdles.",
                "Milk Stork enables nursing mothers traveling on business to ship refrigerated breast milk home overnight at zero personal expense.",
                "Employees undergoing fertility cycles receive up to 5 paid medical recovery days per calendar year under the leave policy.",
            ],
            "CARROT ENROLLMENT PROCESS:",
            "Register at www.get-carrot.com using your Nexus corporate email address. Your care navigator will schedule an introductory video "
            "consultation within 48 hours to create a tailored fertility, adoption, or surrogacy roadmap and activate your Carrot Card."
        ),
        make_article(
            "Article 8. Tuition Reimbursement, Student Loan Repayment & Continuous Learning",
            "8.1 IRS Section 127 Tax-Free Tuition Assistance & $100 Monthly Student Loan Benefit",
            "Investing in our workforce educational attainment directly fuels enterprise innovation. Nexus Corporation sponsors a robust Educational "
            "Assistance Program compliant with Internal Revenue Code Section 127, providing up to $5,250 per calendar year in 100% tax-free tuition "
            "assistance for accredited undergraduate, graduate, and doctoral coursework. Courses must be related to current job duties or prospective "
            "career trajectories within Nexus, including Software Engineering, AI/Machine Learning, Cybersecurity, Cloud Architecture, and Business.",
            "To alleviate the burden of educational debt, Nexus also sponsors an automated Student Loan Repayment Assistance Program through "
            "Gradifi. Eligible full-time regular employees with at least 6 months of continuous service receive a direct corporate contribution "
            "of $100 per month ($1,200 per year, up to a lifetime maximum of $6,000) paid directly to the employee verified student loan servicer. "
            "This corporate payment reduces principal balance and shortens loan payoff timelines without reducing employee salary.",
            ["Education Program", "Funding Level", "Eligibility Timeline", "Approved Costs / Servicers", "Service Retention Agreement"],
            [
                ["IRS Sec 127 Tuition Assistance", "Up to $5,250 tax-free / year", "12 Months continuous service", "Tuition, lab fees, textbooks for degree", "12 Months retention post-completion"],
                ["Gradifi Student Loan Match", "$100 / Month ($6,000 max)", "6 Months continuous service", "Federal & private student loan servicers", "Must remain active during payments"],
                ["Professional Certifications", "100% Cost Covered (to $1,500)", "Immediate upon manager approval", "AWS, GCP, CISA, CISSP, PMP, Scrums", "Must remain active 6 months"],
                ["O'Reilly Learning / Coursera", "100% Corporate Subscription", "Immediate on Day 1 for all staff", "Unlimited technical libraries and labs", "None (Corporate benefit)"],
                ["Executive Sabbatical Grant", "Up to $15,000 per program", "Nomination by Executive Team", "Advanced executive university certificates", "24 Months retention agreement"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Tuition reimbursement requires an official grade of 'B' or higher (or 'Pass' in pass/fail grading) and itemized bursar receipt.",
                "Voluntary resignation within 12 months of receiving tuition assistance triggers pro-rated repayment deducted from final pay.",
                "Employees are encouraged to take up to 2 paid hours weekly during work hours for verified degree study or exam preparation.",
            ],
            "GRADIFI ENROLLMENT SLA:",
            "Link your loan servicer at nexus.gradifi.com within the first 15 days of the month. Corporate contributions initiate on the "
            "first monthly billing cycle following loan verification and are disbursed directly to your lender via electronic funds transfer."
        ),
        make_article(
            "Article 9. Voluntary Ancillary Insurance, Group Legal Services & Pet Insurance",
            "9.1 MetLife Group Legal Plans, Nationwide Pet Health & Norton Identity Theft Protection",
            "Nexus Corporation offers a rich suite of voluntary ancillary benefits that enable employees to customize personal and family "
            "protections at discounted group rates via convenient pre-tax and post-tax payroll deductions. Key voluntary offerings include: "
            "(1) MetLife Legal Plans providing fully covered legal consultations and document drafting; (2) Nationwide Pet Insurance covering "
            "veterinary care; (3) Norton LifeLock identity theft protection; and (4) Aflac Critical Illness and Accident Supplemental Insurance.",
            "Through MetLife Legal Plans, employees gain unlimited access to a nationwide network of 18,000+ participating attorneys for will "
            "preparation, estate planning, real estate purchases, traffic ticket defense, identity restoration, and elder law matters with "
            "zero attorney copays for covered services. Nationwide Pet Insurance reimburses up to 70% of veterinary medical expenses for "
            "accidents, illnesses, and hereditary conditions for canine and feline companions, with a $250 annual deductible.",
            ["Voluntary Benefit", "Carrier / Partner", "Typical Monthly Premium", "Key Services Covered", "Deduction Type"],
            [
                ["MetLife Group Legal Plan", "MetLife Legal Plans", "$16.50 / Month", "Wills, trusts, real estate, powers of attorney, traffic", "Post-tax payroll deduction"],
                ["Nationwide Pet Insurance", "Nationwide Pet Care", "$28.00 - $45.00 / Month (by pet)", "70% reimbursement; accidents, illnesses, surgeries", "Post-tax payroll deduction"],
                ["Norton LifeLock Benefit", "Norton LifeLock Identity", "$8.50 Indiv / $16.00 Family", "$1M stolen funds reimbursement, credit bureau alerts", "Pre-tax payroll deduction"],
                ["Aflac Critical Illness Plan", "Aflac Supplemental", "$12.00 - $24.00 / Month", "Lump-sum cash payout ($10K-$30K) on diagnosis", "Post-tax payroll deduction"],
                ["Aflac Accident Insurance", "Aflac Supplemental", "$11.00 / Month", "Cash payouts for ER visits, fractures, dislocations", "Post-tax payroll deduction"],
            ],
            [120, 110, 105, 115, 90],
            [
                "Voluntary benefits may be elected during annual Open Enrollment or within 30 days of hire via Workday Benefits.",
                "Pet insurance policies can be enrolled or modified year-round directly through the Nexus Nationwide custom portal.",
                "Legal plan coverage extends to the employee spouse and dependent children for family estate and consumer defense matters.",
            ],
            "ESTATE PLANNING RECOMMENDATION:",
            "People Operations strongly encourages all employees to utilize the MetLife Legal Plan to create or update their Last Will and "
            "Testament, Durable Power of Attorney, and Healthcare Proxy, completely covered at zero additional cost under the group legal plan."
        ),
        make_article(
            "Article 10. Commuter Benefits, Transit Subsidies & Pre-Tax Parking",
            "10.1 Edenred Commuter Solutions, 50% Transit Pass Subsidy & Active Mobility Stipend",
            "Nexus Corporation encourages sustainable commuting practices and helps offset transportation costs for office-based and hybrid "
            "personnel through pre-tax commuter benefits and direct transit subsidies administered via Edenred Commuter Solutions. In compliance "
            "with IRS Section 132(f), employees may contribute up to $315 per month pre-tax for public mass transit passes and vanpooling, plus "
            "an additional $315 per month pre-tax for qualified workplace parking at corporate offices or park-and-ride transit stations.",
            "To promote environmental sustainability and transit adoption, Nexus provides an active Transit Subsidy covering 50% of the cost "
            "of public transportation passes (subways, commuter rail, buses, ferries) up to a maximum company subsidy of $100 per month for "
            "hybrid employees reporting to regional office hubs. For employees who commute via bicycle or active micro-mobility, Nexus provides "
            "a $30 monthly bike-to-work reimbursement covering bike share memberships, maintenance tune-ups, and safety equipment.",
            ["Commuter Program", "IRS Statutory Limit (2026)", "Nexus Corporate Subsidy", "Eligible Transit Modes", "Payment Mechanism"],
            [
                ["Public Mass Transit Pass", "Up to $315 / Month pre-tax", "50% Match up to $100 / Month", "Subway, commuter train, metro bus, public ferry", "Edenred Commuter Mastercard"],
                ["Qualified Parking Account", "Up to $315 / Month pre-tax", "None (Subsidized on-site lots)", "Commercial parking garages, park-and-ride lots", "Edenred Commuter Mastercard"],
                ["Vanpool & Rideshare Pool", "Up to $315 / Month pre-tax", "50% Match up to $100 / Month", "Commuter vanpools with 6+ passengers", "Edenred direct vendor payment"],
                ["Active Bike / Micro-Mobility", "N/A (Corporate program)", "$30 / Month cash stipend", "Bicycle tune-ups, CitiBike/Lime memberships", "Expensify receipt upload"],
                ["EV Charging at Hubs", "N/A (Corporate facility)", "100% Free Level 2 charging", "ChargePoint on-site charging stations at hubs", "ChargePoint corporate RFID card"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Commuter deduction elections must be placed in Edenred by the 10th of each month for benefits to apply to the following month.",
                "Transit funds automatically roll over month-to-month while actively employed but are non-refundable upon separation per IRS law.",
                "Free corporate shuttle service is provided between regional train stations and Nexus headquarters during morning and evening rush.",
            ],
            "EDENRED COMMUTER DEADLINE:",
            "Place or modify commuter orders at login.edenredbenefits.com before 11:59 PM on the 10th of the month. Funds load onto your "
            "Edenred Mastercard on the first calendar day of the benefit month and are immediately usable for ticket vending and tap-and-pay."
        ),
        make_article(
            "Article 11. Annual Open Enrollment, Qualifying Life Events (QLE) & COBRA Continuation",
            "11.1 Annual Election Windows, Workday Benefits Module & COBRA Continuation Rights",
            "Annual Open Enrollment is held each autumn from November 1st through November 15th, providing all eligible employees with the "
            "opportunity to review, modify, enroll in, or waive health and welfare coverage for the upcoming calendar plan year. Elections made "
            "during Open Enrollment take effect on January 1st and remain irrevocable throughout the calendar year, in strict accordance with "
            "Section 125 of the Internal Revenue Code, unless the employee experiences a recognized Qualifying Life Event (QLE).",
            "Recognized QLEs include: marriage, divorce, legal separation, birth or adoption of a child, death of a spouse or dependent, loss of "
            "alternative coverage, or significant change in spousal employment status. Employees must submit their QLE change request and supporting "
            "legal documentation in Workday within 30 calendar days of the event date. Under federal COBRA regulations, separating employees and "
            "covered dependents may continue group medical, dental, and vision coverage for 18 to 36 months by paying 102% of the full premium.",
            ["Enrollment Event", "Election Window", "Effective Date of Change", "Required Documentation", "System Channel"],
            [
                ["Annual Open Enrollment", "Nov 1 - Nov 15 annually", "January 1st of following year", "None required (Annual active election)", "Workday > Benefits Open Enrollment"],
                ["Birth or Adoption of Child", "Within 30 days of birth/order", "Retroactive to date of birth", "Birth certificate or adoption court decree", "Workday > Life Events > New Dependent"],
                ["Marriage or Domestic Partner", "Within 30 days of ceremony", "First of month following marriage", "Government marriage license / affidavit", "Workday > Life Events > Legal Marriage"],
                ["Divorce or Legal Separation", "Within 30 days of court entry", "Date of divorce judgment", "Final divorce decree or legal separation order", "Workday > Life Events > Divorce"],
                ["COBRA Continuation Election", "60 Days from qualifying notice", "Continuous back to loss date", "COBRA Election Form to BenefitPoint", "BenefitPoint Third-Party Admin Portal"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Failure to submit QLE documentation within 30 days forfeits the mid-year change right until the next annual Open Enrollment.",
                "COBRA continuation notices are automatically dispatched via certified mail by BenefitPoint within 14 days of separation.",
                "Employees reaching age 65 receive comprehensive Medicare transition coordination through our Medicare advocacy partner.",
            ],
            "30-DAY QUALIFYING LIFE EVENT DEADLINE:",
            "Federal Section 125 regulations strictly prohibit mid-year benefit modifications past the 30-day window following a life event. "
            "Log into Workday and submit your event documentation immediately upon occurrence to safeguard your family coverage continuity."
        ),
        make_article(
            "Article 12. Benefits Administration, ERISA Compliance, Summary Plan Descriptions & Appeals",
            "12.1 Regulatory Governance, Form 5500 Annual Reporting & Formal Claim Appeals",
            "All health and welfare plans described in this guide are governed by the Employee Retirement Income Security Act of 1974 (ERISA) "
            "as amended. The Plan Administrator is the Nexus Corporation Total Rewards Committee, chaired by the Chief People Officer. The Plan "
            "Administrator possesses full discretionary authority to interpret plan provisions, determine benefit eligibility, and resolve "
            "disputed questions of fact. Summary Plan Descriptions (SPDs) and official plan documents are available on the HR Benefits Portal.",
            "Employees have the statutory right under ERISA to file formal appeals regarding denied claims or benefit eligibility determinations. "
            "Appeals must be submitted in writing to the Plan Administrator within 180 calendar days of receiving written notice of adverse "
            "determination. The Total Rewards Committee reviews all relevant records and issues a comprehensive written determination within "
            "60 calendar days of appeal receipt, detailing specific plan provisions, clinical rationale, and external review pathways. "
            "In addition to internal appeals, participants maintain the statutory right to seek independent external review through state insurance "
            "commissioners or bring civil action under ERISA Section 502(a) in federal district court following exhaustion of administrative remedies.",
            ["Administrative Function", "Governing Regulatory Body", "Statutory Requirement", "Responsible Authority", "Filing Deadline / Cycle"],
            [
                ["ERISA Plan Governance", "US Department of Labor (EBSA)", "ERISA Section 502 / Form 5500", "Total Rewards Committee", "Annual filing by July 31st with DOL"],
                ["Summary Plan Descriptions (SPD)", "US Department of Labor", "ERISA Section 104 disclosures", "People Operations Benefits Team", "Updated every 5 years; available 24/7"],
                ["Formal Benefit Claim Appeals", "ERISA Claims Procedure 503", "Full and fair review of claims", "ERISA Appeals Review Board", "Filed in 180 days; decided in 60 days"],
                ["HIPAA Privacy Compliance", "HHS Office for Civil Rights", "HIPAA Privacy & Security Rules", "Chief Privacy Officer & Legal", "Continuous monitoring; annual audits"],
                ["External Independent Review", "State Insurance Commissioners", "Affordable Care Act Sec 2719", "Independent Review Organizations", "Filed within 4 months of final denial"],
            ],
            [120, 110, 110, 110, 90],
            [
                "Nexus distributes the annual Summary Annual Report (SAR) summarizing financial status of all employee welfare benefit plans.",
                "Plan participants may examine all official plan documents and trust agreements without charge during regular business hours.",
                "Retaliation or discrimination against any employee for exercising rights under ERISA is illegal under federal law Section 510.",
                "Participants have the right to obtain copies of all plan documents, insurance contracts, and Form 5500 filings upon written request.",
                "The US Department of Labor Employee Benefits Security Administration (EBSA) provides free counseling at 1-866-444-EBSA.",
            ],
            "TOTAL REWARDS COMMITTEE CONTACT:",
            "Direct formal ERISA appeals, legal inquiries, and Summary Plan Description requests to: Total Rewards Committee, Nexus Corporation, "
            "Attn: Benefits Plan Administrator, 100 Nexus Way, Suite 400, or via email to benefits-governance@nexus-corp.internal."
        ),
    ]

    return {
        "filename": "benefits_guide.pdf",
        "meta": {
            "id": "HR-POL-003",
            "title": "Total Rewards & Employee Benefits Guide",
            "category": "Total Rewards | Compensation and Benefits",
            "eff_date": "January 1, 2026",
        },
        "sections": sections,
    }

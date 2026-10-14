import { HrRequest, NotificationItem, HolidayItem, LeaveBalance, PolicyItem } from '../types';

export const ASSETS = {
  logo: '/logo.svg',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  parentalLeaveImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi7Jx04YAu9hvasmLGHLdufUaN0tRPFFAp5DEcHokZvsHw2BjgkBgvZkvkoCG2o8vv40PNckNayyRLcjq5RyhkIsY2sLz0QrtvGnFQFqaG7sfqFeMlw_x3ldPQ5x7SXCOSexTmvgORXjuCSD_LO0UZ10u2IUvKeFjzqBiL8ukqG7zX0FESIUBe5i5sEY3wm6YhaU0-Pl9dplK-OBCXHTjv2pylPPbkRv_Pr5436JoNNQTsmYdTdDaJ',
  taxDeclarationImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu2ha8G2iq0FDxZh61m-yGql-k9EHm2CLiofHd1yNCKoUq8QXO6DfvvZ9FggsUV7p1sTwhJpE1mtRSp7PAuETIDA8_bqmbUPdmEgZC8f-Ef4mzOeN3P7nvNVr39GFNj940HyL915h6APPa2-g9JOIIKCg2Gb6-zk8ED1FxnnsA9ae21puJwptSBSztw7YzlyhYBaNHOHGA4fUwc2WmQJB1MC8QsBFNbJOVpYOfMxSc1zNPMLwqmyd8',
};

export const CURRENT_USER: {
  id?: string;
  name: string;
  role: string;
  department: string;
  employeeId: string;
  email: string;
  workLocation: string;
  manager: string;
  joiningDate: string;
  phone: string;
  bankName: string;
  accountNumberMasked: string;
  ifsc: string;
  avatar?: string;
} = {
  id: 'EMP002',
  name: 'Rupam Sharma',
  role: 'Senior Software Engineer',
  department: 'Product Engineering - Cloud Platform',
  employeeId: 'EMP-84920',
  email: 'rupam.sharma@enterprise.org',
  workLocation: 'Bengaluru Tech Park / Hybrid',
  manager: 'Ananya Roy (Director of Engineering)',
  joiningDate: '15 March 2022',
  phone: '+91 98450 12384',
  bankName: 'HDFC Bank Ltd',
  accountNumberMasked: '•••• •••• •••• 4892',
  ifsc: 'HDFC0001245',
  avatar: ASSETS.avatar,
};

export const INITIAL_REQUESTS: HrRequest[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Welcome to your Employee Self-Service Desk',
    time: 'Just now',
    read: false,
    type: 'info',
  },
  {
    id: 'n2',
    title: 'New HR policy published: Hybrid Work Guidelines 2026',
    time: 'Yesterday',
    read: false,
    type: 'policy',
  },
  {
    id: 'n3',
    title: 'Upcoming Public Holiday: Gandhi Jayanti on 02 Oct',
    time: '3 days ago',
    read: true,
    type: 'info',
  },
];

export const UPCOMING_HOLIDAYS: HolidayItem[] = [
  {
    id: 'h1',
    dateNum: '02',
    monthText: 'OCT',
    name: 'Gandhi Jayanti',
    type: 'National Holiday',
    dayOfWeek: 'Friday',
    fullDate: '02 October 2026',
  },
  {
    id: 'h2',
    dateNum: '20',
    monthText: 'OCT',
    name: 'Diwali',
    type: 'Festival Holiday',
    dayOfWeek: 'Tuesday',
    fullDate: '20 October 2026',
  },
  {
    id: 'h3',
    dateNum: '25',
    monthText: 'DEC',
    name: 'Christmas',
    type: 'Public Holiday',
    dayOfWeek: 'Friday',
    fullDate: '25 December 2026',
  },
  {
    id: 'h4',
    dateNum: '01',
    monthText: 'JAN',
    name: 'New Year Day',
    type: 'Optional Holiday',
    dayOfWeek: 'Friday',
    fullDate: '01 January 2027',
  },
];

export const INITIAL_LEAVE_BALANCE: LeaveBalance = {
  casual: { remaining: 8, total: 12 },
  sick: { remaining: 6, total: 10 },
  earned: { remaining: 12, total: 18 },
  annual: { remaining: 12, total: 18 },
};

export const POLICIES: PolicyItem[] = [
  {
    id: 'pol-1',
    title: 'Leave of Absence Policy (HR-POL-001)',
    category: 'Leave & Family',
    summary: 'Official leave administration manual governing Paid Time Off (PTO), sick leave, parental bonding leaves (16 weeks primary, 6 weeks secondary), bereavement, sabbaticals, and civic duty.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Official Policy',
    featured: true,
    readTime: '6 pages • 5 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/leave_policy.pdf',
    fileName: 'leave_policy.pdf',
    pageCount: 6,
    fileSize: '36.5 KB',
    content: [
      'Article 1: Annual PTO accrues at 1.67 days/month (20 days/year) with up to 5 days carryover into Q1.',
      'Article 2: 10 days paid sick leave annually with medical practitioner note required for consecutive absences > 3 days.',
      'Article 3: 16 weeks fully paid parental leave for primary caregivers and 6 weeks for secondary caregivers with flexible return options.',
      'Article 4: 5 days immediate family bereavement leave and full compensation for civic jury duty service.',
      'Article 5: Up to 90 days unpaid personal sabbatical leaves for career growth or critical family health needs.',
      'Article 6: 11 official public holidays plus 2 floating personal cultural holidays per calendar year.'
    ],
  },
  {
    id: 'pol-2',
    title: 'Total Rewards & Employee Benefits Guide (HR-POL-003)',
    category: 'Benefits & Wellness',
    summary: 'Comprehensive total rewards compendium covering PPO & HDHP medical plans, Delta Dental, VSP Vision, HSA seeds, and 401(k) 4% dollar-for-dollar employer match.',
    image: ASSETS.taxDeclarationImg,
    tag: 'Official Policy',
    featured: true,
    readTime: '6 pages • 6 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/benefits_guide.pdf',
    fileName: 'benefits_guide.pdf',
    pageCount: 6,
    fileSize: '35.8 KB',
    content: [
      'Article 1: Group medical coverage offering Comprehensive PPO and High-Deductible Health Plan with $0 preventative care.',
      'Article 2: Delta Dental covering 100% diagnostic exams and $2,500 annual limit, plus VSP Vision $200 hardware credit.',
      'Article 3: Employer HSA seed of $750 for individual or $1,500 for family plans, along with Healthcare & Dependent Care FSAs.',
      'Article 4: 401(k) retirement plan with 100% employer match up to 4% of salary and immediate day-one vesting.',
      'Article 5: Mental health benefits via Modern Health with 8 fully covered therapy sessions per year.',
      'Article 6: $75/month lifestyle wellness stipend for gym memberships, fitness gear, or mental wellness apps.'
    ],
  },
  {
    id: 'pol-3',
    title: 'Remote Work & Hybrid Workplace Policy (HR-POL-004)',
    category: 'Workplace & IT',
    summary: 'Hybrid 2-3 day model, $500 home office ergonomics setup stipend, $50/mo internet subsidy, and 20-day international remote work allowance.',
    tag: 'Official Policy',
    readTime: '6 pages • 5 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/remote_work_policy.pdf',
    fileName: 'remote_work_policy.pdf',
    pageCount: 6,
    fileSize: '37.1 KB',
    content: [
      'Article 1: Hybrid model requires 2-3 days in office with Tuesday and Thursday designated as core collaboration anchor days.',
      'Article 2: One-time $500 home office ergonomics setup stipend plus ongoing $50 monthly high-speed internet subsidy.',
      'Article 3: Up to 20 business days of international remote work from approved jurisdictions per fiscal year.',
      'Article 4: Endpoint security compliance requiring GlobalProtect VPN, disk encryption, and automatic 10-minute screen locks.',
      'Article 5: Ergonomic workstation requirements and async documentation first culture via Google Workspace and Slack.',
      'Article 6: Performance standards, manager regular syncs, and protocols for remote work agreement reviews.'
    ],
  },
  {
    id: 'pol-4',
    title: 'Travel & Expense Reimbursement Policy (HR-POL-005)',
    category: 'Payroll & Tax',
    summary: 'Daily meal allowances ($75/day), lodging limits, Navan flight booking workflows, and 30-day filing windows.',
    tag: 'Official Policy',
    readTime: '6 pages • 5 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/travel_expense_policy.pdf',
    fileName: 'travel_expense_policy.pdf',
    pageCount: 6,
    fileSize: '36.7 KB',
    content: [
      'Article 1: Business travel authorizations require 14 days advance notice for domestic and 30 days for international trips.',
      'Article 2: Economy airfare standard; business class permitted on flights exceeding 6 hours continuous travel time.',
      'Article 3: Hotel lodging caps set at $200/night standard or $320/night in Tier 1 global financial hubs (NYC, SF, London, Zurich).',
      'Article 4: Daily meal per diem of $75/day ($15 breakfast, $25 lunch, $35 dinner) or up to $100 for approved client dining.',
      'Article 5: Expense reports must be submitted within 30 days of trip conclusion with tax invoices attached via Navan.',
      'Article 6: Rigorous compliance controls, audit procedures, and clear definition of non-reimbursable personal expenditures.'
    ],
  },
  {
    id: 'pol-5',
    title: 'Information Security & Data Protection Policy (HR-POL-006)',
    category: 'Workplace & IT',
    summary: 'Password standards (14+ characters, MFA), clean desk policy, external media block, and 1-hour incident response SLA.',
    tag: 'Official Policy',
    readTime: '6 pages • 5 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/security_policy.pdf',
    fileName: 'security_policy.pdf',
    pageCount: 6,
    fileSize: '37.5 KB',
    content: [
      'Article 1: Password governance requiring 14+ characters, 90-day rotation, hardware/authenticator app MFA, and SMS MFA ban.',
      'Article 2: Strict Clean Desk Policy and mandatory screen locking (Win+L / Ctrl+Cmd+Q) whenever leaving workstations.',
      'Article 3: Hardware USB mass storage devices disabled by default across all company-issued laptops.',
      'Article 4: 4-tier data classification: Public, Internal, Confidential, and Restricted/PII with cryptographic controls.',
      'Article 5: 1-hour SLA for reporting suspected phishing, device loss, or security incidents to security@nexuscorp.internal.',
      'Article 6: Continuous telemetry auditing, log monitoring, and disciplinary frameworks for intentional security violations.'
    ],
  },
  {
    id: 'pol-6',
    title: 'Performance Management, Career Growth & Recognition Policy (HR-POL-007)',
    category: 'General Standards',
    summary: 'Biannual review cycles, 360-degree peer feedback, 5-tier calibrated rating system, career leveling, and PIP guidelines.',
    tag: 'Official Policy',
    readTime: '6 pages • 5 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/performance_and_growth_policy.pdf',
    fileName: 'performance_and_growth_policy.pdf',
    pageCount: 6,
    fileSize: '35.7 KB',
    content: [
      'Article 1: Performance philosophy emphasizing OKR alignment, impact velocity, and core enterprise leadership competencies.',
      'Article 2: Biannual review schedule (June mid-year check-in and December formal evaluation) featuring 360-degree peer feedback.',
      'Article 3: Standard 5-tier evaluation rating scale tied directly to February 1 annual merit compensation adjustments.',
      'Article 4: Parallel career growth ladders for Individual Contributors (IC1-IC8) and People Management (M1-M7).',
      'Article 5: Structured Performance Improvement Plan (PIP) framework with 30, 60, and 90-day objective milestones.',
      'Article 6: Mandatory bi-weekly 1-on-1 development meetings and upward feedback mechanisms for managers.'
    ],
  },
  {
    id: 'pol-7',
    title: 'Employee Handbook & Corporate Code of Conduct (HR-POL-002)',
    category: 'General Standards',
    summary: 'Enterprise mission, zero-tolerance anti-harassment, $1,200 annual learning stipend, and confidential ethics hotline.',
    tag: 'Official Policy',
    readTime: '6 pages • 6 min',
    lastUpdated: '01 Oct 2026',
    pdfUrl: '/resources/employee_handbook.pdf',
    fileName: 'employee_handbook.pdf',
    pageCount: 6,
    fileSize: '38.0 KB',
    content: [
      'Article 1: Company mission, equal opportunity employment, and strict zero-tolerance harassment and discrimination policy.',
      'Article 2: Standard 40-hour work week with 10:00 AM - 4:00 PM core sync window and overtime guidelines for non-exempt staff.',
      'Article 3: $1,200 annual individual professional development stipend for conferences, books, certifications, and courses.',
      'Article 4: Comprehensive compensation philosophy, bonus structures, and career progression frameworks.',
      'Article 5: Workplace safety protocols, health compliance, and drug/alcohol-free work environment mandates.',
      'Article 6: Confidential grievance escalation pathways, whistleblower protections, and 24/7 third-party ethics hotline.'
    ],
  },
];

export const KNOWLEDGE_FAQS = [
  {
    question: 'How do I claim medical insurance cashless reimbursement?',
    category: 'Benefits',
    answer: 'Show your MediAssist digital health card at the network hospital admission desk. For emergency hospitalization, inform the insurance desk within 24 hours. For non-network claims, collect all original discharge summaries, itemized bills, and submit a reimbursement claim in My Requests > Documents within 30 days.',
  },
  {
    question: 'What is the cutoff date for submitting monthly expense reimbursements?',
    category: 'Payroll',
    answer: 'Monthly claims submitted before the 20th of every month are disbursed along with that month’s salary on the last working day. Claims submitted after the 20th roll over to the following payroll cycle.',
  },
  {
    question: 'How can I request an experience or tenure certificate?',
    category: 'Documents',
    answer: 'Go to "Raise Request", select category "Documents", and choose "Employment Verification Letter" or "Experience Certificate". Digital certificates with cryptographic seals are dispatched within 2 business days.',
  },
  {
    question: 'What is the procedure for encashing unutilized earned leaves?',
    category: 'Leave',
    answer: 'Up to 30 earned leaves can be carried forward into the next calendar year. Any accumulated earned leave beyond 30 days is automatically encashed at basic salary rate during the March payroll cycle.',
  },
];

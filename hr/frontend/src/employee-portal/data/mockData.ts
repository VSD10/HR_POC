import { HrRequest, NotificationItem, HolidayItem, LeaveBalance, PolicyItem } from '../types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1WaZ8YCESJFIspy51rbU-PfY3H9ZC0fUO7zm64oYsxN6WgyuZ66MiUsMAHKUvoXVOYKlKVMZpsGDyNLxZkaAgERCmxOfhVhv9HWeQgMC3Kd-qhZYifNM1GIrf2-fI9TkNaFVS6VCWyd4kXIZHiIjsqLtbuVfX65E20Yw2wmKa6p_SwLkOgVDv57boHhkKaf2xYXMDN1rwxeoab1ahCYlfMi8a11ytKYvi70TAX6-VTRoXcHwPgEkiBKcJg',
  avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1We_fGu7ivsnlA9Sip2HUdvK_UW0DrH_HdC3JT5FMLT30mc7YMTBRoA6RZejOoDa-L9qu0bw0bVGaJ_KvvrYxKdIyccNkh1o0xBzT3gFiK7CeBRkAaH4a0U9ru2r6JsBB1APj0Ttd5eo5asFCWTCCXcdFtpYkHJOoK6UI5wKWjnHatdZyMQai7HlV53rP81t6-CuBcvlflzjLdw3CIxpZkZ-JJ06fPeSAinW0kCAO6Q1TUoyR19MEm581Y',
  parentalLeaveImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi7Jx04YAu9hvasmLGHLdufUaN0tRPFFAp5DEcHokZvsHw2BjgkBgvZkvkoCG2o8vv40PNckNayyRLcjq5RyhkIsY2sLz0QrtvGnFQFqaG7sfqFeMlw_x3ldPQ5x7SXCOSexTmvgORXjuCSD_LO0UZ10u2IUvKeFjzqBiL8ukqG7zX0FESIUBe5i5sEY3wm6YhaU0-Pl9dplK-OBCXHTjv2pylPPbkRv_Pr5436JoNNQTsmYdTdDaJ',
  taxDeclarationImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu2ha8G2iq0FDxZh61m-yGql-k9EHm2CLiofHd1yNCKoUq8QXO6DfvvZ9FggsUV7p1sTwhJpE1mtRSp7PAuETIDA8_bqmbUPdmEgZC8f-Ef4mzOeN3P7nvNVr39GFNj940HyL915h6APPa2-g9JOIIKCg2Gb6-zk8ED1FxnnsA9ae21puJwptSBSztw7YzlyhYBaNHOHGA4fUwc2WmQJB1MC8QsBFNbJOVpYOfMxSc1zNPMLwqmyd8',
};

export const CURRENT_USER = {
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
};

export const POLICIES: PolicyItem[] = [
  {
    id: 'pol-benefits',
    title: 'Benefits Guide',
    category: 'Payroll & Tax',
    summary: 'Total Rewards, medical floater coverage, HSA/FSA pre-tax benefits, and wellness allowances.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Total Rewards',
    featured: true,
    documentName: 'benefits_guide.pdf',
    readTime: '6 min read',
    lastUpdated: 'Today',
    content: [
      'Comprehensive medical insurance coverage including 100% in-network preventive care.',
      'Flexible Spending Account (FSA) and Health Savings Account (HSA) pre-tax contribution limits.',
      'Annual wellness bonus for gym, fitness, and mental health programs.'
    ]
  },
  {
    id: 'pol-leave',
    title: 'Leave Policy',
    category: 'Leave & Family',
    summary: 'Annual leave accruals, carryover limits, parental leave, and statutory sick leave provisions.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Leave & Time',
    featured: true,
    documentName: 'leave_policy.pdf',
    readTime: '5 min read',
    lastUpdated: 'Today',
    content: [
      'Annual leave guidelines, paid parental bonding leave for primary and secondary caregivers.',
      'Up to 30 days of earned leave carryover permitted into subsequent calendar years.',
      'Bereavement leave and statutory paid family and medical leave (PFML) integration.'
    ]
  },
  {
    id: 'pol-remote',
    title: 'Remote Work Policy',
    category: 'Workplace & IT',
    summary: 'Hybrid work guidelines, core collaboration hours, home office setup allowances, and data security.',
    image: ASSETS.taxDeclarationImg,
    tag: 'Workplace & IT',
    featured: true,
    documentName: 'remote_work_policy.pdf',
    readTime: '4 min read',
    lastUpdated: 'Today',
    content: [
      'Hybrid work model supporting in-office collaboration and flexible remote schedules.',
      'Core collaboration hours from 10:30 AM to 4:30 PM local time.',
      'IT equipment stipend and remote connectivity security protocols.'
    ]
  },
  {
    id: 'pol-expense',
    title: 'Expense Policy',
    category: 'Workplace & IT',
    summary: 'Corporate expense guidelines, meal per diem caps, client entertainment, and receipt filing rules.',
    image: ASSETS.taxDeclarationImg,
    tag: 'Finance & Travel',
    featured: true,
    documentName: 'expense_policy.pdf',
    readTime: '5 min read',
    lastUpdated: 'Today',
    content: [
      'Daily per diem allowances for domestic and international travel expenses.',
      'Mandatory itemized tax receipt submission within 30 days of expense occurrence.',
      'Direct expense claim reimbursement via direct payroll deposit.'
    ]
  },
  {
    id: 'pol-handbook',
    title: 'Employee Handbook',
    category: 'Workplace & IT',
    summary: 'Code of business conduct, equal opportunity workplace standards, and compliance governance.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Governance',
    featured: true,
    documentName: 'employee_handbook.pdf',
    readTime: '7 min read',
    lastUpdated: 'Today',
    content: [
      'Core enterprise values, code of business conduct, and ethical standards.',
      'Equal employment opportunity and anti-harassment policy.',
      'Whistleblower protection and confidential compliance reporting channels.'
    ]
  },
  {
    id: 'pol-security',
    title: 'Security Policy',
    category: 'Workplace & IT',
    summary: 'Information security, MFA authentication, laptop encryption, and customer data privacy standards.',
    image: ASSETS.taxDeclarationImg,
    tag: 'Compliance',
    featured: true,
    documentName: 'security_policy.pdf',
    readTime: '6 min read',
    lastUpdated: 'Today',
    content: [
      'Mandatory Multi-Factor Authentication (MFA) and enterprise password hygiene.',
      'Laptop full disk encryption and secure VPN tunneling requirements.',
      'Data classification and incident response reporting timelines.'
    ]
  },
  {
    id: 'pol-performance',
    title: 'Performance and Growth Policy',
    category: 'Workplace & IT',
    summary: 'Bi-annual performance appraisals, promotional frameworks, career leveling, and learning development.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Career Growth',
    featured: true,
    documentName: 'performance_and_growth_policy.pdf',
    readTime: '5 min read',
    lastUpdated: 'Today',
    content: [
      'Structured bi-annual performance evaluations with 360-degree peer and leadership reviews.',
      'Transparent career leveling frameworks and promotional compensation bands.',
      'Annual learning and professional certification sponsorship budget.'
    ]
  },
  {
    id: 'pol-travel-expense',
    title: 'Travel Expense Policy',
    category: 'Workplace & IT',
    summary: 'Detailed travel expense guidelines, flight classifications, hotel tier caps, and per diem limits.',
    image: ASSETS.taxDeclarationImg,
    tag: 'Travel & Expense',
    featured: true,
    documentName: 'travel_expense_policy.pdf',
    readTime: '6 min read',
    lastUpdated: 'Today',
    content: [
      'Comprehensive rules for booking corporate travel, economy class flights, and preferred hotels.',
      'Tier-1 and Tier-2 city meal allowances and incidental expense thresholds.',
      'Expense filing windows and fraud prevention guidelines.'
    ]
  },
  {
    id: 'pol-travel',
    title: 'Travel Policy',
    category: 'Workplace & IT',
    summary: 'Official travel approval authorization, emergency travel assistance, and duty of care guidelines.',
    image: ASSETS.parentalLeaveImg,
    tag: 'Travel Guidelines',
    featured: true,
    documentName: 'travel_policy.pdf',
    readTime: '4 min read',
    lastUpdated: 'Today',
    content: [
      'Pre-travel manager approval process and corporate travel risk management.',
      'International business visa processing and travel insurance coverage.',
      '24/7 emergency travel hotline and global assistance protocols.'
    ]
  }
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

export interface AppUser {
  id: string; // HR001, HR002, HR003, EMP001, EMP002, EMP003, EMP004
  name: string;
  email: string;
  department: string;
  role: string;
  isHr: boolean;
  avatar: string;
  avatarUrl: string; // alias for compatibility
  title: string;     // alias for compatibility
  securityLevel?: number;
  tenure?: string;
}

export const MOCK_USERS: AppUser[] = [
  // 1. HR Operations Users
  {
    id: 'HR001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@enterprise.internal',
    department: 'HR Operations',
    role: 'HR Operations Lead',
    title: 'HR Operations Lead',
    isHr: true,
    avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0',
    avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1Xtd_6Zzb5GlqZHxkO20YhGWUIh5W6zeXIQMhT-wo_XWwgwVuROluO2YbW2xoNMM9EX4rSJ9HfXVhPfo0-FHKC9ypn5YpZDfKfjsev9tVACXOmHmujbKFBPnxdIa0mK0Il1qM1GRlo1u2Phyfe_WS_DSjxP_VA-_CcPCooGoexaXN5JJnUeX6ce0c_p78M6YXoqa2h8-dvIVVZUElaP5exk5NPsZxfpbZryLSyTPFga3mLVWeRTcUTS_B0',
    securityLevel: 3,
    tenure: '5 years'
  },
  {
    id: 'HR002',
    name: 'Marcus Vance',
    email: 'marcus.vance@enterprise.internal',
    department: 'HR Operations',
    role: 'Senior HR Benefits & Leave Specialist',
    title: 'Senior HR Benefits & Leave Specialist',
    isHr: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    securityLevel: 2,
    tenure: '3 years'
  },
  {
    id: 'HR003',
    name: 'Elena Rostova',
    email: 'elena.rostova@enterprise.internal',
    department: 'HR Operations',
    role: 'Payroll & Compliance Admin',
    title: 'Payroll & Compliance Admin',
    isHr: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    securityLevel: 2,
    tenure: '4 years'
  },

  // 2. Employees
  {
    id: 'EMP001',
    name: 'Alex Johnson',
    email: 'alex.johnson@enterprise.internal',
    department: 'Engineering',
    role: 'Senior Staff Engineer',
    title: 'Senior Staff Engineer',
    isHr: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    securityLevel: 1,
    tenure: '4 years'
  },
  {
    id: 'EMP002',
    name: 'Rupam Sharma',
    email: 'rupam.sharma@enterprise.org',
    department: 'Product Engineering',
    role: 'Lead Full-Stack Engineer',
    title: 'Lead Full-Stack Engineer',
    isHr: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    securityLevel: 1,
    tenure: '2 years'
  },
  {
    id: 'EMP003',
    name: 'Maya Patel',
    email: 'maya.patel@enterprise.internal',
    department: 'Design & Product',
    role: 'Product Manager',
    title: 'Product Manager',
    isHr: false,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
    securityLevel: 1,
    tenure: '3 years'
  },
  {
    id: 'EMP004',
    name: 'David Chen',
    email: 'david.chen@enterprise.internal',
    department: 'Finance & Operations',
    role: 'Financial Analyst',
    title: 'Financial Analyst',
    isHr: false,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    securityLevel: 1,
    tenure: '1 year'
  }
];

export const HR_USERS = MOCK_USERS.filter(u => u.isHr);
export const EMPLOYEE_USERS = MOCK_USERS.filter(u => !u.isHr);

export function getUserById(id: string): AppUser | undefined {
  if (!id) return undefined;
  const normalized = id.trim().toUpperCase();
  return MOCK_USERS.find(u => u.id.toUpperCase() === normalized);
}

export function getUserByEmail(email: string): AppUser | undefined {
  if (!email) return undefined;
  const normalized = email.trim().toLowerCase();
  return MOCK_USERS.find(u => u.email.toLowerCase() === normalized);
}

export function findUserByQuery(query: string): AppUser | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return MOCK_USERS.find(u => 
    u.id.toLowerCase() === q ||
    u.email.toLowerCase() === q ||
    u.name.toLowerCase().includes(q)
  );
}
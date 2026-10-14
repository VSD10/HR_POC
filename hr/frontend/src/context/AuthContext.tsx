import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, getUserById, getUserByEmail, findUserByQuery, getUserRoles, determineDefaultPortal, canAccessPortal, PortalType, AppUser } from '../data/mockUsers';

export type UserRole = 'ADMIN' | 'HR_ADMIN' | 'HR_LEAD' | 'HR_SPECIALIST' | 'EMPLOYEE' | string;

export interface UserProfile extends AppUser {
  isAdmin?: boolean;
  userRoles?: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHr: boolean;
  isAdmin: boolean;
  userRoles: string[];
  defaultPortal: PortalType;
  canAccess: (portal: PortalType) => boolean;
  hasAdminRole: boolean;
  hasEmployeeRole: boolean;
  hasHrRole: boolean;
  login: (emailOrId: string, password?: string) => Promise<void>;
  loginAsUser: (userId: string) => Promise<void>;
  logout: () => void;
  demoLogin: (roleOrId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function applyThemeForUser(isHr: boolean) {
  try {
    const root = document.documentElement;
    const targetTheme = isHr ? 'dark' : 'light';
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('hr_theme', targetTheme);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hr_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate existing token or restored user on load
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('hr_auth_token');
      const storedUserId = localStorage.getItem('hr_active_user_id');

      if (!storedToken && !storedUserId) {
        setIsLoading(false);
        return;
      }

      // Check if we can find locally from roster first
      let resolvedUser: AppUser | undefined;
      if (storedUserId) {
        resolvedUser = getUserById(storedUserId);
      }

      // Try contacting sync server /auth/me
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken || storedUserId}`,
            'Accept': 'application/json'
          }
        });
        if (res.ok) {
          const profile = await res.json();
          // Normalize with roster details
          const rosterMatch = getUserById(profile.id) || getUserByEmail(profile.email);
          const computedRoles = getUserRoles({
            roles: profile.roles || rosterMatch?.roles,
            role: profile.role || rosterMatch?.role,
            systemRole: profile.systemRole || rosterMatch?.systemRole,
            isHr: profile.isHr !== undefined ? !!profile.isHr : (rosterMatch ? rosterMatch.isHr : false)
          });
          const finalUser: UserProfile = {
            id: profile.id || rosterMatch?.id || 'EMP001',
            name: profile.name || rosterMatch?.name || 'User',
            email: profile.email || rosterMatch?.email || '',
            department: profile.department || rosterMatch?.department || 'Operations',
            role: profile.role || rosterMatch?.role || (profile.isHr ? 'HR_ADMIN' : 'EMPLOYEE'),
            roles: computedRoles,
            userRoles: computedRoles,
            systemRole: profile.systemRole || rosterMatch?.systemRole,
            title: profile.title || rosterMatch?.title || profile.role || 'Team Member',
            isHr: profile.isHr !== undefined ? !!profile.isHr : (rosterMatch ? rosterMatch.isHr : false),
            avatar: profile.avatar || profile.avatarUrl || rosterMatch?.avatar || '',
            avatarUrl: profile.avatarUrl || profile.avatar || rosterMatch?.avatarUrl || '',
            securityLevel: profile.securityLevel || rosterMatch?.securityLevel || 1,
            tenure: profile.tenure || rosterMatch?.tenure || '1 year'
          };
          const tok = storedToken || `token_${finalUser.id}_${Date.now()}`;
          setUser(finalUser);
          setToken(tok);
          try {
            localStorage.setItem('hr_auth_token', tok);
            localStorage.setItem('hr_active_user_id', finalUser.id);
          } catch {}
          applyThemeForUser(finalUser.isHr);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[AuthContext] Backend /auth/me check failed, using local roster:', err);
      }

      if (resolvedUser) {
        const computedRoles = getUserRoles(resolvedUser);
        const finalResolved: UserProfile = {
          ...resolvedUser,
          roles: computedRoles,
          userRoles: computedRoles
        };
        const tok = storedToken || `token_${resolvedUser.id}_${Date.now()}`;
        setUser(finalResolved);
        setToken(tok);
        try {
          localStorage.setItem('hr_auth_token', tok);
          localStorage.setItem('hr_active_user_id', resolvedUser.id);
        } catch {}
        applyThemeForUser(resolvedUser.isHr);
      } else {
        localStorage.removeItem('hr_auth_token');
        localStorage.removeItem('hr_active_user_id');
        setToken(null);
        setUser(null);
      }
      setIsLoading(false);
    }

    checkAuth();
  }, []);

  const loginAsUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const matched = getUserById(userId) || findUserByQuery(userId);
      if (!matched) {
        throw new Error(`User with ID "${userId}" not found in roster`);
      }

      const generatedToken = `token_${matched.id}_${Date.now()}`;
      const computedRoles = getUserRoles(matched);
      const finalMatched: UserProfile = {
        ...matched,
        roles: computedRoles,
        userRoles: computedRoles
      };

      // Notify backend if online
      try {
        await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: matched.id, email: matched.email, role: matched.role, roles: computedRoles })
        });
      } catch (e) {
        console.warn('[AuthContext] Backend login notify warning:', e);
      }

      // Clear any stale portal choices from previous sessions
      localStorage.removeItem('portal');
      localStorage.removeItem('hr_active_portal');

      localStorage.setItem('hr_auth_token', generatedToken);
      localStorage.setItem('hr_active_user_id', matched.id);

      const targetPortal = determineDefaultPortal(finalMatched);
      localStorage.setItem('hr_active_portal', targetPortal);

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('tab');
        url.searchParams.delete('view');
        if (targetPortal === 'admin') {
          url.pathname = '/admin';
          url.searchParams.set('portal', 'admin');
        } else if (targetPortal === 'hr') {
          url.pathname = '/';
          url.searchParams.set('portal', 'hr');
        } else {
          url.pathname = '/';
          url.searchParams.set('portal', 'employee');
        }
        window.history.replaceState({}, '', url.toString());
        window.dispatchEvent(new Event('portal-navigation'));
        window.dispatchEvent(new PopStateEvent('popstate'));
      }

      setToken(generatedToken);
      setUser(finalMatched);
      applyThemeForUser(matched.isHr);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrId: string, password = 'SecretPassword123!') => {
    setIsLoading(true);
    try {
      // 1. Match from mock roster
      const matched = getUserById(emailOrId) || getUserByEmail(emailOrId) || findUserByQuery(emailOrId);

      // 2. Attempt server login
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: matched?.email || emailOrId,
            userId: matched?.id,
            password
          })
        });

        if (res.ok) {
          const data = await res.json();
          const serverUser = data.user;
          const finalMatch = getUserById(serverUser.id) || getUserByEmail(serverUser.email) || matched;
          const computedRoles = getUserRoles({
            roles: serverUser.roles || finalMatch?.roles,
            role: serverUser.role || finalMatch?.role,
            systemRole: serverUser.systemRole || finalMatch?.systemRole,
            isHr: serverUser.isHr !== undefined ? !!serverUser.isHr : (finalMatch ? finalMatch.isHr : false)
          });
          const finalUser: UserProfile = {
            id: serverUser.id || finalMatch?.id || 'EMP001',
            name: serverUser.name || finalMatch?.name || 'User',
            email: serverUser.email || finalMatch?.email || '',
            department: serverUser.department || finalMatch?.department || 'Operations',
            role: serverUser.role || finalMatch?.role || (serverUser.isHr ? 'HR_ADMIN' : 'EMPLOYEE'),
            roles: computedRoles,
            userRoles: computedRoles,
            systemRole: serverUser.systemRole || finalMatch?.systemRole,
            title: serverUser.title || finalMatch?.title || serverUser.role || 'Team Member',
            isHr: serverUser.isHr !== undefined ? !!serverUser.isHr : (finalMatch ? finalMatch.isHr : false),
            avatar: serverUser.avatar || serverUser.avatarUrl || finalMatch?.avatar || '',
            avatarUrl: serverUser.avatarUrl || serverUser.avatar || finalMatch?.avatarUrl || '',
            securityLevel: serverUser.securityLevel || finalMatch?.securityLevel || 1,
            tenure: serverUser.tenure || finalMatch?.tenure || '1 year'
          };

          // Clear any stale portal choices from previous sessions
          localStorage.removeItem('portal');
          localStorage.removeItem('hr_active_portal');

          localStorage.setItem('hr_auth_token', data.token);
          localStorage.setItem('hr_active_user_id', finalUser.id);

          const targetPortal = determineDefaultPortal(finalUser);
          localStorage.setItem('hr_active_portal', targetPortal);

          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('tab');
            url.searchParams.delete('view');
            if (targetPortal === 'admin') {
              url.pathname = '/admin';
              url.searchParams.set('portal', 'admin');
            } else if (targetPortal === 'hr') {
              url.pathname = '/';
              url.searchParams.set('portal', 'hr');
            } else {
              url.pathname = '/';
              url.searchParams.set('portal', 'employee');
            }
            window.history.replaceState({}, '', url.toString());
            window.dispatchEvent(new Event('portal-navigation'));
            window.dispatchEvent(new PopStateEvent('popstate'));
          }

          setToken(data.token);
          setUser(finalUser);
          applyThemeForUser(finalUser.isHr);
          return;
        }
      } catch (e) {
        console.warn('[AuthContext] Backend login endpoint unavailable, using roster match:', e);
      }

      if (matched) {
        const fallbackToken = `token_${matched.id}_${Date.now()}`;
        const computedRoles = getUserRoles(matched);
        const finalMatched: UserProfile = {
          ...matched,
          roles: computedRoles,
          userRoles: computedRoles
        };

        // Clear any stale portal choices from previous sessions
        localStorage.removeItem('portal');
        localStorage.removeItem('hr_active_portal');

        localStorage.setItem('hr_auth_token', fallbackToken);
        localStorage.setItem('hr_active_user_id', matched.id);

        const targetPortal = determineDefaultPortal(finalMatched);
        localStorage.setItem('hr_active_portal', targetPortal);

        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('tab');
          url.searchParams.delete('view');
          if (targetPortal === 'admin') {
            url.pathname = '/admin';
            url.searchParams.set('portal', 'admin');
          } else if (targetPortal === 'hr') {
            url.pathname = '/';
            url.searchParams.set('portal', 'hr');
          } else {
            url.pathname = '/';
            url.searchParams.set('portal', 'employee');
          }
          window.history.replaceState({}, '', url.toString());
          window.dispatchEvent(new Event('portal-navigation'));
          window.dispatchEvent(new PopStateEvent('popstate'));
        }

        setToken(fallbackToken);
        setUser(finalMatched);
        applyThemeForUser(matched.isHr);
      } else {
        throw new Error(`Invalid credentials or user "${emailOrId}" not found in mock user roster.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleOrId: string) => {
    // Check if roleOrId is a user ID directly
    const directUser = getUserById(roleOrId);
    if (directUser) {
      await loginAsUser(directUser.id);
      return;
    }

    // Role-based or test persona-based logins matching matrix:
    // Case 1: Maya Patel (EMPLOYEE)
    if (roleOrId === 'CASE1' || roleOrId === 'MAYA' || roleOrId === 'EMP003') {
      await loginAsUser('EMP003');
    }
    // Case 2: Sarah Jenkins (HR_SPECIALIST)
    else if (roleOrId === 'CASE2' || roleOrId === 'SARAH' || roleOrId === 'HR_SPECIALIST' || roleOrId === 'HR001') {
      await loginAsUser('HR001');
    }
    // Case 3: David Chen (HR_LEAD)
    else if (roleOrId === 'CASE3' || roleOrId === 'DAVID' || roleOrId === 'HR_LEAD' || roleOrId === 'EMP004') {
      await loginAsUser('EMP004');
    }
    // Case 4: John Smith (ADMIN only)
    else if (roleOrId === 'CASE4' || roleOrId === 'JOHN' || roleOrId === 'ADMIN_ONLY' || roleOrId === 'ADM001') {
      await loginAsUser('ADM001');
    }
    // Case 5: Alex (ADMIN + EMPLOYEE)
    else if (roleOrId === 'CASE5' || roleOrId === 'ALEX_ADMIN_EMP' || roleOrId === 'ALX001') {
      await loginAsUser('ALX001');
    }
    // Case 6: Alex (ADMIN + HR_LEAD)
    else if (roleOrId === 'CASE6' || roleOrId === 'ALEX_ADMIN_HR' || roleOrId === 'ALX002') {
      await loginAsUser('ALX002');
    }
    // Case 7: Alex (ADMIN + EMPLOYEE + HR_LEAD)
    else if (roleOrId === 'CASE7' || roleOrId === 'ALEX_ALL' || roleOrId === 'ALX003') {
      await loginAsUser('ALX003');
    }
    else {
      await loginAsUser('EMP001'); // Alex Johnson (EMPLOYEE)
    }
  };

  const logout = () => {
    localStorage.removeItem('hr_auth_token');
    localStorage.removeItem('hr_active_user_id');
    localStorage.removeItem('hr_active_portal');
    localStorage.removeItem('portal');
    try { sessionStorage.clear(); } catch {}

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.search = '';
      window.history.replaceState({}, '', url.toString());
      window.dispatchEvent(new Event('portal-navigation'));
      window.dispatchEvent(new PopStateEvent('popstate'));
    }

    setToken(null);
    setUser(null);
  };

  const computedUserRoles = getUserRoles(user);
  const isUserAdmin = computedUserRoles.includes('ADMIN');
  const hasEmployeeRole = computedUserRoles.includes('EMPLOYEE');
  const hasHrRole = computedUserRoles.includes('HR_LEAD') || computedUserRoles.includes('HR_SPECIALIST');
  const defaultPortal = determineDefaultPortal(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isHr: !!user?.isHr || hasHrRole,
        isAdmin: isUserAdmin,
        userRoles: computedUserRoles,
        defaultPortal,
        canAccess: (portal: PortalType) => canAccessPortal(user, portal),
        hasAdminRole: isUserAdmin,
        hasEmployeeRole,
        hasHrRole,
        login,
        loginAsUser,
        logout,
        demoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
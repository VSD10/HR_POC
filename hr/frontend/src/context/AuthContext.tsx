import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, getUserById, getUserByEmail, findUserByQuery, AppUser } from '../data/mockUsers';

export type UserRole = 'HR_ADMIN' | 'HR_SPECIALIST' | 'EMPLOYEE' | string;

export interface UserProfile extends AppUser {}

interface AuthContextType {
  user: UserProfile | null;
  currentUser: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHr: boolean;
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
          const finalUser: UserProfile = {
            id: profile.id || rosterMatch?.id || 'EMP001',
            name: profile.name || rosterMatch?.name || 'User',
            email: profile.email || rosterMatch?.email || '',
            department: profile.department || rosterMatch?.department || 'Operations',
            role: profile.role || rosterMatch?.role || (profile.isHr ? 'HR_ADMIN' : 'EMPLOYEE'),
            title: profile.title || rosterMatch?.title || profile.role || 'Team Member',
            isHr: profile.isHr !== undefined ? !!profile.isHr : (rosterMatch ? rosterMatch.isHr : false),
            avatar: profile.avatar || profile.avatarUrl || rosterMatch?.avatar || '',
            avatarUrl: profile.avatarUrl || profile.avatar || rosterMatch?.avatarUrl || '',
            securityLevel: profile.securityLevel || rosterMatch?.securityLevel || 1,
            tenure: profile.tenure || rosterMatch?.tenure || '1 year'
          };
          setUser(finalUser);
          setToken(storedToken || `token_${finalUser.id}`);
          applyThemeForUser(finalUser.isHr);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[AuthContext] Backend /auth/me check failed, using local roster:', err);
      }

      if (resolvedUser) {
        setUser(resolvedUser);
        setToken(storedToken || `token_${resolvedUser.id}`);
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

      // Notify backend if online
      try {
        await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: matched.id, email: matched.email, role: matched.role })
        });
      } catch (e) {
        console.warn('[AuthContext] Backend login notify warning:', e);
      }

      localStorage.setItem('hr_auth_token', generatedToken);
      localStorage.setItem('hr_active_user_id', matched.id);
      setToken(generatedToken);
      setUser(matched);
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
          const finalUser: UserProfile = {
            id: serverUser.id || finalMatch?.id || 'EMP001',
            name: serverUser.name || finalMatch?.name || 'User',
            email: serverUser.email || finalMatch?.email || '',
            department: serverUser.department || finalMatch?.department || 'Operations',
            role: serverUser.role || finalMatch?.role || (serverUser.isHr ? 'HR_ADMIN' : 'EMPLOYEE'),
            title: serverUser.title || finalMatch?.title || serverUser.role || 'Team Member',
            isHr: serverUser.isHr !== undefined ? !!serverUser.isHr : (finalMatch ? finalMatch.isHr : false),
            avatar: serverUser.avatar || serverUser.avatarUrl || finalMatch?.avatar || '',
            avatarUrl: serverUser.avatarUrl || serverUser.avatar || finalMatch?.avatarUrl || '',
            securityLevel: serverUser.securityLevel || finalMatch?.securityLevel || 1,
            tenure: serverUser.tenure || finalMatch?.tenure || '1 year'
          };
          localStorage.setItem('hr_auth_token', data.token);
          localStorage.setItem('hr_active_user_id', finalUser.id);
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
        localStorage.setItem('hr_auth_token', fallbackToken);
        localStorage.setItem('hr_active_user_id', matched.id);
        setToken(fallbackToken);
        setUser(matched);
        applyThemeForUser(matched.isHr);
      } else {
        throw new Error(`Invalid credentials or user "${emailOrId}" not found in mock user roster.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (roleOrId: string) => {
    // Check if roleOrId is a user ID directly (HR001, HR002, HR003, EMP001, EMP002, EMP003, EMP004)
    const directUser = getUserById(roleOrId);
    if (directUser) {
      await loginAsUser(directUser.id);
      return;
    }

    if (roleOrId === 'HR_ADMIN' || roleOrId === 'HR001') {
      await loginAsUser('HR001'); // Sarah Jenkins
    } else if (roleOrId === 'HR_SPECIALIST' || roleOrId === 'HR002') {
      await loginAsUser('HR002'); // Marcus Vance
    } else if (roleOrId === 'HR003') {
      await loginAsUser('HR003'); // Elena Rostova
    } else if (roleOrId === 'EMP002') {
      await loginAsUser('EMP002'); // Rupam Sharma
    } else if (roleOrId === 'EMP003') {
      await loginAsUser('EMP003'); // Maya Patel
    } else if (roleOrId === 'EMP004') {
      await loginAsUser('EMP004'); // David Chen
    } else {
      await loginAsUser('EMP001'); // Alex Johnson
    }
  };

  const logout = () => {
    localStorage.removeItem('hr_auth_token');
    localStorage.removeItem('hr_active_user_id');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isHr: !!user?.isHr,
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
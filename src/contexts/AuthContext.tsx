
import { createContext, useContext, useState, ReactNode } from 'react';
import { AuthState, User, UserRole } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple user database for demo purposes
const USERS = {
  admin: { password: 'admin123', role: 'admin' as UserRole },
  club: { password: 'club123', role: 'interviewer' as UserRole },
  // // Added college users
  // '23107104': { password: 'password123', role: 'interviewer' as UserRole },
  // '24129008': { password: 'password123', role: 'interviewer' as UserRole },
  // '24128017': { password: 'password123', role: 'interviewer' as UserRole },
  // '24106078': { password: 'password123', role: 'interviewer' as UserRole },
  // '24128062': { password: 'password123', role: 'interviewer' as UserRole },
  // '24107078': { password: 'password123', role: 'interviewer' as UserRole },
  // '24127056': { password: 'password123', role: 'interviewer' as UserRole },
  // '24127034': { password: 'password123', role: 'interviewer' as UserRole },
  // '24127033': { password: 'password123', role: 'interviewer' as UserRole },
  // '23107116': { password: 'password123', role: 'interviewer' as UserRole },
  // '24129029': { password: 'password123', role: 'interviewer' as UserRole },
  // '23127035': { password: 'password123', role: 'interviewer' as UserRole },
  // '23128025': { password: 'password123', role: 'interviewer' as UserRole },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem('user');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      isAuthenticated: !!savedUser,
    };
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    const userEntry = USERS[username as keyof typeof USERS];
    
    if (userEntry && userEntry.password === password) {
      const user: User = {
        username,
        role: userEntry.role,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuthState({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

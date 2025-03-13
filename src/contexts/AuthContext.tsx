
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthState, User, UserRole } from '@/types/auth';
import { 
  initializeStorage, 
  authenticateUser, 
  getCurrentUser, 
  logoutUser 
} from '@/services/storageService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize storage first
    initializeStorage();
    
    // Check if user is already logged in
    const storedUser = getCurrentUser();
    return {
      user: storedUser ? {
        username: storedUser.name,
        role: storedUser.role
      } : null,
      isAuthenticated: !!storedUser,
    };
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    const authenticatedUser = authenticateUser(email, password);
    
    if (authenticatedUser) {
      const user: User = {
        username: authenticatedUser.name,
        role: authenticatedUser.role,
      };
      
      setAuthState({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const logout = () => {
    logoutUser();
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  googleToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('googleToken');
    if (token) {
      setIsAuthenticated(true);
      setGoogleToken(token);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('googleToken', token);
    setGoogleToken(token);
    setIsAuthenticated(true);
    toast.success('Successfully logged in!');
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('googleToken');
    setGoogleToken(null);
    setIsAuthenticated(false);
    toast.success('Successfully logged out!');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, googleToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
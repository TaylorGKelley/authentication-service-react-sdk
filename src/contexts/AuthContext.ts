import { createContext } from 'react';
import AuthContextType from '../types/AuthContextType';

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  accessToken: undefined,
  setAccessToken: () => {},
  user: undefined,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

export default AuthContext;

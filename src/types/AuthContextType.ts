import { Dispatch, SetStateAction } from 'react';
import User from './User';

type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  accessToken?: string | null;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
  user?: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  login: ({ accessToken, user }: { accessToken: string; user: User }) => void;
  logout: () => void;
};

export default AuthContextType;

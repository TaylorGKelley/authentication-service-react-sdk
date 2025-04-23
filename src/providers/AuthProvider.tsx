import {
  FC,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import User from '../types/User';
import AuthContext from '../contexts/AuthContext';
import AuthContextType from '../types/AuthContextType';
import api from '../lib/api';
import useCSRFContext from '../hooks/useCSRFContext';
import axios, { AxiosRequestConfig } from 'axios';
import CSRFProvider from './CSRFProvider';

type AxiosRequestConfigWithRetry = AxiosRequestConfig & {
  _retry?: boolean;
};

const AuthProviderInner: FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null | undefined>();
  const [user, setUser] = useState<User | null | undefined>();

  const csrfToken = useCSRFContext();

  // fetch auth state and tokens
  useEffect(() => {
    if (accessToken === null) return; // Prevents this effect from running on logout, when accessToken is null

    const fetchAuthState = async () => {
      try {
        const response = await api.get<{
          isAuthenticated: boolean;
          user: User;
        }>('/check-auth');

        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    // Be sure the CSRF token is available before fetching auth state
    if (csrfToken) fetchAuthState();
  }, [csrfToken, accessToken]);

  // Add CSRF Token request interceptor to api(axios) config
  useLayoutEffect(() => {
    const csrfInterceptor = api.interceptors.request.use((config) => {
      if (config.method !== 'get') {
        // Adds header for all requests other than GET
        config.headers!['X-CSRF-Token'] = csrfToken;
      }

      return config;
    });

    return () => {
      api.interceptors.request.eject(csrfInterceptor);
    };
  }, [csrfToken]);

  // Add Access Token request interceptor to api(axios) config
  useLayoutEffect(() => {
    const authInterceptor = api.interceptors.request.use((config) => {
      config.headers!.Authorization = !(config as AxiosRequestConfigWithRetry)
        ._retry
        ? `Bearer ${accessToken}`
        : config.headers!.Authorization;

      return config;
    });

    return () => {
      api.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);

  // Add Refresh Token response interceptor to api(axios) config
  useLayoutEffect(() => {
    const refreshInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (!error?.response?.status || !csrfToken) {
          // If error is not a response error or CSRF token is not available, just return
          return Promise.reject(error);
        }

        const originalRequest = error.config;
        if (
          (error.response.status === 403 &&
            error.response.data.message === 'Invalid access token') ||
          (error.response.status === 401 &&
            error.response.data.message !== 'Refresh token not found' &&
            accessToken === undefined)
        ) {
          try {
            const response = await axios.post<{ accessToken: string }>(
              '/refresh-token',
              undefined,
              {
                headers: {
                  'X-CSRF-Token': csrfToken,
                },
                withCredentials: true,
              }
            );

            if (!response || response?.status !== 200)
              throw new Error('Cannot refresh token. Please login');

            setAccessToken(response.data.accessToken);

            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${response.data.accessToken}`,
            };
            originalRequest._retry = true;
            return api(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
      }
    );

    return () => {
      api.interceptors.response.eject(refreshInterceptor);
    };
  }, [csrfToken, accessToken]);

  const login = ({
    accessToken,
    user,
  }: {
    accessToken: string;
    user: User;
  }) => {
    setIsAuthenticated(true);
    setAccessToken(accessToken);
    setUser(user);
  };

  const logout = async () => {
    await api.delete('/logout', {
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      withCredentials: true,
    });

    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
  };

  // Context's value
  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    accessToken,
    setAccessToken,
    user,
    setUser,
    login,
    logout,
  } as AuthContextType;

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CSRFProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </CSRFProvider>
  );
};

export default AuthProvider;

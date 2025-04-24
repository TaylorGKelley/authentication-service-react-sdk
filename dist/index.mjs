// src/providers/AuthProvider.tsx
import React5, {
  useEffect as useEffect2,
  useLayoutEffect,
  useState as useState2
} from "react";

// src/contexts/AuthContext.ts
import { createContext } from "react";
var AuthContext = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {
  },
  accessToken: void 0,
  setAccessToken: () => {
  },
  user: void 0,
  setUser: () => {
  },
  login: () => {
  },
  logout: () => {
  }
});
var AuthContext_default = AuthContext;

// src/lib/api/index.ts
import axios from "axios";
var api = axios.create({
  timeout: 10 * 1e3,
  // 10 seconds
  headers: {
    "Content-Type": "application/json"
  }
});
var api_default = api;

// src/hooks/useCSRFContext.ts
import { useContext } from "react";

// src/contexts/CSRFContext.ts
import { createContext as createContext2 } from "react";
var CSRFContext = createContext2(void 0);
var CSRFContext_default = CSRFContext;

// src/hooks/useCSRFContext.ts
var useCSRFContext = () => {
  return useContext(CSRFContext_default);
};
var useCSRFContext_default = useCSRFContext;

// src/providers/AuthProvider.tsx
import axios3 from "axios";

// src/providers/CSRFProvider.tsx
import React4, {
  useEffect,
  useState
} from "react";
import axios2 from "axios";
var CSRFProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState();
  useEffect(() => {
    const fetchCSRFToken = async () => {
      var _a;
      try {
        const response = await axios2.get(
          "http://localhost:7001/api/v1/csrf-token",
          { withCredentials: true }
        );
        setCsrfToken((_a = response.data) == null ? void 0 : _a.csrfToken);
      } catch (error) {
        return Promise.reject(error);
      }
    };
    fetchCSRFToken();
  }, []);
  return /* @__PURE__ */ React4.createElement(CSRFContext_default.Provider, { value: csrfToken }, children);
};
var CSRFProvider_default = CSRFProvider;

// src/providers/AuthProvider.tsx
var AuthProviderInner = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState2(false);
  const [accessToken, setAccessToken] = useState2();
  const [user, setUser] = useState2();
  const csrfToken = useCSRFContext_default();
  useEffect2(() => {
    if (accessToken === null) return;
    const fetchAuthState = async () => {
      try {
        const response = await api_default.get("/check-auth");
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    if (csrfToken) fetchAuthState();
  }, [csrfToken, accessToken]);
  useLayoutEffect(() => {
    const csrfInterceptor = api_default.interceptors.request.use((config) => {
      if (config.method !== "get") {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
      return config;
    });
    return () => {
      api_default.interceptors.request.eject(csrfInterceptor);
    };
  }, [csrfToken]);
  useLayoutEffect(() => {
    const authInterceptor = api_default.interceptors.request.use((config) => {
      config.headers.Authorization = !config._retry ? `Bearer ${accessToken}` : config.headers.Authorization;
      return config;
    });
    return () => {
      api_default.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);
  useLayoutEffect(() => {
    const refreshInterceptor = api_default.interceptors.response.use(
      (response) => response,
      async (error) => {
        var _a;
        if (!((_a = error == null ? void 0 : error.response) == null ? void 0 : _a.status) || !csrfToken) {
          return Promise.reject(error);
        }
        const originalRequest = error.config;
        if (error.response.status === 403 && error.response.data.message === "Invalid access token" || error.response.status === 401 && error.response.data.message !== "Refresh token not found" && accessToken === void 0) {
          try {
            const response = await axios3.post(
              "/refresh-token",
              void 0,
              {
                headers: {
                  "X-CSRF-Token": csrfToken
                },
                withCredentials: true
              }
            );
            if (!response || (response == null ? void 0 : response.status) !== 200)
              throw new Error("Cannot refresh token. Please login");
            setAccessToken(response.data.accessToken);
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${response.data.accessToken}`
            };
            originalRequest._retry = true;
            return api_default(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
      }
    );
    return () => {
      api_default.interceptors.response.eject(refreshInterceptor);
    };
  }, [csrfToken, accessToken]);
  const login = ({
    accessToken: accessToken2,
    user: user2
  }) => {
    setIsAuthenticated(true);
    setAccessToken(accessToken2);
    setUser(user2);
  };
  const logout = async () => {
    await api_default.delete("/logout", {
      headers: {
        "X-CSRF-Token": csrfToken
      },
      withCredentials: true
    });
    setIsAuthenticated(false);
    setAccessToken(null);
    setUser(null);
  };
  const contextValue = {
    isAuthenticated,
    setIsAuthenticated,
    accessToken,
    setAccessToken,
    user,
    setUser,
    login,
    logout,
    csrfToken
  };
  return /* @__PURE__ */ React5.createElement(AuthContext_default.Provider, { value: contextValue }, children);
};
var AuthProvider = ({ children }) => {
  return /* @__PURE__ */ React5.createElement(CSRFProvider_default, null, /* @__PURE__ */ React5.createElement(AuthProviderInner, null, children));
};
var AuthProvider_default = AuthProvider;

// src/hooks/useAuthContext.ts
import { useContext as useContext2 } from "react";
var useAuthContext = () => {
  return useContext2(AuthContext_default);
};
var useAuthContext_default = useAuthContext;
export {
  AuthProvider_default as AuthProvider,
  api_default as api,
  useAuthContext_default as useAuthContext
};

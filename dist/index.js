"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AuthProvider: () => AuthProvider_default,
  api: () => api_default,
  useAuth: () => useAuth_default
});
module.exports = __toCommonJS(index_exports);

// src/providers/AuthProvider.tsx
var import_react5 = __toESM(require("react"));

// src/contexts/AuthContext.ts
var import_react = require("react");
var AuthContext = (0, import_react.createContext)({
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
var import_axios = __toESM(require("axios"));
var api = import_axios.default.create({
  timeout: 10 * 1e3,
  // 10 seconds
  headers: {
    "Content-Type": "application/json"
  }
});
var api_default = api;

// src/hooks/useCSRFContext.ts
var import_react3 = require("react");

// src/contexts/CSRFContext.ts
var import_react2 = require("react");
var CSRFContext = (0, import_react2.createContext)(void 0);
var CSRFContext_default = CSRFContext;

// src/hooks/useCSRFContext.ts
var useCSRFContext = () => {
  return (0, import_react3.useContext)(CSRFContext_default);
};
var useCSRFContext_default = useCSRFContext;

// src/providers/AuthProvider.tsx
var import_axios3 = __toESM(require("axios"));

// src/providers/CSRFProvider.tsx
var import_react4 = __toESM(require("react"));
var import_axios2 = __toESM(require("axios"));
var CSRFProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = (0, import_react4.useState)();
  (0, import_react4.useEffect)(() => {
    const fetchCSRFToken = async () => {
      var _a;
      try {
        const response = await import_axios2.default.get(
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
  return /* @__PURE__ */ import_react4.default.createElement(CSRFContext_default.Provider, { value: csrfToken }, children);
};
var CSRFProvider_default = CSRFProvider;

// src/providers/AuthProvider.tsx
var AuthProviderInner = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = (0, import_react5.useState)(false);
  const [accessToken, setAccessToken] = (0, import_react5.useState)();
  const [user, setUser] = (0, import_react5.useState)();
  const csrfToken = useCSRFContext_default();
  (0, import_react5.useEffect)(() => {
    if (accessToken === null) return;
    const fetchAuthState = async () => {
      try {
        const response = await api_default.get("https://localhost:7001/api/v1/check-auth");
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user);
      } catch {
        setIsAuthenticated(false);
        setUser(null);
      }
    };
    if (csrfToken) fetchAuthState();
  }, [csrfToken, accessToken]);
  (0, import_react5.useLayoutEffect)(() => {
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
  (0, import_react5.useLayoutEffect)(() => {
    const authInterceptor = api_default.interceptors.request.use((config) => {
      config.headers.Authorization = !config._retry ? `Bearer ${accessToken}` : config.headers.Authorization;
      return config;
    });
    return () => {
      api_default.interceptors.request.eject(authInterceptor);
    };
  }, [accessToken]);
  (0, import_react5.useLayoutEffect)(() => {
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
            const response = await import_axios3.default.post(
              "https://localhost:7001/api/v1/refresh-token",
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
  return /* @__PURE__ */ import_react5.default.createElement(AuthContext_default.Provider, { value: contextValue }, children);
};
var AuthProvider = ({ children }) => {
  return /* @__PURE__ */ import_react5.default.createElement(CSRFProvider_default, null, /* @__PURE__ */ import_react5.default.createElement(AuthProviderInner, null, children));
};
var AuthProvider_default = AuthProvider;

// src/hooks/useAuth.ts
var import_react6 = require("react");
var useAuthContext = () => {
  return (0, import_react6.useContext)(AuthContext_default);
};
var useAuth_default = useAuthContext;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProvider,
  api,
  useAuth
});

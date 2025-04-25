import React, { PropsWithChildren, Dispatch, SetStateAction } from 'react';
import * as axios from 'axios';

type AuthProviderProps = PropsWithChildren & {
    baseUrl: string;
};
declare const AuthProvider: ({ baseUrl, children }: AuthProviderProps) => React.JSX.Element;

declare const useAuthContext: () => AuthContextType;

declare const api: axios.AxiosInstance;

type User = {
    id?: number;
    googleId?: string;
    githubId?: string;
    email?: string;
    emailVerified?: boolean;
    accountActive?: boolean;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profileImage?: string;
};

type AuthContextType = {
    isAuthenticated: boolean;
    setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
    accessToken?: string | null;
    setAccessToken: Dispatch<SetStateAction<string | null>>;
    user?: User | null;
    setUser: Dispatch<SetStateAction<User | null>>;
    login: ({ accessToken, user }: {
        accessToken: string;
        user: User;
    }) => void;
    logout: () => void;
    csrfToken: string;
};

export { type AuthContextType, AuthProvider, type User, api, useAuthContext as useAuth };

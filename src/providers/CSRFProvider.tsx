import React, { useEffect, useState, type PropsWithChildren } from 'react';
import CSRFContext from '../contexts/CSRFContext';
import axios from 'axios';

type CSRFProviderProps = PropsWithChildren & {
  baseUrl: string;
};

const CSRFProvider = ({ baseUrl, children }: CSRFProviderProps) => {
  const [csrfToken, setCsrfToken] = useState<string | undefined>();

  useEffect(() => {
    const fetchCSRFToken = async () => {
      try {
        const response = await axios.get<{ csrfToken: string }>(
          `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}api/v1/csrf-token`,
          { withCredentials: true }
        );

        setCsrfToken(response.data?.csrfToken);
      } catch (error) {
        return Promise.reject(error);
      }
    };

    fetchCSRFToken();
  }, []);

  return (
    <CSRFContext.Provider value={csrfToken}>{children}</CSRFContext.Provider>
  );
};

export default CSRFProvider;

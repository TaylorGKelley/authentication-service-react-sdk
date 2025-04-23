import { createContext } from 'react';

const CSRFContext = createContext<string | undefined>(undefined);

export default CSRFContext;

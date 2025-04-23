import { useContext } from 'react';
import CSRFContext from '../contexts/CSRFContext';

const useCSRFContext = () => {
  return useContext(CSRFContext);
};

export default useCSRFContext;

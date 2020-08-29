import { useContext } from 'react';
import OuContext from '../contexts/ouContext';

const useOuContext = () => useContext(OuContext);

export default useOuContext;
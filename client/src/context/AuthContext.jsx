import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

const initialState = { user: null, loading: true };

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { user: action.payload, loading: false };
    case 'LOGOUT':
      return { user: null, loading: false };
    case 'LOADED':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is logged in on mount
    api.get('/auth/me')
      .then((res) => {
        if (res.data.success) {
          dispatch({ type: 'SET_USER', payload: res.data.data });
        } else {
          dispatch({ type: 'LOADED' });
        }
      })
      .catch(() => dispatch({ type: 'LOADED' }));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    dispatch({ type: 'SET_USER', payload: res.data.data });
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    dispatch({ type: 'SET_USER', payload: res.data.data });
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    dispatch({ type: 'LOGOUT' });
  };

  const setUser = (userData) => dispatch({ type: 'SET_USER', payload: userData });

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, dispatch, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

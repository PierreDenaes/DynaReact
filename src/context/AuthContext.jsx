import React, { createContext, useReducer, useEffect } from 'react';
import { api } from '../services/api';

export const AuthContext = createContext();

const initialState = {
  user: null,
  isOnboarded: false,
  loading: true,
  error: null,
  token: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isOnboarded: !!action.payload?.onboarding_completed,
        loading: false,
        error: null
      };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for existing token and user in localStorage
    const savedToken = localStorage.getItem('dynprot_token');
    const savedUser = localStorage.getItem('dynprot_user');
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
        dispatch({ type: 'SET_TOKEN', payload: savedToken });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('dynprot_user');
        localStorage.removeItem('dynprot_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await api.get(`/auth/profile/${userId}`);
      const userData = response.user;
      
      dispatch({ type: 'SET_USER', payload: userData });
      localStorage.setItem('dynprot_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch user profile' });
      localStorage.removeItem('dynprot_user');
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response;
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      localStorage.setItem('dynprot_user', JSON.stringify(user));
      localStorage.setItem('dynprot_token', token);
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Connexion échouée';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await api.post('/auth/register', userData);
      const { user, token } = response;
      
      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_TOKEN', payload: token });
      localStorage.setItem('dynprot_user', JSON.stringify(user));
      localStorage.setItem('dynprot_token', token);
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Inscription échouée';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const registerProfile = async (profileData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.post('/auth/register-profile', {
        ...profileData,
        user_id: state.user.user_id
      });
      
      const updatedUser = {
        ...state.user,
        ...response.user,
        onboarding_completed: true
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('dynprot_user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Profile registration error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Configuration du profil échouée' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('dynprot_user');
    localStorage.removeItem('dynprot_token');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUserGoal = async (newGoal) => {
    try {
      await api.put(`/users/goal/${state.user.user_id}`, {
        daily_protein_goal: newGoal
      });
      
      const updatedUser = { ...state.user, daily_protein_goal: newGoal };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('dynprot_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const value = {
    user: state.user,
    isOnboarded: state.isOnboarded,
    loading: state.loading,
    error: state.error,
    token: state.token,
    login,
    register,
    registerProfile,
    logout,
    updateUserGoal
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

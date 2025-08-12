import { kmsAPI } from '@/lib/api';
import { sampleContacts, sampleGroups, sampleUser } from '@/lib/sampleData';
import { localStorage } from '@/lib/storage';
import { AuthUser, Contact, Group, LoginCredentials } from '@/types';
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';

interface AppState {
  // Authentication
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Contacts
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContact: Contact | null;
  
  // Groups
  groups: Group[];
  selectedGroup: Group | null;

  // UI State
  searchQuery: string;
  error: string | null;
  isRefreshing: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_CONTACTS'; payload: Contact[] }
  | { type: 'SET_FILTERED_CONTACTS'; payload: Contact[] }
  | { type: 'SET_SELECTED_CONTACT'; payload: Contact | null }
  | { type: 'SET_GROUPS'; payload: Group[] }
  | { type: 'SET_SELECTED_GROUP'; payload: Group | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'ADD_CONTACT'; payload: Contact }
  | { type: 'UPDATE_CONTACT'; payload: { id: string; data: Partial<Contact> } }
  | { type: 'DELETE_CONTACT'; payload: string }
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: { id: string; data: Partial<Group> } }
  | { type: 'DELETE_GROUP'; payload: string };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  contacts: [],
  filteredContacts: [],
  selectedContact: null,
  groups: [],
  selectedGroup: null,
  searchQuery: '',
  error: null,
  isRefreshing: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload 
      };
    
    case 'SET_CONTACTS':
      return { 
        ...state, 
        contacts: action.payload,
        filteredContacts: action.payload,
      };
    
    case 'SET_FILTERED_CONTACTS':
      return { ...state, filteredContacts: action.payload };
    
    case 'SET_SELECTED_CONTACT':
      return { ...state, selectedContact: action.payload };
    
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    
    case 'SET_SELECTED_GROUP':
      return { ...state, selectedGroup: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    
    case 'ADD_CONTACT':
      const newContacts = [...state.contacts, action.payload];
      return { 
        ...state, 
        contacts: newContacts,
        filteredContacts: newContacts,
      };
    
    case 'UPDATE_CONTACT':
      const updatedContacts = state.contacts.map(contact =>
        contact.id === action.payload.id 
          ? { ...contact, ...action.payload.data }
          : contact
      );
      return { 
        ...state, 
        contacts: updatedContacts,
        filteredContacts: updatedContacts,
      };
    
    case 'DELETE_CONTACT':
      const filteredContactsAfterDelete = state.contacts.filter(
        contact => contact.id !== action.payload
      );
      return { 
        ...state, 
        contacts: filteredContactsAfterDelete,
        filteredContacts: filteredContactsAfterDelete,
      };
    
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload] };
    
    case 'UPDATE_GROUP':
      const updatedGroups = state.groups.map(group =>
        group.id === action.payload.id 
          ? { ...group, ...action.payload.data }
          : group
      );
      return { ...state, groups: updatedGroups };
    
    case 'DELETE_GROUP':
      return { 
        ...state, 
        groups: state.groups.filter(group => group.id !== action.payload)
      };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  // Authentication
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Contacts
  loadContacts: () => Promise<void>;
  refreshContacts: () => Promise<void>;
  searchContacts: (query: string) => Promise<void>;
  updateContact: (contactId: string, data: Partial<Contact>) => Promise<void>;
  selectContact: (contact: Contact | null) => void;
  
  // Groups
  loadGroups: () => Promise<void>;
  createGroup: (name: string, description?: string) => Promise<Group>;
  addUserToGroup: (groupId: string, contactId: string) => Promise<void>;
  removeUserFromGroup: (groupId: string, contactId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  selectGroup: (group: Group | null) => void;
  
  // Utility
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Load contacts and groups from local storage
      const [contacts, groups] = await Promise.all([
        localStorage.getContacts(),
        localStorage.getGroups(),
      ]);
      
      // If no local data exists, show sample data for demo
      if (contacts.length === 0 && groups.length === 0) {
        dispatch({ type: 'SET_CONTACTS', payload: sampleContacts });
        dispatch({ type: 'SET_GROUPS', payload: sampleGroups });
        // Save sample data to local storage
        await localStorage.saveContacts(sampleContacts);
        await localStorage.saveGroups(sampleGroups);
      } else {
        dispatch({ type: 'SET_CONTACTS', payload: contacts });
        dispatch({ type: 'SET_GROUPS', payload: groups });
      }
      
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load initial data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Authentication functions
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Check for demo credentials
      if (credentials.username === 'demo' && credentials.password === 'demo') {
        // Use sample data for demo
        dispatch({ type: 'SET_USER', payload: sampleUser });
        await localStorage.saveContacts(sampleContacts);
        await localStorage.saveGroups(sampleGroups);
        dispatch({ type: 'SET_CONTACTS', payload: sampleContacts });
        dispatch({ type: 'SET_GROUPS', payload: sampleGroups });
        return true;
      }
      
      const response = await kmsAPI.login(credentials);
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
        // Load contacts from API after successful login
        await loadContacts();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Login failed' });
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await kmsAPI.logout();
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_CONTACTS', payload: [] });
      dispatch({ type: 'SET_GROUPS', payload: [] });
      await localStorage.clearAllData();
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Logout failed' });
    }
  };

  // Contact functions
  const loadContacts = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if we should sync with API
      const shouldSync = await localStorage.shouldSyncContacts();
      
      if (shouldSync && kmsAPI.isAuthenticated()) {
        const response = await kmsAPI.fetchContacts();
        
        if (response.success && response.data) {
          await localStorage.saveContacts(response.data);
          dispatch({ type: 'SET_CONTACTS', payload: response.data });
        } else {
          // Fallback to local data
          const localContacts = await localStorage.getContacts();
          dispatch({ type: 'SET_CONTACTS', payload: localContacts });
        }
      } else {
        // Load from local storage
        const localContacts = await localStorage.getContacts();
        dispatch({ type: 'SET_CONTACTS', payload: localContacts });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load contacts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshContacts = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_REFRESHING', payload: true });
      
      if (kmsAPI.isAuthenticated()) {
        const response = await kmsAPI.fetchContacts();
        
        if (response.success && response.data) {
          await localStorage.saveContacts(response.data);
          dispatch({ type: 'SET_CONTACTS', payload: response.data });
        }
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to refresh contacts' });
    } finally {
      dispatch({ type: 'SET_REFRESHING', payload: false });
    }
  };

  const searchContacts = async (query: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      
      if (query.trim() === '') {
        dispatch({ type: 'SET_FILTERED_CONTACTS', payload: state.contacts });
      } else {
        const filteredContacts = await localStorage.searchContacts(query);
        dispatch({ type: 'SET_FILTERED_CONTACTS', payload: filteredContacts });
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Search failed' });
    }
  };

  const updateContact = async (contactId: string, data: Partial<Contact>): Promise<void> => {
    try {
      await localStorage.updateContact(contactId, data);
      dispatch({ type: 'UPDATE_CONTACT', payload: { id: contactId, data } });
      
      // Optionally sync with API
      if (kmsAPI.isAuthenticated()) {
        kmsAPI.updateContact(contactId, data).catch(console.error);
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update contact' });
    }
  };

  const selectContact = (contact: Contact | null): void => {
    dispatch({ type: 'SET_SELECTED_CONTACT', payload: contact });
  };

  // Group functions
  const loadGroups = async (): Promise<void> => {
    try {
      const groups = await localStorage.getGroups();
      dispatch({ type: 'SET_GROUPS', payload: groups });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load groups' });
    }
  };

  const createGroup = async (name: string, description?: string): Promise<Group> => {
    try {
      const newGroup = await localStorage.createGroup(name, description);
      dispatch({ type: 'ADD_GROUP', payload: newGroup });
      return newGroup;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create group' });
      throw error;
    }
  };

  const addUserToGroup = async (groupId: string, contactId: string): Promise<void> => {
    try {
      await localStorage.addUserToGroup(groupId, contactId);
      const updatedGroups = await localStorage.getGroups();
      dispatch({ type: 'SET_GROUPS', payload: updatedGroups });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to add user to group' });
    }
  };

  const removeUserFromGroup = async (groupId: string, contactId: string): Promise<void> => {
    try {
      await localStorage.removeUserFromGroup(groupId, contactId);
      const updatedGroups = await localStorage.getGroups();
      dispatch({ type: 'SET_GROUPS', payload: updatedGroups });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to remove user from group' });
    }
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    try {
      await localStorage.deleteGroup(groupId);
      dispatch({ type: 'DELETE_GROUP', payload: groupId });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete group' });
    }
  };

  const selectGroup = (group: Group | null): void => {
    dispatch({ type: 'SET_SELECTED_GROUP', payload: group });
  };

  // Utility functions
  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const contextValue: AppContextType = {
    state,
    login,
    logout,
    loadContacts,
    refreshContacts,
    searchContacts,
    updateContact,
    selectContact,
    loadGroups,
    createGroup,
    addUserToGroup,
    removeUserFromGroup,
    deleteGroup,
    selectGroup,
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

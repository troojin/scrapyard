'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { pb, checkPocketBaseConnection } from '@/lib/pocketbase';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConnected: boolean;
  login: (identity: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
    avatar?: File | null;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { name?: string; username?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-scavenger-1',
  username: 'scavenger_core',
  email: 'scavenger@scrapyard.local',
  name: 'Scavenger Zero',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const syncUserFromAuthStore = useCallback(() => {
    if (pb.authStore.isValid && pb.authStore.record) {
      const rec = pb.authStore.record;
      setUser({
        id: rec.id,
        username: rec.username || rec.email?.split('@')[0] || 'developer',
        email: rec.email,
        name: rec.name || '',
        avatar: rec.avatar || '',
        created: rec.created,
        updated: rec.updated,
        collectionId: rec.collectionId,
        collectionName: rec.collectionName,
      });
    } else {
      const storedDemo = typeof window !== 'undefined' ? localStorage.getItem('scrapyard_demo_user') : null;
      if (storedDemo) {
        try {
          setUser(JSON.parse(storedDemo));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      const connected = await checkPocketBaseConnection();
      if (!isMounted) return;
      setIsConnected(connected);

      syncUserFromAuthStore();
      setIsLoading(false);
    }

    init();

    const unsubscribe = pb.authStore.onChange(() => {
      syncUserFromAuthStore();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [syncUserFromAuthStore]);

  const login = async (identity: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(identity, password);
      if (authData.record) {
        setUser({
          id: authData.record.id,
          username: authData.record.username,
          email: authData.record.email,
          name: authData.record.name,
          avatar: authData.record.avatar,
          collectionId: authData.record.collectionId,
          collectionName: authData.record.collectionName,
        });
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials or connection error';
      return { success: false, error: message };
    }
  };

  const signup = async (data: {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
    avatar?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('passwordConfirm', data.passwordConfirm);
      if (data.avatar) {
        formData.append('avatar', data.avatar);
      }

      await pb.collection('users').create(formData);
      await pb.collection('users').authWithPassword(data.email, data.password);
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scrapyard_demo_user');
    }
    setUser(null);
  };

  const loginAsDemoUser = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('scrapyard_demo_user', JSON.stringify(DEMO_USER));
    }
    setUser(DEMO_USER);
  };

  const updateAvatar = async (file: File) => {
    if (!user) return { success: false, error: 'Not logged in' };

    if (user.id.startsWith('demo-')) {
      const reader = new FileReader();
      return new Promise<{ success: boolean; error?: string }>((resolve) => {
        reader.onload = (e) => {
          const updatedUser: User = {
            ...user,
            avatar: e.target?.result as string,
          };
          setUser(updatedUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('scrapyard_demo_user', JSON.stringify(updatedUser));
          }
          resolve({ success: true });
        };
        reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
        reader.readAsDataURL(file);
      });
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const updated = await pb.collection('users').update(user.id, formData);
      setUser((prev) => (prev ? { ...prev, avatar: updated.avatar } : null));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Avatar update failed';
      return { success: false, error: message };
    }
  };

  const updateProfile = async (data: { name?: string; username?: string }) => {
    if (!user) return { success: false, error: 'Not logged in' };

    if (user.id.startsWith('demo-')) {
      const updatedUser: User = {
        ...user,
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.username !== undefined ? { username: data.username } : {}),
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('scrapyard_demo_user', JSON.stringify(updatedUser));
      }
      return { success: true };
    }

    try {
      const updated = await pb.collection('users').update(user.id, data);
      setUser((prev) => (prev ? { ...prev, name: updated.name, username: updated.username } : null));
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConnected,
        login,
        signup,
        logout,
        updateAvatar,
        updateProfile,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

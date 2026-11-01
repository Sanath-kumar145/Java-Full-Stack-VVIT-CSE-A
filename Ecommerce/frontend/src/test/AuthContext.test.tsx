import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const TestConsumer: React.FC = () => {
  const { user, token, isAuthenticated, isLoading, login, register, logout } = useAuth();

  if (isLoading) return <div>Loading Auth...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Unauthenticated'}</div>
      <div data-testid="user-email">{user?.email || 'No User'}</div>
      <div data-testid="token-val">{token || 'No Token'}</div>
      <button onClick={() => login({ email: 'sanath@thinkmart.in', password: 'Password123' })}>
        Trigger Login
      </button>
      <button
        onClick={() =>
          register({
            fullName: 'Sanath Kumar',
            email: 'newuser@thinkmart.in',
            password: 'Password123',
          })
        }
      >
        Trigger Register
      </button>
      <button onClick={logout}>Trigger Logout</button>
    </div>
  );
};

describe('AuthContext and State Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes in unauthenticated state when localStorage is empty', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
  });

  it('restores authentication session from valid token in localStorage', async () => {
    localStorage.setItem('thinkmart_token', 'valid-mock-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValueOnce({
      id: 1,
      email: 'sanath@thinkmart.in',
      fullName: 'Sanath Kumar',
      role: 'ROLE_CUSTOMER',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('sanath@thinkmart.in');
    expect(screen.getByTestId('token-val')).toHaveTextContent('valid-mock-jwt-token');
  });

  it('clears session when stored token is expired or rejected by server', async () => {
    localStorage.setItem('thinkmart_token', 'expired-jwt-token');
    vi.spyOn(api, 'getCurrentUser').mockRejectedValueOnce(new Error('401 Unauthorized'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('Unauthenticated');
    expect(localStorage.getItem('thinkmart_token')).toBeNull();
  });

  it('handles login, saves token, and sets user state', async () => {
    vi.spyOn(api, 'login').mockResolvedValueOnce({
      token: 'new-login-token',
      type: 'Bearer',
      user: {
        id: 1,
        email: 'sanath@thinkmart.in',
        fullName: 'Sanath Kumar',
        role: 'ROLE_CUSTOMER',
      },
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Trigger Login').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('sanath@thinkmart.in');
    expect(localStorage.getItem('thinkmart_token')).toBe('new-login-token');
  });

  it('handles logout and clears authentication state and localStorage', async () => {
    localStorage.setItem('thinkmart_token', 'active-token');
    vi.spyOn(api, 'getCurrentUser').mockResolvedValueOnce({
      id: 1,
      email: 'sanath@thinkmart.in',
      fullName: 'Sanath Kumar',
      role: 'ROLE_CUSTOMER',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(await screen.findByTestId('auth-status')).toHaveTextContent('Authenticated');

    act(() => {
      screen.getByText('Trigger Logout').click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('No User');
    expect(localStorage.getItem('thinkmart_token')).toBeNull();
  });
});


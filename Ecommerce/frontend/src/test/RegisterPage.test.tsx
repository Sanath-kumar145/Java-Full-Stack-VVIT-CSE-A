import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RegisterPage } from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';

describe('RegisterPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders registration form fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Rahul Sharma/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/rahul@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Min. 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Re-type your password/i)).toBeInTheDocument();
  });

  it('validates password mismatch before calling API', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g. Rahul Sharma/i), { target: { value: 'Rahul Sharma' } });
    fireEvent.change(screen.getByPlaceholderText(/rahul@example.com/i), { target: { value: 'rahul@thinkmart.in' } });
    fireEvent.change(screen.getByPlaceholderText(/Min. 6 characters/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Re-type your password/i), { target: { value: 'DifferentPass' } });
    fireEvent.click(screen.getByRole('checkbox'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    });

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('displays duplicate email error from backend', async () => {
    const errorResponse = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'An account with email rahul@thinkmart.in already exists.' },
      },
    };
    vi.spyOn(api, 'register').mockRejectedValueOnce(errorResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/e.g. Rahul Sharma/i), { target: { value: 'Rahul Sharma' } });
    fireEvent.change(screen.getByPlaceholderText(/rahul@example.com/i), { target: { value: 'rahul@thinkmart.in' } });
    fireEvent.change(screen.getByPlaceholderText(/Min. 6 characters/i), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Re-type your password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('checkbox'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    });

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });
});


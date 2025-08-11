import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { authApi } from '../services/api';
import type { RegisterRequest } from '../types';
import type { RootState } from '../store';

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterRequest & { confirmPassword: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest & { confirmPassword: string }) => {
    dispatch(loginStart());
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authApi.register(registerData);
      dispatch(loginSuccess({ token: response.token, user: response.user }));
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Registration failed'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <span className="text-lg font-semibold">Task Management</span>
        </div>
      </nav>

      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-8">
            <div>
              <h2 className="mt-2 text-center text-3xl text-gray-900">
                SignUp
              </h2>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div>
               
                  <input
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Username must be at least 3 characters' }
                    })}
                    type="text"
                    className="input-field"
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="input-field"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    className="input-field"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    type="password"
                    className="input-field"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;

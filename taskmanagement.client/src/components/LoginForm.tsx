import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { authApi } from '../services/api';
import type { LoginRequest } from '../types';
import type { RootState } from '../store';

const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onSubmit = async (data: LoginRequest) => {
    dispatch(loginStart());
    try {
      const response = await authApi.login(data);
      dispatch(loginSuccess({ token: response.token, user: response.user }));
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err: any) {
      dispatch(loginFailure(err.response?.data?.message || 'Login failed'));
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
              <h4 className="mt-1 text-center text-3xl  text-gray-900">
                Sign in
              </h4>
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
                    {...register('username', { required: 'Username is required' })}
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
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    className="input-field"
                    placeholder="Enter your password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign up
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

export default LoginForm;

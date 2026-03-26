import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { VALIDATION_CONSTRAINTS } from '@/types/validation';
import type { AxiosError } from 'axios';

const loginSchema = z.object({
  email: z.string()
    .min(1, VALIDATION_CONSTRAINTS.USER.EMAIL.REQUIRED_MESSAGE)
    .email(VALIDATION_CONSTRAINTS.USER.EMAIL.INVALID_MESSAGE)
    .trim(),
  password: z.string()
    .min(VALIDATION_CONSTRAINTS.USER.PASSWORD.MIN_LENGTH, VALIDATION_CONSTRAINTS.USER.PASSWORD.MIN_LENGTH_MESSAGE),
});

const registerSchema = loginSchema.extend({
  name: z.string()
    .min(VALIDATION_CONSTRAINTS.USER.NAME.MIN_LENGTH, VALIDATION_CONSTRAINTS.USER.NAME.MIN_LENGTH_MESSAGE)
    .max(VALIDATION_CONSTRAINTS.USER.NAME.MAX_LENGTH, VALIDATION_CONSTRAINTS.USER.NAME.MAX_LENGTH_MESSAGE)
    .trim(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterForm>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/campaigns" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = isRegister
        ? await authApi.register(data)
        : await authApi.login(data);

      setAuth(response.user, response.token);
      navigate('/campaigns');
    } catch (err) {
      const axiosError = err as AxiosError<{ error: { message: string } }>;
      setError(
        axiosError.response?.data?.error?.message || 'An error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Mini Campaign Manager
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  maxLength={VALIDATION_CONSTRAINTS.USER.NAME.MAX_LENGTH}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading
                ? 'Loading...'
                : isRegister
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

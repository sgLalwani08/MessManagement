import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Key, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface LocationState {
  message?: string;
  userType?: string;
}

const ADMIN_EMAIL = 'sl24eeb0b57@nitw.ac.in';
const ADMIN_PASSWORD = 'admin@123';
const STUDENT_EMAIL_DOMAIN = 'nitw.ac.in';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const message = state?.message;
  const userType = state?.userType || 'student';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string, type: 'admin' | 'student') => {
    if (type === 'admin') {
      return email === ADMIN_EMAIL;
    } else {
      return email.endsWith(`@${STUDENT_EMAIL_DOMAIN}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Special handling for admin login
      if (userType === 'admin') {
        if (formData.email !== ADMIN_EMAIL) {
          throw new Error('Invalid admin email');
        }
        if (formData.password !== ADMIN_PASSWORD) {
          throw new Error('Invalid admin password');
        }

        // Admin login successful
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('currentUser', JSON.stringify({
          id: 'admin-1',
          email: ADMIN_EMAIL,
          name: 'Admin',
          role: 'admin'
        }));

        navigate('/admin/dashboard');
        return;
      }

      // Handle student login
      if (userType === 'student') {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find((u: any) => u.email === formData.email);

        if (!user) {
          throw new Error('User not found. Please register first.');
        }

        if (user.password !== formData.password) {
          throw new Error('Invalid credentials');
        }

        if (user.registrationStatus !== 'approved') {
          throw new Error('Your registration is pending approval from admin.');
        }

        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('currentUser', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'student',
          registrationStatus: user.registrationStatus
        }));

        navigate('/student/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Login failed');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {userType === 'admin' ? 'Admin Sign In' : 'Student Sign In'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {userType === 'admin' 
              ? 'Restricted access for mess administration' 
              : 'Use your NITW student email'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <LogIn className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

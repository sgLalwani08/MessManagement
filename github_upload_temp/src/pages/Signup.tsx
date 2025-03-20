import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Book, Home, Key, AlertCircle, Camera, CheckCircle } from 'lucide-react';
import { BRANCH_OPTIONS, HOSTEL_OPTIONS, MESS_OPTIONS } from '../constants/options';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  rollNo: string;
  branch: string;
  hostelName: string;
  messName: string;
  roomNo: string;
  phone: string;
  photo?: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignupForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rollNo: '',
    branch: '',
    hostelName: '',
    messName: '',
    roomNo: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('Photo size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!photo) {
      setError('Please upload your photo');
      return false;
    }

    if (!formData.email.endsWith('@nitw.ac.in')) {
      setError('Please use your NITW email address');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      // Check for existing user
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
      
      if (existingUsers.some((user: any) => user.email === formData.email) || 
          pendingRegistrations.some((user: any) => user.email === formData.email)) {
        setError('Email already registered');
        return;
      }

      // Create new user with pending registration
      const newUser = {
        ...formData,
        photo,
        registrationStatus: 'pending',
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      // Add to pending registrations
      localStorage.setItem('pendingRegistrations', 
        JSON.stringify([...pendingRegistrations, newUser])
      );

      setSuccess('Registration successful! Please wait for admin approval.');
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registration submitted. Please wait for admin approval before logging in.' 
          }
        });
      }, 2000);

    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Student Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Register for mess access with your NITW credentials
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm space-y-6">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="space-y-2">
              <div className="h-32 w-32 relative rounded-full overflow-hidden border-2 border-gray-300">
                {photo ? (
                  <img 
                    src={photo} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Camera className="h-4 w-4" />
                Upload Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="yourname@nitw.ac.in"
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <div className="mt-1 relative">
                <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <select
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              >
                <option value="">Select Branch</option>
                {BRANCH_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hostel</label>
              <select
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.hostelName}
                onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
              >
                <option value="">Select Hostel</option>
                {HOSTEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Room Number</label>
              <div className="mt-1 relative">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mess Type</label>
              <select
                required
                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.messName}
                onChange={(e) => setFormData({ ...formData, messName: e.target.value })}
              >
                <option value="">Select Mess</option>
                {MESS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  required
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-500"
            >
              Already registered? Sign in
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
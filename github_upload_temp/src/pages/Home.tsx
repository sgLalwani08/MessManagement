import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Utensils, Calendar, BarChart, LogIn, User, Clock, Shield, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">NIT Warangal</span>
                  <span className="block text-orange-600">Digital Mess Management</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                  Streamline your mess operations with digital attendance tracking and real-time analytics
                </p>

                {/* Sign In Buttons Section */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                  {/* Student Section */}
                  <div className="flex-1 max-w-xs mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-orange-100">
                      <User className="h-8 w-8 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Student Access</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => navigate('/login', { state: { userType: 'student' }})}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Student Sign In
                        </button>
                        <button
                          onClick={() => navigate('/signup')}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-orange-600 text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          New Registration
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Admin Section */}
                  <div className="flex-1 max-w-xs mx-auto">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-100">
                      <Shield className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Access</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => navigate('/login', { state: { userType: 'admin' }})}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Admin Sign In
                        </button>
                        <p className="text-sm text-gray-500 text-center">
                          Restricted access for mess administration
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {/* Menu Card */}
                <div onClick={() => navigate('/menu')} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer">
                  <div className="p-6">
                    <Utensils className="h-8 w-8 text-orange-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Daily Menu</h3>
                    <p className="mt-2 text-gray-500">Check today's delicious meal options</p>
                  </div>
                </div>

                {/* Schedule Card */}
                <div onClick={() => navigate('/schedule')} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer">
                  <div className="p-6">
                    <Calendar className="h-8 w-8 text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Mess Schedule</h3>
                    <p className="mt-2 text-gray-500">View mess timings and important notices</p>
                  </div>
                </div>

                {/* Analytics Card */}
                <div onClick={() => navigate('/analytics')} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 cursor-pointer">
                  <div className="p-6">
                    <BarChart className="h-8 w-8 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                    <p className="mt-2 text-gray-500">Track attendance and meal statistics</p>
                  </div>
                </div>
              </div>

              {/* Mess Timings Section */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Mess Timings</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-100">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-orange-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Breakfast</h3>
                        <p className="text-gray-600">7:00 AM - 9:00 AM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Lunch</h3>
                        <p className="text-gray-600">12:00 PM - 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
                    <div className="flex items-center gap-3">
                      <Clock className="h-6 w-6 text-purple-500" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Dinner</h3>
                        <p className="text-gray-600">7:00 PM - 9:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
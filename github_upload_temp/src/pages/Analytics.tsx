import React from 'react';
import { BarChart, Users, TrendingUp, Calendar, Clock } from 'lucide-react';
import { MESS_OPTIONS, MEAL_TYPES } from '../constants/options';

const Analytics = () => {
  // Mock data for analytics
  const attendanceData = {
    totalStudents: 1500,
    averageAttendance: 85,
    todayAttendance: 1420,
    weeklyTrend: '+5%'
  };

  const mealStats = [
    {
      mess: 'IFC - A',
      breakfast: 450,
      lunch: 480,
      dinner: 420
    },
    {
      mess: 'IFC - B',
      breakfast: 380,
      lunch: 420,
      dinner: 390
    },
    {
      mess: 'IFC - C',
      breakfast: 320,
      lunch: 350,
      dinner: 330
    }
  ];

  const peakHours = [
    { meal: 'Breakfast', time: '8:00 AM', count: 280 },
    { meal: 'Lunch', time: '12:30 PM', count: 420 },
    { meal: 'Dinner', time: '7:30 PM', count: 380 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mess Analytics</h1>
          <p className="mt-2 text-gray-600">Real-time attendance and meal statistics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceData.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <BarChart className="h-6 w-6 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Average Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceData.averageAttendance}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Today's Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceData.todayAttendance}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Weekly Trend</p>
                <p className="text-2xl font-semibold text-green-600">{attendanceData.weeklyTrend}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mess-wise Attendance */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mess-wise Attendance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mess
                    </th>
                    {MEAL_TYPES.map(meal => (
                      <th key={meal.value} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {meal.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mealStats.map(stat => (
                    <tr key={stat.mess}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.mess}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.breakfast}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.lunch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.dinner}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Peak Hours</h2>
            <div className="space-y-4">
              {peakHours.map(peak => (
                <div key={peak.meal} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{peak.meal}</p>
                      <p className="text-xs text-gray-500">{peak.time}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {peak.count} students
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 
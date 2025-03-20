import React, { useState } from 'react';
import { Calendar, Bell, Clock, AlertCircle, Edit2, X, Save, Plus } from 'lucide-react';
import { DAYS_OF_WEEK, MEAL_TYPES } from '../constants/options';

interface Notice {
  id: number;
  type: 'important' | 'warning' | 'info';
  message: string;
  date: string;
}

interface ScheduleTime {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

const Schedule = () => {
  // State for modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);

  // State for editing
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState<Partial<Notice>>({
    type: 'info',
    message: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Mock data for notices
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: 1,
      type: 'important',
      message: 'Special dinner on Saturday for cultural night celebration',
      date: '2024-03-23'
    },
    {
      id: 2,
      type: 'info',
      message: 'Breakfast timing changed to 7:30 AM - 9:30 AM on Sunday',
      date: '2024-03-24'
    },
    {
      id: 3,
      type: 'warning',
      message: 'Maintenance work in IFC-A mess on Friday evening',
      date: '2024-03-22'
    }
  ]);

  // Mock data for schedule
  const [schedule, setSchedule] = useState<ScheduleTime[]>(
    DAYS_OF_WEEK.map(day => ({
      day,
      breakfast: '7:00 AM - 9:00 AM',
      lunch: '12:00 PM - 2:00 PM',
      dinner: '7:00 PM - 9:00 PM'
    }))
  );

  const handleEditSchedule = (day: string, meal: string, time: string) => {
    setSchedule(schedule.map(item => 
      item.day === day ? { ...item, [meal]: time } : item
    ));
  };

  const handleEditNotice = (notice: Notice) => {
    setEditingNotice(notice);
    setIsNoticeModalOpen(true);
  };

  const handleSaveNotice = () => {
    if (editingNotice) {
      setNotices(notices.map(notice => 
        notice.id === editingNotice.id ? editingNotice : notice
      ));
      setEditingNotice(null);
      setIsNoticeModalOpen(false);
    }
  };

  const handleAddNotice = () => {
    if (newNotice.message && newNotice.type && newNotice.date) {
      const notice: Notice = {
        id: notices.length + 1,
        type: newNotice.type as 'important' | 'warning' | 'info',
        message: newNotice.message,
        date: newNotice.date
      };
      setNotices([...notices, notice]);
      setNewNotice({
        type: 'info',
        message: '',
        date: new Date().toISOString().split('T')[0]
      });
      setIsAddNoticeModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mess Schedule</h1>
          <p className="mt-2 text-gray-600">Weekly schedule and important notices</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit Schedule
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Day
                      </th>
                      {MEAL_TYPES.map(meal => (
                        <th key={meal.value} className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {meal.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedule.map(item => (
                      <tr key={item.day}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.day}
                        </td>
                        {MEAL_TYPES.map(meal => (
                          <td key={meal.value} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {item[meal.value as keyof ScheduleTime]}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Notices Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-semibold text-gray-900">Important Notices</h2>
                </div>
                <button
                  onClick={() => setIsAddNoticeModalOpen(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Notice
                </button>
              </div>
              
              <div className="space-y-4">
                {notices.map(notice => (
                  <div key={notice.id} className="p-4 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {notice.type === 'important' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                        {notice.type === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                        {notice.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                        <div>
                          <p className="text-sm text-gray-900">{notice.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notice.date}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditNotice(notice)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Edit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit Schedule</h3>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                {schedule.map(item => (
                  <div key={item.day} className="grid grid-cols-4 gap-4 items-center">
                    <div className="font-medium text-gray-900">{item.day}</div>
                    {MEAL_TYPES.map(meal => (
                      <div key={meal.value}>
                        <input
                          type="text"
                          value={item[meal.value as keyof ScheduleTime]}
                          onChange={(e) => handleEditSchedule(item.day, meal.value, e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Time"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice Edit Modal */}
      {isNoticeModalOpen && editingNotice && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Edit Notice</h3>
                <button
                  onClick={() => {
                    setIsNoticeModalOpen(false);
                    setEditingNotice(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={editingNotice.type}
                    onChange={(e) => setEditingNotice({ ...editingNotice, type: e.target.value as 'important' | 'warning' | 'info' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="important">Important</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={editingNotice.message}
                    onChange={(e) => setEditingNotice({ ...editingNotice, message: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={editingNotice.date}
                    onChange={(e) => setEditingNotice({ ...editingNotice, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSaveNotice}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Notice Modal */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add New Notice</h3>
                <button
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as 'important' | 'warning' | 'info' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="important">Important</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={newNotice.message}
                    onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={newNotice.date}
                    onChange={(e) => setNewNotice({ ...newNotice, date: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddNotice}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule; 
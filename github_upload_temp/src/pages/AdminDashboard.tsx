import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart2, QrCode, Calendar, Download, Search, Filter, Clock, AlertCircle, CheckCircle, XCircle, ClipboardList, LogOut, Utensils, User } from 'lucide-react';
import QRScanner from '../components/QRScanner';
import FeedbackList from '../components/FeedbackList';
import MenuEditor from '../components/MenuEditor';
import { BRANCH_OPTIONS, HOSTEL_OPTIONS } from '../constants/options';

interface HeadCount {
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  hostelName: string;
  messName: string;
  phone: string;
  approvedAt?: string;
}

interface ScanRecord {
  studentId: string;
  timestamp: string;
  mealType: string;
}

interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  hostelName: string;
  messName: string;
  phone: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [headCount, setHeadCount] = useState<HeadCount[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<StudentInfo[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterHostel, setFilterHostel] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [registrationFilter, setRegistrationFilter] = useState('pending');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/login');
      return;
    }

    // Load data
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = () => {
    try {
      // Clean up test data first
      cleanupTestData();

      // Load registered students from registeredUsers
      const students = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      setRegisteredStudents(students.filter((s: StudentInfo) => s.registrationStatus === 'approved'));

      // Load scan history
      const scans = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      setScanHistory(Array.isArray(scans) ? scans : []);

      // Load head count data directly or calculate it
      const storedHeadCount = JSON.parse(localStorage.getItem('headCount') || '{}');
      if (Object.keys(storedHeadCount).length > 0) {
        // Convert stored headCount object to array format
        const headCountArray = Object.entries(storedHeadCount).map(([date, data]: [string, any]) => ({
          date,
          ...data
        }));
        setHeadCount(headCountArray);
      } else {
        // Calculate head count if not already stored
        calculateHeadCount(Array.isArray(scans) ? scans : []);
      }

      // Load pending registrations
      const registrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
      setPendingRegistrations(registrations);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const cleanupTestData = () => {
    try {
      // Get current data
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
      const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      const headCount = JSON.parse(localStorage.getItem('headCount') || '{}');

      // Remove test data (any entry with test.student@nitw.ac.in or containing "Test Student")
      const cleanedRegisteredUsers = registeredUsers.filter((user: StudentInfo) => 
        !user.email.includes('test.student@') && 
        !user.name.includes('Test Student')
      );

      const cleanedPendingRegistrations = pendingRegistrations.filter((reg: PendingRegistration) => 
        !reg.email.includes('test.student@') && 
        !reg.name.includes('Test Student')
      );

      const cleanedScanHistory = scanHistory.filter((scan: ScanRecord) => 
        !scan.studentId.includes('123456789') && 
        !(scan.studentName && scan.studentName.includes('Test Student'))
      );

      // Save cleaned data back to localStorage
      localStorage.setItem('registeredUsers', JSON.stringify(cleanedRegisteredUsers));
      localStorage.setItem('pendingRegistrations', JSON.stringify(cleanedPendingRegistrations));
      localStorage.setItem('scanHistory', JSON.stringify(cleanedScanHistory));

      // Recalculate head count from cleaned scan history
      const newHeadCount = cleanedScanHistory.reduce((acc: Record<string, any>, scan: ScanRecord) => {
        const date = new Date(scan.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
        }
        acc[date][scan.mealType.toLowerCase()]++;
        acc[date].total++;
        return acc;
      }, {});

      localStorage.setItem('headCount', JSON.stringify(newHeadCount));
    } catch (err) {
      console.error('Failed to clean up test data:', err);
    }
  };

  const calculateHeadCount = (scans: ScanRecord[]) => {
    const counts = scans.reduce((acc: Record<string, any>, scan) => {
      const date = new Date(scan.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
      }
      acc[date][scan.mealType.toLowerCase()]++;
      acc[date].total++;
      return acc;
    }, {});

    const headCountData = Object.entries(counts).map(([date, data]: [string, any]) => ({
      date,
      ...data
    }));

    setHeadCount(headCountData);
  };

  const handleRegistrationAction = (registration: PendingRegistration, action: 'approve' | 'reject') => {
    try {
      // Update registration status
      const updatedRegistrations = pendingRegistrations.map(reg => 
        reg.email === registration.email 
          ? { ...reg, registrationStatus: action }
          : reg
      );

      // If approved, add to registered users with password
      if (action === 'approve') {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if user already exists in registeredUsers
        const userExists = registeredUsers.some((user: StudentInfo) => user.email === registration.email);
        
        if (!userExists) {
          const newUser = {
            ...registration,
            registrationStatus: 'approved',
            approvedAt: new Date().toISOString()
          };
          
          localStorage.setItem('registeredUsers', JSON.stringify([
            ...registeredUsers,
            newUser
          ]));
        }
      }

      // Remove from pending registrations list if approved or rejected
      const filteredPendingRegistrations = pendingRegistrations.filter(
        reg => reg.email !== registration.email
      );
      
      // Keep a record of all registrations with their status
      localStorage.setItem('pendingRegistrations', JSON.stringify(filteredPendingRegistrations));
      setPendingRegistrations(filteredPendingRegistrations);
      
      // Reload dashboard data
      loadDashboardData();
    } catch (err) {
      console.error('Failed to process registration:', err);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      data.map(row => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  // Add a function to filter registered students
  const filteredStudents = registeredStudents.filter(student => {
    // Search term filter
    if (searchTerm && 
      !student.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      !student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !student.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Branch filter
    if (filterBranch && student.branch !== filterBranch) {
      return false;
    }
    
    // Hostel filter
    if (filterHostel && student.hostelName !== filterHostel) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage mess operations and monitor attendance
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <BarChart2 className="h-5 w-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`${
              activeTab === 'scanner'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <QrCode className="h-5 w-5" />
            QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`${
              activeTab === 'registrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <ClipboardList className="h-5 w-5" />
            Registrations
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Users className="h-5 w-5" />
            Students
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`${
              activeTab === 'attendance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Calendar className="h-5 w-5" />
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`${
              activeTab === 'menu'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center gap-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            <Utensils className="h-5 w-5" />
            Menu
          </button>
        </nav>
      </div>

      {/* Content Sections */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(headCount[0] || {}).map(([key, value]) => (
              <div key={key} className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-sm font-medium text-gray-500 uppercase">{key}</h3>
                <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Weekly Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Weekly Statistics</h2>
              <button
                onClick={() => exportToCSV(headCount, 'weekly-stats')}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Breakfast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lunch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dinner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {headCount.map((day) => (
                    <tr key={day.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.breakfast}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.lunch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {day.dinner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Feedback Section */}
          <FeedbackList />
        </div>
      )}

      {activeTab === 'scanner' && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">QR Code Scanner Instructions</h3>
            <ul className="list-disc pl-5 text-blue-700 space-y-1">
              <li>Click "Scan with Camera" to activate your device's camera for live QR scanning</li>
              <li>Position the QR code within the square frame on the screen</li>
              <li>If camera access fails, check your browser permissions</li>
              <li>For testing, you can also upload a QR code image using "Upload QR Image"</li>
              <li>Student information will appear after a successful scan</li>
            </ul>
          </div>
          <QRScanner />
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Registration Management</h2>
            <div className="flex gap-4">
              <select
                value={registrationFilter}
                onChange={(e) => setRegistrationFilter(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mess & Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRegistrations
                  .filter(reg => reg.registrationStatus === registrationFilter)
                  .map((registration) => (
                    <tr key={registration.email}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                        <div className="text-sm text-gray-500">{registration.rollNo}</div>
                        <div className="text-sm text-gray-500">{registration.branch}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{registration.email}</div>
                        <div className="text-sm text-gray-500">{registration.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{registration.messName}</div>
                        <div className="text-sm text-gray-500">{registration.hostelName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${registration.registrationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${registration.registrationStatus === 'approved' ? 'bg-green-100 text-green-800' : ''}
                          ${registration.registrationStatus === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {registration.registrationStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {registration.registrationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRegistrationAction(registration, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRegistrationAction(registration, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Registered Students</h2>
            <button
              onClick={() => exportToCSV(registeredStudents, 'registered-students')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Export List
            </button>
          </div>

          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or roll number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-md w-full max-w-xs"
            />

            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="border rounded-md px-2"
            >
              <option value="">All Branches</option>
              {BRANCH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="border rounded-md px-2"
            >
              <option value="">All Hostels</option>
              {HOSTEL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mess
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.photo ? (
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={student.photo} 
                              alt={student.name} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.rollNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.branch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.hostelName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.messName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.approvedAt ? new Date(student.approvedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No students found matching the filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Attendance Records</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => exportToCSV(scanHistory, 'attendance-records')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Export Records
              </button>
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <input
              type="text"
              placeholder="Search by name or roll number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-md w-full max-w-xs"
            />

            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="border rounded-md px-2"
            >
              <option value="">All Branches</option>
              {BRANCH_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filterHostel}
              onChange={(e) => setFilterHostel(e.target.value)}
              className="border rounded-md px-2"
            >
              <option value="">All Hostels</option>
              {HOSTEL_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mess Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scanHistory
                  .filter(scan => {
                    // Date filter
                    if (dateRange.start && dateRange.end) {
                      const scanDate = new Date(scan.timestamp).toISOString().split('T')[0];
                      if (scanDate < dateRange.start || scanDate > dateRange.end) {
                        return false;
                      }
                    }
                    
                    // Search term filter
                    if (searchTerm && !scan.studentId.includes(searchTerm) && 
                        !scan.studentName?.toLowerCase().includes(searchTerm.toLowerCase())) {
                      return false;
                    }
                    
                    return true;
                  })
                  .map((scan, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {scan.studentName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {scan.mealType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {scan.messName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(scan.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="bg-white rounded-lg shadow-sm">
          <MenuEditor />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
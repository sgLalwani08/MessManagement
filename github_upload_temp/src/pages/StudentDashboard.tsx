import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Book, Home, QrCode, Download, AlertCircle, CheckCircle, LogOut, MessageSquare } from 'lucide-react';
import QRCode from 'qrcode';
import FeedbackForm from '../components/FeedbackForm';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  branch: string;
  hostelName: string;
  messName: string;
  roomNo: string;
  phone: string;
  photo: string;
  registrationStatus: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'feedback'>('profile');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'student') {
      navigate('/login');
      return;
    }

    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Look in approved users first
    let userDetails = registeredUsers.find((user: StudentInfo) => user.email === currentUser.email);
    
    // If not found, check pending registrations
    if (!userDetails) {
      const pendingRegistrations = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]');
      userDetails = pendingRegistrations.find((user: StudentInfo) => user.email === currentUser.email);
      
      if (userDetails && userDetails.registrationStatus === 'pending') {
        setError('Your registration is pending approval from admin.');
        setStudentInfo(userDetails);
      } else if (userDetails && userDetails.registrationStatus === 'rejected') {
        setError('Your registration has been rejected. Please contact the admin.');
        setStudentInfo(userDetails);
      } else {
        navigate('/login'); // User not found in either list, redirect to login
      }
    } else {
      // User found in registered users (approved)
      setStudentInfo(userDetails);
      generateQRCode(userDetails);
    }
  }, [navigate]);

  const generateQRCode = async (user: StudentInfo) => {
    try {
      const qrData = {
        id: user.id,
        name: user.name,
        rollNo: user.rollNo,
        messName: user.messName,
        email: user.email,
        hostelName: user.hostelName,
        branch: user.branch,
        timestamp: new Date().toISOString()
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));
      setQrCodeUrl(qrCodeDataUrl);
    } catch (err) {
      setError('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `mess-qr-${studentInfo?.rollNo}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!studentInfo) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-5 w-5 inline mr-1" />
              Profile
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'feedback'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('feedback')}
            >
              <MessageSquare className="h-5 w-5 inline mr-1" />
              Feedback
            </button>
          </div>

          {studentInfo && (
            <div className="p-6">
              {activeTab === 'profile' && (
                <>
                  <div className="flex items-start space-x-6">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                      <img
                        src={studentInfo.photo || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    </div>

                    {/* Student Information */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.name}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <Mail className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.email}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Roll Number</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <Book className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.rollNo}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Branch</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <Book className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.branch}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Hostel & Room</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <Home className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.hostelName} - Room {studentInfo.roomNo}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 flex items-center text-lg text-gray-900">
                          <Phone className="h-5 w-5 text-gray-400 mr-2" />
                          {studentInfo.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Status */}
                  <div className="mt-8">
                    <div className={`p-4 rounded-lg flex items-center gap-2 ${
                      studentInfo.registrationStatus === 'approved' 
                        ? 'bg-green-50 text-green-700' 
                        : studentInfo.registrationStatus === 'rejected'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {studentInfo.registrationStatus === 'approved' 
                        ? <CheckCircle className="h-5 w-5" />
                        : <AlertCircle className="h-5 w-5" />
                      }
                      <span className="font-medium">
                        Registration Status: {
                          studentInfo.registrationStatus === 'approved' 
                            ? 'Approved' 
                            : studentInfo.registrationStatus === 'rejected'
                            ? 'Rejected'
                            : 'Pending Approval'
                        }
                      </span>
                    </div>
                  </div>

                  {/* QR Code Section - Only show if approved */}
                  {studentInfo.registrationStatus === 'approved' && qrCodeUrl && (
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">Mess QR Code</h2>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-4 bg-white border rounded-lg">
                          <img src={qrCodeUrl} alt="Mess QR Code" className="w-48 h-48" />
                        </div>
                        <button
                          onClick={handleDownloadQR}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download QR Code
                        </button>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                          Present this QR code during meal times for mess entry. 
                          The QR code contains your identification details.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'feedback' && (
                <div className="mt-4">
                  <FeedbackForm 
                    studentInfo={{
                      id: studentInfo.id,
                      name: studentInfo.name,
                      rollNo: studentInfo.rollNo
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
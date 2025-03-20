import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Book, Home, QrCode, Download, AlertCircle, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

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
    const userDetails = registeredUsers.find((user: StudentInfo) => user.email === currentUser.email);

    if (userDetails) {
      setStudentInfo(userDetails);
      
      // Generate QR code if registration is approved
      if (userDetails.registrationStatus === 'approved') {
        generateQRCode(userDetails);
      }
    }
  }, [navigate]);

  const generateQRCode = async (user: StudentInfo) => {
    try {
      const qrData = {
        id: user.id,
        name: user.name,
        rollNo: user.rollNo,
        messName: user.messName,
        email: user.email
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

  if (!studentInfo) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src={studentInfo.photo}
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
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                {studentInfo.registrationStatus === 'approved' 
                  ? <CheckCircle className="h-5 w-5" />
                  : <AlertCircle className="h-5 w-5" />
                }
                <span className="font-medium">
                  Registration Status: {studentInfo.registrationStatus === 'approved' 
                    ? 'Approved' 
                    : 'Pending Approval'}
                </span>
              </div>
            </div>

            {/* QR Code Section */}
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
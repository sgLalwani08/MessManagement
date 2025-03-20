import React, { useState, useRef } from 'react';
import { Camera, Upload, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface StudentInfo {
  name: string;
  rollNo: string;
  branch: string;
  hostelName: string;
  messName: string;
  roomNo: string;
  photo: string;
  email: string;
  registrationStatus: string;
}

const recordAttendance = (student: StudentInfo, mealType: string) => {
  try {
    const scanRecord = {
      studentId: student.rollNo,
      studentName: student.name,
      timestamp: new Date().toISOString(),
      mealType,
      messName: student.messName
    };

    const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    
    // Check for duplicate entry for the same meal
    const today = new Date().toDateString();
    const duplicateEntry = scanHistory.find((record: any) => 
      record.studentId === student.rollNo && 
      record.mealType === mealType &&
      new Date(record.timestamp).toDateString() === today
    );

    if (!duplicateEntry) {
      const updatedHistory = [...scanHistory, scanRecord];
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      
      // Update head count stats
      const headCount = JSON.parse(localStorage.getItem('headCount') || '{}');
      const dateKey = today;
      
      if (!headCount[dateKey]) {
        headCount[dateKey] = { breakfast: 0, lunch: 0, dinner: 0, total: 0 };
      }
      
      headCount[dateKey][mealType.toLowerCase()]++;
      headCount[dateKey].total++;
      
      localStorage.setItem('headCount', JSON.stringify(headCount));
      
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Failed to record attendance:', err);
    return false;
  }
};

const QRScanner = () => {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 10) return 'BREAKFAST';
    if (hour >= 12 && hour < 15) return 'LUNCH';
    if (hour >= 19 && hour < 22) return 'DINNER';
    return 'NOT_MEAL_TIME';
  };

  const processQRData = async (qrData: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse QR data
      const qrInfo = JSON.parse(qrData);
      
      // Get registered students from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Find student by email and verify registration status
      const student = registeredUsers.find((s: StudentInfo) => 
        s.email === qrInfo.email && 
        s.registrationStatus === 'approved'
      );

      if (!student) {
        throw new Error('Student not found or registration not approved');
      }

      // Verify QR data matches registered data
      if (student.rollNo !== qrInfo.rollNo || 
          student.name !== qrInfo.name || 
          student.messName !== qrInfo.messName) {
        throw new Error('Invalid QR code - data mismatch');
      }

      setStudentInfo(student);

      // Record scan in attendance history
      const mealType = getCurrentMealType();
      if (mealType !== 'NOT_MEAL_TIME') {
        const recorded = recordAttendance(student, mealType);
        if (!recorded) {
          setError('Student already recorded for this meal');
        } else {
          setSuccess(`${student.name} successfully recorded for ${mealType.toLowerCase()} at ${new Date().toLocaleTimeString()}`);
        }
      } else {
        setError('Not currently meal time. Attendance not recorded.');
      }

    } catch (err: any) {
      setError(err.message || 'Invalid QR code or student not found');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setScannerActive(true);
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      async (decodedText) => {
        await processQRData(decodedText);
        scanner.clear();
        setScannerActive(false);
      },
      (error) => {
        console.error(error);
      }
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (!e.target?.result) {
          throw new Error('Failed to read file');
        }

        // Import HTML5-QRCode dynamically
        const { Html5Qrcode } = await import('html5-qrcode');
        const html5QrCode = new Html5Qrcode("file-qr-reader");
        const imageUrl = e.target.result as string;
        
        setLoading(true);
        setError(null);
        
        // Decode QR from image
        try {
          const decodedText = await html5QrCode.scanFileV2(file, /* verbose= */ false);
          await processQRData(decodedText.decodedText);
        } catch (err) {
          setError('Failed to decode QR code from image. Please try a clearer image.');
        } finally {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to process QR code image');
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scanner Controls */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
            
            {!scannerActive && (
              <div className="space-y-4">
                <button
                  onClick={startScanner}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Camera className="h-5 w-5" />
                  Scan with Camera
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Upload className="h-5 w-5" />
                  Upload QR Image
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            )}

            {scannerActive && (
              <div id="reader" className="w-full"></div>
            )}

            <div id="file-qr-reader" className="hidden"></div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Processing...</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>

        {/* Student Info Display */}
        {studentInfo && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
                  {studentInfo.photo ? (
                    <img 
                      src={studentInfo.photo}
                      alt={studentInfo.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{studentInfo.name}</h3>
                  <p className="text-blue-100">{studentInfo.rollNo}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hostel</p>
                  <p className="font-medium">{studentInfo.hostelName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Room No</p>
                  <p className="font-medium">{studentInfo.roomNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mess Type</p>
                  <p className="font-medium">{studentInfo.messName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium">{studentInfo.branch}</p>
                </div>
              </div>

              {/* Meal Time Status */}
              <div className="mt-6 p-4 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Meal Status</h4>
                <p className={`text-lg font-medium ${
                  getCurrentMealType() === 'NOT_MEAL_TIME' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {getCurrentMealType() === 'NOT_MEAL_TIME' 
                    ? 'Not Currently Meal Time' 
                    : `Current Meal: ${getCurrentMealType()}`
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Scan Time: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
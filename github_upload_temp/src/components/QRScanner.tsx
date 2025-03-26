import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, User, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

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
  const [cameraLoading, setCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  // Clean up the scanner when component unmounts
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          console.error('Failed to clear scanner:', err);
        }
      }
    };
  }, []);

  // Also clean up when scanner is deactivated
  useEffect(() => {
    if (!scannerActive && scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to clear scanner:', err);
      }
    }
  }, [scannerActive]);

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

  const checkCameraPermission = async () => {
    try {
      // Try to access the camera to check permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      // If we get here, we have permission
      // Make sure to stop the stream to release the camera
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return false;
      } else if (err.name === 'NotFoundError') {
        return 'no-camera';
      }
      return false;
    }
  };

  const startScanner = async () => {
    setError(null);
    setCameraLoading(true);
    
    // First check camera permissions
    const hasPermission = await checkCameraPermission();
    
    if (hasPermission === 'no-camera') {
      setError('No camera detected on this device');
      setCameraLoading(false);
      return;
    }
    
    if (hasPermission === false) {
      setError('Camera access denied. Please allow camera access in your browser settings.');
      setCameraLoading(false);
      return;
    }
    
    // Clear any existing scanner
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to clear existing scanner:', err);
      }
    }
    
    setScannerActive(true);
    
    // Wait for the next render cycle to ensure the reader element exists
    setTimeout(() => {
      try {
        // Create the scanner with a slightly modified config
        const scanner = new Html5QrcodeScanner(
          'reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
            showZoomSliderIfSupported: true,
          },
          /* verbose= */ false
        );
        
        scannerRef.current = scanner;
        
        // Render the scanner
        scanner.render(
          // Success callback
          async (decodedText: string) => {
            try {
              await processQRData(decodedText);
            } catch (err) {
              console.error('Error processing QR data:', err);
              setError('Failed to process QR code');
            }
          },
          // Error callback
          (errorMessage: string) => {
            // Don't display errors for normal scanning process
            console.log('Scanner error (non-critical):', errorMessage);
            
            // Only show critical errors to the user
            if (errorMessage.includes('Camera access is blocked')) {
              setError('Camera access was blocked. Please allow access and try again.');
              stopScanner();
            }
          }
        );
        
        setCameraLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize camera:', err);
        setError(`Could not start scanner: ${err.message || 'Unknown error'}`);
        setScannerActive(false);
        setCameraLoading(false);
      }
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Failed to clear scanner:', err);
      }
    }
    setScannerActive(false);
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

        setLoading(true);
        setError(null);
        
        // Create a new Html5Qrcode instance
        try {
          const html5QrCode = new Html5Qrcode("file-qr-reader");
          
          // Decode QR from image
          try {
            const decodedText = await html5QrCode.scanFileV2(file, /* verbose= */ false);
            await processQRData(decodedText.decodedText);
          } catch (err) {
            console.error('Failed to decode QR from image:', err);
            setError('Failed to decode QR code from image. Please try a clearer image.');
          } finally {
            // Always clean up the scanner
            try {
              html5QrCode.clear();
            } catch (err) {
              console.error('Failed to clear file scanner:', err);
            }
            setLoading(false);
          }
        } catch (err) {
          console.error('Error creating QR scanner for file:', err);
          setError('Failed to initialize QR scanner for image');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error processing file upload:', err);
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
                  disabled={cameraLoading}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-5 w-5" />
                  {cameraLoading ? 'Initializing Camera...' : 'Scan with Camera'}
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
              <div>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={stopScanner}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                    title="Close Scanner"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div id="reader" ref={scannerDivRef} className="w-full min-h-[300px]"></div>
                <div className="text-center text-sm text-gray-500 mt-2">
                  <p>Position the QR code within the scanner frame</p>
                </div>
              </div>
            )}

            <div id="file-qr-reader" className="hidden"></div>
          </div>

          {cameraLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Accessing camera...</span>
            </div>
          )}

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
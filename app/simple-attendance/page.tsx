"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Camera, CameraOff, Users, CheckCircle } from "lucide-react";

interface Student {
  id: number;
  name: string;
  student_id: string;
  student_code?: string;
  department: string;
  confidence?: number;
  already_marked?: boolean;
  recognizedAt?: string;
}

interface Session {
  id: number;
  subject: string;
  department: string;
  instructor: string;
  classroom: string;
  status: string;
}

export default function SimpleAttendance() {
  const webcamRef = useRef<Webcam>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [attendanceList, setAttendanceList] = useState<Student[]>([]);
  const [recognizedStudents, setRecognizedStudents] = useState<Student[]>([]);

  useEffect(() => {
    // Clean up old sessions first, then load valid sessions
    cleanupOldSessions().then(() => {
      loadSessions();
    });
    
    socketRef.current = io("http://localhost:5000");
    
    socketRef.current.on("recognition_result", (data) => {
      console.log("Recognition result received:", data);
      
      if (data.recognized && data.recognized.length > 0) {
        console.log("Students recognized:", data.recognized);
        setRecognizedStudents(data.recognized);
        
        // Auto-add to attendance list with timestamp - show all recognized students
        data.recognized.forEach((student: Student) => {
          setAttendanceList(prev => {
            // Always add to show real-time recognition, but avoid duplicates in same session
            const existingIndex = prev.findIndex(s => s.id === student.id);
            const studentWithTime = {
              ...student,
              recognizedAt: new Date().toISOString()
            };
            
            if (existingIndex >= 0) {
              // Update existing student with new timestamp
              const updated = [...prev];
              updated[existingIndex] = studentWithTime;
              return updated;
            } else {
              // Add new student
              return [...prev, studentWithTime];
            }
          });
        });
      } else if (data.error) {
        console.error("Recognition error:", data.error);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const cleanupOldSessions = async () => {
    try {
      await axios.delete("http://localhost:5000/api/sessions/cleanup");
    } catch (error) {
      console.log("Cleanup not available, continuing...");
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sessions/active");
      const activeSessions = Array.isArray(response.data) ? response.data : [];
      
      // Filter sessions to only show valid Computer Science classes
      const validClasses = ['CN', 'CC', 'OS', 'SSS'];
      const filteredSessions = activeSessions.filter(session => 
        session.department === 'Computer Science' && 
        (validClasses.includes(session.subject) || validClasses.includes(session.className))
      );
      
      setSessions(filteredSessions);
      if (filteredSessions.length > 0 && !selectedSession) {
        setSelectedSession(filteredSessions[0]);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const startFaceRecognition = () => {
    if (!selectedSession) {
      alert("Please select a session first!");
      return;
    }
    setIsCapturing(true);
    captureFrame();
  };

  const stopFaceRecognition = () => {
    setIsCapturing(false);
  };

  const captureFrame = useCallback(() => {
    if (!webcamRef.current || !socketRef.current || !isCapturing || !selectedSession) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      socketRef.current.emit("process_frame", {
        frame: imageSrc,
        session_id: selectedSession.id,
        department: selectedSession.department
      });
    }

    if (isCapturing) {
      setTimeout(captureFrame, 2000); // Capture every 2 seconds
    }
  }, [isCapturing, selectedSession]);

  useEffect(() => {
    if (isCapturing) {
      captureFrame();
    }
  }, [isCapturing, captureFrame]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Face Recognition Attendance</h1>

      {/* Session Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Select Active Class</h2>
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => setSelectedSession(session)}
              >
                <h3 className="font-bold">{session.subject}</h3>
                <p className="text-sm text-gray-600">{session.department}</p>
                <p className="text-sm text-gray-600">{session.instructor}</p>
                <p className="text-sm text-gray-600">{session.classroom}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-red-600">No active classes. Please start a class first.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Face Recognition Camera
            {isCapturing && (
              <span className="ml-2 text-sm text-green-600 animate-pulse">
                🔍 Scanning for faces...
              </span>
            )}
          </h2>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ height: "300px" }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user"
              }}
            />
            {recognizedStudents.length > 0 && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded shadow-lg">
                ✅ Detected: {recognizedStudents.length} students
              </div>
            )}
            
            {recognizedStudents.length > 0 && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded">
                <div className="text-sm font-medium">Recently Recognized:</div>
                {recognizedStudents.slice(0, 3).map((student, idx) => (
                  <div key={idx} className="text-xs">
                    • {student.name} ({Math.round((student.confidence || 0) * 100)}%)
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={isCapturing ? stopFaceRecognition : startFaceRecognition}
              disabled={!selectedSession}
              className={`flex-1 py-3 px-4 rounded-md transition-colors flex items-center justify-center text-white font-semibold ${
                isCapturing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
              }`}
            >
              {isCapturing ? (
                <>
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Recognition
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Recognition
                </>
              )}
            </button>
            <button
              onClick={() => {
                if (selectedSession && socketRef.current) {
                  console.log("Manual test trigger");
                  socketRef.current.emit("process_frame", {
                    frame: "test_frame",
                    session_id: selectedSession.id,
                    department: selectedSession.department
                  });
                }
              }}
              disabled={!selectedSession}
              className="px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
            >
              🧪 Test Recognition
            </button>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Present Students ({attendanceList.length})
          </h2>
          
          <div className="max-h-96 overflow-y-auto">
            {attendanceList.length > 0 ? (
              <div className="space-y-3">
                {attendanceList.map((student, index) => (
                  <div
                    key={`${student.id}-${index}`}
                    className={`flex items-center p-3 rounded-md transition-all duration-500 ${
                      student.recognizedAt && new Date(student.recognizedAt).getTime() > Date.now() - 5000
                        ? 'bg-green-100 border-2 border-green-400 shadow-lg'
                        : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{student.name}</p>
                      <p className="text-sm text-gray-600">
                        {student.student_code || student.student_id} - {student.department}
                      </p>
                      {student.confidence && (
                        <p className="text-xs text-green-600">
                          Confidence: {Math.round(student.confidence * 100)}%
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.recognizedAt 
                        ? new Date(student.recognizedAt).toLocaleTimeString()
                        : new Date().toLocaleTimeString()
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No students detected yet</p>
                <p className="text-sm mt-1">Start face recognition to mark attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
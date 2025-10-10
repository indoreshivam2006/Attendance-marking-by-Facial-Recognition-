"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Camera, CameraOff, Users, CheckCircle, AlertCircle, Activity } from "lucide-react";

interface RecognizedStudent {
  id: number;
  name: string;
  confidence: number;
}

interface ActiveSession {
  id: number;
  subject: string;
  instructor: string;
  classroom: string;
  department?: string;
  year?: string;
  start_time: string;
  end_time: string;
}

export default function AttendancePage() {
  const webcamRef = useRef<Webcam>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [recognizedStudents, setRecognizedStudents] = useState<RecognizedStudent[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [totalFaces, setTotalFaces] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [students, setStudents] = useState<any[]>([]);
  const [showManualMode, setShowManualMode] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  useEffect(() => {
    // Check for active sessions
    checkActiveSessions();
    
    // Fetch students for manual attendance
    fetchStudents();

    // Poll for active sessions every 5 seconds
    const sessionInterval = setInterval(checkActiveSessions, 5000);

    // Connect to WebSocket
    socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

    socketRef.current.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Connected to server");
    });

    socketRef.current.on("disconnect", () => {
      setConnectionStatus("disconnected");
      console.log("Disconnected from server");
    });

    socketRef.current.on("recognition_result", (data) => {
      if (data.error) {
        console.error("Recognition error:", data.error);
        return;
      }

      setRecognizedStudents(data.recognized || []);
      setTotalFaces(data.total_faces || 0);

      // Update attendance list
      if (data.recognized && data.recognized.length > 0) {
        data.recognized.forEach((student: RecognizedStudent) => {
          setAttendanceList((prev) => {
            const exists = prev.find((s) => s.id === student.id);
            if (!exists) {
              return [...prev, { ...student, time: new Date().toLocaleTimeString() }];
            }
            return prev;
          });
        });
      }
    });

    return () => {
      clearInterval(sessionInterval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students`
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const checkActiveSessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions/active`
      );
      
      const newSessions = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      setActiveSessions(newSessions);
      
      // Auto-select first session if none selected and sessions available
      if (newSessions.length > 0 && !selectedSession) {
        setSelectedSession(newSessions[0]);
        alert(`Session available: ${newSessions[0].subject}. You can now mark attendance!`);
      }
      
      // Get unique departments
      const depts = [...new Set(newSessions.map(s => s.department).filter(Boolean))];
      setDepartments(depts);
      
    } catch (error) {
      console.log("No active sessions");
      setActiveSessions([]);
    }
  };

  const markAttendanceManually = async (studentId: number) => {
    if (!selectedSession) {
      alert("Please select an active session first!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/attendance/mark`,
        { student_id: studentId, session_id: selectedSession.id }
      );
      
      if (response.data.message) {
        // Find the student and add to attendance list
        const student = students.find(s => s.id === studentId);
        if (student) {
          setAttendanceList((prev) => {
            const exists = prev.find((s) => s.id === studentId);
            if (!exists) {
              return [...prev, { 
                ...student, 
                confidence: 1.0, 
                time: new Date().toLocaleTimeString() 
              }];
            }
            return prev;
          });
        }
        alert(`Attendance marked for ${student?.name}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || "Failed to mark attendance";
      alert(message);
    }
  };

  const capture = useCallback(() => {
    if (!webcamRef.current || !socketRef.current || !isCapturing || !selectedSession) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      socketRef.current.emit("process_frame", { 
        frame: imageSrc,
        session_id: selectedSession.id,
        department: selectedSession.department
      });
    }

    // Continue capturing
    if (isCapturing) {
      setTimeout(capture, 1000); // Capture every second
    }
  }, [isCapturing, selectedSession]);

  const startCapturing = () => {
    if (!selectedSession) {
      alert("Please select an active session first!");
      return;
    }
    setIsCapturing(true);
    capture();
  };

  const stopCapturing = () => {
    setIsCapturing(false);
  };

  const calculateAttendancePercentages = async () => {
    if (!selectedSession) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/attendance/calculate-percentages`,
        { session_id: selectedSession.id }
      );
      alert("Attendance percentages calculated successfully!");
    } catch (error) {
      console.error("Error calculating percentages:", error);
      alert("Failed to calculate attendance percentages");
    }
  };

  useEffect(() => {
    if (isCapturing) {
      capture();
    }
  }, [isCapturing, capture]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Real-Time Attendance Marking</h1>

      {/* Session Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
            {activeSessions.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">Select Department:</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      const deptSessions = activeSessions.filter(s => !e.target.value || s.department === e.target.value);
                      if (deptSessions.length > 0) {
                        setSelectedSession(deptSessions[0]);
                      }
                    }}
                    className="px-3 py-1 border rounded-md"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeSessions
                    .filter(session => !selectedDepartment || session.department === selectedDepartment)
                    .map(session => (
                    <div
                      key={session.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedSession?.id === session.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{session.subject}</h3>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-sm text-gray-600">Instructor: {session.instructor}</p>
                      <p className="text-sm text-gray-600">Classroom: {session.classroom}</p>
                      <p className="text-sm text-gray-600">Department: {session.department}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.start_time).toLocaleTimeString()} - 
                        {new Date(session.end_time).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-red-600">No active sessions. Please start a session first.</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Connection Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === "connected" 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {connectionStatus === "connected" ? "● Connected" : "○ Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setShowManualMode(false)}
            className={`px-4 py-2 rounded-md transition-colors ${
              !showManualMode 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Camera Mode
          </button>
          <button
            onClick={() => setShowManualMode(true)}
            className={`px-4 py-2 rounded-md transition-colors ${
              showManualMode 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Manual Mode
          </button>
        </div>
      </div>

      {showManualMode ? (
        /* Manual Attendance Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Manual Attendance Marking</h2>
            <div className="max-h-96 overflow-y-auto">
              {students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.student_id}</p>
                          <p className="text-xs text-gray-500">{student.department}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => markAttendanceManually(student.id)}
                        disabled={!selectedSession || attendanceList.some(a => a.id === student.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 text-sm transition-colors"
                      >
                        {attendanceList.some(a => a.id === student.id) ? "Present" : "Mark Present"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No students found</p>
              )}
            </div>
          </div>
          
          {/* Attendance List - Same for both modes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Attendance List ({attendanceList.length})
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {attendanceList.length > 0 ? (
                <div className="space-y-2">
                  {attendanceList.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                    >
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-600">
                            Confidence: {(student.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{student.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No students marked yet</p>
                  <p className="text-sm mt-1">Mark attendance to see results</p>
                </div>
              )}
            </div>
            
            {/* Calculate Attendance Button */}
            <div className="mt-4">
              <button
                onClick={calculateAttendancePercentages}
                disabled={!selectedSession || attendanceList.length === 0}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
              >
                Calculate Attendance %
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webcam Feed */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: "400px" }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "user",
              }}
            />
            {totalFaces > 0 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                Faces Detected: {totalFaces}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={isCapturing ? stopCapturing : startCapturing}
              disabled={!selectedSession}
              className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                isCapturing
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400"
              }`}
            >
              {isCapturing ? (
                <>
                  <CameraOff className="w-5 h-5 mr-2" />
                  Stop Marking
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Marking
                </>
              )}
            </button>

            <button
              onClick={calculateAttendancePercentages}
              disabled={!selectedSession || attendanceList.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 transition-colors"
            >
              Calculate %
            </button>
          </div>
        </div>

        {/* Recognition Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Attendance List ({attendanceList.length})
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {attendanceList.length > 0 ? (
              <div className="space-y-2">
                {attendanceList.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-600">
                          Confidence: {(student.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{student.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No students detected yet</p>
                <p className="text-sm mt-1">Start marking attendance to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Real-time Recognition Status */}
      {!showManualMode && isCapturing && recognizedStudents.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Currently Recognizing:</h3>
          <div className="flex flex-wrap gap-2">
            {recognizedStudents.map((student, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {student.name} ({(student.confidence * 100).toFixed(1)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
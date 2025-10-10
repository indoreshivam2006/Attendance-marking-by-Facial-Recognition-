"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Play, Square, Plus } from "lucide-react";

interface Session {
  id: number;
  subject: string;
  department: string;
  instructor: string;
  classroom: string;
  status: string;
  className?: string;
}

interface DepartmentData {
  name: string;
  classes: string[];
}

export default function SimpleSessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [formData, setFormData] = useState({
    subject: "",
    department: "",
    instructor: "",
    classroom: "",
    className: ""
  });

  useEffect(() => {
    loadSessions();
    loadDepartments();
    cleanupOldSessions();
  }, []);

  const cleanupOldSessions = async () => {
    try {
      // Clear any sessions that don't belong to the new department structure
      await axios.delete("http://localhost:5000/api/sessions/cleanup");
    } catch (error) {
      // Ignore cleanup errors - it's optional
      console.log("Cleanup not available, continuing...");
    }
  };

  const loadSessions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sessions");
      setSessions(response.data);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/sessions/filters");
      const data = response.data;
      if (data.classes) {
        const deptData = Object.entries(data.classes).map(([name, classes]) => ({
          name,
          classes: classes as string[]
        }));
        setDepartments(deptData);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    
    // Only include className for Computer Science
    const sessionData = {
      ...formData,
      classroom: formData.classroom,
      className: formData.department === "Computer Science" ? formData.className : undefined,
      start_time: now.toISOString().slice(0, 19).replace('T', ' '),
      end_time: endTime.toISOString().slice(0, 19).replace('T', ' ')
    };

    try {
      await axios.post("http://localhost:5000/api/sessions", sessionData);
      alert("Session created successfully!");
      setShowForm(false);
  setFormData({ subject: "", department: "", instructor: "", classroom: "", className: "" });
      loadSessions();
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  const startSession = async (sessionId: number) => {
    try {
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/start`);
      alert("Session started! Go to Face Recognition to mark attendance.");
      loadSessions();
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session");
    }
  };

  const stopSession = async (sessionId: number) => {
    try {
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/stop`);
      alert("Session stopped!");
      loadSessions();
    } catch (error) {
      console.error("Error stopping session:", error);
      alert("Failed to stop session");
    }
  };

  const startLiveAttendance = async (department: string, className: string) => {
    try {
      // Create a quick session for this class
      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const sessionData = {
        subject: className,
        department: department,
        instructor: "Live Session",
        classroom: "Live",
        className: className,
        start_time: now.toISOString().slice(0, 19).replace('T', ' '),
        end_time: endTime.toISOString().slice(0, 19).replace('T', ' ')
      };

      const response = await axios.post("http://localhost:5000/api/sessions", sessionData);
      
      // Start the session immediately
      await axios.post(`http://localhost:5000/api/sessions/${response.data.id}/start`);
      
      // Navigate to attendance page
      window.location.href = "/simple-attendance";
      
    } catch (error) {
      console.error("Error starting live attendance:", error);
      alert("Failed to start live attendance");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Class Sessions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </button>
      </div>

      {/* Create Session Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Session</h2>
          <form onSubmit={createSession} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subject (e.g., Math, Physics)"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="px-3 py-2 border rounded-md"
              required
            />
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value, className: ""})}
              className="px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
            </select>
            {formData.department === "Computer Science" && (
              <select
                value={formData.className}
                onChange={e => setFormData({...formData, className: e.target.value})}
                className="px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Class</option>
                <option value="CN">CN</option>
                <option value="CC">CC</option>
                <option value="OS">OS</option>
                <option value="SSS">SSS</option>
              </select>
            )}
            <input
              type="text"
              placeholder="Instructor Name"
              value={formData.instructor}
              onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Classroom (e.g., Room 101)"
              value={formData.classroom}
              onChange={(e) => setFormData({...formData, classroom: e.target.value})}
              className="px-3 py-2 border rounded-md"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Department Classes Grid */}
      <div className="space-y-8">
        {departments.map(department => (
          <div key={department.name} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{department.name}</h2>
            
            {department.classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {department.classes.map(className => {
                  // Find if there's an active session for this class
                  const activeSession = sessions.find(s => 
                    s.department === department.name && 
                    (s.subject === className || s.className === className) && 
                    s.status === 'active'
                  );
                  
                  return (
                    <div key={className} className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">{className}</h3>
                        
                        {activeSession ? (
                          <div className="space-y-2">
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">
                              ACTIVE
                            </span>
                            <p className="text-sm text-gray-600">{activeSession.instructor}</p>
                            <p className="text-sm text-gray-600">{activeSession.classroom}</p>
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => stopSession(activeSession.id)}
                                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 flex items-center justify-center text-sm"
                              >
                                <Square className="w-3 h-3 mr-1" />
                                Stop
                              </button>
                              <a
                                href="/simple-attendance"
                                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-center text-sm"
                              >
                                Mark Attendance
                              </a>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => startLiveAttendance(department.name, className)}
                            className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 font-medium"
                          >
                            📹 Mark Live Attendance
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No classes available for {department.name}</p>
                <p className="text-sm">Contact administration to add classes</p>
              </div>
            )}
          </div>
        ))}
      </div>


    </div>
  );
}
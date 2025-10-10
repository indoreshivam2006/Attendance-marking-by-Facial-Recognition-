"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, MapPin, User, Plus, Building, GraduationCap, Trash2 } from "lucide-react";

interface Session {
  id: number;
  subject: string;
  instructor: string;
  classroom: string;
  department?: string;
  year?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

interface Filters {
  departments: string[];
  years: string[];
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<Filters>({ departments: [], years: [] });
  const [selectedFilters, setSelectedFilters] = useState({
    department: '',
    year: ''
  });
  const [formData, setFormData] = useState({
    subject: "",
    instructor: "",
    classroom: "",
    department: "",
    year: "",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchSessions();
    fetchFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, selectedFilters]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions`
      );
      setSessions(response.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions/filters`
      );
      setFilters(response.data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const applyFilters = () => {
    let filtered = sessions;
    
    if (selectedFilters.department) {
      filtered = filtered.filter(session => session.department === selectedFilters.department);
    }
    
    if (selectedFilters.year) {
      filtered = filtered.filter(session => session.year === selectedFilters.year);
    }
    
    setFilteredSessions(filtered);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      department: '',
      year: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format datetime for backend
    const formattedData = {
      ...formData,
      start_time: formData.start_time.replace("T", " ") + ":00",
      end_time: formData.end_time.replace("T", " ") + ":00",
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions`,
        formattedData
      );
      alert("Session created successfully!");
      setShowCreateForm(false);
      fetchSessions();
      setFormData({
        subject: "",
        instructor: "",
        classroom: "",
        department: "",
        year: "",
        start_time: "",
        end_time: "",
      });
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session");
    }
  };

  const isSessionActive = (session: Session) => {
    // Check if session status is 'active' (manually started)
    // @ts-ignore - session may have status property from backend
    if (session.status === 'active') {
      return true;
    }
    
    // Fallback to time-based check
    const now = new Date();
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    return now >= start && now <= end;
  };

  const isSessionUpcoming = (session: Session) => {
    const now = new Date();
    const start = new Date(session.start_time);
    return start > now;
  };

  const clearSessions = async () => {
    if (confirm("Are you sure you want to clear all sessions? This action cannot be undone.")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/clear/sessions`
        );
        alert("All sessions cleared successfully!");
        fetchSessions();
      } catch (error) {
        console.error("Error clearing sessions:", error);
        alert("Failed to clear sessions");
      }
    }
  };

  const clearAllSessionData = async () => {
    if (confirm("Are you sure you want to clear all sessions AND attendance data? This will remove all conducted lectures and attendance records. This action cannot be undone.")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/clear/all-session-data`
        );
        alert("All session and attendance data cleared successfully!");
        fetchSessions();
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Failed to clear data");
      }
    }
  };

  const startSession = async (sessionId: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions/${sessionId}/start`
      );
      alert("Session started successfully! You can now mark attendance.");
      fetchSessions(); // Refresh to update session status
      
      // Redirect to attendance page
      window.location.href = "/attendance";
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session");
    }
  };

  const stopSession = async (sessionId: number) => {
    if (confirm("Are you sure you want to stop this session?")) {
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/sessions/${sessionId}/stop`
        );
        alert("Session stopped successfully!");
        fetchSessions(); // Refresh to update session status
      } catch (error) {
        console.error("Error stopping session:", error);
        alert("Failed to stop session");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Class Sessions</h1>
        <div className="flex gap-3">
          <button
            onClick={clearSessions}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center"
            title="Clear all sessions only"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Sessions
          </button>
          <button
            onClick={clearAllSessionData}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center"
            title="Clear all sessions and attendance data"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Session
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Sessions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedFilters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {filters.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedFilters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Years</option>
              {filters.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          

          
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Session</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Computer Science 101"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructor
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classroom
              </label>
              <input
                type="text"
                name="classroom"
                value={formData.classroom}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Room 301"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                {filters.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <select
                name="year"
                required
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {filters.years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                required
                value={formData.start_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                name="end_time"
                required
                value={formData.end_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
              >
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No sessions found</div>
          <div className="text-gray-400 text-sm">
            {selectedFilters.department || selectedFilters.year 
              ? "Try adjusting your filters or create a new session." 
              : "Create your first session to get started."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
          const isActive = isSessionActive(session);
          const isUpcoming = isSessionUpcoming(session);
          
          return (
            <div
              key={session.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                isActive
                  ? "border-green-500"
                  : isUpcoming
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              {isActive && (
                <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full mb-2">
                  ACTIVE NOW
                </span>
              )}
              {isUpcoming && (
                <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full mb-2">
                  UPCOMING
                </span>
              )}
              
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {session.subject}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {session.instructor || "N/A"}
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {session.classroom || "N/A"}
                </div>

                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  {session.department || "N/A"}
                </div>

                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                  {session.year || "N/A"}
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(session.start_time).toLocaleDateString()}
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(session.start_time).toLocaleTimeString()} - 
                  {new Date(session.end_time).toLocaleTimeString()}
                </div>
                
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Duration: {session.duration_minutes} minutes
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {isActive ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => stopSession(session.id)}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Stop Session
                    </button>
                    <a
                      href="/attendance"
                      className="block w-full text-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Mark Attendance
                    </a>
                  </div>
                ) : isUpcoming || (!isActive && !isUpcoming) ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => startSession(session.id)}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Start Session
                    </button>
                    <a
                      href={`/attendance/session/${session.id}`}
                      className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      View Attendance
                    </a>
                  </div>
                ) : (
                  <a
                    href={`/attendance/session/${session.id}`}
                    className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    View Attendance
                  </a>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
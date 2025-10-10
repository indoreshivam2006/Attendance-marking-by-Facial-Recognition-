"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingDown, Calendar, Users, Trash2, ArrowLeft, BookOpen, GraduationCap } from "lucide-react";

interface LowAttendanceStudent {
  id: number;
  name: string;
  student_id: string;
  email: string;
  department: string;
  semester: number;
  total_classes: number;
  attended: number;
  attendance_percentage: number;
}

interface DepartmentReport {
  department: string;
  total_students: number;
  total_classes_conducted: number;
  average_attendance: number;
  students: {
    id: number;
    name: string;
    student_id: string;
    email: string;
    total_classes: number;
    attended: number;
    attendance_percentage: number;
  }[];
}

interface SubjectReport {
  subject: string;
  department: string;
  total_classes_conducted: number;
  average_attendance: number;
  students_attendance: {
    id: number;
    name: string;
    student_id: string;
    email: string;
    total_classes: number;
    attended: number;
    attendance_percentage: number;
  }[];
}

export default function ReportsPage() {
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<LowAttendanceStudent[]>([]);
  const [allStudentsStats, setAllStudentsStats] = useState<LowAttendanceStudent[]>([]);
  const [departmentReports, setDepartmentReports] = useState<DepartmentReport[]>([]);
  const [subjectReports, setSubjectReports] = useState<SubjectReport[]>([]);
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentReport | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectReport | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'departments' | 'subjects'>('overview');

  useEffect(() => {
    fetchAttendanceData();
  }, [attendanceThreshold]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch low attendance students
      const lowAttendanceResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/low-attendance?threshold=${attendanceThreshold}`
      );
      setLowAttendanceStudents(Array.isArray(lowAttendanceResponse.data) ? lowAttendanceResponse.data : []);
      
      // Fetch all students' attendance statistics
      const allStatsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/attendance-stats`
      );
      setAllStudentsStats(Array.isArray(allStatsResponse.data) ? allStatsResponse.data : []);

      // Fetch department reports
      const departmentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/departments`
      );
      setDepartmentReports(Array.isArray(departmentResponse.data) ? departmentResponse.data : []);

      // Fetch subject reports
      const subjectResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/reports/subjects`
      );
      setSubjectReports(Array.isArray(subjectResponse.data) ? subjectResponse.data : []);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearReportsData = async () => {
    if (confirm("Are you sure you want to clear all report data? This will remove all attendance records and cannot be undone.")) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/clear/reports`
        );
        alert("All report data cleared successfully!");
        fetchAttendanceData();
      } catch (error) {
        console.error("Error clearing report data:", error);
        alert("Failed to clear report data");
      }
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "#10b981"; // green
    if (percentage >= 60) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const pieChartData = [
    {
      name: "Good (≥75%)",
      value: allStudentsStats.filter(s => s.total_classes > 0 && s.attendance_percentage >= 75).length,
      color: "#10b981"
    },
    {
      name: "Warning (60-74%)",
      value: allStudentsStats.filter(s => s.total_classes > 0 && s.attendance_percentage >= 60 && s.attendance_percentage < 75).length,
      color: "#f59e0b"
    },
    {
      name: "Critical (<60%)",
      value: allStudentsStats.filter(s => s.total_classes > 0 && s.attendance_percentage < 60).length,
      color: "#ef4444"
    },
    {
      name: "No Records",
      value: allStudentsStats.filter(s => s.total_classes === 0).length,
      color: "#9ca3af"
    }
  ];

  const departmentData = allStudentsStats
    .filter(s => s.total_classes > 0) // Only include students with attendance records
    .reduce((acc: any[], student) => {
      const dept = student.department || "Unknown";
      const existing = acc.find(d => d.department === dept);
      if (existing) {
        existing.count++;
        existing.totalPercentage += student.attendance_percentage;
      } else {
        acc.push({
          department: dept,
          count: 1,
          totalPercentage: student.attendance_percentage,
          avgPercentage: 0
        });
      }
      return acc;
    }, []).map(d => ({
      ...d,
      avgPercentage: Math.round(d.totalPercentage / d.count)
    }));

  // Render different views based on selection
  if (selectedDepartment) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => setSelectedDepartment(null)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">
            {selectedDepartment.department} Department - Student Attendance
          </h1>
        </div>

        {/* Department Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{selectedDepartment.total_students}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{selectedDepartment.total_classes_conducted}</div>
              <div className="text-sm text-gray-600">Classes Conducted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{selectedDepartment.average_attendance.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {selectedDepartment.students.filter(s => s.attendance_percentage >= 75).length}
              </div>
              <div className="text-sm text-gray-600">Good Attendance (≥75%)</div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Student Attendance Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedDepartment.students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.total_classes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.attended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.attendance_percentage >= 90 
                          ? 'bg-green-100 text-green-800'
                          : student.attendance_percentage >= 75 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.attendance_percentage >= 75 ? (
                        <span className="text-green-600 font-medium">Good</span>
                      ) : (
                        <span className="text-red-600 font-medium">Low</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (selectedSubject) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => setSelectedSubject(null)}
            className="mr-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">
            {selectedSubject.subject} Subject - Student Attendance
          </h1>
        </div>

        {/* Subject Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{selectedSubject.students_attendance.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{selectedSubject.total_classes_conducted}</div>
              <div className="text-sm text-gray-600">Classes Conducted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">{selectedSubject.average_attendance.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Attendance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">
                {selectedSubject.students_attendance.filter(s => s.attendance_percentage >= 75).length}
              </div>
              <div className="text-sm text-gray-600">Good Attendance (≥75%)</div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Student Attendance in {selectedSubject.subject}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {selectedSubject.students_attendance.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.total_classes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.attended}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.attendance_percentage >= 90 
                          ? 'bg-green-100 text-green-800'
                          : student.attendance_percentage >= 75 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.attendance_percentage >= 75 ? (
                        <span className="text-green-600 font-medium">Good</span>
                      ) : (
                        <span className="text-red-600 font-medium">Low</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Attendance Reports & Analytics</h1>
        <div className="flex space-x-4">
          {/* View Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'overview' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('departments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'departments' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Departments
            </button>
            <button
              onClick={() => setActiveView('subjects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeView === 'subjects' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Subjects
            </button>
          </div>
          <button
            onClick={clearReportsData}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center"
            title="Clear all report data (attendance records)"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Report Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Threshold (%)
            </label>
            <select
              value={attendanceThreshold}
              onChange={(e) => setAttendanceThreshold(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={90}>90%</option>
              <option value={85}>85%</option>
              <option value={80}>80%</option>
              <option value={75}>75%</option>
              <option value={70}>70%</option>
              <option value={65}>65%</option>
              <option value={60}>60%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Attendance Distribution</h2>
          {pieChartData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-sm">No attendance data available yet</p>
              <p className="text-xs mt-2">Data will appear once students attend sessions</p>
            </div>
          )}
          
          {/* Attendance Summary */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {pieChartData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Average Attendance by Department</h2>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Bar dataKey="avgPercentage" fill="#3b82f6" name="Avg Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-sm">No department data available</p>
              <p className="text-xs mt-2">Data will appear once students attend sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Attendance Students Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            {showAllStudents ? 'All Students Attendance' : `Students Below ${attendanceThreshold}% Attendance`}
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAllStudents(!showAllStudents)}
              className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
            >
              {showAllStudents ? 'Show Low Attendance Only' : 'Show All Students'}
            </button>
            <span className="text-sm text-gray-600">
              Total: {showAllStudents ? allStudentsStats.length : lowAttendanceStudents.length} students
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (showAllStudents ? allStudentsStats : lowAttendanceStudents).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Student ID</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Department</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Semester</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Classes</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Attended</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Percentage</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(showAllStudents ? allStudentsStats : lowAttendanceStudents).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{student.student_id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.department || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600">{student.semester || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600">{student.total_classes}</td>
                    <td className="px-4 py-3 text-gray-600">{student.attended}</td>
                    <td className="px-4 py-3">
                      <span
                        className="font-semibold"
                        style={{ color: getAttendanceColor(student.attendance_percentage) }}
                      >
                        {student.attendance_percentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          student.total_classes === 0
                            ? "bg-gray-100 text-gray-800"
                            : student.attendance_percentage >= 75
                            ? "bg-green-100 text-green-800"
                            : student.attendance_percentage >= 60
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {student.total_classes === 0
                          ? "No Records"
                          : student.attendance_percentage >= 75
                          ? "Good"
                          : student.attendance_percentage >= 60
                          ? "Warning"
                          : "Critical"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {showAllStudents 
                ? "No students registered in the system"
                : (
                    <>
                      No students found below {attendanceThreshold}% attendance.
                      <br /><br />
                      This could mean:
                      <br />• All students have good attendance (above {attendanceThreshold}%)
                      <br />• No attendance sessions have been conducted yet
                    </>
                  )}
            </p>
          </div>
        )}
      </div>

      {/* Department View */}
      {activeView === 'departments' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Department-wise Reports
          </h2>
          {departmentReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departmentReports.map((dept) => (
                <div
                  key={dept.department}
                  onClick={() => setSelectedDepartment(dept)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{dept.department}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{dept.total_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes Conducted:</span>
                      <span className="font-medium">{dept.total_classes_conducted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Attendance:</span>
                      <span className={`font-medium ${
                        dept.average_attendance >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dept.average_attendance.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Good Attendance:</span>
                      <span className="font-medium">
                        {dept.students.filter(s => s.attendance_percentage >= 75).length}/{dept.total_students}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-600 font-medium">Click to view details →</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No department data available. Conduct some classes to see reports.</p>
            </div>
          )}
        </div>
      )}

      {/* Subject View */}
      {activeView === 'subjects' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Subject-wise Reports
          </h2>
          {subjectReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjectReports.map((subject) => (
                <div
                  key={subject.subject}
                  onClick={() => setSelectedSubject(subject)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{subject.subject}</h3>
                  <div className="text-xs text-gray-500 mb-3">{subject.department}</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes:</span>
                      <span className="font-medium">{subject.total_classes_conducted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{subject.students_attendance.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Attendance:</span>
                      <span className={`font-medium ${
                        subject.average_attendance >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {subject.average_attendance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-blue-600 font-medium">Click to view details →</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No subject data available. Conduct some classes to see reports.</p>
            </div>
          )}
        </div>
      )}

      {/* Overview - Summary Statistics */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Critical Attendance</p>
                <p className="text-2xl font-bold text-red-700">
                  {lowAttendanceStudents.filter(s => s.attendance_percentage < 60).length}
                </p>
                <p className="text-xs text-red-600 mt-1">Below 60%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Warning Zone</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {lowAttendanceStudents.filter(s => s.attendance_percentage >= 60 && s.attendance_percentage < 75).length}
                </p>
                <p className="text-xs text-yellow-600 mt-1">60% - 74%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Average Attendance</p>
                <p className="text-2xl font-bold text-blue-700">
                  {lowAttendanceStudents.length > 0
                    ? (lowAttendanceStudents.reduce((sum, s) => sum + s.attendance_percentage, 0) / lowAttendanceStudents.length).toFixed(1)
                    : 0}%
                </p>
                <p className="text-xs text-blue-600 mt-1">Overall Average</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Camera, 
  Calendar, 
  AlertTriangle, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Building2,
  Clock,
  Award,
  BarChart3,
  Settings
} from "lucide-react";
import axios from "axios";

interface Department {
  name: string;
  total_students: number;
  active_students: number;
  average_attendance: number;
}

interface DashboardStats {
  total_departments: number;
  total_students: number;
  total_sessions: number;
  active_sessions: number;
  departments: Department[];
  recent_activity: {
    new_registrations_today: number;
    sessions_completed_today: number;
    average_daily_attendance: number;
  };
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    total_departments: 0,
    total_students: 0,
    total_sessions: 0,
    active_sessions: 0,
    departments: [],
    recent_activity: {
      new_registrations_today: 0,
      sessions_completed_today: 0,
      average_daily_attendance: 0
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Active Departments",
      value: stats.total_departments,
      icon: Building2,
      color: "bg-indigo-500",
      trend: "+2 this month",
      description: "Engineering Departments"
    },
    {
      title: "Total Students",
      value: stats.total_students,
      icon: GraduationCap,
      color: "bg-emerald-500",
      trend: `+${stats.recent_activity.new_registrations_today} today`,
      description: "Enrolled Students"
    },
    {
      title: "Active Sessions",
      value: stats.active_sessions,
      icon: Clock,
      color: stats.active_sessions > 0 ? "bg-amber-500" : "bg-gray-500",
      trend: `${stats.total_sessions} total`,
      description: "Live Classes"
    },
    {
      title: "Average Attendance",
      value: `${stats.recent_activity.average_daily_attendance}%`,
      icon: TrendingUp,
      color: stats.recent_activity.average_daily_attendance >= 80 ? "bg-green-500" : "bg-orange-500",
      trend: "Last 7 days",
      description: "Institute Performance"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Engineering Faculty Dashboard</h1>
            <p className="text-indigo-100">Welcome back, Administrator</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-200">Today's Date</p>
            <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-xs text-gray-500 mb-2">{card.description}</p>
              <p className="text-xs font-medium text-green-600">{card.trend}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
              Department Overview
            </h2>
            <a 
              href="/reports"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              View Details
              <BarChart3 className="w-4 h-4 ml-1" />
            </a>
          </div>
          
          <div className="space-y-4">
            {stats.departments.length > 0 ? stats.departments.map((dept, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{dept.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dept.average_attendance >= 85 
                      ? 'bg-green-100 text-green-700' 
                      : dept.average_attendance >= 75 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {dept.average_attendance}% Attendance
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{dept.total_students} Total Students</span>
                  <span>{dept.active_students} Active Students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      dept.average_attendance >= 85 ? 'bg-green-500' : 
                      dept.average_attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(dept.average_attendance, 100)}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No departments found</p>
                <p className="text-sm">Students will be categorized by department once registered</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Executive Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-indigo-600" />
              Executive Actions
            </h2>
            <div className="space-y-3">
              <a
                href="/reports"
                className="flex items-center w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-colors"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                View Analytics & Reports
              </a>
              <a
                href="/sessions"
                className="flex items-center w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-colors"
              >
                <Calendar className="w-5 h-5 mr-3" />
                Schedule Class Session
              </a>
              <a
                href="/students"
                className="flex items-center w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-colors"
              >
                <GraduationCap className="w-5 h-5 mr-3" />
                Manage Students
              </a>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-indigo-600" />
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Face Recognition</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Database</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Camera System</span>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  Standby
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">AI Model</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Deep Learning
                </span>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">Today's Activity</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-800">{stats.recent_activity.sessions_completed_today}</p>
                  <p className="text-gray-600">Sessions</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-800">{stats.recent_activity.new_registrations_today}</p>
                  <p className="text-gray-600">New Students</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Save, Database, Camera, AlertCircle, CheckCircle } from "lucide-react";

interface Settings {
  face_recognition_model: string;
  tolerance: number;
  attendance_threshold: number;
  session_timeout: number;
  auto_exit_timeout: number;
  database_backup_enabled: boolean;
  backup_frequency: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    face_recognition_model: "hog",
    tolerance: 0.5,
    attendance_threshold: 75,
    session_timeout: 60,
    auto_exit_timeout: 60,
    database_backup_enabled: false,
    backup_frequency: "daily"
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Settings</h1>

      <div className="space-y-6">
        {/* Face Recognition Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Camera className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Face Recognition Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recognition Model
              </label>
              <select
                value={settings.face_recognition_model}
                onChange={(e) => handleInputChange("face_recognition_model", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hog">HOG (Faster, CPU-based)</option>
                <option value="cnn">CNN (More Accurate, GPU-based)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                HOG is faster but CNN provides better accuracy
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recognition Tolerance
              </label>
              <input
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.tolerance}
                onChange={(e) => handleInputChange("tolerance", parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower values = more strict matching (0.1 - 1.0)
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Attendance Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Attendance Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={settings.attendance_threshold}
                onChange={(e) => handleInputChange("attendance_threshold", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Students below this percentage will be flagged
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                min="30"
                max="240"
                value={settings.session_timeout}
                onChange={(e) => handleInputChange("session_timeout", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum time for an attendance session
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Exit Detection Timeout (seconds)
              </label>
              <input
                type="number"
                min="30"
                max="300"
                value={settings.auto_exit_timeout}
                onChange={(e) => handleInputChange("auto_exit_timeout", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Time after which a student is considered to have left if not detected
              </p>
            </div>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Database Settings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backup_enabled"
                  checked={settings.database_backup_enabled}
                  onChange={(e) => handleInputChange("database_backup_enabled", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="backup_enabled" className="ml-2 block text-sm text-gray-900">
                  Enable Automatic Database Backups
                </label>
              </div>
            </div>

            {settings.database_backup_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  value={settings.backup_frequency}
                  onChange={(e) => handleInputChange("backup_frequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold">System Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Version
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                v1.0.0
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Database Status
              </label>
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-sm text-green-600">
                Connected
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Face Recognition Library
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                face_recognition v1.3.0
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Backup
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                {settings.database_backup_enabled ? "2025-09-27 08:00:00" : "Disabled"}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md flex items-center space-x-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
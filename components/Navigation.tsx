"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Users, Calendar, BarChart3, Settings, UserPlus } from "lucide-react";

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/simple-sessions", label: "Classes", icon: Calendar },
    { href: "/simple-attendance", label: "Face Recognition", icon: Camera },
    { href: "/students", label: "Students", icon: Users },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Face Attendance System
          </Link>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
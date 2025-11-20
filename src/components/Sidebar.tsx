"use client"; // Added use client directive

import Link from "next/link"; // Imported Link
import { usePathname } from "next/navigation"; // Imported usePathname
import { Home, Book, Users, Settings, PenTool } from 'lucide-react';

// Sidebar Component
export default function Sidebar() { // Changed to default export
  const menuItems = [
    { href: "/admin", icon: Home, label: "Dashboard" },
    { href: "/admin/books", icon: Book, label: "Books" },
    { href: "/admin/chapters", icon: Book, label: "Chapters" },
    { href: "/admin/authors", icon: PenTool, label: "Authors" },
    { href: "/admin/categories", icon: Book, label: "Categories" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const pathname = usePathname(); // Used usePathname for active state

  return (
    <div className="w-64 bg-slate-800 text-white min-h-screen flex flex-col">
      <div className="p-4 flex items-center gap-2 border-b border-slate-700">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">iL</span>
        </div>
        <span className="font-semibold text-lg">iLibrary Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Navigation</div>
        </div>

        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link // Used Link component
                  href={item.href}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors ${
                    pathname === item.href
                      ? "bg-slate-700"
                      : "hover:bg-slate-700"
                  }`}
                >
                  <item.icon size={18} className="text-slate-400" />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
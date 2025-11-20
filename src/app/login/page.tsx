"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!result?.error) {
      router.replace("/admin");
    } else {
      setError("Invalid email or password. Please try again.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT: form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-20 py-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center md:text-left">
          Welcome back to iLibrary Admin
        </h1>
        <p className="text-gray-500 mb-8 text-center md:text-left">
          Please login to manage books, members, and dashboard settings
        </p>

       
          

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="admin@gmail.com"
            className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="********"
            className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-black outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Remember / forgot */}
        <div className="flex items-center justify-between mb-6 text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input type="checkbox" className="rounded" />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="text-black font-medium hover:underline"
            onClick={() => setShowModal(true)}
          >
            Forgot Password?
          </button>
        </div>
        
        {error && <p className="text-sm text-red-600 text-center mb-4">{error}</p>}

        {/* Login button */}
        <button 
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-900 transition disabled:bg-gray-400"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-6 text-gray-600 text-sm text-center md:text-left">
          Don’t have an admin account?{" "}
          <span className="text-black font-semibold hover:underline cursor-pointer">
            Contact the system owner
          </span>
        </p>
      </div>

      {/* RIGHT: gradient stats (hidden on mobile) */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl w-72">
          <h2 className="text-lg font-semibold mb-2">Library Activity</h2>
          <p className="text-3xl font-bold mb-4">+84.32%</p>

          <div className="flex items-end gap-3 h-32">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-md bg-orange-300 h-10" />
              <span className="text-xs text-gray-500">Books</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-md bg-orange-400 h-16" />
              <span className="text-xs text-gray-500">Users</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-md bg-orange-500 h-20" />
              <span className="text-xs text-gray-500">Borrowed</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-md bg-orange-600 h-24" />
              <span className="text-xs text-gray-500">Returned</span>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-lg font-bold mb-4">Password Reset</h2>
            <p>الرجاء التواصل مع مسؤول النظام لإعادة تعيين كلمة المرور الخاصة بك.</p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
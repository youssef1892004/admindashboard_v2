"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { client } from '@/lib/graphql';
import { CREATE_USER } from '@/lib/graphql/mutations/users';

interface UserFormData {
  email: string;
  displayName: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      let hashedPassword = null;
      if (formData.password) {
        const hashResponse = await fetch('/api/hash-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: formData.password }),
        });

        if (!hashResponse.ok) {
          const errorData = await hashResponse.json();
          throw new Error(errorData.error || 'Failed to hash password');
        }
        const hashData = await hashResponse.json();
        hashedPassword = hashData.hashedPassword;
      }
      
      const now = new Date().toISOString();

      const variables = {
        email: formData.email,
        passwordHash: hashedPassword,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber || null,
        // Default values for fields not in the simplified form
        avatarUrl: '', 
        locale: 'en', // Changed from 'en-US' to 'en'
        lastSeen: now,
        ticketExpiresAt: now,
        otpHashExpiresAt: now,
        otpMethodLastUsed: null,
        otpHash: null,
        totpSecret: null,
        activeMfaType: null, 
        ticket: null,
      };

      await client.request(CREATE_USER, variables);
      setSuccess("User created successfully!");
      setTimeout(() => router.push('/admin/users'), 1000);
    } catch (err: any) {
      console.error("Error creating user:", err);
      const errorMessage = err.response?.errors?.[0]?.message || err.message || "Failed to create user. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
          <input type="email" id="email" name="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">Display Name:</label>
          <input type="text" id="displayName" name="displayName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.displayName} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
          <input type="password" id="password" name="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.password || ''} onChange={handleChange} required />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.confirmPassword || ''} onChange={handleChange} required />
        </div>
         <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
          <input type="text" id="phoneNumber" name="phoneNumber" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.phoneNumber || ''} onChange={handleChange} />
        </div>

        <div className="mt-6">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
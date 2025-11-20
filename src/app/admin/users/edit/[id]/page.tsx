"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/graphql';
import { GET_USER_BY_ID } from '@/lib/graphql/queries/users';
import { UPDATE_USER } from '@/lib/graphql/mutations/users';

interface UserFormData {
  email?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
  defaultRole?: string;
  lastSeen?: string;
  disabled?: boolean;
  avatarUrl?: string;
  locale?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneNumberVerified?: boolean;
  newEmail?: string;
  otpMethodLastUsed?: string;
  otpHash?: string;
  otpHashExpiresAt?: string;
  isAnonymous?: boolean;
  totpSecret?: string;
  activeMfaType?: string;
  ticket?: string;
  ticketExpiresAt?: string;
  metadata?: string; // JSON string
  createdAt?: string; 
  updatedAt?: string; 
}

// Helper to format dates for datetime-local input, handling nulls
const formatDateForInput = (date: string | null | undefined) => {
  if (!date) return '';
  try {
    return new Date(date).toISOString().slice(0, 16);
  } catch {
    return '';
  }
};


export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [formData, setFormData] = useState<UserFormData>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const userData = await client.request(GET_USER_BY_ID, { id: userId });
        
        const fetchedUser = userData.user;
        if (fetchedUser) {
          setFormData({
            ...fetchedUser,
            password: '', 
            confirmPassword: '',
            displayName: fetchedUser.displayName || '',
            lastSeen: formatDateForInput(fetchedUser.lastSeen),
            otpHashExpiresAt: formatDateForInput(fetchedUser.otpHashExpiresAt),
            ticketExpiresAt: formatDateForInput(fetchedUser.ticketExpiresAt),
            metadata: fetchedUser.metadata ? JSON.stringify(fetchedUser.metadata, null, 2) : '{}'
          });
        } else {
          setError("User not found.");
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || err.response?.errors?.[0]?.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    let metadata;
    try {
        metadata = formData.metadata ? JSON.parse(formData.metadata) : null;
    } catch (e) {
        setError("Invalid JSON in metadata field.");
        setSubmitting(false);
        return;
    }

    try {
      let hashedPassword;
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

      const variables = {
        id: userId,
        email: formData.email,
        displayName: formData.displayName,
        defaultRole: formData.defaultRole,
        lastSeen: formData.lastSeen || null,
        disabled: formData.disabled === true, // Explicitly set to true or false
        avatarUrl: formData.avatarUrl || '',
        locale: formData.locale || 'en',
        phoneNumber: formData.phoneNumber || null,
        emailVerified: formData.emailVerified === true,
        phoneNumberVerified: formData.phoneNumberVerified === true,
        newEmail: formData.newEmail || null,
        otpMethodLastUsed: formData.otpMethodLastUsed || null,
        otpHash: formData.otpHash || null,
        otpHashExpiresAt: formData.otpHashExpiresAt || null,
        isAnonymous: formData.isAnonymous === true,
        totpSecret: formData.totpSecret || null,
        activeMfaType: formData.activeMfaType || null,
        ticket: formData.ticket || null,
        ticketExpiresAt: formData.ticketExpiresAt || null,
        metadata: metadata,
        passwordHash: hashedPassword,
      };

      await client.request(UPDATE_USER, variables);
      setSuccess("User updated successfully!");
      setTimeout(() => router.push('/admin/users'), 1000);

    } catch (err: any) {
      console.error("Error updating user:", err);
      const errorMessage = err.response?.errors?.[0]?.message || err.message || "Failed to update user. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Loading user data...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!formData.email) return <div className="p-4">User not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit User: {formData.displayName}</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1 */}
          <div>
             <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <input type="email" id="email" name="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.email || ''} onChange={handleChange} required />
            </div>
            <div className="mb-4">
                <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">Display Name:</label>
                <input type="text" id="displayName" name="displayName" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.displayName || ''} onChange={handleChange} required />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password (leave blank to keep current):</label>
                <input type="password" id="password" name="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.password || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.confirmPassword || ''} onChange={handleChange} />
            </div>
             <div className="mb-4">
                <label htmlFor="defaultRole" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                <select id="defaultRole" name="defaultRole" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.defaultRole || 'user'} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="author">Author</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">Phone Number:</label>
              <input type="text" id="phoneNumber" name="phoneNumber" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.phoneNumber || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="avatarUrl" className="block text-gray-700 text-sm font-bold mb-2">Avatar URL:</label>
              <input type="text" id="avatarUrl" name="avatarUrl" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.avatarUrl || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="locale" className="block text-gray-700 text-sm font-bold mb-2">Locale:</label>
              <input type="text" id="locale" name="locale" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.locale || ''} onChange={handleChange} />
            </div>
             <div className="mb-4">
              <label htmlFor="newEmail" className="block text-gray-700 text-sm font-bold mb-2">New Email:</label>
              <input type="email" id="newEmail" name="newEmail" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.newEmail || ''} onChange={handleChange} />
            </div>
             <div className="mb-4">
              <label htmlFor="metadata" className="block text-gray-700 text-sm font-bold mb-2">Metadata (JSON):</label>
              <textarea id="metadata" name="metadata" rows={3} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.metadata || ''} onChange={handleChange}></textarea>
            </div>
          </div>
          
          {/* Column 2 */}
          <div>
            <div className="mb-4">
              <label htmlFor="lastSeen" className="block text-gray-700 text-sm font-bold mb-2">Last Seen:</label>
              <input type="datetime-local" id="lastSeen" name="lastSeen" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.lastSeen || ''} onChange={handleChange} />
            </div>
             <div className="mb-4 flex items-center">
                <input type="checkbox" id="disabled" name="disabled" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={formData.disabled || false} onChange={handleChange} />
                <label htmlFor="disabled" className="ml-2 block text-sm text-gray-900">Disabled</label>
            </div>
            <div className="mb-4 flex items-center">
                <input type="checkbox" id="emailVerified" name="emailVerified" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={formData.emailVerified || false} onChange={handleChange} />
                <label htmlFor="emailVerified" className="ml-2 block text-sm text-gray-900">Email Verified</label>
            </div>
            <div className="mb-4 flex items-center">
                <input type="checkbox" id="phoneNumberVerified" name="phoneNumberVerified" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={formData.phoneNumberVerified || false} onChange={handleChange} />
                <label htmlFor="phoneNumberVerified" className="ml-2 block text-sm text-gray-900">Phone Number Verified</label>
            </div>
            <div className="mb-4 flex items-center">
                <input type="checkbox" id="isAnonymous" name="isAnonymous" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={formData.isAnonymous || false} onChange={handleChange} />
                <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">Is Anonymous</label>
            </div>
            <div className="mb-4">
              <label htmlFor="otpMethodLastUsed" className="block text-gray-700 text-sm font-bold mb-2">OTP Method Last Used:</label>
              <input type="text" id="otpMethodLastUsed" name="otpMethodLastUsed" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.otpMethodLastUsed || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="otpHash" className="block text-gray-700 text-sm font-bold mb-2">OTP Hash:</label>
              <input type="text" id="otpHash" name="otpHash" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.otpHash || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="otpHashExpiresAt" className="block text-gray-700 text-sm font-bold mb-2">OTP Hash Expires At:</label>
              <input type="datetime-local" id="otpHashExpiresAt" name="otpHashExpiresAt" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.otpHashExpiresAt || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="totpSecret" className="block text-gray-700 text-sm font-bold mb-2">TOTP Secret:</label>
              <input type="text" id="totpSecret" name="totpSecret" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.totpSecret || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="activeMfaType" className="block text-gray-700 text-sm font-bold mb-2">Active MFA Type:</label>
              <input type="text" id="activeMfaType" name="activeMfaType" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.activeMfaType || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="ticket" className="block text-gray-700 text-sm font-bold mb-2">Ticket:</label>
              <input type="text" id="ticket" name="ticket" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.ticket || ''} onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label htmlFor="ticketExpiresAt" className="block text-gray-700 text-sm font-bold mb-2">Ticket Expires At:</label>
              <input type="datetime-local" id="ticketExpiresAt" name="ticketExpiresAt" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" value={formData.ticketExpiresAt || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
}

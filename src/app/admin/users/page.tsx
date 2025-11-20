"use client"

import React, { useState, useEffect } from 'react';
import { client } from '@/lib/graphql';
import { GET_USERS } from '@/lib/graphql/queries/users';
import { DELETE_USER } from '@/lib/graphql/mutations/users';
import { INSERT_ROLE } from '@/lib/graphql/mutations/roles';
import Link from 'next/link';

interface User {
  id: string;
  createdAt: string; 
  displayName: string; 
  avatarUrl: string; 
  email: string;
  phoneNumber: string; 
  defaultRole: string; 
}

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null); // For success/info messages

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersData = await client.request(GET_USERS);
      setUsers(usersData.users); 
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load users data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await client.request(DELETE_USER, { id: userId });
        setUsers(users.filter(user => user.id !== userId)); 
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Failed to delete user. Please try again.");
      }
    }
  };

  const handleCreateAdminRole = async () => {
    setInfo(null);
    setError(null);
    if (window.confirm("This will attempt to create the 'admin' role. This is usually only needed once. Proceed?")) {
      try {
        await client.request(INSERT_ROLE, { role: "admin" });
        setInfo("'admin' role created successfully, or it already existed. You can now assign users to this role.");
      } catch (err: any) {
        console.error("Error creating admin role:", err);
        // Check for unique violation error, which means the role already exists
        if (err.response?.errors?.[0]?.extensions?.code === 'constraint-violation') {
           setInfo("The 'admin' role already exists.");
        } else {
           setError("Failed to create 'admin' role. Check the console for details.");
        }
      }
    }
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>
      <div className="mb-4">
        <Link href="/admin/users/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2">
          Create New User
        </Link>
        <button onClick={handleCreateAdminRole} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Ensure 'admin' Role Exists
        </button>
      </div>

      {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>}
      {info && <p className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">{info}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Joined</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{user.id}</td>
                <td className="py-3 px-4 flex items-center">
                  {user.avatarUrl && <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full mr-2" />}
                  {user.displayName}
                </td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.defaultRole}</td>
                <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="py-3 px-4">
                  <Link href={`/admin/users/edit/${user.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Edit</Link>
                  <button onClick={() => handleDeleteUser(user.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

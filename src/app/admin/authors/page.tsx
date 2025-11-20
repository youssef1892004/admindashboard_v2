"use client"

import React, { useState, useEffect } from 'react';
import { client, GET_USERS_BY_ROLE } from '@/lib/graphql';

interface User {
  id: string;
  createdAt: string; // Changed from created_at
  displayName: string; // Changed from display_name
  avatarUrl: string; // Changed from avatar_url
  email: string;
  phoneNumber: string; // Changed from phone_number
  defaultRole: string; // Changed from default_role
}

export default function Page() {
  const [authors, setAuthors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authorsData = await client.request(GET_USERS_BY_ROLE, { defaultRole: "author" }); // Fix variable name
        setAuthors(authorsData.users); // Access users
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load authors data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading authors...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Authors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {authors.map((author) => (
          <div key={author.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center mb-4">
              <img src={author.avatarUrl || 'https://via.placeholder.com/150'} alt={author.displayName} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h2 className="text-xl font-semibold">{author.displayName}</h2>
                <p className="text-gray-500">{author.email}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-1"><strong>ID:</strong> {author.id}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Phone:</strong> {author.phoneNumber || 'N/A'}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Joined:</strong> {new Date(author.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Role:</strong> {author.defaultRole}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

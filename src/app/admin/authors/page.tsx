"use client"

import React, { useState, useEffect } from 'react';
import { client, GET_USERS_BY_ROLE } from '@/lib/graphql';
import { DELETE_USER } from '@/lib/graphql/mutations/users';
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
  const [authors, setAuthors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authorsData = await client.request(GET_USERS_BY_ROLE, { defaultRole: "author" });
      setAuthors(authorsData.users);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load authors data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteAuthor = async (authorId: string) => {
    if (window.confirm("Are you sure you want to delete this author? This action cannot be undone.")) {
      try {
        await client.request(DELETE_USER, { id: authorId });
        setAuthors(authors.filter(author => author.id !== authorId));
      } catch (err) {
        console.error("Error deleting author:", err);
        setError("Failed to delete author. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading authors...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Authors</h1>
        <Link href="/admin/users/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create New Author
        </Link>
      </div>

      {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {authors.map((author) => (
          <div key={author.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
            <div className="flex items-center mb-4">
              <img src={author.avatarUrl || 'https://via.placeholder.com/150'} alt={author.displayName} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h2 className="text-xl font-semibold">{author.displayName}</h2>
                <p className="text-gray-500">{author.email}</p>
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-gray-700 text-sm mb-1"><strong>ID:</strong> {author.id}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Phone:</strong> {author.phoneNumber || 'N/A'}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Joined:</strong> {new Date(author.createdAt).toLocaleDateString()}</p>
              <p className="text-gray-700 text-sm mb-1"><strong>Role:</strong> {author.defaultRole}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
                <a 
                  href={`https://ilibrary.site/writers/${author.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs"
                >
                  View
                </a>
                <Link href={`/admin/users/edit/${author.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs">
                  Edit
                </Link>
                <button onClick={() => handleDeleteAuthor(author.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">
                  Delete
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

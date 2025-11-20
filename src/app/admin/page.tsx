"use client"

import React, { useState, useEffect } from 'react';
import { client, GET_BOOKS, GET_DASHBOARD_STATS, GET_USERS, GET_USERS_BY_ROLE } from '@/lib/graphql';

interface Book {
  id: string;
  title: string;
  author_id: string;
  description: string;
  coverImage: string;
  publicationDate: string;
  chapter_num: number;
  total_pages: number | null;
  ISBN: number | null;
  Category_id: string | null;
  vedio_URL: string | null;
  viocestd_URL: string | null;
}

interface DashboardStats {
  booksCount: number;
  chaptersCount: number;
  usersCount: number; // Will be calculated client-side
  authorsCount: number; // New: Count of authors
}

export default function Page() {
  const [books, setBooks] = useState<Book[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, statsData, usersData, authorsData] = await Promise.all([
          client.request(GET_BOOKS),
          client.request(GET_DASHBOARD_STATS),
          client.request(GET_USERS),
          client.request(GET_USERS_BY_ROLE, { defaultRole: "author" }), // Fetch authors
        ]);
        
        setBooks(booksData.libaray_Book);
        setStats({
          booksCount: statsData.booksCount.aggregate.count,
          chaptersCount: statsData.chaptersCount.aggregate.count,
          usersCount: usersData.users.length, // Client-side user count
          authorsCount: authorsData.users.length, // Client-side author count
        });

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow-lg rounded-lg p-5">
            <h2 className="text-gray-500 text-sm font-medium">Total Books</h2>
            <p className="text-3xl font-bold">{stats.booksCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-5">
            <h2 className="text-gray-500 text-sm font-medium">Total Chapters</h2>
            <p className="text-3xl font-bold">{stats.chaptersCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-5">
            <h2 className="text-gray-500 text-sm font-medium">Total Users</h2>
            <p className="text-3xl font-bold">{stats.usersCount}</p>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-5"> {/* New card for Authors */}
            <h2 className="text-gray-500 text-sm font-medium">Total Authors</h2>
            <p className="text-3xl font-bold">{stats.authorsCount}</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">All Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
            {book.coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-48 object-cover rounded-md mb-2" 
              />
            )}
            <p className="text-gray-700 text-sm mb-1"><strong>ID:</strong> {book.id}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Author ID:</strong> {book.author_id}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Description:</strong> {book.description}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Publication Date:</strong> {new Date(book.publicationDate).toLocaleDateString()}</p>
            <p className="text-gray-700 text-sm mb-1"><strong>Chapters:</strong> {book.chapter_num}</p>
            {book.total_pages && <p className="text-gray-700 text-sm mb-1"><strong>Total Pages:</strong> {book.total_pages}</p>}
            {book.ISBN && <p className="text-gray-700 text-sm mb-1"><strong>ISBN:</strong> {book.ISBN}</p>}
            {book.Category_id && <p className="text-gray-700 text-sm mb-1"><strong>Category ID:</strong> {book.Category_id}</p>}
            {book.vedio_URL && <p className="text-gray-700 text-sm mb-1"><strong>Video URL:</strong> <a href={book.vedio_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></p>}
            {book.viocestd_URL && <p className="text-gray-700 text-sm mb-1"><strong>Voice Std URL:</strong> <a href={book.viocestd_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a></p>}
          </div>
        ))}
      </div>
    </div>
  );
}
"use client"

import React, { useState, useEffect } from 'react';
import { client } from '@/lib/graphql';
import { GET_BOOKS } from '@/lib/graphql/queries/books';
import { DELETE_BOOK } from '@/lib/graphql/mutations/books';
import Link from 'next/link';

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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const booksData = await client.request(GET_BOOKS);
      setBooks(booksData.libaray_Book);
    } catch (err) {
      console.error("Error fetching books data:", err);
      setError("Failed to load books data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await client.request(DELETE_BOOK, { id: bookId });
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Error deleting book:", err);
        setError("Failed to delete book. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading books...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All Books</h1>
        <Link href="/admin/books/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create New Book
        </Link>
      </div>
      
      {error && <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            {book.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={book.coverImage} 
                alt={book.title} 
                className="w-full h-48 object-cover" 
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
            <div className="p-4 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{book.title}</h2>
              <div className="text-sm text-gray-600 space-y-1 mb-4 flex-grow">
                <p><strong>Author ID:</strong> {book.author_id || 'N/A'}</p>
                <p><strong>Category ID:</strong> {book.Category_id || 'N/A'}</p>
                <p><strong>Chapters:</strong> {book.chapter_num}</p>
                <p><strong>Published:</strong> {new Date(book.publicationDate).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end mt-2">
                  <Link href={`/admin/books/edit/${book.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteBook(book.id)} 
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                  >
                    Delete
                  </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

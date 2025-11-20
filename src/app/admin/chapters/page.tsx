"use client"

import React, { useState, useEffect } from 'react';
import { client } from '@/lib/graphql';
import { GET_BOOKS } from '@/lib/graphql/queries/books';
import { GET_CHAPTERS_BY_BOOK } from '@/lib/graphql/queries/chapters';
import { DELETE_CHAPTER } from '@/lib/graphql/mutations/chapters';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  chapter_num: number;
  Create_at: string;
}

const BookChapters = ({ book }: { book: Book }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await client.request(GET_CHAPTERS_BY_BOOK, { book__id: book.id });
      setChapters(data.libaray_Chapter);
    } catch (err) {
      console.error(`Error fetching chapters for book ${book.id}:`, err);
      setError("Failed to load chapters.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChapters();
  }, [book.id]);

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await client.request(DELETE_CHAPTER, { id: chapterId });
        fetchChapters(); // Refresh chapters
      } catch (err) {
        console.error("Error deleting chapter:", err);
        setError("Failed to delete chapter.");
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Loading chapters...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-b-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Chapters</h3>
        <Link href={`/admin/chapters/create/${book.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs">
          Add Chapter
        </Link>
      </div>
      {chapters.length === 0 ? (
        <p>No chapters found for this book.</p>
      ) : (
        <ul className="space-y-2">
          {chapters.map(chapter => (
            <li key={chapter.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
              <div>
                <p className="font-medium">#{chapter.chapter_num}: {chapter.title}</p>
                <p className="text-xs text-gray-500">Created: {new Date(chapter.Create_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center">
                <Link href={`/admin/chapters/edit/${chapter.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mr-2">
                  Edit
                </Link>
                <button onClick={() => handleDeleteChapter(chapter.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default function ChaptersPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const booksData = await client.request(GET_BOOKS);
        setBooks(booksData.libaray_Book);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError("Failed to load books data.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);
  
  const toggleBook = (bookId: string) => {
    setActiveBookId(prevId => (prevId === bookId ? null : bookId));
  };

  if (loading) {
    return <div className="p-4">Loading books...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Book Chapters</h1>
      <div className="space-y-2">
        {books.map((book) => (
          <div key={book.id} className="bg-white shadow-md rounded-lg">
            <button
              onClick={() => toggleBook(book.id)}
              className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
            >
              <h2 className="text-xl font-semibold">{book.title}</h2>
              <span>{activeBookId === book.id ? '▲' : '▼'}</span>
            </button>
            {activeBookId === book.id && <BookChapters book={book} />}
          </div>
        ))}
      </div>
    </div>
  );
}

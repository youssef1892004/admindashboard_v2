"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/graphql';
import { GET_BOOK_BY_ID } from '@/lib/graphql/queries/books';
import { UPDATE_BOOK } from '@/lib/graphql/mutations/books';
import { GET_USERS_BY_ROLE } from '@/lib/graphql/queries/users';
import { GET_CATEGORIES } from '@/lib/graphql/queries/categories';

interface Author {
  id: string;
  displayName: string;
}

interface Category {
  id: string;
  name: string;
}

// Define a type for the form data
interface BookFormData {
  title: string;
  author_id: string;
  Category_id: string;
  description: string;
  coverImage: string;
  publicationDate: string;
  chapter_num: number;
  total_pages: number;
  ISBN: number;
  vedio_URL: string;
  viocestd_URL: string;
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<Partial<BookFormData>>({});
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [bookData, authorsData, categoriesData] = await Promise.all([
          client.request(GET_BOOK_BY_ID, { id }),
          client.request(GET_USERS_BY_ROLE, { defaultRole: "author" }),
          client.request(GET_CATEGORIES)
        ]);
        
        setAuthors(authorsData.users);
        setCategories(categoriesData.libaray_Category);

        if (bookData.libaray_Book_by_pk) {
          const book = bookData.libaray_Book_by_pk;
          if (book.publicationDate) {
            book.publicationDate = new Date(book.publicationDate).toISOString().split('T')[0];
          }
          setFormData(book);
        } else {
          setError("Book not found.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const variables = {
      id,
      ...formData,
      author_id: formData.author_id || null,
      Category_id: formData.Category_id || null,
      ISBN: Number(formData.ISBN) || null, // Ensure ISBN is a number
    };

    try {
      await client.request(UPDATE_BOOK, variables);
      router.push('/admin/books');
    } catch (err: any) {
      console.error("Error updating book:", err);
      setError(err.message || err.response?.errors?.[0]?.message || "Failed to update book.");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Book</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
              <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>

            <div className="mb-4">
              <label htmlFor="author_id" className="block text-gray-700 text-sm font-bold mb-2">Author:</label>
              <select name="author_id" id="author_id" value={formData.author_id || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value="">Select an Author</option>
                {authors.map(author => <option key={author.id} value={author.id}>{author.displayName}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="Category_id" className="block text-gray-700 text-sm font-bold mb-2">Category:</label>
              <select name="Category_id" id="Category_id" value={formData.Category_id || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value="">Select a Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
              <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} rows={4} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>

            <div className="mb-4">
              <label htmlFor="coverImage" className="block text-gray-700 text-sm font-bold mb-2">Cover Image URL:</label>
              <input type="text" name="coverImage" id="coverImage" value={formData.coverImage || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            
            <div className="mb-4">
              <label htmlFor="publicationDate" className="block text-gray-700 text-sm font-bold mb-2">Publication Date:</label>
              <input type="date" name="publicationDate" id="publicationDate" value={formData.publicationDate || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <div className="mb-4">
              <label htmlFor="chapter_num" className="block text-gray-700 text-sm font-bold mb-2">Chapters:</label>
              <input type="number" name="chapter_num" id="chapter_num" value={formData.chapter_num || 0} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>

            <div className="mb-4">
              <label htmlFor="total_pages" className="block text-gray-700 text-sm font-bold mb-2">Total Pages:</label>
              <input type="number" name="total_pages" id="total_pages" value={formData.total_pages || 0} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            
            <div className="mb-4">
              <label htmlFor="ISBN" className="block text-gray-700 text-sm font-bold mb-2">ISBN:</label>
              <input type="number" name="ISBN" id="ISBN" value={formData.ISBN || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>

            <div className="mb-4">
              <label htmlFor="vedio_URL" className="block text-gray-700 text-sm font-bold mb-2">Video URL:</label>
              <input type="text" name="vedio_URL" id="vedio_URL" value={formData.vedio_URL || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>

            <div className="mb-4">
              <label htmlFor="viocestd_URL" className="block text-gray-700 text-sm font-bold mb-2">Voice Studio URL:</label>
              <input type="text" name="viocestd_URL" id="viocestd_URL" value={formData.viocestd_URL || ''} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
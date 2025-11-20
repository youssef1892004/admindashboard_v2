"use client"

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/graphql';
import { CREATE_CHAPTER } from '@/lib/graphql/mutations/chapters';
import Link from 'next/link';

export default function CreateChapterPage() {
  const router = useRouter();
  const params = useParams();
  const book__id = params.bookId as string;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapter_num: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.title) {
      setError("Title is required.");
      setLoading(false);
      return;
    }

    const variables = {
      book__id,
      title: formData.title,
      content: formData.content, // Send as a plain string, graphql-request will stringify for jsonb
      chapter_num: formData.chapter_num,
      Create_at: new Date().toISOString(),
    };

    try {
      await client.request(CREATE_CHAPTER, variables);
      router.push('/admin/chapters');
    } catch (err: any) {
      console.error("Error creating chapter:", err);
      setError(err.message || err.response?.errors?.[0]?.message || "Failed to create chapter.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Chapter</h1>
      <h2 className="text-lg text-gray-600 mb-4">For Book ID: {book__id}</h2>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="mb-4">
          <label htmlFor="chapter_num" className="block text-gray-700 text-sm font-bold mb-2">Chapter Number:</label>
          <input type="number" name="chapter_num" id="chapter_num" value={formData.chapter_num} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
          <textarea name="content" id="content" value={formData.content} onChange={handleChange} rows={10} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Chapter'}
          </button>
          <Link href="/admin/chapters" className="text-gray-600 hover:text-gray-800">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

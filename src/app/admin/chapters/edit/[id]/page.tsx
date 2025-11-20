"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/graphql';
import { GET_CHAPTER_BY_ID } from '@/lib/graphql/queries/chapters';
import { UPDATE_CHAPTER } from '@/lib/graphql/mutations/chapters';
import Link from 'next/link';

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapter_num: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchChapter = async () => {
      setLoading(true);
      try {
        const data = await client.request(GET_CHAPTER_BY_ID, { id });
        if (data.libaray_Chapter_by_pk) {
          const chapter = data.libaray_Chapter_by_pk;
          // Content is expected to be a string
          setFormData({
            ...chapter,
            content: chapter.content || '',
          });
        } else {
          setError("Chapter not found.");
        }
      } catch (err) {
        console.error("Error fetching chapter:", err);
        setError("Failed to load chapter data.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!formData.title) {
      setError("Title is required.");
      setSubmitting(false);
      return;
    }

    const { book__id, ...updateData } = formData;

    const variables = {
      id,
      ...updateData,
    };

    try {
      await client.request(UPDATE_CHAPTER, variables);
      router.push('/admin/chapters');
    } catch (err: any) {
      console.error("Error updating chapter:", err);
      setError(err.message || err.response?.errors?.[0]?.message || "Failed to update chapter.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Chapter</h1>
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
          <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="mb-4">
          <label htmlFor="chapter_num" className="block text-gray-700 text-sm font-bold mb-2">Chapter Number:</label>
          <input type="number" name="chapter_num" id="chapter_num" value={formData.chapter_num || 0} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-bold mb-2">Content:</label>
          <textarea name="content" id="content" value={formData.content || ''} onChange={handleChange} rows={10} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Chapter'}
          </button>
          <Link href="/admin/chapters" className="text-gray-600 hover:text-gray-800">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
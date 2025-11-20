"use client"

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { client } from '@/lib/graphql';
import { GET_CATEGORY_BY_ID } from '@/lib/graphql/queries/categories';
import { UPDATE_CATEGORY } from '@/lib/graphql/mutations/categories';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const data = await client.request(GET_CATEGORY_BY_ID, { id });
        if (data.libaray_Category_by_pk) {
          setName(data.libaray_Category_by_pk.name);
        } else {
          setError("Category not found.");
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!name) {
      setError("Category name cannot be empty.");
      setSubmitting(false);
      return;
    }

    try {
      await client.request(UPDATE_CATEGORY, { id, name });
      setSuccess("Category updated successfully!");
      router.push('/admin/categories');
    } catch (err: any) {
      console.error("Error updating category:", err);
      setError(err.message || err.response?.errors?.[0]?.message || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Category Name:
          </label>
          <input
            type="text"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={submitting}
        >
          {submitting ? 'Updating...' : 'Update Category'}
        </button>
      </form>
    </div>
  );
}

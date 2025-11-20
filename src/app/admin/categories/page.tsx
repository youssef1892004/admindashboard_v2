"use client"

import React, { useState, useEffect } from 'react';
import { client } from '@/lib/graphql';
import { GET_CATEGORIES } from '@/lib/graphql/queries/categories';
import { DELETE_CATEGORY } from '@/lib/graphql/mutations/categories';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesData = await client.request(GET_CATEGORIES);
      setCategories(categoriesData.libaray_Category);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load categories data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await client.request(DELETE_CATEGORY, { id: categoryId });
        // Refresh the list after deletion
        fetchData(); 
      } catch (err) {
        console.error("Error deleting category:", err);
        setError("Failed to delete category. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="p-4">Loading categories...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link href="/admin/categories/create" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Create New Category
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
              <p className="text-gray-500 text-sm mb-1"><strong>ID:</strong> {category.id}</p>
            </div>
            <div className="flex justify-end mt-4">
              <Link href={`/admin/categories/edit/${category.id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">
                Edit
              </Link>
              <button 
                onClick={() => handleDeleteCategory(category.id)} 
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Mail, Bell, Settings, Menu } from 'lucide-react';
import { client } from '@/lib/graphql';
import { GLOBAL_SEARCH } from '@/lib/graphql/queries/search';
import Link from 'next/link';
import { debounce } from 'lodash';

// Define types for our data
interface Book {
  id: string;
  title: string;
  coverImage: string;
  author_id?: string; // Now directly from the book, not nested auther
}

interface UserAuth {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  defaultRole: string;
}

interface LibarayAutor {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  Book_Author: Book[];
  user_auth: UserAuth[];
}

interface ProcessedAuthor {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  defaultRole: string;
  books: Book[];
}

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProcessedAuthor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }
    setLoading(true);
    try {
      const data: { authors: LibarayAutor[], books: Book[] } = await client.request(GLOBAL_SEARCH, { search: `%${searchQuery}%` });
      
      const { authors, books } = data;

      const authorsMap: { [key: string]: ProcessedAuthor } = {};

      // Process authors from the author search
      authors.forEach(author => {
        const user = author.user_auth.length > 0 ? author.user_auth[0] : null;
        authorsMap[author.id] = {
          id: user?.id || author.id,
          displayName: user?.displayName || author.name,
          email: user?.email || 'No linked user account',
          avatarUrl: user?.avatarUrl || author.image_url,
          defaultRole: user?.defaultRole || 'author',
          books: author.Book_Author || [],
        };
      });

      // Process books from the book search and merge with authors
      books.forEach(book => {
        if (book.author_id) {
          let processedAuthor = authorsMap[book.author_id];
          if (!processedAuthor) {
            // Author not found by direct name search, create a placeholder
            processedAuthor = {
                id: book.author_id,
                displayName: 'Unknown Author (ID: ' + book.author_id + ')',
                email: 'N/A',
                avatarUrl: '', // Default empty avatar
                defaultRole: 'author', // Assume they are an author
                books: [],
            };
            authorsMap[book.author_id] = processedAuthor; // Add to map
          }
          // Add book if it's not already in the list (handle duplicates if a book is found via both author and book search)
          if (!processedAuthor.books.some(b => b.id === book.id)) {
            processedAuthor.books.push(book);
          }
        }
      });
      
      const authorsArray = Object.values(authorsMap);
      setResults(authorsArray);
      setIsDropdownVisible(true);

    } catch (error) {
      console.error("Error during search:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const debouncedSearch = useCallback(debounce(performSearch, 300), []);

  useEffect(() => {
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleBlur = () => {
    setTimeout(() => {
      setIsDropdownVisible(false);
    }, 200);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
        <div 
          className="relative max-w-md w-full"
          onBlur={handleBlur}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for authors and books..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query && results.length > 0 && setIsDropdownVisible(true)}
          />
          {isDropdownVisible && (
            <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {loading && <div className="p-4 text-gray-500">Searching...</div>}
              {!loading && results.length === 0 && query.length > 1 && (
                <div className="p-4 text-gray-500">No results found.</div>
              )}
              {!loading && results.map(author => (
                <div key={author.id} className="border-b">
                  <Link href={`/admin/users/edit/${author.id}`} className="block p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <img src={author.avatarUrl || 'https://via.placeholder.com/40'} alt={author.displayName} className="w-10 h-10 rounded-full mr-4" />
                      <div>
                        <p className="font-semibold">{author.displayName} <span className="text-sm text-gray-500 font-normal">({author.defaultRole})</span></p>
                        <p className="text-sm text-gray-600">{author.email}</p>
                      </div>
                    </div>
                  </Link>
                  {author.books && author.books.length > 0 && (
                    <div className="pl-8 pr-4 pb-4">
                      <h4 className="font-semibold text-sm text-gray-700 mt-2 mb-1 border-t pt-2">Books by this author:</h4>
                      <ul className="space-y-2">
                        {author.books.map(book => (
                          <li key={book.id}>
                            <Link href={`/admin/books/edit/${book.id}`} className="flex items-center hover:bg-gray-100 p-2 rounded">
                              <img src={book.coverImage || 'https://via.placeholder.com/32'} alt={book.title} className="w-8 h-8 rounded-md mr-3" />
                              <span className="text-sm">{book.title}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Mail size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <Settings size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" className="w-full h-full" />
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </div>
  );
}
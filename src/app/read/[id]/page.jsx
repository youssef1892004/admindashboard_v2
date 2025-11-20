"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaArrowRight, FaBook, FaMinus, FaPlus, FaAlignRight, FaAlignCenter, FaHome, FaSave } from 'react-icons/fa';
import Link from 'next/link';
import { useReadingHistory } from '@/hooks/useReadingHistory';

// الاستعلام الأول: لجلب محتوى الفصل ومعرّف الكتاب (book__id)
const GET_CHAPTER_CONTENT = gql`
  query GetChapterContent($id: uuid!) {
    libaray_Chapter_by_pk(id: $id) {
      id
      title
      content
      chapter_num
      book__id
    }
  }
`;

// الاستعلام الثاني: لجلب بيانات الكتاب والفصول الأخرى للتنقل
const GET_BOOK_NAVIGATION = gql`
  query GetBookNavigation($bookId: uuid!) {
    libaray_Book_by_pk(id: $bookId) {
      id
      title
      Bookchapters(order_by: { chapter_num: asc }) {
        id
        chapter_num
      }
    }
  }
`;

const ReadPage = () => {
  const params = useParams();
  const { saveProgress } = useReadingHistory();

  const [fontSize, setFontSize] = useState(20);
  const [textAlign, setTextAlign] = useState('text-right');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const [saveStatus, setSaveStatus] = useState('');

  // تنفيذ الاستعلام الأول
  const { data: chapterData, loading: chapterLoading, error: chapterError } = useQuery(GET_CHAPTER_CONTENT, {
    variables: { id: params.id },
    skip: !params.id,
  });

  const chapter = chapterData?.libaray_Chapter_by_pk;
  const bookId = chapter?.book__id;

  // تنفيذ الاستعلام الثاني
  const { data: bookData, loading: bookLoading, error: bookError } = useQuery(GET_BOOK_NAVIGATION, {
    variables: { bookId: bookId },
    skip: !bookId,
  });

  const book = bookData?.libaray_Book_by_pk;
  const allChapters = book?.Bookchapters || [];
  
  const loading = chapterLoading || bookLoading;
  const error = chapterError || bookError;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 100) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'c')) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSaveProgress = () => {
    if (!bookId || !chapter?.chapter_num) return;

    setSaveStatus('جاري الحفظ...');
    const chapterLabel = `الفصل ${chapter.chapter_num}`;
    saveProgress(bookId, chapterLabel);
    
    setTimeout(() => {
      setSaveStatus('تم الحفظ بنجاح!');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 1000);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900"><p className="text-xl animate-pulse">جاري تحميل الفصل...</p></div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900"><h1 className="text-3xl font-bold text-red-500">الفصل غير موجود أو حدث خطأ.</h1></div>;
  }
  if (!chapter) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900"><h1 className="text-3xl font-bold">لم يتم العثور على الفصل.</h1></div>;
  }

  const currentIndex = allChapters.findIndex(ch => ch.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const renderContent = () => {
    const content = chapter?.content;
    if (!content) {
      return <p className="text-gray-400">لا يوجد محتوى لعرضه في هذا الفصل.</p>;
    }
    
    // The content is expected to be a plain string.
    // The whitespace formatting from a textarea will be preserved.
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <div dir="rtl" className="font-tajawal bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      
      <nav className={`fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="container mx-auto max-w-5xl px-5 py-3 flex justify-between items-center">
          <Link href={`/books/${book?.id}`} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
            <FaBook />
            <span>فهرس الكتاب</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setTextAlign('text-right')} className={`p-2 rounded-md ${textAlign === 'text-right' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} aria-label="محاذاة لليمين">
              <FaAlignRight />
            </button>
            <button onClick={() => setTextAlign('text-center')} className={`p-2 rounded-md ${textAlign === 'text-center' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`} aria-label="توسيط">
              <FaAlignCenter />
            </button>
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full" aria-label="تصغير الخط">
              <FaMinus />
            </button>
            <span className="w-10 text-center font-semibold">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(40, s + 2))} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full" aria-label="تكبير الخط">
              <FaPlus />
            </button>
          </div>

          <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
            <span>الرئيسية</span>
            <FaHome />
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-4 sm:px-6 pt-24 pb-24">
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{chapter.title}</h1>
          <p className="text-md text-gray-500 dark:text-gray-400 mt-2">الفصل رقم {chapter.chapter_num}</p>
        </header>

        <article 
          className={`chapter-content select-none bg-white dark:bg-gray-800 p-8 sm:p-12 rounded-lg shadow-lg ${textAlign}`}
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
        >
          {renderContent()}
        </article>
      </main>

      <footer className={`fixed bottom-0 left-0 right-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-top transition-transform duration-300 ${isNavVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto max-w-5xl px-4 py-4 flex justify-between items-center">
          {nextChapter ? (
            <Link href={`/read/${nextChapter.id}`} className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <span>الفصل التالي</span>
              <FaArrowLeft />
            </Link>
          ) : <div className="w-36"></div>}
          
          <div className="flex flex-col items-center">
            <button
              onClick={handleSaveProgress}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-400"
              disabled={!bookId || !chapter}
            >
              <FaSave />
              <span>حفظ التقدم</span>
            </button>
            {saveStatus && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 transition-opacity duration-300">
                {saveStatus}
              </p>
            )}
          </div>

          {prevChapter ? (
            <Link href={`/read/${prevChapter.id}`} className="flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              <FaArrowRight />
              <span>الفصل السابق</span>
            </Link>
          ) : <div className="w-36"></div>}
        </div>
      </footer>
    </div>
  );
};

export default ReadPage;
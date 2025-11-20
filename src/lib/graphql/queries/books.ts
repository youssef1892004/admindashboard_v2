export const GET_BOOKS = `
  query GetBook {
    libaray_Book {
      id
      title
      author_id
      description
      coverImage
      publicationDate
      chapter_num
      total_pages
      ISBN
      Category_id
      vedio_URL
      viocestd_URL
    }
  }
`;

export const GET_BOOK_BY_ID = `
  query GetBookById($id: uuid!) {
    libaray_Book_by_pk(id: $id) {
      id
      title
      author_id
      description
      coverImage
      publicationDate
      chapter_num
      total_pages
      ISBN
      Category_id
      vedio_URL
      viocestd_URL
    }
  }
`;
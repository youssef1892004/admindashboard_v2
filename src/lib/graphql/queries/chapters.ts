export const GET_CHAPTERS_BY_BOOK = `
  query GetChaptersByBook($book__id: uuid!) {
    libaray_Chapter(where: {book__id: {_eq: $book__id}}) {
      id
      title
      content
      chapter_num
      Create_at
    }
  }
`;

export const GET_CHAPTER_BY_ID = `
  query GetChapterById($id: uuid!) {
    libaray_Chapter_by_pk(id: $id) {
      id
      title
      content
      chapter_num
      book__id
    }
  }
`;
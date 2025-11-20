export const CREATE_CHAPTER = `
  mutation CreateChapter($book__id: uuid!, $title: String!, $content: jsonb, $chapter_num: Int, $Create_at: timestamptz) {
    insert_libaray_Chapter_one(object: {
      book__id: $book__id, 
      title: $title, 
      content: $content,
      chapter_num: $chapter_num,
      Create_at: $Create_at
    }) {
      id
    }
  }
`;

export const UPDATE_CHAPTER = `
  mutation UpdateChapter($id: uuid!, $title: String, $content: jsonb, $chapter_num: Int) {
    update_libaray_Chapter_by_pk(pk_columns: {id: $id}, _set: {
      title: $title, 
      content: $content,
      chapter_num: $chapter_num
    }) {
      id
    }
  }
`;

export const DELETE_CHAPTER = `
  mutation DeleteChapter($id: uuid!) {
    delete_libaray_Chapter_by_pk(id: $id) {
      id
    }
  }
`;
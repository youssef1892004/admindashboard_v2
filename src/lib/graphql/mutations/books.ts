export const CREATE_BOOK = `
  mutation CreateBook(
    $title: String!, 
    $author_id: uuid, 
    $description: String, 
    $coverImage: String, 
    $publicationDate: date, 
    $chapter_num: Int, 
    $total_pages: Int, 
    $ISBN: Int, 
    $Category_id: uuid, 
    $vedio_URL: String, 
    $viocestd_URL: String
  ) {
    insert_libaray_Book_one(object: {
      title: $title, 
      author_id: $author_id, 
      description: $description, 
      coverImage: $coverImage, 
      publicationDate: $publicationDate, 
      chapter_num: $chapter_num, 
      total_pages: $total_pages, 
      ISBN: $ISBN, 
      Category_id: $Category_id, 
      vedio_URL: $vedio_URL, 
      viocestd_URL: $viocestd_URL
    }) {
      id
    }
  }
`;

export const UPDATE_BOOK = `
  mutation UpdateBook(
    $id: uuid!, 
    $title: String, 
    $author_id: uuid, 
    $description: String, 
    $coverImage: String, 
    $publicationDate: date, 
    $chapter_num: Int, 
    $total_pages: Int, 
    $ISBN: Int, 
    $Category_id: uuid, 
    $vedio_URL: String, 
    $viocestd_URL: String
  ) {
    update_libaray_Book_by_pk(pk_columns: {id: $id}, _set: {
      title: $title, 
      author_id: $author_id, 
      description: $description, 
      coverImage: $coverImage, 
      publicationDate: $publicationDate, 
      chapter_num: $chapter_num, 
      total_pages: $total_pages, 
      ISBN: $ISBN, 
      Category_id: $Category_id, 
      vedio_URL: $vedio_URL, 
      viocestd_URL: $viocestd_URL
    }) {
      id
    }
  }
`;

export const DELETE_BOOK = `
  mutation DeleteBook($id: uuid!) {
    delete_libaray_Book_by_pk(id: $id) {
      id
    }
  }
`;
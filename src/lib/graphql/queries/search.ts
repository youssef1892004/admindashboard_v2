export const GLOBAL_SEARCH = `
  query GlobalSearch($search: String!) {
    authors: libaray_Autor(where: {name: {_ilike: $search}}) {
      id
      name
      bio
      image_url
      Book_Author {
        id
        title
        coverImage
      }
      user_auth {
        id
        email
        displayName
        avatarUrl
        defaultRole
      }
    }
    books: libaray_Book(where: {title: {_ilike: $search}}) {
      id
      title
      coverImage
      author_id
    }
  }
`;

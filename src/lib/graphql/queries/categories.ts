export const GET_CATEGORIES = `
  query GetCategories {
    libaray_Category {
      id
      name
    }
  }
`;

export const GET_CATEGORY_BY_ID = `
  query GetCategoryById($id: uuid!) {
    libaray_Category_by_pk(id: $id) {
      id
      name
    }
  }
`;
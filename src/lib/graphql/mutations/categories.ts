export const CREATE_CATEGORY = `
  mutation CreateCategory($name: String!) {
    insert_libaray_Category_one(object: {name: $name}) {
      id
      name
    }
  }
`;

export const UPDATE_CATEGORY = `
  mutation UpdateCategory($id: uuid!, $name: String!) {
    update_libaray_Category_by_pk(pk_columns: {id: $id}, _set: {name: $name}) {
      id
      name
    }
  }
`;

export const DELETE_CATEGORY = `
  mutation DeleteCategory($id: uuid!) {
    delete_libaray_Category_by_pk(id: $id) {
      id
    }
  }
`;
export const INSERT_ROLE = `
  mutation InsertRole($role: String!) {
    insertAuthRole(object: { role: $role }) {
      role
    }
  }
`;

export const INSERT_USER_ROLE = `
  mutation InsertUserRole($userId: uuid!, $role: String!) {
    insertAuthUserRole(object: {userId: $userId, role: $role}) {
      id
      userId
      role
    }
  }
`;
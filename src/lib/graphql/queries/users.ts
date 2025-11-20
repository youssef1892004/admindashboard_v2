export const FIND_USER_BY_EMAIL = `
  query FindUserByEmail($email: citext!) {
    users(where: {email: {_eq: $email}}) {
      id
      email
      passwordHash
      displayName
      defaultRole
    }
  }
`;

export const GET_USERS = `
  query GetUsers {
    users {
      id
      createdAt
      displayName
      avatarUrl
      email
      phoneNumber
      defaultRole
    }
  }
`;

export const GET_USERS_BY_ROLE = `
  query GetUsersByRole($defaultRole: String!) {
    users(where: {defaultRole: {_eq: $defaultRole}}) {
      id
      createdAt
      displayName
      avatarUrl
      email
      phoneNumber
      defaultRole
    }
  }
`;

export const GET_USER_BY_ID = `
  query GetUserById($id: uuid!) {
    user(id: $id) {
      id
      createdAt
      updatedAt
      lastSeen
      disabled
      displayName
      avatarUrl
      locale
      email
      phoneNumber
      passwordHash
      emailVerified
      phoneNumberVerified
      newEmail
      otpMethodLastUsed
      otpHash
      otpHashExpiresAt
      defaultRole
      isAnonymous
      totpSecret
      activeMfaType
      ticket
      ticketExpiresAt
      metadata
    }
  }
`;
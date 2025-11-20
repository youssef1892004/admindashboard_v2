export const CREATE_USER = `
  mutation CreateUser(
    $email: citext!,
    $passwordHash: String,
    $displayName: String,
    $defaultRole: String = "user",
    $lastSeen: timestamptz,
    $disabled: Boolean = false,
    $avatarUrl: String,
    $locale: String,
    $phoneNumber: String,
    $emailVerified: Boolean = false,
    $phoneNumberVerified: Boolean = false,
    $newEmail: citext,
    $otpMethodLastUsed: String,
    $otpHash: String,
    $otpHashExpiresAt: timestamptz,
    $isAnonymous: Boolean = false,
    $totpSecret: String,
    $activeMfaType: String,
    $ticket: String,
    $ticketExpiresAt: timestamptz,
    $metadata: jsonb
  ) {
    insertUser(object: {
      email: $email,
      passwordHash: $passwordHash,
      displayName: $displayName,
      defaultRole: $defaultRole,
      lastSeen: $lastSeen,
      disabled: $disabled,
      avatarUrl: $avatarUrl,
      locale: $locale,
      phoneNumber: $phoneNumber,
      emailVerified: $emailVerified,
      phoneNumberVerified: $phoneNumberVerified,
      newEmail: $newEmail,
      otpMethodLastUsed: $otpMethodLastUsed,
      otpHash: $otpHash,
      otpHashExpiresAt: $otpHashExpiresAt,
      isAnonymous: $isAnonymous,
      totpSecret: $totpSecret,
      activeMfaType: $activeMfaType,
      ticket: $ticket,
      ticketExpiresAt: $ticketExpiresAt,
      metadata: $metadata
    }) {
      id
    }
  }
`;

export const UPDATE_USER = `
  mutation UpdateUser(
    $id: uuid!,
    $email: citext,
    $passwordHash: String,
    $displayName: String,
    $defaultRole: String,
    $lastSeen: timestamptz,
    $disabled: Boolean,
    $avatarUrl: String,
    $locale: String,
    $phoneNumber: String,
    $emailVerified: Boolean,
    $phoneNumberVerified: Boolean,
    $newEmail: citext,
    $otpMethodLastUsed: String,
    $otpHash: String,
    $otpHashExpiresAt: timestamptz,
    $isAnonymous: Boolean,
    $totpSecret: String,
    $activeMfaType: String,
    $ticket: String,
    $ticketExpiresAt: timestamptz,
    $metadata: jsonb
  ) {
    updateUser(pk_columns: {id: $id}, _set: {
      email: $email,
      passwordHash: $passwordHash,
      displayName: $displayName,
      defaultRole: $defaultRole,
      lastSeen: $lastSeen,
      disabled: $disabled,
      avatarUrl: $avatarUrl,
      locale: $locale,
      phoneNumber: $phoneNumber,
      emailVerified: $emailVerified,
      phoneNumberVerified: $phoneNumberVerified,
      newEmail: $newEmail,
      otpMethodLastUsed: $otpMethodLastUsed,
      otpHash: $otpHash,
      otpHashExpiresAt: $otpHashExpiresAt,
      isAnonymous: $isAnonymous,
      totpSecret: $totpSecret,
      activeMfaType: $activeMfaType,
      ticket: $ticket,
      ticketExpiresAt: $ticketExpiresAt,
      metadata: $metadata
    }) {
      id
    }
  }
`;

export const DELETE_USER = `
  mutation DeleteUser($id: uuid!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
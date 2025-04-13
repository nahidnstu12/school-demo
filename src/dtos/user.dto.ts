'use server';

import { User } from '@prisma/client';

class UserDTO {
  static toProfile(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // createdAt: user.createdAt.toISOString(),
      // updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toList(user: User) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

export default UserDTO;

'use server';

class UserDTO {
  static toProfile(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      // createdAt: user.createdAt.toISOString(),
      // updatedAt: user.updatedAt.toISOString(),
    };
  }

  static toList(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

export default UserDTO;

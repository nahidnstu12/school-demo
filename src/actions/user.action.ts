'use server';

import UserService from '@/services/user.service';
import BaseServerAction from './base.action';
import { userSchema } from '@/types/user';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

class UserServerAction extends BaseServerAction<z.infer<typeof userSchema>> {
  constructor() {
    super(userSchema);
  }

  async createUser(
    formData: FormData
  ): Promise<
    | { success: true; user: any }
    | { success: false; errors: { field: string | number; message: string }[] }
  > {
    console.log(formData, 'server action form data');
    const validatedData = this.validateFormData(formData);

    if (!validatedData.success) return validatedData;

    const user = await new UserService().create(validatedData.data as Prisma.UserCreateInput);
    return { success: true, user };
  }
}
const userActionInstance = new UserServerAction();

export async function createUser(formData: FormData) {
  return userActionInstance.createUser(formData);
}

// export default userActionInstance;

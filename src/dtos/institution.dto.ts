'use server';

import { Institution, User } from '@prisma/client';

interface IRelations extends Institution {
  user: User;
}

class InstitutionDTO {
  static toDetail(institution: IRelations) {
    return {
      id: institution.id,
      email: institution?.user?.email,
      name: institution.name,
      address: institution.address,
      contactNumber: institution.contactNumber,
    };
  }

  static toList(institution: IRelations) {
    return {
      id: institution.id,
      email: institution?.user?.email,
      name: institution.name,
    };
  }

  static toPublic(institution: IRelations) {
    // A public view that excludes sensitive info
    return {
      id: institution.id,
      name: institution.name,
    };
  }
}

export default InstitutionDTO;

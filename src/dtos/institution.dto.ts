'use server';

import { Institution } from '@prisma/client';

class InstitutionDTO {
  static toProfile(institution: Institution) {
    return {
      id: institution.id,
      email: institution.email,
      name: institution.name,
      address: institution.address,
      contactNumber: institution.contactNumber,
    };
  }

  static toList(institution: Institution) {
    return {
      id: institution.id,
      email: institution.email,
      name: institution.name,
    };
  }
}

export default InstitutionDTO;

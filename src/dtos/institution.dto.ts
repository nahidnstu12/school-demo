'use server';

class InstitutionDTO {
  static toProfile(institution: any) {
    return {
      id: institution.id,
      email: institution.email,
      name: institution.name,
      address: institution.address,
      contactNumber: institution.contactNumber,
    };
  }

  static toList(institution: any) {
    return {
      id: institution.id,
      email: institution.email,
      name: institution.name,
    };
  }
}

export default InstitutionDTO;

'use server';

class LevelDTO {
  static toProfile(level: any) {
    return {
      id: level.id,
      institutionId: level.institutionId,
      name: level.name,
    };
  }

  static toList(level: any) {
    return {
      id: level.id,
      institutionId: level.institutionId,
      name: level.name,
    };
  }
}

export default LevelDTO;

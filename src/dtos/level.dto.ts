'use server';

import { Level } from '@prisma/client';

class LevelDTO {
  static toProfile(level: Level) {
    return {
      id: level.id,
      institutionId: level.institutionId,
      name: level.name,
    };
  }

  static toList(level: Level) {
    return {
      id: level.id,
      institutionId: level.institutionId,
      name: level.name,
    };
  }
}

export default LevelDTO;

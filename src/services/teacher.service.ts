'use server';

import TeacherDTO from '@/dtos/teacher.dto';
import { Teacher, Prisma } from '@prisma/client';
import BaseService from './base.service';
import TeacherModel from '@/models/teacher.model';

/**
 * Teacher service that extends the base service
 */
class TeacherService extends BaseService<
  Teacher,
  Prisma.TeacherCreateInput,
  Prisma.TeacherUpdateInput,
  TeacherModel,
  typeof TeacherDTO
> {
  constructor(model: TeacherModel = new TeacherModel(), dto: typeof TeacherDTO = TeacherDTO) {
    super(model, dto);
  }

  /**
   * Get all designations for dropdown
   */
  async getAllDesignations(): Promise<string[]> {
    try {
      const teachers = await this.model.findMany({
        distinct: ['designation'],
        select: {
          designation: true,
        },
      });

      return teachers.map((t) => t.designation);
    } catch (error) {
      console.error('Error getting designations:', error);
      throw error;
    }
  }
}

export default TeacherService;

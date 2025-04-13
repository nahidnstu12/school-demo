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
   * Get paginated teachers with custom filter
   */
  //   async findAllPaginated(
  //     page: number = 1,
  //     pageSize: number = 10,
  //     filterObject: Prisma.TeacherFindManyArgs = {}
  //   ): Promise<{ data: TeacherDTO[]; total: number }> {
  //     try {
  //       // Use the model's findManyPaginated method
  //       const result = await this.model.findManyPaginated(page, pageSize, filterObject);

  //       // Transform data using DTO
  //       const transformedData = this.dto.transformMany(result.data as any);

  //       return {
  //         data: transformedData,
  //         total: result.total,
  //       };
  //     } catch (error) {
  //       console.error('Error in findAllPaginated:', error);
  //       throw error;
  //     }
  //   }

  /**
   * Get all designations for dropdown
   */
  async getAllDesignations(): Promise<string[]> {
    try {
      const teachers = await this.model.findMany({
        // select: {
        //   designation: true,
        // },
        distinct: ['designation'],
      });

      return teachers.map((t) => t.designation);
    } catch (error) {
      console.error('Error getting designations:', error);
      throw error;
    }
  }
}

export default TeacherService;

import { FilterConfig } from '@/utils/filter-helpers';
import { z } from 'zod';

export const teacherSchema = z.object({
  userId: z.string(),
  institutionId: z.string(),
  designation: z.string(),
  joiningDate: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  specialization: z.string().optional(),
  pdsId: z.string().optional(),
  status: z.boolean().default(true),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

// Define filter configuration
export const teacherFilterConfig: FilterConfig = {
  defaultPageSize: 10,
  defaultSort: { field: 'joiningDate', direction: 'desc' as const },
  fields: {
    name: {
      type: 'string',
      defaultOperator: 'contains',
    },
    institutionId: {
      type: 'string',
      defaultOperator: 'equals',
    },
    email: {
      type: 'string',
      defaultOperator: 'contains',
    },
    phone: {
      type: 'string',
      defaultOperator: 'contains',
    },
    designation: {
      type: 'string',
      defaultOperator: 'equals',
    },
    joiningDate: {
      type: 'date',
      defaultOperator: 'between',
    },
    status: {
      type: 'boolean',
      defaultOperator: 'equals',
    },
    pdsId: {
      type: 'string',
      defaultOperator: 'contains',
    },
  },
};

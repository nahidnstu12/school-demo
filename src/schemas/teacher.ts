import { FilterConfig } from '@/utils/filter-helpers';
import { z } from 'zod';

// Combined schema for the form that includes both User and Teacher fields
export const teacherFormSchema = z.object({
  // User fields
  firstName: z.string().min(2, { message: 'First name is required (min 2 characters)' }),
  lastName: z.string().min(1, { message: 'Last name is required (min 1 character)' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().optional(),
  
  // Teacher fields
  institutionId: z.string().min(1, { message: 'Institution is required' }),
  designation: z.string().min(1, { message: 'Designation is required' }),
  pdsId: z.string().optional(),
  joiningDate: z.date().optional().nullable(),
  address: z.string().optional(),
  district: z.string().optional(),
  specialization: z.string().optional(),
  status: z.boolean().default(true),
});

// The form values type
export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

// The actual Teacher model schema (for reference/validation)
export const teacherSchema = z.object({
  userId: z.string(),
  institutionId: z.string(),
  designation: z.string(),
  joiningDate: z.date().optional().nullable(),
  address: z.string().optional(),
  district: z.string().optional(),
  specialization: z.string().optional(),
  pdsId: z.string().optional(),
  status: z.boolean().default(true),
});

// Export the filter configuration
export const teacherFilterConfig: FilterConfig = {
  defaultPageSize: 10,
  defaultSort: { field: 'createdAt', direction: 'desc' },
  fields: {
    // Teacher model fields
    institutionId: { type: 'string', defaultOperator: 'equals' },
    designation: { type: 'string', defaultOperator: 'equals' },
    joiningDate: { type: 'date', defaultOperator: 'equals' },
    status: { type: 'boolean', defaultOperator: 'equals' },
    pdsId: { type: 'string', defaultOperator: 'contains' },
    
    // Special fields for related user
    email: { type: 'string', defaultOperator: 'contains' },
    phone: { type: 'string', defaultOperator: 'contains' },
    fullName: { type: 'string', defaultOperator: 'contains' },
    
    // Global search
    search: { type: 'string', defaultOperator: 'contains' },
  },
};
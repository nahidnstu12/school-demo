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
  joiningDate: z.preprocess(
    (val) => {
      if (!val) return null;
      if (val instanceof Date) return val.toISOString().split('T')[0];
      if (typeof val === 'string') return val;
      return null;
    },
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' })
      .nullable()
  ),
  address: z.string().optional(),
  district: z.string().optional(),
  specialization: z.string().optional(),
  status: z.preprocess(
    (val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') {
        return val === 'true' || val === 'on';
      }
      return false;
    },
    z.boolean()
  ),
  userId: z.string().optional(), // Added for edit mode
});

// The form values type
export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

// Define the User type
export type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

// Define the Institution type
export type InstitutionData = {
  id: string;
  name: string;
};

// Define the Teacher type with nested User and Institution
export type TeacherWithUser = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  institution: InstitutionData;
  institutionId: string;
  designation: string;
  joiningDate: Date | null;
  address: string | null;
  district: string | null;
  specialization: string | null;
  pdsId: string | null;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};



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

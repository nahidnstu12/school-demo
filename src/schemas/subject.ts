import { FilterConfig } from '@/utils/filter-helpers';
import { z } from 'zod';


export const subjectSchema = z.object({
  institutionId: z.string().min(1, "Institution are required"),
  levelId: z.string().min(1, "Level are required"),
  name: z.string().min(3, 'Name is required'),
  code: z.string().min(3, 'Code is required').max(12, "big code!"),
  // Convert string to number for creditHours
  creditHours: z.preprocess(
    (val) => (val === '' || val === null || val === undefined) ? undefined : Number(val),
    z.number().optional()
  ),
  description: z.string().optional(),
  // Convert string to boolean for status
  status: z.preprocess(
    (val) => val === 'true' || val === true || val === 'on',
    z.boolean()
  ),
});

// Create subject schema (extends base schema)
export const createSubjectSchema = subjectSchema;

// Update subject schema (all fields optional except id)
export const updateSubjectSchema = z.object({
  id: z.string(),
  institutionId: z.string().optional(),
  levelId: z.string().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  code: z.string().optional(),
  creditHours: z.number().optional(),
  description: z.string().optional(),
  status: z.boolean().optional(),
});

// Filter schema for subject list
export const subjectFilterSchema = z.object({
  institutionId: z.string().optional(),
  levelId: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  status: z.boolean().optional(),
});

// Types
export type SubjectFormValues = z.infer<typeof subjectSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type SubjectFilterInput = z.infer<typeof subjectFilterSchema>;

export const subjectFilterConfig: FilterConfig = {
  defaultPageSize: 10,
  defaultSort: { field: 'createdAt', direction: 'desc' as const },
  fields: {
    name: { type: 'string', defaultOperator: 'contains' },
    code: { type: 'string', defaultOperator: 'contains' },
    institutionId: { type: 'string', defaultOperator: 'equals' },
    levelId: { type: 'string', defaultOperator: 'equals' },
    status: { type: 'boolean', defaultOperator: 'equals' },
    createdAt: { type: 'date', defaultOperator: 'equals' },
  },
};

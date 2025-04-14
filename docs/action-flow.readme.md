# Understanding Our Process

## Server Actions with Relational Filtering

The system consists of three main components:

1. **BaseServerAction**: Provides CRUD operations with validation
2. **RelationalServerAction**: Extends BaseServerAction with relational filtering for list
3. **Entity-specific actions**: Concrete implementations for your models

## Server Action Interfaces

```ts
// IServerAction defines the contract for server actions
export interface IServerAction<T, ModelType> {
  create(formData: FormData): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  createMany(formData: FormData): Promise<ActionResult<Prisma.BatchPayload>>;
  update(
    id: string | number,
    formData: FormData
  ): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  delete(id: string | number): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  getById(
    id: string | number
  ): Promise<{ success: boolean; data?: ModelType | null; errors?: any[] }>;
  getAll(filters?: any): Promise<{ success: boolean; data?: ModelType[]; errors?: any[] }>;
  upsert(id: string | number, formData: FormData): Promise<ActionResult<ModelType>>;
  findOne(filters: any): Promise<ActionResult<ModelType | null>>;
  softDelete(id: string | number): Promise<ActionResult<ModelType>>;
  count(filters?: any): Promise<ActionResult<number>>;
  aggregate(params: any): Promise<ActionResult<any>>;
  executeRawQuery(formData: FormData): Promise<ActionResult<any>>;
}
```

## Relational Filtering Configuration

### RelationalFilterConfig

Configures filtering, sorting, and search behavior:

```ts
export interface RelationalFilterConfig {
  defaultPageSize: number;
  defaultSort?: { field: string; direction: 'asc' | 'desc' };
  fields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date'; // Field type
      defaultOperator?: string; // Default comparison operator
      relation?: string; // Optional relation name
      relationField?: string; // Optional field in relation
    };
  };
  include?: Record<string, boolean>; // Relations to include in results
  searchFields?: Array<{
    // Fields to search
    field: string;
    relation?: string;
    relationField?: string;
  }>;
}
```

## Example Usage

### 1. Create Relational Filter Config

```typescript
const teacherRelationalConfig: RelationalFilterConfig = {
  // Default pagination size
  defaultPageSize: 10,
  // Default sorting
  defaultSort: { field: 'fullName', direction: 'asc' },

  // Field definitions for filtering
  fields: {
    // use specail field for global search, this connect for searchFields
    search: {
      type: 'string',
      defaultOperator: 'contains',
    },
    // Direct fields on the Teacher entity
    designation: {
      type: 'string',
      defaultOperator: 'equals',
    },
    joiningDate: {
      type: 'date',
      defaultOperator: 'between',
    },

    // Fields that map to relations
    email: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'user', // Related entity
      relationField: 'email', // Field in related entity
    },
    phone: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'user',
      relationField: 'phone',
    },
  },
  // Include related entities in the results
  include: {
    user: true,
    institution: true,
  },

  // Define which fields to use for global search
  searchFields: [
    { relation: 'user', relationField: 'firstName', field: 'firstName' },
    { relation: 'user', relationField: 'lastName', field: 'lastName' },
    { relation: 'user', relationField: 'email', field: 'email' },
    { relation: 'user', relationField: 'phone', field: 'phone' },
  ],
};
```

### 3. Implement Entity-Specific Action Class

```ts
class TeacherServerAction extends RelationalServerAction<
  TeacherFormValues,
  Prisma.TeacherCreateInput,
  Prisma.TeacherUpdateInput,
  Teacher,
  TeacherService
> {
  constructor(
    schema: z.ZodType<TeacherFormValues> = teacherSchema,
    service: TeacherService = new TeacherService()
  ) {
    super(schema, service, teacherRelationalConfig);
  }

  // Additional methods specific to Teacher
  async getTeacherDesignations(): Promise<ActionResult<string[]>> {
    try {
      const designations = await this.service.getAllDesignations();
      return { success: true, data: designations };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}
```

### 4. Create and Export Action Functions

```ts
// Create singleton instance
const teacherActionInstance = new TeacherServerAction();

// Export reusable functions for use in components
export async function getTeachersWithFilter(formData: FormData) {
  return teacherActionInstance.getItemsWithFilter(formData);
}

export async function getTeacherDesignations() {
  return teacherActionInstance.getTeacherDesignations();
}

export async function createTeacher(formData: FormData) {
  return teacherActionInstance.create(formData);
}
```

## How getItemsWithFilter Works

The `getItemsWithFilter` method performs these steps:

1. Extracts query parameters from the URL (page, pageSize, sort, dir, search)
2. Processes filter data from FormData
3. Builds Prisma query with proper relation handling
4. Executes the query and returns paginated results

## Service Interface

```ts
export interface IService<T, CreateInput, UpdateInput, DTO = any> {
  findById(id: string | number, transformMethod?: keyof DTO): Promise<T | null>;
  findAll(filters?: any, transformMethod?: keyof DTO): Promise<T[]>;
  findAllPaginated(
    page: number,
    perPage: number,
    filters?: any,
    transformMethod?: keyof DTO
  ): Promise<{ data: T[]; total: number; page: number; perPage: number; pageCount: number }>;

  count(filters?: any): Promise<number>;
  create(data: CreateInput): Promise<T>;
  createMany(data: CreateInput[]): Promise<Prisma.BatchPayload>;
  update(id: string | number, data: UpdateInput): Promise<T>;
  delete(id: string | number): Promise<T>;
  upsert(id: string | number, create: CreateInput, update: UpdateInput): Promise<T>;
  findOne(filters: any, transformMethod?: keyof DTO): Promise<T | null>;
  softDelete(id: string | number): Promise<T>; // Optional method for soft delete if needed
  aggregate<R = any>(params: any): Promise<R>;
  executeRawQuery<R = any>(query: string, ...values: any[]): Promise<R>;
}
```

## Model Interface

```ts
export interface IModel<T> {
  create(data: any): Promise<T>;
  createMany(data: any[]): Promise<Prisma.BatchPayload>;
  update(id: string | number, data: any): Promise<T>;
  delete(id: string | number): Promise<T>;
  findMany(filters?: any): Promise<T[]>;
  findUnique(id: string | number): Promise<T | null>;
  findFirst(filters?: any): Promise<T | null>;
  upsert(id: string | number, create: any, update: any): Promise<T>;
  aggregate(params: any): Promise<any>;
  queryRaw<R = any>(query: string, ...values: any[]): Promise<R>;
  softDelete(id: string | number): Promise<T>;
  count(filters?: any): Promise<number>;
}
```

## DTO

```ts
interface TeacherWithRelations extends Teacher {
  user: User;
  institution: Institution;
}

class TeacherDTO {
  static toList(teacher: TeacherWithRelations) {}
  static toDetail(teacher: TeacherWithRelations) {}
  static toAdmin(teacher: TeacherWithRelations) {}
  static toPublic(teacher: TeacherWithRelations) {}
}
```

## Schemas

```ts
export const teacherSchema = z.object({
  // schema validation login using zod
});

export type FilterConfig = {
  fields: Record<string, FilterFieldConfig>;
  defaultSort: { field: string; direction: 'asc' | 'desc' };
  defaultPageSize: number;
};
// Define filter configuration for useDynamic hook filter config value for filter options
export const teacherFilterConfig: FilterConfig = {
  defaultSort: {},
  defaultPageSize: {},
  fields: {},
};
```

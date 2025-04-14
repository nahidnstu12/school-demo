# Conceptual Guide: How Our Server Action System Works

This guide explains the core concepts of our server action system with a focus on understanding the data flow and responsibility of each component.

## System Architecture Overview

```
┌─ UI Layer ───────────────────┐
│  React Components            │
│  - Calls server actions      │
│  - Displays formatted data   │
└───────────────┬──────────────┘
                │
                ▼
┌─ Server Action Layer ────────┐
│  Action Classes              │
│  - Validates input           │
│  - Processes filters         │
│  - Calls service methods     │
└───────────────┬──────────────┘
                │
                ▼
┌─ Service Layer ──────────────┐
│  Service Classes             │
│  - Executes database queries │
│  - Applies DTO transforms    │
│  - Implements business logic │
└───────────────┬──────────────┘
                │
                ▼
┌─ DTO Layer ──────────────────┐
│  Data Transfer Objects       │
│  - Transforms data structures│
│  - Creates context-based views│
└───────────────┬──────────────┘
                │
                ▼
┌─ Model Layer ───────────────┐
│  Prisma Models              │
│  - Database schema          │
│  - Basic CRUD operations    │
└──────────────────────────────┘
```

## How Data Flows Through The System

Let's look at a typical data flow for a list operation with filtering:

1. **UI Component**: Initiates request with filter parameters
2. **Server Action**: Processes filter params for relation handling
3. **Service**: Executes database query with processed filters
4. **DTO**: Transforms raw data into appropriate format
5. **UI Component**: Receives and displays formatted data

## Key Components and Their Roles

### 1. Model Layer

The model layer defines your database schema and provides basic CRUD operations.

**Concept:**

- Models represent your database tables
- Define relationships between entities
- Provide a foundation for type safety

**Example (Prisma Schema):**

```prisma
// Simplified model definition
model Teacher {
  id            String      @id @default(uuid())
  designation   String
  userId        String      @unique

  // Relations
  user          User        @relation(fields: [userId], references: [id])
  courses       Course[]    // Teacher can have many courses
}
```

### 2. DTO (Data Transfer Object) Layer

DTOs transform database records into shapes appropriate for different contexts.

**Concept:**

- Control what data is exposed to clients
- Format data appropriately for different views
- Keep transformation logic in one place

**Example (DTO Pattern):**

```typescript
// Conceptual example of a Teacher DTO
class TeacherDTO {
  // For list views (simplified data)
  static toList(teacher) {
    return {
      id: teacher.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      designation: teacher.designation,
      // Only essential fields for a list view
    };
  }

  // For detail views (more comprehensive data)
  static toDetail(teacher) {
    return {
      id: teacher.id,
      user: {
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        email: teacher.user.email,
        // More user details
      },
      designation: teacher.designation,
      courses: teacher.courses.map((course) => ({
        id: course.id,
        name: course.name,
        // Simplified course data
      })),
      // Additional fields for detailed view
    };
  }
}
```

### 3. Service Layer

Services handle business logic and database operations.

**Concept:**

- Execute database queries
- Apply business rules
- Transform data using DTOs
- Centralize database access logic

**Example (Service Pattern):**

```typescript
// Conceptual example of a Teacher service
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
  // Find teachers with filtering and transformation
  async findTeachers(filters, transformMethod = 'toList') {
    // 1. Process any filters or parameters
    const processedFilters = this.processFilters(filters);

    // 2. Execute database query with relations
    const teachers = await this.prisma.teacher.findMany({
      ...processedFilters,
      include: { user: true, courses: true },
    });

    // 3. Apply DTO transformation
    return teachers.map((teacher) => TeacherDTO[transformMethod](teacher));
  }

  // Other methods for CRUD operations...
}
```

### 4. Server Action Layer

Server actions expose functionality to UI components.

**Concept:**

- Validate input data
- Process forms and parameters
- Handle relation-aware filtering
- Call appropriate service methods
- Return consistent result structures

**Example (Server Action Pattern):**

```typescript
// Conceptual example of a Teacher server action
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
  // Get teachers with filtering
  async getTeachersWithFilter(formData) {
    try {
      // 1. Extract filter parameters
      const filterParams = this.extractFilterParams(formData);

      // 2. Process relation fields in filter
      const processedFilters = this.processRelationFields(filterParams);

      // 3. Call service with processed filters
      const teachers = await this.teacherService.findTeachers(
        processedFilters,
        'toList' // Specify which DTO transformation to use
      );

      // 4. Return successful response
      return { success: true, data: teachers };
    } catch (error) {
      // 5. Handle errors consistently
      return this.handleError(error);
    }
  }
}

const teacherActionInstance = new TeacherServerAction();
export async function getTeachersWithFilter(formData: FormData) {
  return teacherActionInstance.getItemsWithFilter(formData);
}
```

### 5. UI Component Layer

UI components present data and handle user interactions.

**Concept:**

- Call server actions to fetch or modify data
- Display data in appropriate formats
- Handle loading and error states
- Manage local UI state

**Example (React Component):**

```tsx
// Conceptual example of a Teacher list component
function TeacherList() {
  const [teachers, setTeachers] = useState([]);

  // Call server action with filters
  const handleFilter = async (formData) => {
    // The server action returns data already transformed by the DTO
    const result = await getTeachersWithFilter(formData);

    if (result.success) {
      // Use the transformed data directly
      setTeachers(result.data);
    }
  };

  return (
    // UI implementation
  );
}
```

## Relational Filtering System

One of the key features of our system is its ability to handle filtering across relations.

### How It Works:

1. **Configuration**: Define which fields map to relations

   ```typescript
   // Conceptual filter configuration for Teacher
   const filterConfig = {
     fields: {
       // Direct field on Teacher
       designation: {
         type: 'string',
       },

       // Field on related User entity
       email: {
         type: 'string',
         relation: 'user',
         relationField: 'email',
       },
     },
   };
   ```

2. **Filter Processing**: When a filter includes a relation field, it's mapped to the appropriate query structure

   ```typescript
   // Original filter from client
   const filter = {
     where: {
       email: { contains: 'example.com' },
     },
   };

   // Processed for Prisma with relation handling
   const processedFilter = {
     where: {
       user: {
         email: { contains: 'example.com' },
       },
     },
   };
   ```

3. **Sorting**: Similarly, sorting can be handled across relations

   ```typescript
   // Original sort request (sort by user's name)
   const sort = { field: 'name', direction: 'asc' };

   // Processed for Prisma
   const processedSort = {
     orderBy: {
       user: {
         firstName: 'asc',
       },
     },
   };
   ```

4. **Search**: Global search works across multiple fields, including related entities

   ```typescript
   // Search term
   const search = 'john';

   // Processed search conditions
   const searchConditions = [
     { designation: { contains: 'john' } },
     { user: { firstName: { contains: 'john' } } },
     { user: { lastName: { contains: 'john' } } },
     { user: { email: { contains: 'john' } } },
   ];
   ```

## DTO Transformation Pattern

Our DTOs follow a method-based transformation pattern that allows different views of the same data.

### How Transformations Work:

1. **Define Transformation Methods**: Each DTO has multiple static methods for different views

   ```typescript
   class CourseDTO {
     static toList(course) {
       /* Transform for lists */
     }
     static toDetail(course) {
       /* Transform for details */
     }
     static toAdmin(course) {
       /* Transform for admin panel */
     }
     static toPublic(course) {
       /* Transform for public API */
     }
   }
   ```

2. **Service Layer Integration**: Services call the appropriate DTO method based on the context

   ```typescript
   // In service method
   async findCourseById(id, view = 'toDetail') {
     const course = await this.prisma.course.findUnique({
       where: { id },
       include: { /* relations */ }
     });

     // Apply transformation based on requested view
     return CourseDTO[view](course);
   }
   ```

3. **Server Action Usage**: Server actions can specify which transformation to use

   ```typescript
   // Different actions for different views
   async getCourseDetails(id) {
     return this.courseService.findCourseById(id, 'toDetail');
   }

   async getCourseForPublicAPI(id) {
     return this.courseService.findCourseById(id, 'toPublic');
   }
   ```

## The Full Flow: Example Scenario

Let's walk through a complete example of fetching a filtered list of teachers:

1. **User Interaction**: User selects filters in the UI and submits the form

   ```typescript
   // User filters for teachers with designation "Senior" and email containing "example.com"
   const formData = new FormData();
   formData.append(
     'filter',
     JSON.stringify({
       designation: 'Senior',
       email: 'example.com',
     })
   );
   ```

2. **Server Action Processing**:

   ```typescript
   // Server action receives FormData
   async function getTeachersWithFilter(formData) {
     // Extract and process filters
     const filterJson = formData.get('filter');
     const filterObj = JSON.parse(filterJson);

     // Process relation fields (email → user.email)
     const processedFilter = {
       where: {
         designation: filterObj.designation,
         user: {
           email: { contains: filterObj.email },
         },
       },
     };

     // Call service with processed filters
     const result = await teacherService.findTeachers(processedFilter);

     return { success: true, data: result };
   }
   ```

3. **Service Execution**:

   ```typescript
   // Service method
   async findTeachers(filters, transformMethod = 'toList') {
     // Execute query with relations included
     const teachers = await this.prisma.teacher.findMany({
       ...filters,
       include: { user: true, institution: true }
     });

     // Transform results
     return teachers.map(teacher => TeacherDTO[transformMethod](teacher));
   }
   ```

4. **DTO Transformation**:

   ```typescript
   // DTO transformation method
   static toList(teacher) {
     return {
       id: teacher.id,
       name: `${teacher.user.firstName} ${teacher.user.lastName}`,
       email: teacher.user.email,
       designation: teacher.designation,
       institution: teacher.institution.name
     };
   }
   ```

5. **Response Handling in UI**:
   ```typescript
   // React component
   const handleFilter = async (formData) => {
     const result = await getTeachersWithFilter(formData);

     if (result.success) {
       // Data is already transformed into the desired format
       setTeachers(result.data);
     }
   };
   ```

## Key System Benefits

1. **Separation of Concerns**:

   - UI components focus on presentation
   - Server actions handle API and validation
   - Services manage business logic
   - DTOs control data transformation
   - Models define database structure

2. **Type Safety**:

   - TypeScript ensures consistent data structures
   - Zod validates input data
   - DTOs standardize output formats

3. **Maintainability**:

   - Each layer has clear responsibilities
   - Changes to database schema are isolated
   - UI changes don't affect backend logic

4. **Flexibility**:

   - Different data views through DTO methods
   - Consistent error handling
   - Relation-aware filtering and sorting

5. **Reusability**:
   - Base classes handle common functionality
   - DTO methods can be reused across different contexts
   - Filter processing works for any entity with relations

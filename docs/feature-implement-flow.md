# Step-by-Step Guide: Implementing a New Feature

This guide walks you through the complete process of implementing a new feature in our system, from database model to UI components.

## Implementation Flow

```
Prisma Model → Model/DTO/Schema → Service → Server Action → Client Component
```

## Step 1: Create the Prisma Model

Define your entity in the Prisma schema file:

```prisma
model NewFeature {
  id             String    @id @default(cuid())
  name           String
  description    String?
  institutionId  String    @map("institution_id")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deleted        Boolean   @default(false)

  // Relations
  institution    Institution  @relation(fields: [institutionId], references: [id], onDelete: Cascade)

  @@index([institutionId])
  @@map("new_features")
}
```

After adding the model, run migrations:

```bash
bunx prisma generate
bunx prisma db push

# or
bunx prisma migrate dev --name add_new_feature
```

## Step 2: Create the Model Class

Create a model class that extends `BaseModel`:

```typescript
// models/newFeature.model.ts

class NewFeatureModel extends BaseModel<NewFeature> {
  constructor() {
    super(prisma.newFeature);
  }

  // Add any custom model methods here if needed
}

export default NewFeatureModel;
```

## Step 3: Create the DTO

Define the DTO (Data Transfer Object) to transform your data:

```typescript
// dtos/newFeature.dto.ts
import { NewFeature, Institution } from '@prisma/client';

interface NewFeatureWithRelations extends NewFeature {
  institution: Institution;
}

class NewFeatureDTO {
  static toList(newFeature: NewFeatureWithRelations) {
    return {
      id: newFeature.id,
      name: newFeature.name,
      institutionName: newFeature.institution.name,
      // Add more fields as needed
    };
  }

  static toDetail(newFeature: NewFeatureWithRelations) {
    return {
      id: newFeature.id,
      name: newFeature.name,

      // Add more fields as needed
    };
  }
}

export default NewFeatureDTO;
```

## Step 4: Define the Schema and Filter Configuration

Create the validation schema and filter configuration:

```typescript
// schemas/newFeature.ts
import { z } from 'zod';
import { FilterConfig } from '@/utils/filter-helpers';

// Validation schema for form data
export const newFeatureSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  institutionId: z.string().min(1, 'Institution is required'),
});

export type NewFeatureFormValues = z.infer<typeof newFeatureSchema>;

// Filter configuration for list views
export const newFeatureFilterConfig: FilterConfig = {
  defaultPageSize: 10,
  defaultSort: { field: 'name', direction: 'asc' },
  fields: {
    search: {
      type: 'string',
      defaultOperator: 'contains',
    },
    institutionId: {
      type: 'string',
      defaultOperator: 'equals',
    },
    name: {
      type: 'string',
      defaultOperator: 'contains',
    },
    // Add more filter fields as needed
  },
};
```

## Step 5: Create the Service

Implement the service class that extends `BaseService`:

```typescript
// services/newFeature.service.ts

class NewFeatureService extends BaseService<
  NewFeature,
  Prisma.NewFeatureCreateInput,
  Prisma.NewFeatureUpdateInput,
  NewFeatureModel,
  typeof NewFeatureDTO
> {
  constructor(
    model: NewFeatureModel = new NewFeatureModel(),
    dto: typeof NewFeatureDTO = NewFeatureDTO
  ) {
    super(model, dto);
  }

  // Add custom service methods here
  async getSpecialFeatures(): Promise<NewFeature[]> {
    try {
      // Example custom method
      const features = await this.model.findMany({
        where: { name: { contains: 'Special' } },
        include: { institution: true },
      });

      return features;
    } catch (error) {
      console.error('Error getting special features:', error);
      throw error;
    }
  }
}

export default NewFeatureService;
```

## Step 6: Create the Server Action

Implement the server action class:

```typescript
// actions/newFeature.action.ts
'use server';

// Enhanced filter config with relation information
const newFeatureRelationalConfig: RelationalFilterConfig = {
  defaultPageSize: newFeatureFilterConfig.defaultPageSize,
  defaultSort: newFeatureFilterConfig.defaultSort,
  fields: {
    ...newFeatureFilterConfig.fields,
    // Add relation fields
    institutionName: {
      type: 'string',
      defaultOperator: 'contains',
      relation: 'institution',
      relationField: 'name',
    },
  },
  include: {
    institution: true,
  },
  searchFields: [
    { field: 'name' },
    { relation: 'institution', relationField: 'name', field: 'institutionName' },
  ],
};

class NewFeatureServerAction extends RelationalServerAction<
  NewFeatureFormValues,
  Prisma.NewFeatureCreateInput,
  Prisma.NewFeatureUpdateInput,
  NewFeature,
  NewFeatureService
> {
  constructor(
    schema: z.ZodType<NewFeatureFormValues> = newFeatureSchema,
    service: NewFeatureService = new NewFeatureService()
  ) {
    super(schema, service, newFeatureRelationalConfig);
  }

  // Add custom action methods
  async getSpecialFeatures(): Promise<ActionResult<NewFeature[]>> {
    try {
      const features = await this.service.getSpecialFeatures();
      return { success: true, data: features };
    } catch (error) {
      return this.handleServiceError(error);
    }
  }
}

// Create singleton instance
const newFeatureActionInstance = new NewFeatureServerAction();

// Export action functions for client components
export async function createNewFeature(formData: FormData) {
  return newFeatureActionInstance.create(formData);
}

export async function updateNewFeature(id: string, formData: FormData) {
  return newFeatureActionInstance.update(id, formData);
}

export async function deleteNewFeature(id: string) {
  return newFeatureActionInstance.delete(id);
}

export async function getNewFeatureById(id: string) {
  return newFeatureActionInstance.getById(id);
}

export async function getNewFeaturesWithFilter(formData: FormData) {
  return newFeatureActionInstance.getItemsWithFilter(formData);
}

export async function getSpecialFeatures() {
  return newFeatureActionInstance.getSpecialFeatures();
}
```

## Step 7: Create the Client Component

Implement the client-side component:

```typescript
// app/new-features/page.tsx
'use client';

interface NewFeature {
  id: string;
  name: string;
  institutionName?: string;
  institutionId: string;
  // Add more fields as needed
}

export default function NewFeatureList() {
  const [features, setFeatures] = useState<NewFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Refs for fetch handling
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchUrlRef = useRef<string>('');

  // Use dynamic filters hook
  const {
    prismaFilter,
    setFilter,
    applyFilters,
    setPage,
    setPageSize,
    setSort,
    clearAllFilters,
    getFilterValue,
    page,
    pageSize,
  } = useDynamicFilters(newFeatureFilterConfig);

  // Fetch data when filters change
  useEffect(() => {
    fetchFeatures();
  }, [page, pageSize]);

  // Handle filter input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(name, value);
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters(); // Apply filters to URL and trigger data fetch
  };

  // Function to fetch features with current filters
  const fetchFeatures = async () => {
    // Abort any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      // Get current URL to ensure latest params
      const currentUrl = new URL(window.location.href);
      const urlString = currentUrl.search;

      // Skip if URL hasn't changed (avoid duplicate fetches)
      if (urlString === lastFetchUrlRef.current && urlString !== '') {
        setLoading(false);
        return;
      }

      // Remember this URL
      lastFetchUrlRef.current = urlString;

      // Prepare form data
      const formData = new FormData();
      formData.append('filter', JSON.stringify(prismaFilter));

      // Call server action
      const result = await getNewFeaturesWithFilter(formData);

      // Update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        if (result.success) {
          setFeatures(result.data.data);
          setTotal(result.data.total);
        } else {
          console.error('Error fetching features:', result.errors);
        }
      }
    } catch (error: any) {
      // Only log errors for non-aborted requests
      if (error.name !== 'AbortError') {
        console.error('Error fetching features:', error);
      }
    } finally {
      // Update loading state if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Get filter values for form controls
  const searchValue = getFilterValue('search') || '';
  const institutionValue = getFilterValue('institutionId') || '';

  return (
    <div className="container mx-auto p-4">
      {/* Filter Form */}
      {/* Teacher Table */}
      {/* Pagination */}
      </div>
    )
    </div>
  );
}
```

## Development Checklist

Use this checklist to ensure you've completed all the necessary steps:

- [ ] Define Prisma model and run migrations
- [ ] Create DTO with transformation methods
- [ ] Create model class extending BaseModel
- [ ] Define schema and filter configuration
- [ ] Implement service class with business logic
- [ ] Create server action with relational filtering
- [ ] Implement client component with filters and table
- [ ] Add form component for create/edit operations
- [ ] Implement error handling and validation on the client
- [ ] Add tests for critical functionality
- [ ] Update documentation for the new feature

## Best Practices

1. **Follow Naming Conventions**:

   - Use consistent naming across all layers
   - Use PascalCase for classes and interfaces
   - Use camelCase for variables and functions

2. **Type Safety**:

   - Use TypeScript interfaces and types consistently
   - Leverage Zod for runtime validation
   - Define proper return types for all functions

3. **Error Handling**:

   - Use try/catch blocks in service methods
   - Return consistent ActionResult objects
   - Log errors with appropriate context

4. **Performance**:

   - Use abort controllers to cancel ongoing requests
   - Implement request deduplication to avoid redundant calls
   - Be mindful of relation loading (use selective includes)

5. **Code Organization**:
   - Keep related files in appropriate folders
   - Split large components into smaller ones
   - Use consistent export patterns

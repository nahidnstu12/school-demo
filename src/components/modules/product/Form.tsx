'use client';

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { Spinner } from "@heroui/react";
import { createProduct, getProductById, updateProduct } from "@/backend/actions/product.action";
import { getProductCategories } from "@/backend/actions/product.action";
import { ActionResult } from "@/backend/actions/IServerAction";
import { Product } from "@prisma/client";
import { productSchema } from "@/schemas/product";
import { FormProvider } from "@/components/forms/FormContainer";
import { FormInput } from "@/components/forms/FormInput";
import { FormNumberInput } from "@/components/forms/FormNumberInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { useFormData } from '@/hooks/useFormData';
import { useFormOptions } from '@/hooks/useFormOptions';

export type DrawerMode = "create" | "read" | "edit";

interface ProductFormProps {
  productId?: string;
  mode: DrawerMode;
  isReadOnly?: boolean;
  onSuccess?: () => void;
}

export type ProductData = {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  stock: number;
  sku?: string;
  featured: boolean;
  tags: string[];
};

export function ProductForm({ 
  productId, 
  mode, 
  isReadOnly = false, 
  onSuccess 
}: ProductFormProps) {
  // Initialize action state
  const initialState: ActionResult<Product> = {
    success: false,
    errors: [],
  };

  // Get data for editing
  const { data: productData, isLoading: isLoadingData } = useFormData(
    getProductById,
    productId,
    mode !== "create"
  );

  // Set up React Hook Form with Zod resolver
  const methods = useForm<ProductData>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      stock: 0,
      sku: "",
      featured: false,
      tags: [],
    },
  });

  const formValues = methods.watch();

  // Configuration for categories
  const fieldConfig = useMemo(
    () => ({
      categories: {
        fetchFunction: () => getProductCategories(),
        dependencies: [],
      },
    }),
    []
  );

  // Use the hook with this configuration
  const { options, loading } = useFormOptions(fieldConfig, formValues);

  // Set up action states for create and update
  const [createState, createAction, isCreatePending] = useActionState(
    createProduct, 
    initialState
  );

  // For update mode with validation
  const wrappedUpdateProduct = (state: ActionResult<Product>, formData: FormData) => {
    if (productId) {
      return updateProduct(state, productId, formData);
    }
    return {
      success: false as const,
      errors: [{ field: "root", message: "Missing product ID" }],
    };
  };

  const [updateState, updateAction, isUpdatePending] = useActionState(
    wrappedUpdateProduct,
    initialState
  );

  // Determine which state and action to use based on mode
  const state = mode === "edit" ? updateState : createState;
  const formAction = mode === "edit" ? updateAction : createAction;
  const isPending = isUpdatePending || isCreatePending;

  // Update form values when productData changes
  useEffect(() => {
    if (productData && Object.keys(productData).length > 0) {
      methods.reset({
        name: productData.name || "",
        description: productData.description || "",
        price: Number(productData.price) || 0,
        categoryId: productData.categoryId || "",
        stock: productData.stock || 0,
        sku: productData.sku || "",
        featured: productData.featured || false,
        tags: Array.isArray(productData.tags) 
          ? productData.tags.filter((tag): tag is string => typeof tag === 'string')
          : [],
      });
    }
  }, [productData, methods.reset]);

  // Handle success state
  useEffect(() => {
    if (state.success && onSuccess) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  // Show loading spinner while initial data is loading
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  // Format options for select components
  const categoryOptions = options?.categories?.map(category => ({
    id: String(category.id),
    value: String(category.name),
    label: String(category.name)
  })) || [];

  return (
    <FormProvider<ProductData>
      methods={methods}
      actionMethod={formAction}
      isReadOnly={isReadOnly}
      isPending={isPending}
      serverErrors={state.errors}
      showSuccessMessage={state.success}
      successMessage={`Product successfully ${mode === "edit" ? "updated" : "created"}!`}
      submitText={mode === "edit" ? "Update Product" : "Create Product"}
    >
      <FormInput
        name="name"
        label="Name"
        placeholder="Enter product name"
        isRequired
        isDisabled={isReadOnly || isPending}
      />
      
      <FormTextarea
        name="description"
        label="Description"
        placeholder="Enter product description"
        isDisabled={isReadOnly || isPending}
      />

      <FormNumberInput
        name="price"
        label="Price"
        placeholder="Enter price"
        min={0}
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormSelect
        name="categoryId"
        label="Category"
        options={categoryOptions}
        placeholder={loading?.categories ? "Loading categories..." : "Select category"}
        isRequired
        isDisabled={isReadOnly || isPending || loading?.categories}
        isLoading={loading?.categories}
      />

      <FormNumberInput
        name="stock"
        label="Stock"
        placeholder="Enter stock quantity"
        min={0}
        isRequired
        isDisabled={isReadOnly || isPending}
      />

      <FormInput
        name="sku"
        label="SKU"
        placeholder="Enter SKU"
        isDisabled={isReadOnly || isPending}
      />

      <FormCheckbox
        name="featured"
        label="Featured Product"
        isDisabled={isReadOnly || isPending}
      />
    </FormProvider>
  );
} 
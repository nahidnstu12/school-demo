import { useState, useEffect } from 'react';

import { ActionResult } from '@/actions/IServerAction';

// Generic option type
interface OptionItem {
  id: string;
  name: string;
  [key: string]: any; // Allow for additional properties
}

// Configuration for a dropdown field
interface DropdownConfig<T = any> {
  // Function to fetch options
  fetchFunction: (params?: any) => Promise<ActionResult<T[]>>;
  // Function to transform API response to option items (if needed)
  transformFunction?: (data: T[]) => OptionItem[];
  // Initial params for fetch (like filters)
  initialParams?: any;
  // Dependencies - what other fields this dropdown depends on
  dependencies?: string[];
}

export function useFormOptions<T extends Record<string, any>>(
  // Configuration for each dropdown
  fields: Record<string, DropdownConfig>,
  // Current form values
  formValues: T
) {
  // Store options for each field
  const [options, setOptions] = useState<Record<string, OptionItem[]>>({});
  // Store loading state for each field
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  // Store errors for each field
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Initialize state
  useEffect(() => {
    const initialOptions: Record<string, OptionItem[]> = {};
    const initialLoading: Record<string, boolean> = {};
    const initialErrors: Record<string, string | null> = {};

    Object.keys(fields).forEach((fieldName) => {
      initialOptions[fieldName] = [];
      initialLoading[fieldName] = false;
      initialErrors[fieldName] = null;
    });

    setOptions(initialOptions);
    setLoading(initialLoading);
    setErrors(initialErrors);
  }, [fields]);

  // Function to load options for a specific field
  const loadOptions = async (fieldName: string, params?: any) => {
    const config = fields[fieldName];
    if (!config) return;

    // Check dependencies
    if (config.dependencies && config.dependencies.length > 0) {
      // Skip if any dependency is missing
      const missingDependency = config.dependencies.some((dep) => !formValues[dep]);
      if (missingDependency) {
        setOptions((prev) => ({ ...prev, [fieldName]: [] }));
        return;
      }
    }

    setLoading((prev) => ({ ...prev, [fieldName]: true }));

    try {
      // Merge initial params with provided params
      const fetchParams = { ...config.initialParams, ...params };
      const result = await config.fetchFunction(fetchParams);

      if (result.success) {
        const transformedOptions = config.transformFunction
          ? config.transformFunction(result.data)
          : result.data.map((item: any) => ({
              id: item.id,
              name: item.name,
            }));

        setOptions((prev) => ({ ...prev, [fieldName]: transformedOptions }));
        setErrors((prev) => ({ ...prev, [fieldName]: null }));
      } else {
        setOptions((prev) => ({ ...prev, [fieldName]: [] }));
        setErrors((prev) => ({
          ...prev,
          [fieldName]: result.errors?.[0]?.message || 'Failed to load options',
        }));
      }
    } catch (error) {
      console.error(`Error loading options for ${fieldName}:`, error);
      setOptions((prev) => ({ ...prev, [fieldName]: [] }));
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error instanceof Error ? error.message : 'An error occurred',
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  // Watch for dependency changes and reload options
  useEffect(() => {
    Object.entries(fields).forEach(([fieldName, config]) => {
      if (config.dependencies && config.dependencies.length > 0) {
        // Check if all dependencies have values
        const allDependenciesFilled = config.dependencies.every((dep) => !!formValues[dep]);

        if (allDependenciesFilled) {
          // Create params from dependencies
          const params: Record<string, any> = {};
          config.dependencies.forEach((dep) => {
            params[dep] = formValues[dep];
          });

          loadOptions(fieldName, { where: params });
        } else {
          // Clear options if dependencies are missing
          setOptions((prev) => ({ ...prev, [fieldName]: [] }));
        }
      } else if (!config.dependencies || config.dependencies.length === 0) {
        // Load initial options for fields with no dependencies
        loadOptions(fieldName);
      }
    });
  }, [fields, formValues]);

  return {
    options,
    loading,
    errors,
    loadOptions,
  };
}

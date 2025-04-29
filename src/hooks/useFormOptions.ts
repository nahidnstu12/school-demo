import { useState, useEffect, useRef } from 'react';
import { ActionResult } from '@/backend/actions/IServerAction';

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
  
  // Track previous form values to avoid unnecessary rerenders
  const prevFormValuesRef = useRef<T | null>(null);
  
  // Initialize state once when the hook mounts or fields change
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
    
    // Initial load for fields with no dependencies
    Object.entries(fields).forEach(([fieldName, config]) => {
      if (!config.dependencies || config.dependencies.length === 0) {
        loadOptions(fieldName);
      }
    });
  }, [Object.keys(fields).join(',')]); // Only re-run if field keys change

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

      if (result.success && Array.isArray(result.data)) {
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

  // Watch for actual changes in dependency values
  useEffect(() => {
    // Skip the first render when prevFormValuesRef is null
    if (!prevFormValuesRef.current) {
      prevFormValuesRef.current = { ...formValues };
      return;
    }
    
    // Check each field's dependencies
    Object.entries(fields).forEach(([fieldName, config]) => {
      if (config?.dependencies && config?.dependencies.length > 0) {
        // Only update if a dependency value actually changed
        const dependencyChanged = config.dependencies.some(
          (dep) => prevFormValuesRef.current?.[dep] !== formValues[dep]
        );
        
        if (dependencyChanged) {
          // All dependencies are filled
          const allDependenciesFilled = config.dependencies.every((dep) => !!formValues[dep]);
          
          if (allDependenciesFilled) {
            // Format params correctly for the API
            const whereClause: Record<string, any> = {};
            config.dependencies.forEach((dep) => {
              whereClause[dep] = formValues[dep];
            });
            
            // Load options with correctly formatted parameters
            loadOptions(fieldName, { where: whereClause });
          } else {
            // Clear options if dependencies are missing
            setOptions((prev) => ({ ...prev, [fieldName]: [] }));
          }
        }
      }
    });
    
    // Update the previous values reference
    prevFormValuesRef.current = { ...formValues };
  }, [formValues, fields]);

  return {
    options,
    loading,
    errors,
    loadOptions,
  };
}
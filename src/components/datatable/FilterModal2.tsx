import { useFilterStore } from "@/stores/useFilterStore";
import { FilterConfig } from "@/utils/filter-helpers";
import {
  Button,
  DatePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure
} from "@heroui/react";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { Filter, Search } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from "react";
import { DataTableColumn } from "./types";

interface FilterModalProps {
  columns: DataTableColumn<any>[];
  filterConfig: FilterConfig;
  getFilterValue: (field: string) => any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  // handleSubmit: (e: React.FormEvent) => void;
  // clearFilters: () => void;
  // sortValue: string;
  // handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  // searchValue: string;
  appliedFiltersCount: number;
  additionalFilterFields?: React.ReactNode[];
}

type LocalFilters = Record<string, any>;

export default function FilterModal({
  columns,
  filterConfig,
  getFilterValue,
  handleInputChange,
  // handleSubmit,
  // clearFilters,
  // sortValue,
  // handleSortChange,
  // searchValue,
  appliedFiltersCount,
  additionalFilterFields
}: FilterModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Get filter state and actions from Zustand store
  const {
    appliedFiltersCount: zustandAppliedFiltersCount,
    setFilter,
    setRangeFilter,
    applyFilters,
    clearAllFilters
  } = useFilterStore();
  
  // Local state to store current filter values
  const [localFilters, setLocalFilters] = useState<LocalFilters>({});
  const [localSearchValue, setLocalSearchValue] = useState('');
  const initialRenderRef = useRef(true);
  const isSubmittingRef = useRef(false);

  // Update local state when modal opens - this is key to persisting values!
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened, updating local filters");
      
      // Create an object to store all current filter values
      const currentFilters: LocalFilters = { 
        search: getFilterValue('search') || '' 
      };
      
      // Get filterable columns and add their values to our local state
      columns.filter(col => col.filterable).forEach(column => {
        const value = getFilterValue(column.key);
        
        if (value !== undefined) {
          currentFilters[column.key] = value;
          console.log(`Setting filter for ${column.key}:`, value);
        }
      });
      
      // Update local state with all current values
      setLocalFilters(currentFilters);
      setLocalSearchValue(currentFilters.search || '');
    }
  }, [isOpen, columns, getFilterValue]);

  // Debug to verify filter values are correctly stored
  useEffect(() => {
    if (!initialRenderRef.current && isOpen) {
      console.log("Local filters updated:", localFilters);
    }
    initialRenderRef.current = false;
  }, [localFilters, isOpen]);

  // Get only filterable columns
  const filterableColumns = columns.filter(col => col.filterable);

  // Handle local input changes without updating the Zustand store
  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update local state only
    if (name === 'search') {
      setLocalSearchValue(value);
    } else {
      setLocalFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Forward to parent handler
    handleInputChange(e);
  };

  // Handle date change - only update local state, not the store
  const handleDateChange = (value: CalendarDate | null, name: string) => {
    // Create ISO string with proper time to prevent date shifting
    let dateString = '';
    if (value) {
      try {
        // Get the date from CalendarDate and set it to noon to avoid timezone issues
        const date = value.toDate(getLocalTimeZone());
        
        // Set the time to 12:00:00 (noon) to prevent date boundary issues with timezones
        const adjustedDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12, 0, 0
        );
        
        // Now create ISO string - this will maintain the correct date regardless of timezone
        dateString = adjustedDate.toISOString();
      } catch (e) {
        console.error("Error converting date:", e);
        return;
      }
    }

    // Update local state for dates
    const fieldName = name.startsWith('min') || name.startsWith('max') 
      ? name.substring(3).charAt(0).toLowerCase() + name.substring(4)
      : name;
      
    setLocalFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (name.startsWith('min')) {
        // Handle min date
        if (!updatedFilters[fieldName]) {
          updatedFilters[fieldName] = { min: dateString, max: '' };
        } else if (typeof updatedFilters[fieldName] === 'object') {
          updatedFilters[fieldName].min = dateString;
        } else {
          updatedFilters[fieldName] = { min: dateString, max: '' };
        }
      } else if (name.startsWith('max')) {
        // Handle max date
        if (!updatedFilters[fieldName]) {
          updatedFilters[fieldName] = { min: '', max: dateString };
        } else if (typeof updatedFilters[fieldName] === 'object') {
          updatedFilters[fieldName].max = dateString;
        } else {
          updatedFilters[fieldName] = { min: '', max: dateString };
        }
      } else {
        // Regular date field
        updatedFilters[fieldName] = dateString;
      }
      
      return updatedFilters;
    });

    // Pass the date value to the parent component's handler
    handleInputChange({
      target: {
        name,
        value: dateString
      }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Parse date value to CalendarDate
  const parseDateValue = (dateValue: any): CalendarDate | null => {
    if (!dateValue) return null;
    
    try {
      // If dateValue is already a CalendarDate, return it
      if (dateValue instanceof CalendarDate) {
        return dateValue;
      }
      
      // Handle string values (ISO date strings)
      if (typeof dateValue === 'string') {
        // Parse ISO date string to native Date object first
        const date = new Date(dateValue);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          return null;
        }
        
        // Convert Date to CalendarDate
        return new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1, // JavaScript months are 0-based
          date.getDate()
        );
      }
      
      // Handle JavaScript Date objects
      if (dateValue instanceof Date) {
        return new CalendarDate(
          dateValue.getFullYear(),
          dateValue.getMonth() + 1, // JavaScript months are 0-based
          dateValue.getDate()
        );
      }
      
      return null;
    } catch (e) {
      console.error("Error parsing date:", e);
      return null;
    }
  };

  // Get the current value for a field from local state or from the store
  const getCurrentValue = (fieldKey: string) => {
    return localFilters[fieldKey] !== undefined ? localFilters[fieldKey] : getFilterValue(fieldKey);
  };

  // Apply all local filters to the Zustand store
  const applyLocalFiltersToStore = () => {
    // First set the search filter if it exists
    if (localSearchValue) {
      setFilter('search', 'contains', localSearchValue);
    } else {
      setFilter('search', 'contains', '');
    }
    
    // Process all other filters
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === 'search') return; // Skip search as we already handled it
      
      const column = columns.find((col) => col.key === key);
      
      if (!column) return;
      
      if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
        // Handle range filters
        setRangeFilter(
          key,
          value.min ? new Date(value.min) : undefined,
          value.max ? new Date(value.max) : undefined
        );
      } else if (key === 'status') {
        // Handle status filter
        if (value === '') {
          setFilter(key, 'equals', null);
        } else {
          setFilter(key, 'equals', value === 'true');
        }
      } else {
        // Handle standard filters
        const operator = column.filterType === 'select' ? 'equals' : 'contains';
        setFilter(key, filterConfig.fields[key]?.defaultOperator || operator, value);
      }
    });
  };

  // Handle form submission from modal
  const handleModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Check if we're already submitting to prevent double fetch
    if (isSubmittingRef.current) {
      return;
    }
    
    // Set submitting flag
    isSubmittingRef.current = true;
    
    // Apply all local filters to the store
    applyLocalFiltersToStore();
    
    // Close the modal first
    onClose();
    
    // Use setTimeout to ensure the modal close animation completes
    // This prevents the navigation from happening while the modal is closing
    setTimeout(() => {
      // Then apply filters (this will update URL and fetch data)
      applyFilters();
      
      // Reset submitting flag after a delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }, 100);
  };

  // Handle clear filters from modal
  const handleClearFilters = () => {
    // Check if we're already submitting
    if (isSubmittingRef.current) {
      return;
    }
    
    // Set submitting flag
    isSubmittingRef.current = true;
    
    // Clear local state first
    setLocalFilters({});
    setLocalSearchValue('');
    
    // Close the modal
    onClose();
    
    // Use setTimeout to ensure the modal close animation completes
    setTimeout(() => {
      // Then clear filters (this will update URL and fetch data)
      clearAllFilters();
      
      // Reset submitting flag after a delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }, 100);
  };

  const renderFilterField = (column: DataTableColumn<any>) => {
    if (column.key === 'search') return null;
    
    const fieldConfig = filterConfig.fields[column.key];
    if (!fieldConfig) return null;

    const filterValue = getCurrentValue(column.key);
    const dateRange = filterValue && typeof filterValue === 'object' ? filterValue : { min: '', max: '' };
    
    switch (column.filterType) {
      case 'select':
        return (
          <div key={column.key}>
            <Select
              placeholder={`Select ${column.header}`}
              label={column.header}
              labelPlacement="outside"
              name={column.key}
              defaultSelectedKeys={filterValue !== undefined ? [String(filterValue)] : []}
              selectedKeys={filterValue !== undefined ? [String(filterValue)] : []}
              onChange={handleLocalInputChange}
              variant="bordered"
              className="w-full"
              aria-label={`Filter by ${column.header}`}
            >
              <SelectItem key="" textValue="All">All</SelectItem>
              <>{(column.filterOptions || []).map((option) => (
                <SelectItem 
                  key={String(option.value)} 
                  textValue={option.label}
                >
                  {option.label}
                </SelectItem>
              ))}</>
              
            </Select>
          </div>
        );
      
      case 'dateRange':
        return (
          <div key={column.key} className="col-span-1 sm:col-span-2 md:col-span-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <DatePicker
                  label={`${column.header} From`}
                  name={`min${column.key}`}
                  value={parseDateValue(dateRange.min)}
                  onChange={(value) => handleDateChange(value, `min${column.key}`)}
                  variant="bordered"
                  className="w-full"
                  labelPlacement="outside"
                  aria-label={`${column.header} start date`}
                />
              </div>
              <div>
                <DatePicker
                  label={`${column.header} To`}
                  name={`max${column.key}`}
                  value={parseDateValue(dateRange.max)}
                  onChange={(value) => handleDateChange(value, `max${column.key}`)}
                  variant="bordered"
                  className="w-full"
                  labelPlacement="outside"
                  aria-label={`${column.header} end date`}
                />
              </div>
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={column.key}>
            <Select
              placeholder={`Select ${column.header}`}
              label={column.header}
              labelPlacement="outside"
              name={column.key}
              defaultSelectedKeys={filterValue !== undefined ? [String(filterValue)] : []}
              selectedKeys={filterValue !== undefined ? [String(filterValue)] : []}
              onChange={handleLocalInputChange}
              variant="bordered"
              className="w-full"
              aria-label={`Filter by ${column.header}`}
            >
              <SelectItem key="" textValue="All">All</SelectItem>
              <SelectItem key="true" textValue="Yes">Yes</SelectItem>
              <SelectItem key="false" textValue="No">No</SelectItem>
            </Select>
          </div>
        );

      case 'date':
        return (
          <div key={column.key}>
            <DatePicker
              label={column.header}
              name={column.key}
              value={parseDateValue(filterValue)}
              onChange={(value) => handleDateChange(value, column.key)}
              variant="bordered"
              className="w-full"
              labelPlacement="outside"
              aria-label={`Select ${column.header} date`}
            />
          </div>
        );

      // Text input (default)
      default:
        return (
          <div key={column.key}>
            <Input
              type="text"
              label={column.header}
              labelPlacement="outside"
              name={column.key}
              value={filterValue || ''}
              onChange={handleLocalInputChange}
              variant="bordered"
              className="w-full"
              placeholder={`Search by ${column.header.toLowerCase()}...`}
              aria-label={`Search by ${column.header}`}
            />
          </div>
        );
    }
  };

  return (
    <>
      {/* Compact Filter Button */}
      <Button 
        variant="flat" 
        color="default" 
        startContent={<Filter size={18} />}
        endContent={appliedFiltersCount > 0 ? 
          <span className="ml-1 bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {appliedFiltersCount}
          </span> : null
        }
        onPress={onOpen}
        className="w-auto"
      >
        Filters
      </Button>

      {/* Filter Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {isOpen && ( // Only render the form when modal is open to ensure fresh data
            <form onSubmit={handleModalSubmit}>
              <ModalHeader className="flex flex-col gap-1">Filters</ModalHeader>
              <ModalBody>
                {/* Global Search */}
                {filterConfig?.fields?.search && (
                  <div className="w-full mb-4">
                    <Input
                    label="Global Search"
                    isClearable
                    className="w-full"
                    placeholder="Search anything..."
                    startContent={<Search className="text-default-300" size={18} />}
                    name="search"
                    value={localSearchValue}
                    onChange={handleLocalInputChange}
                    aria-label="Global search across all columns"
                  />
                </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Filter Fields */}
                  {filterableColumns.map(renderFilterField)}
                  
                  {/* Additional Filter Fields */}
                  {additionalFilterFields && additionalFilterFields.map((field, index) => (
                    <div key={`additional-filter-${index}`}>
                      {field}
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="flat" 
                  color="danger" 
                  onPress={handleClearFilters}
                  isDisabled={isSubmittingRef.current}
                >
                  Clear Filters
                </Button>
                <Button 
                  type="submit" 
                  color="primary"
                  isDisabled={isSubmittingRef.current}
                >
                  Apply Filters
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
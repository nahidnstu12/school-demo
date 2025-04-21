import { FilterConfig } from '@/utils/filter-helpers';
import { Button, DatePicker, Input, Select, SelectItem } from '@heroui/react';
import { CalendarDate, getLocalTimeZone } from '@internationalized/date';

import { Search } from 'lucide-react';
import { FormEvent } from 'react';
import { DataTableColumn } from './types';
import React from 'react';

interface FilterFormProps {
  columns: DataTableColumn<any>[];
  filterConfig: FilterConfig;
  getFilterValue: (field: string) => any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  clearFilters: () => void;
  sortValue: string;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  searchValue: string;
}

export default function FilterForm({
  columns,
  filterConfig,
  getFilterValue,
  handleInputChange,
  handleSubmit,
  clearFilters,
  sortValue,
  handleSortChange,
  searchValue,
}: FilterFormProps) {
  // Get only filterable columns
  const filterableColumns = columns.filter((col) => col.filterable);

  // Fixed: Handle date properly to ensure consistent format and prevent date shifting
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
          12,
          0,
          0
        );

        // Now create ISO string - this will maintain the correct date regardless of timezone
        dateString = adjustedDate.toISOString();
      } catch (e) {
        console.error('Error converting date:', e);
        return;
      }
    }

    // Pass the date value to the parent component's handler
    handleInputChange({
      target: {
        name,
        value: dateString,
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // Fixed: Parse date value to CalendarDate properly with robust type checking
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
      console.error('Error parsing date:', e);
      return null;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>

        {/* Global Search */}
        <div className="w-full mb-4">
          <Input
            label="Global Search"
            isClearable
            className="w-full"
            placeholder="Search anything..."
            startContent={<Search className="text-default-300" />}
            name="search"
            value={searchValue}
            onChange={handleInputChange}
            aria-label="Global search across all columns"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Filter Fields */}
          {filterableColumns.map((column) => {
            if (column.key === 'search') return null; // Skip search as we have a separate field for it

            const fieldConfig = filterConfig.fields[column.key];
            if (!fieldConfig) return null;

            const filterValue = getFilterValue(column.key);
            const dateRange = filterValue || { min: '', max: '' };

            switch (column.filterType) {
              case 'select':
                return (
                  <div key={column.key}>
                    <Select
                      // label={column.header}
                      placeholder={`Select ${column.header}`}
                      name={column.key}
                      value={filterValue === undefined ? '' : String(filterValue)}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                      aria-label={`Filter by ${column.header}`}
                    >
                      <SelectItem key="" textValue="All">
                        All
                      </SelectItem>
                      <>
                        {(column.filterOptions || []).map((option) => (
                          <SelectItem key={String(option.value)} textValue={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </>
                    </Select>
                  </div>
                );

              case 'dateRange':
                return (
                  <div key={column.key} className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <DatePicker
                          label={`${column.header} From`}
                          name={`min${column.key}`}
                          value={parseDateValue(dateRange.min)}
                          onChange={(value) => handleDateChange(value, `min${column.key}`)}
                          variant="bordered"
                          className="w-full"
                          labelPlacement="outside-left"
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
                          labelPlacement="outside-left"
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
                      // label={column.header}
                      placeholder={`Select ${column.header}`}
                      name={column.key}
                      value={filterValue === undefined ? '' : String(filterValue)}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                      aria-label={`Filter by ${column.header}`}
                    >
                      <SelectItem key="empty-option" textValue="All">
                        All
                      </SelectItem>
                      <SelectItem key="option-true" textValue="Yes">
                        Yes
                      </SelectItem>
                      <SelectItem key="option-false" textValue="No">
                        No
                      </SelectItem>
                    </Select>
                  </div>
                );

              case 'date':
                // For single date fields
                return (
                  <div key={column.key}>
                    <DatePicker
                      // label={column.header}
                      name={column.key}
                      value={parseDateValue(filterValue)}
                      onChange={(value) => handleDateChange(value, column.key)}
                      variant="bordered"
                      className="w-full"
                      labelPlacement="outside-left"
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
                      // label={column.header}
                      name={column.key}
                      value={filterValue || ''}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                      placeholder={`Search by ${column.header.toLowerCase()}...`}
                      aria-label={`Search by ${column.header}`}
                    />
                  </div>
                );
            }
          })}

          {/* Sort dropdown */}
          <div>
            <Select
              // label="Sort By"
              placeholder="Sort By"
              name="sort"
              value={sortValue}
              onChange={handleSortChange}
              variant="bordered"
              className="w-full"
              aria-label="Sort results by field and direction"
            >
              {columns
                .filter((col) => col.sortable)
                .flatMap((column) => [
                  <SelectItem key={`${column.key}:asc`} textValue={`${column.header} (A-Z)`}>
                    {column.header} (A-Z)
                  </SelectItem>,
                  <SelectItem key={`${column.key}:desc`} textValue={`${column.header} (Z-A)`}>
                    {column.header} (Z-A)
                  </SelectItem>,
                ])}
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button type="submit" color="primary">
            Apply Filters
          </Button>
          <Button type="button" variant="flat" onPress={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </form>
    </div>
  );
}

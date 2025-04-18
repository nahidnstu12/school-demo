import { FilterConfig } from "@/utils/filter-helpers";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Checkbox
} from "@heroui/react";
  
import { Search } from 'lucide-react';
import { FormEvent } from "react";
import { DataTableColumn } from ".";

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
  searchValue
}: FilterFormProps) {
  // Get only filterable columns
  const filterableColumns = columns.filter(col => col.filterable);

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
            placeholder="Search name, email, phone, etc..."
            startContent={<Search className="text-default-300" />}
            name="search"
            value={searchValue}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Filter Fields */}
          {filterableColumns.map((column) => {
            if (column.key === 'search') return null; // Skip search as we have a separate field for it
            
            const fieldConfig = filterConfig.fields[column.key];
            if (!fieldConfig) return null;

            const filterValue = getFilterValue(column.key);
            
            switch (column.filterType) {
              case 'select':
                return (
                  <div key={column.key}>
                    <Select
                      label={column.header}
                      placeholder={`Select ${column.header}`}
                      name={column.key}
                      value={filterValue === undefined ? '' : String(filterValue)}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                    >
                      <SelectItem key="">All</SelectItem>
                      <>
                        {(column.filterOptions || []).map((option) => (
                          <SelectItem key={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </>
                    </Select>
                  </div>
                );
              
              case 'dateRange':
                const dateRange = filterValue || { min: '', max: '' };
                return (
                  <div key={column.key} className="col-span-1 sm:col-span-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="date"
                          label={`${column.header} From`}
                          name={`min${column.key}`}
                          value={
                            dateRange.min
                              ? new Date(dateRange.min).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={handleInputChange}
                          variant="bordered"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Input
                          type="date"
                          label={`${column.header} To`}
                          name={`max${column.key}`}
                          value={
                            dateRange.max
                              ? new Date(dateRange.max).toISOString().split('T')[0]
                              : ''
                          }
                          onChange={handleInputChange}
                          variant="bordered"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              
              case 'checkbox':
                return (
                  <div key={column.key}>
                    <Select
                      label={column.header}
                      name={column.key}
                      value={filterValue === undefined ? '' : String(filterValue)}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                    >
                      <SelectItem key="empty-option">All</SelectItem>
                      <SelectItem key="option-true">Yes</SelectItem>
                      <SelectItem key="option-false">No</SelectItem>
                    </Select>
                  </div>
                );
              
              case 'date':
                return (
                  <div key={column.key}>
                    <Input
                      type="date"
                      label={column.header}
                      name={column.key}
                      value={filterValue || ''}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
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
                      name={column.key}
                      value={filterValue || ''}
                      onChange={handleInputChange}
                      variant="bordered"
                      className="w-full"
                      placeholder={`Search by ${column.header.toLowerCase()}...`}
                    />
                  </div>
                );
            }
          })}
          
          {/* Sort dropdown */}
          <div>
            <Select
              label="Sort By"
              name="sort"
              value={sortValue}
              onChange={handleSortChange}
              variant="bordered"
              className="w-full"
            >
              {columns
                .filter((col) => col.sortable)
                .flatMap((column) => [
                  <SelectItem key={`${column.key}:asc`}>
                    {column.header} (A-Z)
                  </SelectItem>,
                  <SelectItem key={`${column.key}:desc`}>
                    {column.header} (Z-A)
                  </SelectItem>,
                ])}
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            type="submit" 
            color="primary"
          >
            Apply Filters
          </Button>
          <Button 
            type="button" 
            variant="flat" 
            onPress={clearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </form>
    </div>
  );
}
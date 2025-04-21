// components/datatable/TopContent.tsx
import React from 'react';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ChevronDown, Plus } from 'lucide-react';
import FilterModal from './FilterModal';
import { DataTableColumn } from './types';
import { FilterConfig } from '@/utils/filter-helpers';
import { Selection } from "@heroui/react";

interface TopContentProps<T> {
  title?: string;
  columns: DataTableColumn<T>[];
  filterConfig: FilterConfig;
  getFilterValue: (field: string) => any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  clearFilters: () => void;
  sortValue: string;
  handleSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  searchValue: string;
  appliedFiltersCount: number;
  visibleColumns: Selection;
  setVisibleColumns: (keys: Selection) => void;
  onAddNew?: () => void;
  additionalFilters?: React.ReactNode[];
}

export function TopContent<T>({
  title,
  columns,
  filterConfig,
  getFilterValue,
  handleInputChange,
  handleSubmit,
  clearFilters,
  sortValue,
  handleSortChange,
  searchValue,
  appliedFiltersCount,
  visibleColumns,
  setVisibleColumns,
  onAddNew,
  additionalFilters
}: TopContentProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-4">
        <div className="flex-1">
          {title && <h1 className="text-xl font-bold mb-2 sm:mb-0">{title}</h1>}
        </div>
        
        {/* Filters and Actions Row */}
        <div className="flex gap-2">
          <FilterModal
            columns={columns}
            filterConfig={filterConfig}
            getFilterValue={getFilterValue}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            clearFilters={clearFilters}
            sortValue={sortValue}
            handleSortChange={handleSortChange}
            searchValue={searchValue}
            appliedFiltersCount={appliedFiltersCount}
            additionalFilterFields={additionalFilters}
          />
          <div className="flex gap-2">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<ChevronDown />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.key} className="capitalize">
                    {column.header}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            
            {onAddNew && (
              <Button color="primary" endContent={<Plus />} onPress={onAddNew}>
                Add New
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Additional custom filters */}
      {/* {additionalFilters && additionalFilters.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {additionalFilters.map((filter, index) => (
              <div key={`inline-filter-${index}`}>
                {filter}
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
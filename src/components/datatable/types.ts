// components/datatable/types.ts
import React from 'react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'checkbox' | 'number';
  filterOptions?: { label: string; value: string | boolean }[];
}
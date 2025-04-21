// 'use client';

// import { ActionResult } from '@/actions/IServerAction';
// import { useDynamicFilters } from '@/hooks/useDynamicFilter';
// import { FilterConfig } from '@/utils/filter-helpers';
// import {
//   Button,
//   Dropdown,
//   DropdownItem,
//   DropdownMenu,
//   DropdownTrigger,
//   Pagination,
//   Select,
//   Selection,
//   SelectItem,
//   SortDescriptor,
//   Table,
//   TableBody,
//   TableCell,
//   TableColumn,
//   TableHeader,
//   TableRow
// } from "@heroui/react";
// import { ChevronDown, Plus } from 'lucide-react';
// import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import FilterForm from './FilterForm';

// // Define column configuration type
// export interface DataTableColumn<T> {
//   key: string;
//   header: string;
//   cell?: (item: T) => React.ReactNode;
//   sortable?: boolean;
//   filterable?: boolean;
//   filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'checkbox';
//   filterOptions?: { label: string; value: string | boolean }[];
// }

// // Filter component props

// // DataTable props
// interface DataTableProps<T> {
//   columns: DataTableColumn<T>[];
//   filterConfig: FilterConfig;
//   fetchData: (formData: FormData) => Promise<ActionResult<any>>;
//   initialVisibleColumns?: string[];
//   onAddNew?: () => void;
//   statusOptions?: { name: string; uid: string }[];
//   selectionMode?: "none" | "single" | "multiple";
//   onSelectionChange?: (keys: Selection) => void;
//   relationshipFilters?: {
//     parentField: string;
//     childField: string;
//     onParentChange?: (value: string) => void;
//   }[];
//   emptyContent?: React.ReactNode;
//   renderCell?: (item: T, columnKey: string) => React.ReactNode;
//   additionalFilters?: React.ReactNode;
//   title?: string;
// }

// // Filter Form Component

// export function DataTable<T extends Record<string, any>>({
//   columns,
//   filterConfig,
//   fetchData,
//   initialVisibleColumns,
//   onAddNew,
//   selectionMode = "none",
//   onSelectionChange,
//   relationshipFilters,
//   emptyContent = "No data found",
//   renderCell: customRenderCell,
//   additionalFilters,
//   title
// }: DataTableProps<T>) {
//   // Use the dynamic filters hook
//   const {
//     prismaFilter,
//     setFilter,
//     setRangeFilter,
//     applyFilters,
//     setPage,
//     setPageSize,
//     setSort,
//     clearAllFilters,
//     getFilterValue,
//     page,
//     pageSize,
//   } = useDynamicFilters(filterConfig);

//   // Calculate default visible columns
//   const defaultVisibleColumns = initialVisibleColumns ||
//     columns.slice(0, Math.min(4, columns.length)).map(col => col.key);

//   // State for HeroUI table
//   const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
//   const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(defaultVisibleColumns));
//   const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
//     column: columns.find(col => col.sortable)?.key || "",
//     direction: "ascending"
//   });

//   // State for data and metadata
//   const [data, setData] = useState<T[]>([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // Refs for request tracking
//   const abortControllerRef = useRef<AbortController | null>(null);
//   const lastFetchUrlRef = useRef<string>('');
//   const pendingFetchRef = useRef<string | null>(null);

//   // Process selection changes if callback provided
//   useEffect(() => {
//     if (onSelectionChange) {
//       onSelectionChange(selectedKeys);
//     }
//   }, [selectedKeys, onSelectionChange]);

//   // Process visible columns
//   const headerColumns = useMemo(() => {
//     if (visibleColumns === "all") return columns;
//     return columns.filter((column) =>
//       Array.from(visibleColumns as Set<string>).includes(column.key)
//     );
//   }, [visibleColumns, columns]);

//   // Function to fetch data based on current filters
//   const fetchDataWithFilters = async () => {
//     // Abort any ongoing fetch
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }

//     // Create a new abort controller for this request
//     abortControllerRef.current = new AbortController();

//     setLoading(true);

//     try {
//       // Get the CURRENT URL from the browser to ensure we're using the latest params
//       const currentUrl = new URL(window.location.href);
//       const urlString = currentUrl.search;

//       // Skip if URL hasn't changed
//       if (urlString === lastFetchUrlRef.current && urlString !== '') {
//         console.log('Skipping duplicate fetch for URL:', urlString);
//         setLoading(false);
//         return;
//       }

//       // Remember this URL for future deduplication
//       lastFetchUrlRef.current = urlString;

//       // Send to server
//       const formData = new FormData();
//       formData.append('filter', JSON.stringify(prismaFilter));

//       console.log('Fetching data with filter:', prismaFilter);

//       const result = await fetchData(formData);

//       // Only update state if this request wasn't aborted
//       if (!abortControllerRef.current.signal.aborted) {
//         if (result.success) {
//           setData(result.data.data);
//           setTotal(result.data.total);
//         } else {
//           console.error('Error fetching data:', result.errors);
//         }
//       }
//     } catch (error: any) {
//       // Only log errors for non-aborted requests
//       if (error.name !== 'AbortError') {
//         console.error('Error fetching data:', error);
//       }
//     } finally {
//       // Only update loading state if this request wasn't aborted
//       if (!abortControllerRef.current?.signal.aborted) {
//         setLoading(false);
//       }
//     }
//   };

//   // Fetch data when prismaFilter changes
//   useEffect(() => {
//     if (Object.keys(prismaFilter).length > 0) {
//       // Generate a unique ID for this fetch operation
//       const fetchId = Date.now().toString();
//       pendingFetchRef.current = fetchId;

//       // Small delay to ensure URL has been updated in the browser
//       setTimeout(() => {
//         // Only proceed if this is still the most recent fetch request
//         if (pendingFetchRef.current === fetchId) {
//           fetchDataWithFilters();
//         }
//       }, 50);
//     }
//   }, [prismaFilter]);

//   // Handle form input changes (only updates form state, not URL)
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;

//     if (type === 'checkbox') {
//       const checked = (e.target as HTMLInputElement).checked;
//       setFilter(name, 'equals', checked);
//     } else if (name.startsWith('min') && name.length > 3) {
//       // Handle date range (min values)
//       const fieldName = name.substring(3).charAt(0).toLowerCase() + name.substring(4);
//       const minDate = value;
//       const maxDate = getFilterValue(fieldName)?.max;
//       setRangeFilter(
//         fieldName,
//         minDate ? new Date(minDate) : undefined,
//         maxDate ? new Date(maxDate) : undefined
//       );
//     } else if (name.startsWith('max') && name.length > 3) {
//       // Handle date range (max values)
//       const fieldName = name.substring(3).charAt(0).toLowerCase() + name.substring(4);
//       const minDate = getFilterValue(fieldName)?.min;
//       const maxDate = value;
//       setRangeFilter(
//         fieldName,
//         minDate ? new Date(minDate) : undefined,
//         maxDate ? new Date(maxDate) : undefined
//       );
//     } else {
//       // For standard text inputs and selects
//       const column = columns.find(col => col.key === name);
//       const operator = column?.filterType === 'select' ? 'equals' : 'contains';

//       if (name === 'status' && value === '') {
//         setFilter(name, 'equals', null);
//       } else if (name === 'status') {
//         setFilter(name, 'equals', value === 'true');
//       } else {
//         setFilter(name, filterConfig.fields[name]?.defaultOperator || operator, value);
//       }
//     }

//     // Check for relationship filters
//     if (relationshipFilters) {
//       const isParentField = relationshipFilters.some(rf => rf.parentField === name);
//       if (isParentField) {
//         // Notify about parent field change
//         const relFilter = relationshipFilters.find(rf => rf.parentField === name);
//         if (relFilter?.onParentChange) {
//           relFilter.onParentChange(value);
//         }
//       }
//     }
//   };

//   // Handle sort change
//   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const [field, direction] = e.target.value.split(':');
//     setSort(field, direction as 'asc' | 'desc');
//   };

//   // Handle form submission - this is when we apply filters to URL and trigger data fetch
//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     applyFilters(); // Apply form filters to URL and trigger data fetch
//   };

//   // Handle page change
//   const handlePageChange = (newPage: number) => {
//     setPage(newPage); // This will update URL and trigger data fetch
//   };

//   // Handle page size change
//   const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newSize = Number(e.target.value);
//     console.log("Page size changed to:", newSize);

//     // Update the pageSize state immediately to reflect in UI
//     setPageSize(newSize);

//     // Force a re-render by using setTimeout
//     setTimeout(() => {
//       // This will update URL and trigger data fetch in the hook
//       setPage(1);
//     }, 0);
//   };

//   // Clear all filters
//   const clearFilters = () => {
//     clearAllFilters(); // This will also trigger data fetch
//   };

//   // Default render cell implementation
//   const renderCellDefault = useCallback((item: T, columnKey: string) => {
//     const column = columns.find(col => col.key === columnKey);

//     if (column?.cell) {
//       return column.cell(item);
//     }

//     return item[columnKey];
//   }, [columns]);

//   // Use custom or default cell renderer
//   const cellRenderer = customRenderCell || renderCellDefault;

//   // Calculate pagination values
//   const pages = Math.ceil(total / pageSize);
//   const startItem = (page - 1) * pageSize + 1;
//   const endItem = Math.min(page * pageSize, total);

//   // Pagination handlers
//   const onNextPage = useCallback(() => {
//     if (page < pages) {
//       handlePageChange(page + 1);
//     }
//   }, [page, pages]);

//   const onPreviousPage = useCallback(() => {
//     if (page > 1) {
//       handlePageChange(page - 1);
//     }
//   }, [page]);

//   // Get filter values
//   const searchValue = getFilterValue('search') || '';

//   // Determine current sort value for the select input
//   const sortValue = useMemo(() => {
//     if (prismaFilter && 'orderBy' in prismaFilter) {
//       const orderBy = prismaFilter.orderBy as Record<string, string>;
//       const field = Object.keys(orderBy)[0];
//       const direction = orderBy[field];
//       if (field && direction) {
//         return `${field}:${direction}`;
//       }
//     }
//     return filterConfig.defaultSort
//       ? `${filterConfig.defaultSort.field}:${filterConfig.defaultSort.direction}`
//       : columns.find(col => col.sortable)
//         ? `${columns.find(col => col.sortable)?.key}:asc`
//         : '';
//   }, [prismaFilter, columns, filterConfig]);

//   // Top content with filter visibility toggle and add button
//   const topContent = useMemo(() => (
//     <div className="flex justify-between items-center py-4">
//       <div className="flex-1">
//         {title && <h1 className="text-xl font-bold">{title}</h1>}
//       </div>
//       <div className="flex gap-3">
//         <Dropdown>
//           <DropdownTrigger className="hidden sm:flex">
//             <Button endContent={<ChevronDown />} variant="flat">
//               Columns
//             </Button>
//           </DropdownTrigger>
//           <DropdownMenu
//             disallowEmptySelection
//             aria-label="Table Columns"
//             closeOnSelect={false}
//             selectedKeys={visibleColumns}
//             selectionMode="multiple"
//             onSelectionChange={setVisibleColumns}
//           >
//             {columns.map((column) => (
//               <DropdownItem key={column.key} className="capitalize">
//                 {column.header}
//               </DropdownItem>
//             ))}
//           </DropdownMenu>
//         </Dropdown>
//         {onAddNew && (
//           <Button color="primary" endContent={<Plus />} onPress={onAddNew}>
//             Add New
//           </Button>
//         )}
//       </div>
//     </div>
//   ), [columns, visibleColumns, onAddNew, title]);

//   // Table header with counts and page size selector
//   const tableHeaderContent = useMemo(() => (
//     <div className="flex justify-between items-center py-2">
//       <div className="text-sm text-default-400">
//         {loading
//           ? 'Loading...'
//           : total > 0
//             ? `Showing ${startItem} to ${endItem} of ${total} entries`
//             : 'No entries found'
//         }
//       </div>
//       <div className="flex items-center gap-2">
//         <span className="text-sm text-default-400">Rows per page:</span>
//         <Select
//             className="max-w-sm"
//             variant={"bordered"}
//             onChange={handlePageSizeChange}
//             value={pageSize}
//           >
//             <SelectItem key="10">10</SelectItem>
//             <SelectItem key="25">25</SelectItem>
//             <SelectItem key="50">50</SelectItem>
//             <SelectItem key="100">100</SelectItem>
//           </Select>
//         {/* <select
//           className="bg-transparent text-sm outline-none border border-gray-300 rounded px-2 py-1"
//           value={pageSize}
//           onChange={handlePageSizeChange}
//         >
//           <option value="10">10</option>
//           <option value="25">25</option>
//           <option value="50">50</option>
//           <option value="100">100</option>
//         </select> */}
//       </div>
//     </div>
//   ), [loading, total, startItem, endItem, pageSize]);

//   // Bottom content with pagination
//   const bottomContent = useMemo(() => {
//     return total > 0 ? (
//       <div className="py-2 px-2 flex justify-between items-center">
//         <span className="w-[30%] text-small text-default-400">
//           {selectedKeys === "all"
//             ? "All items selected"
//             : `${selectedKeys instanceof Set ? selectedKeys.size : 0} of ${total} selected`}
//         </span>
//         <Pagination
//           isCompact
//           showControls
//           showShadow
//           color="primary"
//           page={page}
//           total={pages}
//           onChange={handlePageChange}
//         />
//         <div className="hidden sm:flex w-[30%] justify-end gap-2">
//           <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>
//             Previous
//           </Button>
//           <Button isDisabled={page >= pages} size="sm" variant="flat" onPress={onNextPage}>
//             Next
//           </Button>
//         </div>
//       </div>
//     ) : null;
//   }, [selectedKeys, total, page, pages, onPreviousPage, onNextPage]);

//   return (
//     <div className="space-y-4">
//       {/* Filter Form */}
//       <FilterForm
//         columns={columns}
//         filterConfig={filterConfig}
//         getFilterValue={getFilterValue}
//         handleInputChange={handleInputChange}
//         handleSubmit={handleSubmit}
//         clearFilters={clearFilters}
//         sortValue={sortValue}
//         handleSortChange={handleSortChange}
//         searchValue={searchValue}
//       />

//       {/* Additional custom filters */}
//       {additionalFilters}

//       {/* Top Content */}
//       {topContent}

//       {/* Table Header Content */}
//       {tableHeaderContent}

//       {/* Table */}
//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <Table
//           isHeaderSticky
//           aria-label="Data table with dynamic filters"
//           bottomContent={bottomContent}
//           bottomContentPlacement="outside"
//           classNames={{
//             wrapper: "max-h-[600px]"
//           }}
//           selectedKeys={selectedKeys}
//           selectionMode={selectionMode}
//           sortDescriptor={sortDescriptor}
//           onSelectionChange={setSelectedKeys}
//           onSortChange={setSortDescriptor}
//         >
//           <TableHeader columns={headerColumns}>
//             {(column) => (
//               <TableColumn
//                 key={column.key}
//                 align={column.key === "actions" ? "center" : "start"}
//                 allowsSorting={column.sortable}
//               >
//                 {column.header}
//               </TableColumn>
//             )}
//           </TableHeader>
//           <TableBody
//             emptyContent={emptyContent}
//             items={data}
//             isLoading={loading}
//             loadingContent="Loading..."
//           >
//             {(item) => (
//               <TableRow key={item.id || `row-${data.indexOf(item)}`}>
//                 {(columnKey) => (
//                   <TableCell>{cellRenderer(item, columnKey as string)}</TableCell>
//                 )}
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }

'use client';

import { ActionResult } from '@/actions/IServerAction';
import { useDynamicFilters } from '@/hooks/useDynamicFilter';
import { FilterConfig } from '@/utils/filter-helpers';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Select,
  Selection,
  SelectItem,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { ChevronDown, Plus } from 'lucide-react';
import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FilterForm from './FilterForm';

// Define column configuration type
export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select' | 'date' | 'dateRange' | 'checkbox';
  filterOptions?: { label: string; value: string | boolean }[];
}

// DataTable props
interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  filterConfig: FilterConfig;
  fetchData: (formData: FormData) => Promise<ActionResult<any>>;
  initialVisibleColumns?: string[];
  onAddNew?: () => void;
  statusOptions?: { name: string; uid: string }[];
  selectionMode?: 'none' | 'single' | 'multiple';
  onSelectionChange?: (keys: Selection) => void;
  relationshipFilters?: {
    parentField: string;
    childField: string;
    onParentChange?: (value: string) => void;
  }[];
  emptyContent?: React.ReactNode;
  additionalFilters?: React.ReactNode;
  title?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  filterConfig,
  fetchData,
  initialVisibleColumns,
  onAddNew,
  selectionMode = 'none',
  onSelectionChange,
  relationshipFilters,
  emptyContent = 'No data found',
  additionalFilters,
  title,
}: DataTableProps<T>) {
  // Use the dynamic filters hook
  const {
    prismaFilter,
    setFilter,
    setRangeFilter,
    applyFilters,
    setPage,
    setPageSize,
    setSort,
    clearAllFilters,
    getFilterValue,
    page,
    pageSize,
  } = useDynamicFilters(filterConfig);

  // Calculate default visible columns
  const defaultVisibleColumns =
    initialVisibleColumns || columns.slice(0, Math.min(4, columns.length)).map((col) => col.key);

  // State for HeroUI table
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(defaultVisibleColumns));
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: columns.find((col) => col.sortable)?.key || '',
    direction: 'ascending',
  });

  // State for data and metadata
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for request tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchUrlRef = useRef<string>('');
  const pendingFetchRef = useRef<string | null>(null);

  // Process selection changes if callback provided
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedKeys);
    }
  }, [selectedKeys, onSelectionChange]);

  // Process visible columns
  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns as Set<string>).includes(column.key)
    );
  }, [visibleColumns, columns]);

  // Function to fetch data based on current filters
  const fetchDataWithFilters = async () => {
    // Abort any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      // Get the CURRENT URL from the browser to ensure we're using the latest params
      const currentUrl = new URL(window.location.href);
      const urlString = currentUrl.search;

      // Skip if URL hasn't changed
      if (urlString === lastFetchUrlRef.current && urlString !== '') {
        console.log('Skipping duplicate fetch for URL:', urlString);
        setLoading(false);
        return;
      }

      // Remember this URL for future deduplication
      lastFetchUrlRef.current = urlString;

      // Send to server
      const formData = new FormData();
      formData.append('filter', JSON.stringify(prismaFilter));

      console.log('Fetching data with filter:', prismaFilter);

      const result = await fetchData(formData);

      // Only update state if this request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        if (result.success) {
          setData(result.data.data);
          setTotal(result.data.total);
        } else {
          console.error('Error fetching data:', result.errors);
        }
      }
    } catch (error: any) {
      // Only log errors for non-aborted requests
      if (error.name !== 'AbortError') {
        console.error('Error fetching data:', error);
      }
    } finally {
      // Only update loading state if this request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Fetch data when prismaFilter changes
  useEffect(() => {
    if (Object.keys(prismaFilter).length > 0) {
      // Generate a unique ID for this fetch operation
      const fetchId = Date.now().toString();
      pendingFetchRef.current = fetchId;

      // Small delay to ensure URL has been updated in the browser
      setTimeout(() => {
        // Only proceed if this is still the most recent fetch request
        if (pendingFetchRef.current === fetchId) {
          fetchDataWithFilters();
        }
      }, 50);
    }
  }, [prismaFilter]);

  // Handle form input changes (only updates form state, not URL)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilter(name, 'equals', checked);
    } else if (name.startsWith('min') && name.length > 3) {
      // Handle date range (min values)
      const fieldName = name.substring(3).charAt(0).toLowerCase() + name.substring(4);
      const minDate = value;
      const maxDate = getFilterValue(fieldName)?.max;
      setRangeFilter(
        fieldName,
        minDate ? new Date(minDate) : undefined,
        maxDate ? new Date(maxDate) : undefined
      );
    } else if (name.startsWith('max') && name.length > 3) {
      // Handle date range (max values)
      const fieldName = name.substring(3).charAt(0).toLowerCase() + name.substring(4);
      const minDate = getFilterValue(fieldName)?.min;
      const maxDate = value;
      setRangeFilter(
        fieldName,
        minDate ? new Date(minDate) : undefined,
        maxDate ? new Date(maxDate) : undefined
      );
    } else {
      // For standard text inputs and selects
      const column = columns.find((col) => col.key === name);
      const operator = column?.filterType === 'select' ? 'equals' : 'contains';

      if (name === 'status' && value === '') {
        setFilter(name, 'equals', null);
      } else if (name === 'status') {
        setFilter(name, 'equals', value === 'true');
      } else {
        setFilter(name, filterConfig.fields[name]?.defaultOperator || operator, value);
      }
    }

    // Check for relationship filters
    if (relationshipFilters) {
      const isParentField = relationshipFilters.some((rf) => rf.parentField === name);
      if (isParentField) {
        // Notify about parent field change
        const relFilter = relationshipFilters.find((rf) => rf.parentField === name);
        if (relFilter?.onParentChange) {
          relFilter.onParentChange(value);
        }
      }
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split(':');
    setSort(field, direction as 'asc' | 'desc');
  };

  // Handle form submission - this is when we apply filters to URL and trigger data fetch
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    applyFilters(); // Apply form filters to URL and trigger data fetch
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage); // This will update URL and trigger data fetch
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    console.log('Page size changed to:', newSize);

    // Update the pageSize state immediately to reflect in UI
    setPageSize(newSize);

    // Force a re-render by using setTimeout
    setTimeout(() => {
      // This will update URL and trigger data fetch in the hook
      setPage(1);
    }, 0);
  };

  // Clear all filters
  const clearFilters = () => {
    clearAllFilters(); // This will also trigger data fetch
  };

  // Calculate pagination values
  const pages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Pagination handlers
  const onNextPage = useCallback(() => {
    if (page < pages) {
      handlePageChange(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      handlePageChange(page - 1);
    }
  }, [page]);

  // Get filter values
  const searchValue = getFilterValue('search') || '';

  // Determine current sort value for the select input
  const sortValue = useMemo(() => {
    if (prismaFilter && 'orderBy' in prismaFilter) {
      const orderBy = prismaFilter.orderBy as Record<string, string>;
      const field = Object.keys(orderBy)[0];
      const direction = orderBy[field];
      if (field && direction) {
        return `${field}:${direction}`;
      }
    }
    return filterConfig.defaultSort
      ? `${filterConfig.defaultSort.field}:${filterConfig.defaultSort.direction}`
      : columns.find((col) => col.sortable)
        ? `${columns.find((col) => col.sortable)?.key}:asc`
        : '';
  }, [prismaFilter, columns, filterConfig]);

  // Top content with filter visibility toggle and add button
  const topContent = useMemo(
    () => (
      <div className="flex justify-between items-center py-4">
        <div className="flex-1">{title && <h1 className="text-xl font-bold">{title}</h1>}</div>
        <div className="flex gap-3">
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
    ),
    [columns, visibleColumns, onAddNew, title]
  );

  // Table header with counts and page size selector
  const tableHeaderContent = useMemo(
    () => (
      <div className="flex justify-between items-center py-2">
        <div className="text-sm text-default-400">
          {loading
            ? 'Loading...'
            : total > 0
              ? `Showing ${startItem} to ${endItem} of ${total} entries`
              : 'No entries found'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-default-400">Rows per page:</span>
          <Select
            className="max-w-sm"
            variant="bordered"
            selectedKeys={new Set([pageSize.toString()])}
            onSelectionChange={(keys) => {
              const newSize = Number(Array.from(keys)[0]);
              handlePageSizeChange({
                target: { value: newSize.toString() },
              } as React.ChangeEvent<HTMLSelectElement>);
            }}
          >
            <SelectItem key="10">10</SelectItem>
            <SelectItem key="25">25</SelectItem>
            <SelectItem key="50">50</SelectItem>
            <SelectItem key="100">100</SelectItem>
          </Select>
        </div>
      </div>
    ),
    [loading, total, startItem, endItem, pageSize, handlePageSizeChange]
  );

  // Bottom content with pagination
  const bottomContent = useMemo(() => {
    return total > 0 ? (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys instanceof Set ? selectedKeys.size : 0} of ${total} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={handlePageChange}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>
            Previous
          </Button>
          <Button isDisabled={page >= pages} size="sm" variant="flat" onPress={onNextPage}>
            Next
          </Button>
        </div>
      </div>
    ) : null;
  }, [selectedKeys, total, page, pages, onPreviousPage, onNextPage, handlePageChange]);

  return (
    <div className="space-y-4">
      {/* Filter Form */}
      <FilterForm
        columns={columns}
        filterConfig={filterConfig}
        getFilterValue={getFilterValue}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        clearFilters={clearFilters}
        sortValue={sortValue}
        handleSortChange={handleSortChange}
        searchValue={searchValue}
      />

      {/* Additional custom filters */}
      {additionalFilters}

      {/* Top Content */}
      {topContent}

      {/* Table Header Content */}
      {tableHeaderContent}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table
          isHeaderSticky
          aria-label="Data table with dynamic filters"
          bottomContent={bottomContent}
          bottomContentPlacement="outside"
          classNames={{
            wrapper: 'max-h-[600px]',
          }}
          selectedKeys={selectedKeys}
          selectionMode={selectionMode}
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.key}
                align={column.key === 'actions' ? 'center' : 'start'}
                allowsSorting={column.sortable}
              >
                {column.header}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={emptyContent}
            items={data}
            isLoading={loading}
            loadingContent="Loading..."
          >
            {(item) => (
              <TableRow key={item.id || `row-${data.indexOf(item)}`}>
                {(columnKey) => {
                  const column = columns.find((col) => col.key === columnKey);
                  return (
                    <TableCell>
                      {column?.cell ? column.cell(item) : item[columnKey as string]}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

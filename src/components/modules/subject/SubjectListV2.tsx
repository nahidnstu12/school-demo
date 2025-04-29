'use client';

import { getAllInstitutions } from '@/backend/actions/institution.action';
import { getAllLevels } from '@/backend/actions/level.action';
import { getSubjectsWithFilter } from '@/backend/actions/subject.action';
import { DataTable } from '@/components/datatable';
import { DataTableColumn } from '@/components/datatable/types';
import useTeacherDrawer from '@/hooks/useDrawer';
import { subjectFilterConfig } from '@/schemas/subject';
import { Button, Chip, DatePicker, Input } from '@heroui/react';
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { Level } from '@prisma/client';
import { Edit, Eye, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SubjectDrawer from './Drawer';


// Define subject type with necessary fields for display
interface ISubject {
  id: string;
  name: string;
  code?: string;
  status?: boolean;
  institutionId: string;
  levelId: string;
  creditHours?: number;
  institutionName?: string;
  levelName?: string;
  createdAt?: Date;
}

// Define the structure for additional filter values
interface AdditionalFilterValue {
  field: string;
  operator?: string;
  value: any;
}

export default function SubjectList() {
  const { isOpen, mode, itemId, openDrawer, closeDrawer } = useTeacherDrawer();
  const router = useRouter();
  
  // State for filter options
  const [institutionId, setInstitutionId] = useState<string>('');
  const [levels, setLevels] = useState<Level[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  
  // State for additional filter values
  const [nameFilter, setNameFilter] = useState<string>('');
  const [createdDateFilter, setCreatedDateFilter] = useState<CalendarDate | null>(null);
  
  // Initialize additional filters from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    // Initialize name filter from URL
    const nameParam = searchParams.get('name');
    if (nameParam !== null) {
      setNameFilter(nameParam);
    }
    
    // Initialize date filter from URL
    const dateParam = searchParams.get('createdAt');
    if (dateParam) {
      try {
        const date = new Date(dateParam);
        setCreatedDateFilter(new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        ));
      } catch (e) {
        console.error("Error parsing date from URL:", e);
      }
    }
  }, []);

  // Reference to the DataTable's refetch function
  const dataTableRef = useRef<{
    refetchData: () => void;
  } | null>(null);

  // Create and maintain a collection of additional filter values
  const [additionalFilterValues, setAdditionalFilterValues] = useState<AdditionalFilterValue[]>([]);
  
  // Update additional filter values whenever their state changes
  useEffect(() => {
    const newFilterValues: AdditionalFilterValue[] = [];
    
    // Add name filter if it has value (including empty string)
    if (nameFilter !== undefined) {
      newFilterValues.push({
        field: 'name',
        operator: 'contains',
        value: nameFilter
      });
    }
    
    // Add date filter if it has value
    if (createdDateFilter !== undefined) {
      try {
        // Handle null/empty date
        if (!createdDateFilter) {
          newFilterValues.push({
            field: 'createdAt',
            operator: 'equals',
            value: ''
          });
        } else {
          // Convert CalendarDate to ISO string
          const date = createdDateFilter.toDate(getLocalTimeZone());
          
          // Set the time to noon to prevent timezone issues
          const adjustedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12, 0, 0
          );
          
          // Create ISO string
          const dateString = adjustedDate.toISOString();
          
          newFilterValues.push({
            field: 'createdAt',
            operator: 'equals',
            value: dateString
          });
        }
        
      } catch (e) {
        console.error("Error converting date:", e);
      }
    }
    
    // Update the collection of additional filter values
    setAdditionalFilterValues(newFilterValues);
  }, [nameFilter, createdDateFilter]);

  // Handle filter application - just trigger the DataTable's apply filters
  const handleApplyFilters = () => {
    // No URL manipulation needed - DataTable handles it
  };

  // Handle clearing of additional filters
  const handleClearAdditionalFilters = () => {
    setNameFilter('');
    setCreatedDateFilter(null);
  };

  // Improved handleSuccess callback to actually refresh data
  const handleSuccess = useCallback(() => {
    console.log('Subject saved successfully, refreshing data...');
    
    if (dataTableRef.current) {
      dataTableRef.current.refetchData();
    }
    
    closeDrawer();
  }, [closeDrawer]);

  // Fetch institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const institutionsResult = await getAllInstitutions();
        console.log("institutionsResult>>", institutionsResult);
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch levels when institutionId changes
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const filters = institutionId ? { where: { institutionId } } : null;
        const levelsResult = await getAllLevels(filters);
        if (levelsResult.success) {
          setLevels(levelsResult.data);
        }
      } catch (error) {
        console.error('Error fetching levels:', error);
      }
    };

    fetchMetadata();
  }, [institutionId]);

  // Handle Add New button click
  const handleAddNew = useCallback(() => {
    openDrawer('create');
  }, [openDrawer]);

  const handleDelete = useCallback((id: string) => {
    console.log('Delete subject', id);
  }, []);

  // Define columns for the table
  const columns: DataTableColumn<ISubject>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      filterable: false, // Keep as false because we're using additional filter
      filterType: 'text',
      cell: (subject: ISubject) => (
        <div className="flex flex-col">
          <p className="text-bold text-small">{subject.name}</p>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      filterable: true,
      filterType: 'text',
      cell: (subject: ISubject) => subject.code || 'N/A',
    },
    {
      key: 'institutionId',
      header: 'Institution',
      cell: (subject: ISubject) => subject.institutionName,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: institutions.map((inst) => ({ label: inst.name, value: inst.id })),
    },
    {
      key: 'levelId',
      header: 'Level',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: levels.map((l) => ({ label: l.name, value: l.id })),
      cell: (subject: ISubject) => subject.levelName,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false },
      ],
      cell: (subject: ISubject) => (
        <Chip
          className="capitalize"
          color={subject.status ? 'success' : 'danger'}
          size="sm"
          variant="flat"
        >
          {subject.status ? 'Active' : 'Inactive'}
        </Chip>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      filterable: false, // Keep as false because we're using additional filter
      filterType: 'date',
      cell: (subject: ISubject) => subject.createdAt ? 
        new Date(subject.createdAt).toLocaleDateString() : 'N/A',
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (subject) => (
        <div className="relative flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('read', subject.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('edit', subject.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-danger"
            onPress={() => handleDelete(subject.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleInstitutionChange = (value: string) => {
    setInstitutionId(value);
  };

  // Handle name filter change
  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
  };

  // Handle date filter change
  const handleDateFilterChange = (date: CalendarDate | null) => {
    setCreatedDateFilter(date);
  };

  // Create additional filters to be rendered inside the DataTable component
  const additionalFilters = [
    // Name filter
    <Input
      key="name-filter"
      type="text"
      label="Name"
      labelPlacement="outside"
      name="name"
      placeholder="Filter by name..."
      variant="bordered"
      value={nameFilter}
      onChange={handleNameFilterChange}
    />,
    
    // Created date filter
    <DatePicker
      key="created-date-filter"
      label="Created Date"
      labelPlacement="outside"
      name="createdAt"
      variant="bordered"
      value={createdDateFilter}
      onChange={handleDateFilterChange}
    />
  ];

  return (
    <div className="container mx-auto p-4">
      <DataTable
        title="Subjects"
        columns={columns}
        filterConfig={subjectFilterConfig}
        fetchData={getSubjectsWithFilter}
        initialVisibleColumns={[
          'name',
          'code',
          'status',
          'institutionId',
          'levelId',
          'createdAt',
          'actions',
        ]}
        onAddNew={handleAddNew}
        selectionMode="multiple"
        onSelectionChange={(keys) => console.log('Selected:', keys)}
        emptyContent="No subjects found"
        ref={dataTableRef}
        relationshipFilters={[
          {
            parentField: "institutionId",
            childField: "levelId",
            onParentChange: handleInstitutionChange
          }
        ]}
        additionalFilters={additionalFilters}
        additionalFilterValues={additionalFilterValues}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearAdditionalFilters}
      />
      
      <SubjectDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        mode={mode}
        subjectId={itemId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
'use client';

import { getAllInstitutions } from '@/backend/actions/institution.action';
import useDrawer from '@/hooks/useDrawer';
import { teacherFilterConfig } from '@/schemas/teacher';
import { useFilterStore } from '@/stores/useFilterStore';
import { FilterConfig } from '@/utils/filter-helpers';
import { useCallback, useEffect, useRef, useState } from 'react';

import { DataTableColumn } from '@/components/datatable/types';
import { Button, Chip, Input } from '@heroui/react';
import { Edit, Eye, Trash } from 'lucide-react';

import { getTeacherDesignations, getTeachersWithFilter } from '@/backend/actions/teacher.action';
import { DataTable } from '@/components/datatable/datatable';
import TeacherDrawer from './Drawer';

interface Teacher {
  id: string;
  fullName?: string;
  institutionName?: string;
  institutionId: string;
  phone?: string | null;
  email?: string;
  pdsId: string | null;
  designation: string;
  joiningDate: Date | null;
  status: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  institution: {
    name: string;
  };
}

export default function TeacherList() {
  const { isOpen, mode, itemId, openDrawer, closeDrawer } = useDrawer();

  const [institutionId, setInstitutionId] = useState<string>('');
  const [designations, setDesignations] = useState<{ id: string; name: string }[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  // Reference to the DataTable's refetch function
  const dataTableRef = useRef<{
    refetchData: () => void;
  } | null>(null);

  const { setFilter, getFilterValue, setConfig } = useFilterStore();

  // Set filter config once
  useEffect(() => {
    setConfig(teacherFilterConfig as FilterConfig);
  }, [setConfig]);

  // Improved handleSuccess callback to actually refresh data
  const handleSuccess = useCallback(() => {
    console.log('Teacher saved successfully, refreshing data...');

    // Option 2: If you implemented a ref-based approach with the DataTable
    if (dataTableRef.current) {
      dataTableRef.current.refetchData();
    }

    // Close the drawer after success
    closeDrawer();
  }, [closeDrawer]);

  // Fetch designations and institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Sync institutionId with filter store value
  useEffect(() => {
    const storeInstitutionId = getFilterValue('institutionId');
    if (storeInstitutionId && storeInstitutionId !== institutionId) {
      setInstitutionId(storeInstitutionId);
    }
  }, [getFilterValue, institutionId]);


  // Fetch designations and institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch designations
        const designationsResult = await getTeacherDesignations();
        console.log("designationsResult>>", designationsResult);
        if (designationsResult.success) {
          setDesignations(designationsResult.data.map((designation) => ({ id: designation.id, name: designation.name })));
        }

        // Fetch institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data.map((institution) => ({ id: institution.id, name: institution.name })));
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);


  const handleDelete = useCallback((id: string) => {
    console.log('Delete teacher', id);
  }, []);

  // Handle changes in the additional filter inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(name, teacherFilterConfig.fields[name]?.defaultOperator || 'contains', value);
  };

  // Additional filters that will be shown outside the filter modal
  const additionalFilters = [
    <Input
      key="email-filter"
      type="email"
      aria-label="Email Address"
      name="email"
      label="Email"
      labelPlacement="outside"
      placeholder="Filter by email..."
      value={getFilterValue('email') || ''}
      onChange={handleInputChange}
      variant="bordered"
    />,
    <Input
      key="phone-filter"
      type="text"
      aria-label="Phone Number"
      name="phone"
      label="Phone"
      labelPlacement="outside"
      placeholder="Filter by phone..."
      value={getFilterValue('phone') || ''}
      onChange={handleInputChange}
      variant="bordered"
    />,
  ];

  // Define columns for the table
  const columns: DataTableColumn<Teacher>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (teacher: Teacher) => (
        <div className="flex flex-col">
          <p className="text-bold text-small">{teacher.fullName}</p>
        </div>
      ),
    },
    {
      key: 'institutionId',
      header: 'Institution',
      cell: (teacher: Teacher) => teacher.institutionName,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: institutions.map((inst) => ({ label: inst.name, value: inst.id })),
    },
    {
      key: 'contactInfo',
      header: 'Contact Info',
      cell: (teacher: Teacher) => (
        <div className="flex flex-col">
          <p>{teacher.email}</p>
          <p>{teacher.phone || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: 'pdsId',
      header: 'PDS ID',
      filterable: true,
      filterType: 'text',
      cell: (teacher: Teacher) => teacher.pdsId || 'N/A',
    },
   
    {
      key: 'joiningDate',
      header: 'Joining Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      cell: (teacher: Teacher) =>
        teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A',
    },
    {
        key: 'designation',
        header: 'Designation',
        sortable: true,
        filterable: true,
        filterType: 'select',
        filterOptions: designations.map((d) => ({ label: d.name, value: d.id })),
        cell: (teacher: Teacher) => teacher.designation,
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
      cell: (teacher: Teacher) => (
        <Chip
          className="capitalize"
          color={teacher.status ? 'success' : 'danger'}
          size="sm"
          variant="flat"
        >
          {teacher.status ? 'Active' : 'Inactive'}
        </Chip>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (teacher) => (
        <div className="relative flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('read', teacher.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('edit', teacher.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-danger"
            onPress={() => handleDelete(teacher.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Handle Add New button click
  const handleAddNew = useCallback(() => {
    openDrawer('create');
  }, [openDrawer]);

  return (
    <div className="container mx-auto p-4">
      <DataTable
        title="Teachers"
        columns={columns}
        filterConfig={teacherFilterConfig}
        fetchData={getTeachersWithFilter} // Using our fetch function
        initialVisibleColumns={['fullName', 'institutionId', 'designation', 'contactInfo', 'pdsId', 'joiningDate', 'status', 'actions']}
        onAddNew={handleAddNew}
        selectionMode="multiple"
        onSelectionChange={(keys) => console.log('Selected:', keys)}
        emptyContent="No teachers found"
        ref={dataTableRef}
        additionalFilters={additionalFilters}
      />
      <TeacherDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        mode={mode}
        teacherId={itemId}
        onSuccess={handleSuccess} // Using our improved success handler
      />
    </div>
  );
}

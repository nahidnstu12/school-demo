'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { DataTable, DataTableColumn } from '@/components/datatable';
import { teacherFilterConfig } from '@/schemas/teacher';
import { getTeachersWithFilter, getTeacherDesignations } from '@/actions/teacher.action';
import { getAllInstitutions } from '@/actions/institution.action';
import { Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { Eye, Edit, Trash, EllipsisVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define teacher type with necessary fields for display
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
  const router = useRouter();

  // State for filter options
  const [designations, setDesignations] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  // Fetch designations and institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch designations
        const designationsResult = await getTeacherDesignations();
        if (designationsResult.success) {
          setDesignations(designationsResult.data);
        }

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

  // Handle Add New button click
  const handleAddNew = useCallback(() => {
    router.push('/teachers/create');
  }, [router]);

  // Handle view, edit, delete actions
  const handleView = useCallback(
    (id: string) => {
      router.push(`/teachers/${id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/teachers/${id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((id: string) => {
    // Implement delete logic or confirmation dialog
    console.log('Delete teacher', id);
  }, []);

  // Define columns for the table with all cell rendering logic
  const columns: DataTableColumn<Teacher>[] = [
    {
      key: 'fullName',
      header: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (teacher) => (
        <div className="flex flex-col">
          <p className="text-bold text-small">{teacher.fullName}</p>
        </div>
      ),
    },
    {
      key: 'institutionId',
      header: 'Institution',
      cell: (teacher) => teacher.institutionName,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: institutions.map((inst) => ({ label: inst.name, value: inst.id })),
    },
    {
      key: 'contactInfo',
      header: 'Contact Info',
      cell: (teacher) => (
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
      cell: (teacher) => teacher.pdsId || 'N/A',
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: designations.map((d) => ({ label: d, value: d })),
      cell: (teacher) => teacher.designation,
    },
    {
      key: 'joiningDate',
      header: 'Joining Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      cell: (teacher) =>
        teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A',
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
      cell: (teacher) => (
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
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <EllipsisVertical className="text-default-300" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Actions">
              <DropdownItem
                key="view"
                startContent={<Eye className="w-4 h-4" />}
                onPress={() => handleView(teacher.id)}
              >
                View
              </DropdownItem>
              <DropdownItem
                key="edit"
                startContent={<Edit className="w-4 h-4" />}
                onPress={() => handleEdit(teacher.id)}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                key="delete"
                startContent={<Trash className="w-4 h-4" />}
                className="text-danger"
                color="danger"
                onPress={() => handleDelete(teacher.id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <DataTable<Teacher>
        title="Teachers"
        columns={columns}
        filterConfig={teacherFilterConfig}
        fetchData={getTeachersWithFilter}
        initialVisibleColumns={[
          'fullName',
          'institutionId',
          'designation',
          'joiningDate',
          'status',
          'actions',
        ]}
        onAddNew={handleAddNew}
        selectionMode="multiple"
        onSelectionChange={(keys) => console.log('Selected:', keys)}
        emptyContent="No teachers found"
      />
    </div>
  );
}

'use client';

import { getAllInstitutions } from '@/backend/actions/institution.action';
import { getAllLevels } from '@/backend/actions/level.action';
import { getTeacherDesignations, getTeachersWithFilter } from '@/backend/actions/teacher.action';
import { DataTable } from '@/components/datatable';
import { DataTableColumn } from '@/components/datatable/types';
import useTeacherDrawer from '@/hooks/useDrawer';
import { useDynamicFilters } from '@/hooks/useDynamicFilter';
import { teacherFilterConfig } from '@/schemas/teacher';
import { Button, Chip, Input } from '@heroui/react';
import { Level } from '@prisma/client';
import { Edit, Eye, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import TeacherDrawer from './Drawer';

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
  const { isOpen, mode, itemId, openDrawer, closeDrawer } = useTeacherDrawer();
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [levels, setLevels] = useState<Level[]>([]);

    // Reference to the DataTable's refetch function
    const dataTableRef = useRef<{
      refetchData: () => void;
    } | null>(null);

  const {
    getFilterValue,
    setFilter
  } = useDynamicFilters(teacherFilterConfig);

  const handleSuccess = useCallback(() => {
    console.log('Teacher saved successfully, refreshing data...');
    
    // Option 2: If you implemented a ref-based approach with the DataTable
    if (dataTableRef.current) {
      dataTableRef.current.refetchData();
    }
    
    // Close the drawer after success
    closeDrawer();
  }, [closeDrawer]);

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

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch levels
        const filters = institutionId ? { where: { institutionId } } : null;
        const levelsResult = await getAllLevels(filters);
        if (levelsResult.success) {
          setLevels(levelsResult.data);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, [institutionId]);

  // Handle Add New button click
  const handleAddNew = useCallback(() => {
    openDrawer('create');
  }, [router]);

  // Handle view, edit, delete actions
  const handleView = useCallback(
    (id: string) => {
      openDrawer('read', id);
    },
    [openDrawer]
  );

  const handleEdit = useCallback(
    (id: string) => {
      openDrawer('edit', id);
    },
    [openDrawer]
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
      key: 'designation',
      header: 'Designation',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: designations.map((d) => ({ label: d, value: d })),
      cell: (teacher: Teacher) => teacher.designation,
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
    // {
    //   key: 'actions',
    //   header: 'Actions',
    //   cell: (teacher: Teacher) => (
    //     <div className="relative flex items-center gap-2">
    //       <Dropdown>
    //         <DropdownTrigger>
    //           <Button isIconOnly size="sm" variant="light">
    //             <EllipsisVertical className="text-default-300" />
    //           </Button>
    //         </DropdownTrigger>
    //         <DropdownMenu aria-label="Actions">
    //           <DropdownItem
    //             key="view"
    //             startContent={<Eye className="w-4 h-4" />}
    //             onPress={() => handleView(teacher.id)}
    //           >
    //             View
    //           </DropdownItem>
    //           <DropdownItem
    //             key="edit"
    //             startContent={<Edit className="w-4 h-4" />}
    //             onPress={() => handleEdit(teacher.id)}
    //           >
    //             Edit
    //           </DropdownItem>
    //           <DropdownItem
    //             key="delete"
    //             startContent={<Trash className="w-4 h-4" />}
    //             className="text-danger"
    //             color="danger"
    //             onPress={() => handleDelete(teacher.id)}
    //           >
    //             Delete
    //           </DropdownItem>
    //         </DropdownMenu>
    //       </Dropdown>
    //     </div>
    //   ),
    // },
    {
      key: "actions",
      header: "Actions",
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
      )
    }
  ];

  const handleInstitutionChange = (value: string) => {
    setInstitutionId(value);
    setFilter('institutionId', 'equals', value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name === 'institutionId') setInstitutionId(value);

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilter(name, 'equals', checked);
    } else {
      // For other inputs
      console.log('handleChange>>', name, value);

      setFilter(
        name,
        // name === 'institutionId' || name === 'designation' ? 'equals' : 'contains',
        teacherFilterConfig.fields[name].defaultOperator || 'contains',
        value
      );
    }
  };

  return (
    // <div className="container mx-auto p-4">
    //   <DataTable<Teacher>
    //     title="Teachers"
    //     columns={columns}
    //     filterConfig={teacherFilterConfig}
    //     fetchData={getTeachersWithFilter}
    //     initialVisibleColumns={[
    //       'fullName',
    //       'institutionId',
    //       'designation',
    //       'joiningDate',
    //       'status',
    //       'actions',
    //     ]}
    //     onAddNew={handleAddNew}
    //     selectionMode="multiple"
    //     onSelectionChange={(keys) => console.log('Selected:', keys)}
    //     emptyContent="No teachers found"
    //   />
    // </div>
    <div className="container mx-auto p-4">
      <DataTable
        title="Teachers"
        columns={columns}
        filterConfig={teacherFilterConfig}
        fetchData={getTeachersWithFilter}
        initialVisibleColumns={["fullName", "institutionId", "designation", "status", "actions"]}
        onAddNew={handleAddNew}
        selectionMode="multiple"
        onSelectionChange={(keys) => console.log("Selected:", keys)}
        emptyContent="No teachers found"
        ref={dataTableRef}
        relationshipFilters={[
          {
            parentField: "institutionId",
            childField: "levelId",
            onParentChange: handleInstitutionChange
          }
        ]}
        additionalFilters={[
          <Input
            key="email-filter"
            type="email"
            aria-label="Email Address"
            name="email"
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
            placeholder="Filter by phone..."
            value={getFilterValue('phone') || ''}
            onChange={handleInputChange}
            variant="bordered"
          />
        ]}
      />
       <TeacherDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        mode={mode}
        teacherId={itemId}
        onSuccess={handleSuccess}
      />
    </div>
  
  );
}

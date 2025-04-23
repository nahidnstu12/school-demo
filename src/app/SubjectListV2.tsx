'use client';

import { getAllInstitutions } from '@/actions/institution.action';
import { getAllLevels } from '@/actions/level.action';
import { getSubjectsWithFilter } from '@/actions/subject.action';
import { DataTable } from '@/components/datatable';
import { DataTableColumn } from '@/components/datatable/types';
import SubjectDrawer from '@/components/modules/subject/Drawer';
import useTeacherDrawer from '@/hooks/useDrawer';
import { useDynamicFilters } from '@/hooks/useDynamicFilter';
import { subjectFilterConfig } from '@/schemas/subject';
import { Button, Chip } from '@heroui/react';
import { Level } from '@prisma/client';
import { Edit, Eye, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

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
}

export default function SubjectList() {
  const { isOpen, mode, teacherId, openDrawer, closeDrawer } = useTeacherDrawer();
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState<string>('');
  const [levels, setLevels] = useState<Level[]>([]);

  const { getFilterValue, setFilter } = useDynamicFilters(subjectFilterConfig);

  const handleSuccess = useCallback(() => {
    // Refresh the data table - this depends on your implementation
    // You might want to call a function that refreshes the table data
    console.log('Teacher saved successfully');
  }, []);

  // State for filter options
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  // Fetch designations and institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch designations

        // Fetch institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }

        // const levelsResult = await getAllLevels({});
        // if (levelsResult.success) {
        //   setLevels(levelsResult.data);
        // }
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
    console.log('Delete subject', id);
  }, []);

  // Define columns for the table with all cell rendering logic
  const columns: DataTableColumn<ISubject>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (subject: ISubject) => (
        <div className="flex flex-col">
          <p className="text-bold text-small">{subject.name}</p>
        </div>
      ),
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
      key: 'code',
      header: 'Code',
      filterable: true,
      filterType: 'text',
      cell: (subject: ISubject) => subject.code || 'N/A',
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

  if (teacherId) console.log('teacherid', teacherId);

  return (
    <div className="container mx-auto p-4">
      <DataTable<ISubject>
        title="Subjects"
        columns={columns}
        filterConfig={subjectFilterConfig}
        fetchData={getSubjectsWithFilter}
        initialVisibleColumns={[
          'name',
          'status',
          'institutionId',
          'levelId',
          'creditHours',
          'actions',
        ]}
        onAddNew={handleAddNew}
        selectionMode="multiple"
        onSelectionChange={(keys) => console.log('Selected:', keys)}
        emptyContent="No subjects found"
      />
      <SubjectDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        mode={mode}
        subjectId={teacherId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

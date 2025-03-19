'use client';
import { getAllInstitutions } from '@/actions/institution.action';
import { createLevel } from '@/actions/level.action';
import FormModal from '@/components-old/FormModal';
import Pagination from '@/components-old/Pagination';
import Table from '@/components-old/Table';
import TableSearch from '@/components-old/TableSearch';
import CreateDrawer from '@/components/createDrawer';
import { FormContainer } from '@/components/forms/FormContainer';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';
import ShowModal from '@/components/ShowModal';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { classesData, role } from '@/lib/data';
import { InstitutionFormValues } from '@/schemas/institution';
import { levelSchema } from '@/schemas/level';
import { mapToSelectOptions } from '@/utils/helpers';
import { addToast, Button, useDisclosure } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type Class = {
  id: number;
  name: string;
  capacity: number;
  grade: number;
  supervisor: string;
};

interface Institution {
  address: string;
  name: string;
  id: string;
  contactNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SuccessResponse {
  success: true;
  data: Institution[];
}

interface ErrorResponse {
  success: false;
  errors: { field: string | number; message: string }[];
}

type InstitutionResponse = SuccessResponse | ErrorResponse;

const columns = [
  {
    header: 'Class Name',
    accessor: 'name',
  },
  {
    header: 'Capacity',
    accessor: 'capacity',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Grade',
    accessor: 'grade',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Supervisor',
    accessor: 'supervisor',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Actions',
    accessor: 'action',
  },
];

function ClassListPage() {
  const modalDisclosure = useDisclosure();
  const drawerDisclosure = useDisclosure();
  const viewDisclosure = useDisclosure();
  const updateDisclosure = useDisclosure();
  const deleteDisclosure = useDisclosure();
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const LevelCreatemethods = useForm<InstitutionFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      institutionId: undefined,
    },
    mode: 'onSubmit',
  });

  const LevelViewmethod = useForm<InstitutionFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      institutionId: undefined,
    },
    mode: 'onSubmit',
  });

  // create level
  const { isSubmitting, rootError, successMsg, handleSubmit } = useFormSubmit({
    formMethods: LevelCreatemethods,
    submitAction: createLevel,
    successMessage: 'Level created successfully!',
    onSuccess: (data) => {
      console.log('Level created:', data);
      drawerDisclosure.onOpenChange();
    },
  });

  const handleDelete = (id: string | number) => {
    // perform delete

    addToast({
      title: 'Toast title',
      description: 'Toast displayed successfully',
      color: 'success',
    });
    modalDisclosure.onOpenChange();
  };

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const response: InstitutionResponse = await getAllInstitutions();

        if (response.success) {
          setInstitutions(response.data); // ✅ Set only the data array
        } else {
          console.error('Error fetching institutions:', response.errors);
          setInstitutions([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setInstitutions([]); // Fallback to an empty array
      }
    }

    fetchInstitutions();
  }, []);

  const institutionOptions = mapToSelectOptions(institutions, 'id', 'name');

  const renderRow = (item: Class) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="flex items-center gap-4 p-4">{item.name}</td>
        <td className="hidden md:table-cell">{item.capacity}</td>
        <td className="hidden md:table-cell">{item.grade}</td>
        <td className="hidden md:table-cell">{item.supervisor}</td>
        <td className="flex flex-wrap gap-1">
          <div className="flex items-center">
            <>
              <Button onPress={viewDisclosure.onOpen}>View</Button>
              <CreateDrawer
                isOpen={viewDisclosure.isOpen}
                onOpenChange={viewDisclosure.onOpenChange}
                header="View Level"
              >
                <FormContainer
                  formMethods={LevelViewmethod}
                  // onSubmit={handleSubmit}
                  // isSubmitting={isSubmitting}
                  rootError={rootError}
                  successMessage={successMsg}
                >
                  <FormInput
                    name="name"
                    label="Level Name"
                    type="text"
                    placeholder="create name"
                    required
                  />

                  <FormInput
                    name="name"
                    label="Level Name"
                    type="text"
                    placeholder="create name"
                    required
                  />
                </FormContainer>
              </CreateDrawer>
            </>
          </div>
          <div className="flex items-center ">
            <>
              <Button onPress={modalDisclosure.onOpen}>update</Button>
              <ShowModal
                isOpen={modalDisclosure.isOpen}
                onOpenChange={modalDisclosure.onOpenChange}
                header="Delete Teacher"
                message="Are you sure you want to delete the Teacher?"
                onPress={() => handleDelete(item.id)}
              />
            </>
          </div>
          <div className="flex items-center">
            <>
              <Button onPress={modalDisclosure.onOpen}>Delete</Button>
              <ShowModal
                isOpen={modalDisclosure.isOpen}
                onOpenChange={modalDisclosure.onOpenChange}
                header="Delete Teacher"
                message="Are you sure you want to delete the Teacher?"
                onPress={() => handleDelete(item.id)}
              />
            </>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <>
              <Button color="warning" variant="flat" onPress={drawerDisclosure.onOpen}>
                create Class
              </Button>
              {/* create drawer */}
              <CreateDrawer
                isOpen={drawerDisclosure.isOpen}
                onOpenChange={drawerDisclosure.onOpenChange}
                header="Create Level"
              >
                <FormContainer
                  formMethods={LevelCreatemethods}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  rootError={rootError}
                  successMessage={successMsg}
                >
                  <FormInput
                    name="name"
                    label="Level Name"
                    type="text"
                    placeholder="create name"
                    required
                  />

                  <FormSelect
                    name="institutionId"
                    label="Institution"
                    options={institutionOptions}
                    required
                  />
                </FormContainer>
              </CreateDrawer>
            </>
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={classesData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
}

export default ClassListPage;

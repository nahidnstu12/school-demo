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
import { role, teachersData } from '@/lib/data';
import { InstitutionFormValues } from '@/schemas/institution';
import { levelSchema } from '@/schemas/level';
import { mapToSelectOptions } from '@/utils/helpers';
import { addToast, Button, modal, useDisclosure } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type Teacher = {
  id: number;
  teacherId: string;
  name: string;
  email?: string;
  photo: string;
  phone: string;
  subjects: string[];
  classes: string[];
  address: string;
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
    header: 'Info',
    accessor: 'info',
  },
  {
    header: 'Teacher ID',
    accessor: 'teacherId',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Subjects',
    accessor: 'subjects',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Classes',
    accessor: 'classes',
    className: 'hidden md:table-cell',
  },
  {
    header: 'Phone',
    accessor: 'phone',
    className: 'hidden lg:table-cell',
  },
  {
    header: 'Address',
    accessor: 'address',
    className: 'hidden lg:table-cell',
  },
  {
    header: 'Actions',
    accessor: 'action',
  },
];

export default function TeacherListPage() {
  const modalDisclosure = useDisclosure();
  const drawerDisclosure = useDisclosure();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const methods = useForm<InstitutionFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: '',
      institutionId: undefined,
    },
    mode: 'onSubmit',
  });

  const handleDelete = () => {
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

  // Use our custom hook for form submission
  const { isSubmitting, rootError, successMsg, handleSubmit } = useFormSubmit({
    formMethods: methods,
    submitAction: createLevel,
    successMessage: 'Level created successfully!',
    onSuccess: (data) => {
      console.log('Level created:', data);
      // You could add additional logic here
    },
  });
  const institutionOptions = mapToSelectOptions(institutions, 'id', 'name');

  const renderRow = (item: Teacher) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <Image
          src={item.photo}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-xs text-gray-500">{item?.email}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.teacherId}</td>
      <td className="hidden md:table-cell">{item.subjects.join(',')}</td>
      <td className="hidden md:table-cell">{item.classes.join(',')}</td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden md:table-cell">{item.address}</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/view.png" alt="" width={16} height={16} />
            </button>
          </Link>
          {role === 'admin' && (
            <>
              <Button onPress={modalDisclosure.onOpen}>Delete</Button>
              <ShowModal
                isOpen={modalDisclosure.isOpen}
                onOpenChange={modalDisclosure.onOpenChange}
                header="Delete Teacher"
                message="Are you sure you want to delete the Teacher?"
                onPress={handleDelete}
              />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === 'admin' && (
              <>
                <Button color="warning" variant="flat" onPress={drawerDisclosure.onOpen}>
                  create teacher
                </Button>
                {/* create drawer */}
                <CreateDrawer
                  isOpen={drawerDisclosure.isOpen}
                  onOpenChange={drawerDisclosure.onOpenChange}
                  header="Create Level"
                >
                  <FormContainer
                    formMethods={methods}
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
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={teachersData} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
}

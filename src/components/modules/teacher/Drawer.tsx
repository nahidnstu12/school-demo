'use client';

import React from 'react';
import { getAllInstitutions } from '@/backend/actions/institution.action';
import { getTeacherById, getTeacherDesignations } from '@/backend/actions/teacher.action';
import { TeacherFormValues, TeacherWithUser } from '@/schemas/teacher';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Spinner,
} from '@heroui/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TeacherForm } from './Form2';

export type DrawerMode = 'create' | 'read' | 'edit';

interface TeacherDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DrawerMode;
  teacherId?: string;
  onSuccess?: () => void;
}

export default function TeacherDrawer({
  isOpen,
  onClose,
  mode,
  teacherId,
  onSuccess,
}: TeacherDrawerProps) {
  // States
  const [teacher, setTeacher] = useState<Partial<TeacherFormValues>>({});
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get drawer title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Add New Teacher';
      case 'read':
        return 'Teacher Details';
      case 'edit':
        return 'Edit Teacher';
      default:
        return 'Teacher';
    }
  };

  // Load teacher data when drawer opens in read or edit mode
  useEffect(() => {
    const loadTeacher = async () => {
      if (!teacherId || mode === 'create') return;

      setIsLoading(true);
      try {
        const result = await getTeacherById(teacherId);
        if (result.success && result.data) {
          const teacherData = result.data as TeacherWithUser;
          // Format data for form use
          setTeacher({
            teacherId: teacherData.id,
            firstName: teacherData.user.firstName,
            lastName: teacherData.user.lastName,
            email: teacherData.user.email,
            phone: teacherData.user.phone || '',
            institutionId: teacherData.institutionId,
            designation: teacherData.designation,
            pdsId: teacherData.pdsId || '',
            joiningDate: teacherData.joiningDate
              ? new Date(teacherData.joiningDate).toISOString()
              : null,
            address: teacherData.address || '',
            district: teacherData.district || '',
            specialization: teacherData.specialization || '',
            status: teacherData.status,
          });
        }
      } catch (error) {
        console.error('Error loading teacher:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadTeacher();
    } else {
      // Reset form when drawer closes
      setTeacher({});
    }
  }, [isOpen, teacherId, mode]);

  // Load institutions and designations when drawer opens
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(false); //TODO: change this to true
      try {
        // Load institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }

        // Load designations
        const designationsResult = await getTeacherDesignations();
        if (designationsResult.success) {
          setDesignations(designationsResult.data);
        }

        // Load districts if needed
        // const districtsResult = await getAllDistricts();
        // if (districtsResult.success) {
        //   setDistricts(districtsResult.data);
        // }
      } catch (error) {
        console.error('Error loading metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Handle form success and close drawer
  const handleFormSuccess = () => {
    console.log('Form submission successful');
    
    // Call the onSuccess callback from parent to trigger data refresh
    if (onSuccess) {
      onSuccess();
    }
    
    // Close the drawer after a short delay to show success message
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="lg">
      <DrawerContent>
        <DrawerHeader className="border-b">
          {getTitle()}
          <Button
            isIconOnly
            variant="light"
            radius="full"
            size="sm"
            onPress={onClose}
            className="absolute right-4 top-4"
          >
            <X size={20} />
          </Button>
        </DrawerHeader>

        <DrawerBody>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <TeacherForm
              teacherId={teacherId}
              mode={mode}
              isReadOnly={mode === 'read'}
              onSuccess={handleFormSuccess}
              // defaultValues={teacher as any}
              // institutions={institutions}
              // designations={designations}
            />
          )}
        </DrawerBody>

        <DrawerFooter className="border-t">
          <div className="flex justify-between w-full">
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>

            {mode === 'read' && (
              <Button
                color="primary"
                onPress={() => {
                  // You could implement a way to switch to edit mode here
                  // For example, using a parent component state
                }}
              >
                Edit
              </Button>
            )}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

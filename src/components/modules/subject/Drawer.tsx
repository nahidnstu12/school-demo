import React, { useEffect, useState } from 'react';
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

import { getAllInstitutions } from '@/actions/institution.action';
import { SubjectFormValues } from '@/schemas/subject';
import { getSubjectById } from '@/actions/subject.action';
import { getAllLevels } from '@/actions/level.action';
import { Level } from '@prisma/client';
import SubjectForm from './Form';

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
  const [subject, setSubject] = useState<Partial<SubjectFormValues>>({});
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get drawer title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Add New Subject';
      case 'read':
        return 'Subject Details';
      case 'edit':
        return 'Edit Subject';
      default:
        return 'Subject';
    }
  };

  useEffect(() => {
    const loadTeacher = async () => {
      if (!teacherId || mode === 'create') return;

      setIsLoading(true);
      try {
        const result = await getSubjectById(teacherId);
        if (result.success) {
          // Format data for form use
          const subjectData = result.data;
          setSubject({
            name: subjectData?.name,
            code: subjectData?.code || '',
            creditHours: subjectData?.creditHours || 0,
            description: subjectData?.description || '',
            institutionId: subjectData?.institutionId || '',
            levelId: subjectData?.levelId || '',
            status: subjectData?.status || false,
          });
        }
      } catch (error) {
        console.error('Error loading subject:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadTeacher();
    } else {
      // Reset form when drawer closes
      setSubject({});
    }
  }, [isOpen, teacherId, mode]);

  // Load institutions and designations when drawer opens
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(true);
      try {
        // Load institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }

        // Load designations
        const levelsResult = await getAllLevels({});
        if (levelsResult.success) {
          setLevels(levelsResult.data);
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
            <SubjectForm
              defaultValues={subject}
              institutions={institutions}
              levels={levels}
              isReadOnly={mode === 'read'}
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

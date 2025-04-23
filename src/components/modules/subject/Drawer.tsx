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

import { getAllInstitutions } from '@/actions/institution.action';
import { SubjectFormValues } from '@/schemas/subject';
import { getSubjectById } from '@/actions/subject.action';
import { getAllLevels } from '@/actions/level.action';
import { Level } from '@prisma/client';
import SubjectForm from './Form';

export type DrawerMode = 'create' | 'read' | 'edit';

interface SubjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DrawerMode;
  subjectId?: string;
  onSuccess?: () => void;
}

export default function SubjectDrawer({
  isOpen,
  onClose,
  mode,
  subjectId,
  onSuccess,
}: SubjectDrawerProps) {
  // States
  const [subject, setSubject] = useState<Partial<SubjectFormValues>>({});
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

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
  
  console.log('subjectId>>', subjectId, mode);

  useEffect(() => {
    const loadSubject = async () => {
      if (!subjectId || mode === 'create') {
        setIsDataReady(true);
        return;
      }

      setIsLoading(true);
      setIsDataReady(false);
      
      try {
        const result = await getSubjectById(subjectId);
        console.log('subject result>>', result);
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
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Error loading subject:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Load data when the drawer opens or when mode/subjectId changes
    if (isOpen) {
      loadSubject();
    } else {
      // Reset form when drawer closes
      setSubject({});
      setIsDataReady(false);
    }
  }, [isOpen, subjectId, mode]);

  // Load institutions and levels when drawer opens
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(true);
      try {
        // Load institutions and levels in parallel
        const [institutionsResult, levelsResult] = await Promise.all([
          getAllInstitutions(),
          getAllLevels({})
        ]);
        
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }

        if (levelsResult.success) {
          setLevels(levelsResult.data);
        }
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
        </DrawerHeader>

        <DrawerBody>
          {isLoading && !isDataReady ? (
            <div className="flex justify-center items-center h-64">
              <Spinner color="primary" size="lg" />
            </div>
          ) : (
            <SubjectForm
              subjectId={subjectId}
              defaultValues={subject}
              institutions={institutions}
              levels={levels}
              isReadOnly={mode === 'read'}
              mode={mode}
              onSuccess={onSuccess}
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
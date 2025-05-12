import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@heroui/react';
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
        <DrawerHeader className="border-b">{getTitle()}</DrawerHeader>

        <DrawerBody>
          <TeacherForm
            teacherId={teacherId}
            mode={mode}
            isReadOnly={mode === 'read'}
            onSuccess={handleFormSuccess}
          />
        </DrawerBody>

        <DrawerFooter className="border-t">
          <div className="flex justify-between w-full">
            <Button variant="flat" onPress={onClose}>
              Close
            </Button>

           
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
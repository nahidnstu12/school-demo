import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@heroui/react';
import { SubjectForm } from './Form2';

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
          <SubjectForm
            subjectId={subjectId}
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

            {/* {mode === 'read' && (
              <Button
                color="primary"
                onPress={() => {
                  // You could implement a way to switch to edit mode here
                  // For example, using a parent component state
                }}
              >
                Edit
              </Button>
            )} */}
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
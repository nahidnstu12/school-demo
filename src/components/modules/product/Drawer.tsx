'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@heroui/react';
import { X } from 'lucide-react';
import { ProductForm } from './Form2';

export type DrawerMode = 'create' | 'read' | 'edit';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DrawerMode;
  itemId?: string;
  onSuccess?: () => void;
}

export default function ProductDrawer({
  isOpen,
  onClose,
  mode,
  itemId,
  onSuccess,
}: ProductDrawerProps) {
  // Get drawer title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return 'Add New Product';
      case 'read':
        return 'Product Details';
      case 'edit':
        return 'Edit Product';
      default:
        return 'Product';
    }
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
          <ProductForm
            productId={itemId}
            mode={mode}
            isReadOnly={mode === 'read'}
            onSuccess={onSuccess}
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
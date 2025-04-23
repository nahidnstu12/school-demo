import { useState } from 'react';
import { DrawerMode } from '@/components/modules/teacher/Drawer';

export default function useDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>('create');
  const [itemId, setItemId] = useState<string | undefined>(undefined);

  const openDrawer = (drawerMode: DrawerMode, id?: string) => {
    setMode(drawerMode);
    setItemId(id);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    mode,
    itemId,
    openDrawer,
    closeDrawer,
  };
}

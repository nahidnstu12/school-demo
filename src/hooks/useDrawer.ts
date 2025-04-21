// hooks/useTeacherDrawer.ts
import { useState } from 'react';
import { DrawerMode } from '@/components/modules/teacher/Drawer';

export default function useTeacherDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>('create');
  const [teacherId, setTeacherId] = useState<string | undefined>(undefined);

  const openDrawer = (drawerMode: DrawerMode, id?: string) => {
    setMode(drawerMode);
    setTeacherId(id);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    mode,
    teacherId,
    openDrawer,
    closeDrawer
  };
}
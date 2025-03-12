import { Drawer, DrawerBody, DrawerContent, DrawerHeader } from '@heroui/react';

type CreateDrawerProps = {
  isOpen: boolean;
  onOpenChange: () => void;
  header: string;
  children: any;
};

export default function CreateDrawer({
  isOpen,
  onOpenChange,
  header,
  children,
}: CreateDrawerProps) {
  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1">{header}</DrawerHeader>
            <DrawerBody>{children}</DrawerBody>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

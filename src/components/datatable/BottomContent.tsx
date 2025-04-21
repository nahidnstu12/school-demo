// components/datatable/BottomContent.tsx
import React from 'react';
import { Button, Pagination } from "@heroui/react";
import { Selection } from "@heroui/react";

interface BottomContentProps {
  selectedKeys: Selection;
  total: number;
  page: number;
  pages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  handlePageChange: (page: number) => void;
}

export function BottomContent({
  selectedKeys,
  total,
  page,
  pages,
  onPreviousPage,
  onNextPage,
  handlePageChange
}: BottomContentProps) {
  return total > 0 ? (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="w-[30%] text-small text-default-400">
        {selectedKeys === "all"
          ? "All items selected"
          : `${selectedKeys instanceof Set ? selectedKeys.size : 0} of ${total} selected`}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={handlePageChange}
      />
      <div className="hidden sm:flex w-[30%] justify-end gap-2">
        <Button isDisabled={page === 1} size="sm" variant="flat" onPress={onPreviousPage}>
          Previous
        </Button>
        <Button isDisabled={page >= pages} size="sm" variant="flat" onPress={onNextPage}>
          Next
        </Button>
      </div>
    </div>
  ) : null;
}
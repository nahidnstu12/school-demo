// components/datatable/TableHeader.tsx
import React from 'react';
import { Select, SelectItem } from "@heroui/react";

interface TableHeaderProps {
  loading: boolean;
  total: number;
  startItem: number;
  endItem: number;
  currentPageSize: number;
  handlePageSizeChange: (newSize: number) => void;
  data: any[];
}

export function TableHeader({
  loading,
  total,
  startItem,
  endItem,
  currentPageSize,
  handlePageSizeChange,
  data
}: TableHeaderProps) {
  return (
    <div className="flex justify-between items-center py-2">
      <div className="text-sm text-default-400">
        {loading && data.length === 0
          ? 'Loading...'
          : total > 0
            ? `Showing ${startItem} to ${endItem} of ${total} entries`
            : 'No entries found'
        }
      </div>
      <div className="flex items-center gap-2 min-w-[170px]">
        <span className="text-sm whitespace-nowrap text-default-400">Rows per page:</span>
        <Select
          aria-label="Rows per page"
          className="w-20 min-w-[80px]"
          size="sm"
          variant="bordered"
          selectedKeys={new Set([currentPageSize.toString()])}
          disallowEmptySelection
          onSelectionChange={(keys) => {
            if (keys instanceof Set && keys.size > 0) {
              const newSize = Number(Array.from(keys)[0]);
              handlePageSizeChange(newSize);
            }
          }}
        >
          <SelectItem key="10">10</SelectItem>
          <SelectItem key="25">25</SelectItem>
          <SelectItem key="50">50</SelectItem>
          <SelectItem key="100">100</SelectItem>
        </Select>
      </div>
    </div>
  );
}
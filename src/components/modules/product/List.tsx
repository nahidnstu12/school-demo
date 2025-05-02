'use client';

import { getProductsWithFilter } from '@/backend/actions/product.action';
import { DataTable } from '@/components/datatable/datatable';
import { DataTableColumn } from '@/components/datatable/types';
import ProductDrawer from '@/components/modules/product/Drawer';
import useTeacherDrawer from '@/hooks/useDrawer';
import { productFilterConfig } from '@/schemas/product';
import { Button, Chip, Input } from '@heroui/react';
import { Edit, Eye, Trash } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useFilterStore } from '@/stores/useFilterStore';
import { FilterConfig } from '@/utils/filter-helpers';

// Define product type with necessary fields for display
interface IProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: boolean;
  featured: boolean;
  categoryId: string;
  categoryName?: string;
  images?: { url: string }[];
}

export default function ProductList() {
  const { isOpen, mode, itemId, openDrawer, closeDrawer } = useTeacherDrawer();
  const router = useRouter();

  // Reference to the DataTable's refetch function
  const dataTableRef = useRef<{
    refetchData: () => void;
  } | null>(null);

  // Get required functions from filter store
  const { setFilter, getFilterValue, setConfig } = useFilterStore();

  // Set filter config once
  useEffect(() => {
    setConfig(productFilterConfig as FilterConfig);
  }, [setConfig]);

  // Improved handleSuccess callback to actually refresh data
  const handleSuccess = useCallback(() => {
    console.log('Product saved successfully, refreshing data...');

    if (dataTableRef.current) {
      dataTableRef.current.refetchData();
    }

    closeDrawer();
  }, [closeDrawer]);

  // Handle Add New button click
  const handleAddNew = useCallback(() => {
    openDrawer('create');
  }, [openDrawer]);

  const handleDelete = useCallback((id: string) => {
    // Implement delete logic or confirmation dialog
    console.log('Delete product', id);
  }, []);

  // Define columns for the table with all cell rendering logic
  const columns: DataTableColumn<IProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (product: IProduct) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          )}
          <div className="flex flex-col">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-500">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryId',
      header: 'Category',
      cell: (product: IProduct) => product.categoryName,
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [], // Will be populated with categories
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      filterable: true,
      filterType: 'number',
      cell: (product: IProduct) => (
        <span className="font-medium">${product.price.toFixed(2)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      filterable: true,
      filterType: 'number',
      cell: (product: IProduct) => (
        <span className={product.stock > 0 ? 'text-success' : 'text-danger'}>
          {product.stock}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'In Stock', value: true },
        { label: 'Out of Stock', value: false },
      ],
      cell: (product: IProduct) => (
        <div className="flex gap-2">
          <Chip
            className="capitalize"
            color={product.status ? 'success' : 'danger'}
            size="sm"
            variant="flat"
          >
            {product.status ? 'In Stock' : 'Out of Stock'}
          </Chip>
          {product.featured && (
            <Chip
              className="capitalize"
              color="warning"
              size="sm"
              variant="flat"
            >
              Featured
            </Chip>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (product) => (
        <div className="relative flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('read', product.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => openDrawer('edit', product.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            className="text-danger"
            onPress={() => handleDelete(product.id)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Handle changes in the additional filter inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    const column = columns.find((col) => col.key === name);
    const operator = column?.filterType === 'select' ? 'equals' : 'contains';

    setFilter(name, productFilterConfig.fields[name]?.defaultOperator || operator, value);
  };

  // Additional filters that will be shown outside the filter modal
  const additionalFilters = [
    <Input
      key="name-additional-filter"
      type="text"
      aria-label="Name"
      label="Search by Name"
      labelPlacement="outside"
      name="name"
      placeholder="Filter by name..."
      value={getFilterValue('name') || ''}
      onChange={handleInputChange}
      variant="bordered"
    />,
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        ref={dataTableRef}
        columns={columns}
        fetchData={getProductsWithFilter}
        additionalFilters={additionalFilters}
        onAddNew={handleAddNew}
      />
      <ProductDrawer
        isOpen={isOpen}
        mode={mode}
        itemId={itemId}
        onClose={closeDrawer}
        onSuccess={handleSuccess}
      />
    </div>
  );
} 
'use client';

import { getProductCategories, getProductsWithFilter } from '@/backend/actions/product.action';
import { DataTable } from '@/components/datatable/datatable';
import { DataTableColumn } from '@/components/datatable/types';
import ProductDrawer from '@/components/modules/product/Drawer';
import useDrawer from '@/hooks/useDrawer';
import { productFilterConfig } from '@/schemas/product';
import { useFilterStore } from '@/stores/useFilterStore';
import { FilterConfig } from '@/utils/filter-helpers';
import { Button, Chip, Input, Select, SelectItem } from '@heroui/react';
import { Edit, Eye, Trash } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
  categoryName: string;
  images?: { url: string }[];
}

export default function ProductList() {
  const { isOpen, mode, itemId, openDrawer, closeDrawer } = useDrawer();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getProductCategories();
      console.log('result categories>>', result);
      if (result.success) {
        setCategories(result.data);
      }
    };
    fetchCategories();
  }, []);

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
    // {
    //   key: 'product',
    //   header: 'Product',
    //   sortable: true,
    //   filterable: true,
    //   filterType: 'text',
    //   cell: (product: IProduct) => (
    //     <div className="flex items-center gap-3">
    //       {product.images?.[0] && (
    //         <Image
    //           src={product.images[0].url}
    //           alt={product.name}
    //           width={40}
    //           height={40}
    //           className="rounded-md object-cover"
    //         />
    //       )}
    //       <div className="flex flex-col">
    //         <p className="font-medium">{product.name}</p>
    //         <p className="text-sm text-gray-500">{product.sku}</p>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      cell: (product: IProduct) => (
        <div className="flex flex-col">
          <p className="text-bold text-small">{product.name}</p>
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
      filterOptions: categories.map((category) => ({ label: category.name, value: category.id })),
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
      key: 'sku',
      header: 'SKU',
      sortable: false,
      filterable: false,
      cell: (product: IProduct) => (
        <span className="font-medium">{product.sku}</span>
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
      sortable: false,
      filterable: true,
      filterType: 'checkbox',
      // filterOptions: [
      //   { label: 'In Stock', value: 'true' },
      //   { label: 'Out of Stock', value: 'false' },
      // ],
      cell: (product: IProduct) => (
        <div className="flex gap-2">
          <Chip
            className="capitalize"
            color={product.status && product.stock > 0 ? 'success' : 'danger'}
            size="sm"
            variant="flat"
          >
            {(product.status && product.stock > 0) ? 'In Stock' : 'Out of Stock'}
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
    <Select
      key="featured-additional-filter"
      aria-label="Featured"
      label="Featured"
      labelPlacement="outside"
      name="featured"
      placeholder="Filter by featured..."
      value={getFilterValue('featured') || ''}
      onChange={handleInputChange}
      variant="bordered"
    >
      <SelectItem textValue="true" key="true">True</SelectItem>
      <SelectItem textValue="false" key="false">False</SelectItem>
    </Select>,
  ];

  return (
    <div className="container mx-auto p-4">
      <DataTable
        title="Products"
        filterConfig={productFilterConfig}
        initialVisibleColumns={[
          'name',
          'categoryId',
          'price',
          'stock',
          'status',
          'actions',
        ]}
        ref={dataTableRef}
        columns={columns}
        fetchData={getProductsWithFilter}
        additionalFilters={additionalFilters}
        onAddNew={handleAddNew}
        emptyContent="No products found"
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
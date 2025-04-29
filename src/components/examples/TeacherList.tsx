'use client';

import { teacherFilterConfig } from '@/schemas/teacher';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { getTeachersWithFilter, getTeacherDesignations } from '../../backend/actions/teacher.action';
import { useDynamicFilters } from '@/hooks/useDynamicFilter';
import { getAllInstitutions } from '@/backend/actions/institution.action';

// Define teacher type with necessary fields for display
interface Teacher {
  id: string;
  fullName?: string; // Optional field from DTO
  institutionName?: string; // Optional field from DTO
  institutionId: string;
  phone?: string | null;
  email?: string;
  pdsId: string | null;
  designation: string;
  joiningDate: Date | null;
  status: boolean;
  // Relations needed for direct access in the table
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  };
  institution: {
    name: string;
  };
}

export default function TeacherList() {
  // Use the dynamic filters hook for URL persistence
  const {
    prismaFilter,
    setFilter,
    setRangeFilter,
    applyFilters,
    setPage,
    setPageSize,
    setSort,
    clearAllFilters,
    getFilterValue,
    page,
    pageSize,
  } = useDynamicFilters(teacherFilterConfig);

  // Add type definition for prismaFilter
  const typedPrismaFilter = prismaFilter as { orderBy?: Record<string, 'asc' | 'desc'> };

  // State for teachers and metadata
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [designations, setDesignations] = useState<string[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs for request tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchUrlRef = useRef<string>('');
  const pendingFetchRef = useRef<string | null>(null);

  // Calculate pagination values
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  // Handle form input changes (only updates form state, not URL)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilter(name, 'equals', checked);
    } else if (name === 'minJoiningDate' || name === 'maxJoiningDate') {
      // Handle date range
      const minDate = name === 'minJoiningDate' ? value : getFilterValue('joiningDate')?.min;
      const maxDate = name === 'maxJoiningDate' ? value : getFilterValue('joiningDate')?.max;
      setRangeFilter(
        'joiningDate',
        minDate ? new Date(minDate) : undefined,
        maxDate ? new Date(maxDate) : undefined
      );
    } else if (name === 'search') {
      // For search, we'll handle this specially in the server action
      // Just pass it through as a special search parameter;
      setFilter('search', 'contains', value);
    } else if (name === 'email') {
      // For email, we set it directly as email (not user_email)
      // The server action will handle the relation mapping
      setFilter('email', 'contains', value);
    } else if (name === 'phone') {
      // For phone, we set it directly as phone (not user_phone)
      // The server action will handle the relation mapping
      setFilter('phone', 'contains', value);
    } else {
      // For other inputs
      setFilter(name, teacherFilterConfig.fields[name].defaultOperator || 'contains', value);
    }
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split(':');
    setSort(field, direction as 'asc' | 'desc');
  };

  // Handle form submission - this is when we apply filters to URL and trigger data fetch
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    applyFilters(); // Apply form filters to URL and trigger data fetch
  };

  // Clear all filters
  const clearFilters = () => {
    clearAllFilters(); // This will also trigger data fetch
  };

  // Function to fetch teachers based on current filters
  const fetchTeachers = async () => {
    // Abort any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      // Get the CURRENT URL from the browser to ensure we're using the latest params
      const currentUrl = new URL(window.location.href);
      const urlString = currentUrl.search;

      // Skip if URL hasn't changed
      if (urlString === lastFetchUrlRef.current && urlString !== '') {
        console.log('Skipping duplicate fetch for URL:', urlString);
        setLoading(false);
        return;
      }

      // Remember this URL for future deduplication
      lastFetchUrlRef.current = urlString;

      // Send to server
      const formData = new FormData();
      formData.append('filter', JSON.stringify(prismaFilter));

      console.log('Fetching teachers with filter:', prismaFilter);

      const result = await getTeachersWithFilter(formData);

      // Only update state if this request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        if (result.success) {
          setTeachers(result.data.data);
          setTotal(result.data.total);
        } else {
          console.error('Error fetching teachers:', result.errors);
        }
      }
    } catch (error: any) {
      // Only log errors for non-aborted requests
      if (error.name !== 'AbortError') {
        console.error('Error fetching teachers:', error);
      }
    } finally {
      // Only update loading state if this request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage); // This will update URL and trigger data fetch
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize); // This will update URL and trigger data fetch
  };

  // Get filter values for form controls - FIXED to use the correct field names
  const searchValue = getFilterValue('search') || '';
  const institutionValue = getFilterValue('institutionId') || '';
  const designationValue = getFilterValue('designation') || '';
  const emailValue = getFilterValue('email') || '';
  const phoneValue = getFilterValue('phone') || '';
  const pdsIdValue = getFilterValue('pdsId') || '';
  const joiningDateRange = getFilterValue('joiningDate') || { min: '', max: '' };
  const statusValue = getFilterValue('status');

  // Determine current sort value for the select input
  const sortValue = typedPrismaFilter.orderBy
    ? `${Object.keys(typedPrismaFilter.orderBy)[0]}:${Object.values(typedPrismaFilter.orderBy)[0]}`
    : 'joiningDate:desc';

  // Fetch designations and institutions on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Fetch designations
        const designationsResult = await getTeacherDesignations();
        if (designationsResult.success) {
          setDesignations(designationsResult.data);
        }

        // Fetch institutions
        const institutionsResult = await getAllInstitutions();
        if (institutionsResult.success) {
          setInstitutions(institutionsResult.data);
        }
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch teachers when prismaFilter changes
  useEffect(() => {
    if (Object.keys(prismaFilter).length > 0) {
      // Generate a unique ID for this fetch operation
      const fetchId = Date.now().toString();
      pendingFetchRef.current = fetchId;

      // Small delay to ensure URL has been updated in the browser
      setTimeout(() => {
        // Only proceed if this is still the most recent fetch request
        if (pendingFetchRef.current === fetchId) {
          fetchTeachers();
        }
      }, 50);
    }
  }, [prismaFilter]);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      {/* Filter Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Teacher Filters</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Global Search
              </label>
              <input
                type="text"
                id="search"
                name="search"
                value={searchValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search name, email, phone, PDS ID..."
              />
            </div>

            {/* Institution Filter */}
            <div>
              <label
                htmlFor="institutionId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Institution
              </label>
              <select
                id="institutionId"
                name="institutionId"
                value={institutionValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Institutions</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Email Filter */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={emailValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by email..."
              />
            </div>

            {/* Phone Filter */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={phoneValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by phone..."
              />
            </div>

            {/* PDS ID Filter */}
            <div>
              <label htmlFor="pdsId" className="block text-sm font-medium text-gray-700 mb-1">
                PDS ID
              </label>
              <input
                type="text"
                id="pdsId"
                name="pdsId"
                value={pdsIdValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by PDS ID..."
              />
            </div>

            {/* Designation Filter */}
            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                Designation
              </label>
              <select
                id="designation"
                name="designation"
                value={designationValue}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Designations</option>
                {designations.map((designation) => (
                  <option key={designation} value={designation}>
                    {designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Joining Date Range - Min */}
            <div>
              <label
                htmlFor="minJoiningDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Joining Date From
              </label>
              <input
                type="date"
                id="minJoiningDate"
                name="minJoiningDate"
                value={
                  joiningDateRange.min
                    ? new Date(joiningDateRange.min).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Joining Date Range - Max */}
            <div>
              <label
                htmlFor="maxJoiningDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Joining Date To
              </label>
              <input
                type="date"
                id="maxJoiningDate"
                name="maxJoiningDate"
                value={
                  joiningDateRange.max
                    ? new Date(joiningDateRange.max).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={statusValue === undefined ? '' : String(statusValue)}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setFilter('status', 'equals', null);
                  } else {
                    setFilter('status', 'equals', value === 'true');
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                name="sort"
                value={sortValue}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="joiningDate:desc">Joining Date (Newest)</option>
                <option value="joiningDate:asc">Joining Date (Oldest)</option>
                <option value="fullName:asc">Name (A-Z)</option>
                <option value="fullName:desc">Name (Z-A)</option>
                <option value="designation:asc">Designation (A-Z)</option>
                <option value="designation:desc">Designation (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Table Header with counts and page size selector */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center">
          <div className="text-sm text-gray-600">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-medium">{total === 0 ? 0 : startItem}</span> to{' '}
                <span className="font-medium">{endItem}</span> of{' '}
                <span className="font-medium">{total}</span> teachers
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600">
              Show
            </label>
            <select
              id="pageSize"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Teacher Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDS ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joining Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacher.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.institutionName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{teacher.email}</div>
                      <div>{teacher.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.pdsId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(teacher.joiningDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          teacher.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers - show max 5 pages, with ellipsis if needed */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;

                    // Calculate which page numbers to show
                    if (totalPages <= 5) {
                      // If 5 or fewer pages, show all pages
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      // If near the start, show first 5 pages
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      // If near the end, show last 5 pages
                      pageNum = totalPages - 4 + i;
                    } else {
                      // Otherwise show 2 pages before and after current page
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page >= totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

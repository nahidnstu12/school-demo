import { Skeleton } from '@heroui/react';

export default function TableSkeleton() {
  return (
    <div className="p-4 rounded-md flex-1 m-4 mt-0 max-h-full h-full">
      {/* Skeleton Loader for Table Header */}
      <Skeleton className="px-4 mb-4">
        <div className="h-8 bg-gray-200 rounded-md"></div>
      </Skeleton>

      {/* Skeleton Loader for Table Rows */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md mt-8">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="">
              <td colSpan={3} className="px-4 py-2">
                <Skeleton className="mb-2 px-4 py-2">
                  <div className="h-8 bg-gray-400 rounded-md"></div>
                </Skeleton>
              </td>
            </tr>
          </thead>
          <tbody>
            {/* Skeleton Rows */}
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <Skeleton className="h-6 w-full" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton className="h-6 w-full" />
                </td>
                <td className="px-4 py-2">
                  <Skeleton className="h-6 w-full" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-8 flex justify-between items-center">
        <Skeleton className="h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SearchParams = PaginationParams & {
  query?: string;
  orderBy?: Record<string, 'asc' | 'desc'>;
  filters?: Record<string, unknown>;
};

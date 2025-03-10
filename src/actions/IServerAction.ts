'use server';

export interface IServerAction<T, ModelType> {
  create(formData: FormData): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  update(
    id: string | number,
    formData: FormData
  ): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  delete(id: string | number): Promise<{ success: boolean; data?: ModelType; errors?: any[] }>;
  getById(
    id: string | number
  ): Promise<{ success: boolean; data?: ModelType | null; errors?: any[] }>;
  getAll(filters?: any): Promise<{ success: boolean; data?: ModelType[]; errors?: any[] }>;
}

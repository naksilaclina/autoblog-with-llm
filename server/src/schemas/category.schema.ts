import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Kategori adı zorunludur'),
  slug: z.string().min(1, 'Slug zorunludur'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  meta_title: z.string().min(1, 'Meta başlık zorunludur'),
  meta_description: z.string().min(1, 'Meta açıklama zorunludur'),
  is_active: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>; 
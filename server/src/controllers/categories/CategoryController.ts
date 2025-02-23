import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { createCategorySchema, updateCategorySchema } from '../../schemas/category.schema';
import { AppError, ErrorCodes } from '../../utils/AppError';

export class CategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parent_id: true,
          parent: {
            select: {
              name: true,
            },
          },
          meta_title: true,
          meta_description: true,
          is_active: true,
          created_at: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      return res.json({
        data: categories.map((category: any) => ({
          ...category,
          post_count: category._count.posts,
          _count: undefined,
          parent: category.parent?.name || null,
        })),
      });
    } catch (error) {
      console.error('Kategoriler getirilirken hata:', error);
      throw new AppError(
        'Kategoriler getirilirken bir hata oluştu',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  async getCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          parent_id: true,
          parent: {
            select: {
              name: true,
            },
          },
          meta_title: true,
          meta_description: true,
          is_active: true,
          created_at: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });

      if (!category) {
        throw new AppError('Kategori bulunamadı', 404, ErrorCodes.NOT_FOUND);
      }

      return res.json({
        data: {
          ...category,
          post_count: category._count.posts,
          _count: undefined,
          parent: category.parent?.name || null,
        },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error('Kategori getirilirken hata:', error);
      throw new AppError(
        'Kategori getirilirken bir hata oluştu',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const validatedData = createCategorySchema.parse(req.body);

      // Eğer parent_id varsa, parent kategorinin varlığını kontrol et
      if (validatedData.parent_id) {
        const parentExists = await prisma.category.findUnique({
          where: { id: validatedData.parent_id },
        });

        if (!parentExists) {
          throw new AppError(
            'Üst kategori bulunamadı',
            400,
            ErrorCodes.VALIDATION_ERROR
          );
        }
      }

      const category = await prisma.category.create({
        data: validatedData,
      });

      return res.status(201).json({
        data: category,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error('Kategori oluşturulurken hata:', error);
      throw new AppError(
        'Kategori oluşturulurken bir hata oluştu',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);

      // Kategori var mı kontrol et
      const existingCategory = await prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new AppError('Kategori bulunamadı', 404, ErrorCodes.NOT_FOUND);
      }

      // Eğer parent_id varsa, parent kategorinin varlığını ve döngüsel ilişki olmadığını kontrol et
      if (validatedData.parent_id) {
        if (validatedData.parent_id === id) {
          throw new AppError(
            'Bir kategori kendisini üst kategori olarak seçemez',
            400,
            ErrorCodes.VALIDATION_ERROR
          );
        }

        const parentExists = await prisma.category.findUnique({
          where: { id: validatedData.parent_id },
        });

        if (!parentExists) {
          throw new AppError(
            'Üst kategori bulunamadı',
            400,
            ErrorCodes.VALIDATION_ERROR
          );
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: validatedData,
      });

      return res.json({
        data: category,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error('Kategori güncellenirken hata:', error);
      throw new AppError(
        'Kategori güncellenirken bir hata oluştu',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Kategori var mı kontrol et
      const existingCategory = await prisma.category.findUnique({
        where: { id },
        include: {
          children: true,
          posts: true,
        },
      });

      if (!existingCategory) {
        throw new AppError('Kategori bulunamadı', 404, ErrorCodes.NOT_FOUND);
      }

      // Alt kategorileri ve içerikleri varsa silmeyi reddet
      if (existingCategory.children.length > 0) {
        throw new AppError(
          'Bu kategorinin alt kategorileri var. Önce alt kategorileri silmelisiniz.',
          400,
          ErrorCodes.VALIDATION_ERROR
        );
      }

      if (existingCategory.posts.length > 0) {
        throw new AppError(
          'Bu kategoride içerikler var. Önce içerikleri silmeli veya başka bir kategoriye taşımalısınız.',
          400,
          ErrorCodes.VALIDATION_ERROR
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      return res.status(204).send();
    } catch (error) {
      if (error instanceof AppError) throw error;

      console.error('Kategori silinirken hata:', error);
      throw new AppError(
        'Kategori silinirken bir hata oluştu',
        500,
        ErrorCodes.INTERNAL_ERROR
      );
    }
  }
} 
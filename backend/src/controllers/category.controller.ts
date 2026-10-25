import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export class CategoryController {
  static async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      });

      const formatted = categories.map((c) => ({
        id: c.id,
        name: c.name,
        nameHi: c.nameHi,
        slug: c.slug,
        description: c.description,
        descriptionHi: c.descriptionHi,
        imageUrl: c.imageUrl,
        productCount: c._count.products,
      }));

      return ApiResponse.success(res, formatted, 'Categories retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await prisma.category.findUnique({
        where: { slug: req.params.slug },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
        },
      });

      if (!category || !category.isActive) {
        throw ApiError.notFound('Category not found.');
      }

      return ApiResponse.success(res, category, 'Category retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

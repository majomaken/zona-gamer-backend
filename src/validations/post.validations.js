import z from "zod";

export const createPostValidation = z.object({
  title: z.string()
    .min(5, { message: "El título debe tener al menos 5 caracteres" })
    .max(100, { message: "El título debe tener menos de 100 caracteres" })
    .trim(),
  description: z.string()
    .min(10, { message: "La descripción debe tener al menos 10 caracteres" })
    .max(1000, { message: "La descripción debe tener menos de 1000 caracteres" })
    .trim(),
  content: z.string()
    .trim(),
  image: z.string()
    .optional(),
  type: z.enum(
    ['blog', 'event', 'news'], 
    { message: "El tipo debe ser blog, evento o noticia" }
  ),
  category: z.string()
    .min(2, { message: "La categoría debe tener al menos 2 caracteres" })
    .max(50, { message: "La categoría debe tener menos de 50 caracteres" })
    .optional()
    .default('General'),
  tags: z.array(z.string().min(2).max(50))
    .optional()
    .default([]),
})

export const getPostsQueryValidation = z.object({
  page: z.string()
    .regex(/^\d+$/, { message: "La página debe ser un número" })
    .transform(Number)
    .refine(n => n > 0, { message: "La página debe ser mayor a 0" })
    .optional()
    .default(1),
  limit: z.string()
    .regex(/^\d+$/, { message: "El límite debe ser un número" })
    .transform(Number)
    .refine(n => n > 0 && n <= 50, { message: "El límite debe ser mayor a 0 y menor a 50" })
    .optional()
    .default(10),
  category: z.string()
    .min(1)
    .max(30)
    .optional(),
  tags: z.string()
    .optional()
    .transform(str => str ? str.split(',').map(tag => tag.trim()) : []),
  search: z.string()
    .min(1)
    .max(100)
    .optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'likes'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc'])
    .optional()
    .default('desc'),
})

export const postIdValidation = z.object({
  id: z.string()
    .min(1, { message: "ID del post es requerido" })
    .trim(),
})

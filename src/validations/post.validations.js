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

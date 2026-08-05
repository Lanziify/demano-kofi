import z from 'zod';

export const addProductImageSchema = z.object({
  file: z
    .file()
    .optional()
    .refine((file) => !file || file.size <= 5_000_000, {
      message: 'Image must be less than 5 MB',
    })
    .refine(
      (file) =>
        !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Only JPG, PNG, and WebP images are allowed',
      }
    ),
  altText: z.string().trim().max(255).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isPrimary: z.boolean().optional(),
});

export type AddProductImageSchemaValue = z.infer<typeof addProductImageSchema>;

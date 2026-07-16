import { z } from 'zod';

const nameSchema = z
  .string()
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be at most 50 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Can only contain letters, spaces, hyphens, and apostrophes'
  );

export const profileInfoSchema = z.object({
  image: z.string().optional(),
  firstName: nameSchema,
  lastName: nameSchema,
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export type ProfileInfoSchemaValues = z.infer<typeof profileInfoSchema>;

export const addressDetailsSchema = z.object({
  building: z.string().optional(),
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
});

export type AddressDetailsSchemaValues = z.infer<typeof addressDetailsSchema>;

export const profileSchema = profileInfoSchema.extend({
  address: addressDetailsSchema,
});

export type ProfileSchemaValues = z.infer<typeof profileSchema>;

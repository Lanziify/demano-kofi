import type { Selectable } from 'kysely';
import { z } from 'zod';
import type { Outbox } from '@/types/db';

export const outboxEventTypeSchema = z.enum(['product.image.process_requested']);

export type OutboxEventType = z.infer<typeof outboxEventTypeSchema>;

export const outboxSchema = z.object({
  id: z.uuid(),
  eventType: outboxEventTypeSchema,
  payload: z.string(),
  attempts: z.number().int().nonnegative(),
  createdAt: z.date(),
  processedAt: z.date().nullable(),
  failedAt: z.date().nullable(),
}) satisfies z.ZodType<Selectable<Outbox>>;

export const createOutboxEventSchema = outboxSchema.pick({
  eventType: true,
  payload: true,
});

export type CreateOutboxEventValues = z.infer<typeof createOutboxEventSchema>;

'use client';

import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field';
import {
  addressDetailsSchema,
  AddressDetailsSchemaValues,
} from '../schema/profile.schema';

interface CreateAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampusDialog({
  open,
  onOpenChange,
}: CreateAddressDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { updateAuthSession } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressDetailsSchemaValues>({
    resolver: zodResolver(addressDetailsSchema),
    defaultValues: {
      building: '',
      street: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      postalCode: '',
    },
  });

  const onSubmit = async (data: AddressDetailsSchemaValues) => {
    toast.success('Campus created successfully');

    await updateAuthSession();

    setIsLoading(false);
    reset();
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New Campus</DialogTitle>
          <DialogDescription>
            Create a new campus organization. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campus Name */}
          <FieldSet>
            <FieldLegend>Address Information</FieldLegend>

            <FieldDescription>
              Keep your address information up to date for accurate records and
              deliveries.
            </FieldDescription>

            <FieldGroup>
              <Controller
                name="building"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>
                      House/Unit No., Building
                    </FieldLabel>

                    <Input {...field} placeholder="Unit 12B, ABC Tower" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="street"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Street</FieldLabel>

                    <Input {...field} placeholder="Ayala Avenue" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="barangay"
                control={control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Barangay</FieldLabel>

                    <Input {...field} placeholder="Bel-Air" />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="city"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        City / Municipality
                      </FieldLabel>

                      <Input {...field} placeholder="Makati City" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="province"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Province</FieldLabel>

                      <Input {...field} placeholder="Metro Manila" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="region"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Region</FieldLabel>

                      <Input {...field} placeholder="NCR" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Postal Code</FieldLabel>

                      <Input {...field} placeholder="1209" />

                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Campus'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash/isEqual';
import { Check, Plus, X } from 'lucide-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConfirmationDialog, type ConfirmationDialogOptions } from '@/components/custom/confirmation-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { useDialog } from '@/hooks/use-dialog';
import { useCreateProductCategory, useUpdateProductCategory } from '../mutations/product-category.mutation';
import { type ProductCategoryFormValues, productCategoryFormSchema } from '../schema/category.schema';
import type { ProductCategory } from '../types/types';

type ProductCategoryDialogFormStatus = 'idle' | 'loading' | 'success' | 'error';

export type ProductCategoryDialogFormOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  closeText?: string;
  confirmVariant?: 'default' | 'destructive';
  data?: ProductCategory | null;
  onConfirm?: () => void | Promise<void>;
};

export type ProductCategoryDialogFormProps = ProductCategoryDialogFormOptions & {
  open?: boolean;
  loading?: boolean;
  status?: ProductCategoryDialogFormStatus;
  onOpenChange?: (open: boolean) => void;
};

export function ProductCategoryDialogForm({
  open = false,
  title = '',
  description = '',
  status = 'idle',
  confirmLabel = 'Submit',
  data,
  onOpenChange,
}: ProductCategoryDialogFormProps) {
  const isLoading = status === 'loading';

  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();
  const confirmationDialog = useDialog<ConfirmationDialogOptions>();

  const initialValues = {
    name: '',
    description: '',
  };

  const form = useForm({
    resolver: zodResolver(productCategoryFormSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: ProductCategoryFormValues) => {
    if (data?.id) {
      const categoryId = data.id;

      confirmationDialog.show({
        title: 'Continue update?',
        description: 'Please confirm your changes',
        confirmLabel: 'Confirm',
        confirmVariant: 'default',
        onConfirm: async () => {
          await updateCategory.mutateAsync({ ...values, id: categoryId });

          toast.success('Category updated successfully');
          onOpenChange?.(false);
        },
      });
    } else {
      await createCategory.mutateAsync(values);
      toast.success('Category created successfully');
      form.reset();
    }
  };

  const hasFormValues = () => {
    const values = form.getValues();
    const editValues = productCategoryFormSchema.safeParse(data);

    return editValues.error
      ? values.name.trim() !== '' || values.description.trim() !== ''
      : !isEqual(values, editValues.data);
  };

  const handleFormCancel = () => {
    if (!hasFormValues()) {
      if (onOpenChange) {
        onOpenChange(false);
      }
    }

    confirmationDialog.show({
      title: 'Are you sure?',
      description: 'You will lose all the information entered for this category.',
      confirmLabel: 'Confirm',
      confirmVariant: 'default',
      onConfirm: () => {
        form.reset();
        confirmationDialog.close();
      },
    });
  };

  function handleOpenChange(value: boolean) {
    // prevent closing while loading
    if (isLoading && !value) {
      return;
    }

    if (onOpenChange) {
      onOpenChange(value);
    }
  }

  React.useEffect(() => {
    if (!data) return;

    const parsedData = productCategoryFormSchema.safeParse(data);

    if (parsedData.error) {
      toast.error(parsedData.error.message);
    }

    form.reset({
      ...initialValues,
      ...parsedData.data,
    });
  }, [data, form.reset]);

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent showCloseButton={false} className="sm:max-w-xl">
            {!isSubmitting ? (
              <>
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <FieldGroup className="grid grid-cols-2">
                  <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                        <Input {...field} placeholder="Coffee" />

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                        <Input {...field} placeholder="Optional short category description" />

                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <DialogFooter>
                  <Field orientation="horizontal" className="justify-end">
                    <Button type="button" variant="outline" onClick={handleFormCancel} disabled={isSubmitting}>
                      <X />
                      Cancel
                    </Button>
                    <Button type="submit" form="category-form" disabled={isSubmitting}>
                      <Check />
                      {confirmLabel}
                    </Button>
                  </Field>
                </DialogFooter>
              </>
            ) : (
              <Item>
                <ItemMedia>
                  <Spinner />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="line-clamp-1">Please wait for a while...</ItemTitle>
                </ItemContent>
              </Item>
            )}
          </DialogContent>
        </form>
      </Dialog>
      {confirmationDialog.dialog && (
        <ConfirmationDialog
          {...confirmationDialog.dialog}
          onOpenChange={(open) => {
            confirmationDialog.setDialog((prev) => (prev ? { ...prev, open } : prev));
          }}
          onConfirm={confirmationDialog.dialog.onConfirm}
        />
      )}
    </div>
  );
}

export function ProductCategoryDialogFormTrigger() {
  const categoryDialog = useDialog<ProductCategoryDialogFormOptions>();

  return (
    <div>
      <Button
        onClick={() => {
          categoryDialog.show({
            title: 'New Category',
            description: 'Create new product category for you product listings.',
          });
        }}
      >
        <Plus />
        Add Category
      </Button>
      {categoryDialog.dialog?.open && (
        <ProductCategoryDialogForm
          onOpenChange={(open) => {
            categoryDialog.setDialog((prev) => (prev ? { ...prev, open } : prev));
          }}
          {...categoryDialog.dialog}
        />
      )}
    </div>
  );
}

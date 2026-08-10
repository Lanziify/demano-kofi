'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import isEqual from 'lodash/isEqual';
import { Check, Component, Plus, X } from 'lucide-react';
import React from 'react';
import {
  Controller,
  type Resolver,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { toast } from 'sonner';
import {
  ConfirmationDialog,
  type ConfirmationDialogOptions,
} from '@/components/custom/confirmation-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import {
  useCreateProductCategory,
  useUpdateProductCategory,
} from '@/feature/products/mutations/product-category.mutation';
import {
  type CreateProductCategorySchemaValue,
  createProductCategorySchema,
  type UpdateProductCategorySchemaValue,
  updateProductCategorySchema,
} from '@/feature/products/schema/product-category.schema';
import type { ProductCategoryWithGroupsModifiers } from '@/feature/products/service/product-category.service';
import { useDialog } from '@/hooks/use-dialog';
import ProductModifierGroupCard from './modifier-group-card';

type ProductCategoryDialogStatus = 'idle' | 'loading' | 'success' | 'error';

export type ProductCategoryDialogOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  closeText?: string;
  confirmVariant?: 'default' | 'destructive';
  data?: ProductCategoryWithGroupsModifiers[number] | null;
  onConfirm?: () => void | Promise<void>;
};

export type ProductCategoryDialogProps = ProductCategoryDialogOptions & {
  open?: boolean;
  loading?: boolean;
  status?: ProductCategoryDialogStatus;
  onOpenChange?: (open: boolean) => void;
};

export function ProductCategoryDialog({
  open = false,
  title = '',
  description = '',
  status = 'idle',
  confirmLabel = 'Submit',
  data,
  onOpenChange,
}: ProductCategoryDialogProps) {
  const isLoading = status === 'loading';
  const isEditing = Boolean(data?.id);

  const createCategory = useCreateProductCategory();
  const updateCategory = useUpdateProductCategory();
  const confirmationDialog = useDialog<ConfirmationDialogOptions>();

  const initialValues = {
    name: '',
    description: '',
    modifierGroups: [],
  };

  // Editing an existing category still uses createProductCategorySchema's
  // shape for the form's type param — updateProductCategorySchema only
  // differs by requiring `id` on the category/groups/modifiers, which the
  // resolver below validates at runtime regardless of the declared type.
  const categorySchema = isEditing
    ? updateProductCategorySchema
    : createProductCategorySchema;

  const form = useForm({
    resolver: zodResolver(
      categorySchema
    ) as Resolver<CreateProductCategorySchemaValue>,
    defaultValues: {
      ...initialValues,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const modifierGroups = useFieldArray({
    control: form.control,
    name: 'modifierGroups',
  });

  const onSubmit = async (values: CreateProductCategorySchemaValue) => {
    if (data?.id) {
      const editValues = categorySchema.safeParse(data);
      if (isEqual(values, editValues.data)) return;

      const { modifierGroups: groups, ...categoryData } =
        values as unknown as UpdateProductCategorySchemaValue;

      confirmationDialog.show({
        title: 'Continue update?',
        description: 'Please confirm your changes',
        confirmLabel: 'Confirm',
        confirmVariant: 'default',
        onConfirm: async () => {
          await updateCategory.mutateAsync({
            ...categoryData,
            id: String(data.id),
            modifierGroups: groups,
          });

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
    const editValues = categorySchema.safeParse(data);

    return editValues.error
      ? values.name.trim() !== '' ||
          values.description.trim() !== '' ||
          (values.modifierGroups && values.modifierGroups?.length > 0)
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
      description:
        'You will lose all the information entered for this category.',
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
    const parsedData = categorySchema.safeParse(data);

    form.reset({
      ...initialValues,
      ...parsedData.data,
    } as CreateProductCategorySchemaValue);
  }, [data, form.reset, categorySchema]);

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent showCloseButton={false} className="sm:max-w-3xl">
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

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Description
                        </FieldLabel>
                        <Input
                          {...field}
                          placeholder="Optional short category description"
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </FieldGroup>
                <div className="-mx-4 no-scrollbar max-h-[50vh] space-y-6 overflow-y-auto px-4">
                  {modifierGroups.fields.length > 0 && (
                    <FieldSet>
                      <FieldLegend>Modifier Groups</FieldLegend>
                      <FieldDescription>
                        Create product modifier groups
                      </FieldDescription>
                      <FieldGroup className="gap-4">
                        {modifierGroups.fields.map((field, index) => (
                          <ProductModifierGroupCard
                            key={field.id}
                            control={form.control}
                            name={`modifierGroups.${index}`}
                            onClose={() => modifierGroups.remove(index)}
                          />
                        ))}
                      </FieldGroup>
                    </FieldSet>
                  )}

                  {modifierGroups.fields.length === 0 ? (
                    <Empty className="border border-dashed p-4">
                      <EmptyHeader className="w-full max-w-none flex-row justify-between">
                        <div className="flex items-center gap-4">
                          <EmptyMedia variant="icon" className="m-0">
                            <Component />
                          </EmptyMedia>
                          <div className="text-start">
                            <EmptyTitle>No modifier groups</EmptyTitle>
                            <EmptyDescription>
                              You haven't created any product modifier group for
                              this category yet.
                            </EmptyDescription>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() =>
                            modifierGroups.append({
                              name: '',
                              selectionType: 'multiple',
                              isRequired: false,
                              modifiers: [],
                            })
                          }
                        >
                          <Plus />
                          Add Group
                        </Button>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        modifierGroups.append({
                          name: '',
                          selectionType: 'multiple',
                          isRequired: false,
                          modifiers: [],
                        })
                      }
                    >
                      <Plus />
                      Add Group
                    </Button>
                  )}
                </div>
                <DialogFooter>
                  <Field orientation="horizontal" className="justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFormCancel}
                      disabled={isSubmitting}
                    >
                      <X />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="category-form"
                      disabled={isSubmitting}
                    >
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
                  <ItemTitle className="line-clamp-1">
                    Please wait for a while...
                  </ItemTitle>
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
            confirmationDialog.setDialog((prev) =>
              prev ? { ...prev, open } : prev
            );
          }}
          onConfirm={confirmationDialog.dialog.onConfirm}
        />
      )}
    </div>
  );
}

export function ProductCategoryDialogTrigger() {
  const categoryDialog = useDialog<ProductCategoryDialogOptions>();

  return (
    <div>
      <Button
        onClick={() => {
          categoryDialog.show({
            title: 'New Category',
            description:
              'Create new product category for you product listings.',
          });
        }}
      >
        <Plus />
        Add Category
      </Button>
      {categoryDialog.dialog?.open && (
        <ProductCategoryDialog
          onOpenChange={(open) => {
            categoryDialog.setDialog((prev) =>
              prev ? { ...prev, open } : prev
            );
          }}
          {...categoryDialog.dialog}
        />
      )}
    </div>
  );
}

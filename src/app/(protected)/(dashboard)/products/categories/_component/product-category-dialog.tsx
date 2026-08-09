'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Component, Plus, X } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
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
import { useCreateProductCategory } from '@/feature/products/mutations/product-category.mutation';
import {
  type CreateProductCategorySchemaValue,
  createProductCategorySchema,
} from '@/feature/products/schema/product-category.schema';
import { useDialog } from '@/hooks/use-dialog';
import ProductModifierGroupCard from './modifier-group-card';

type ProductCategoryDialogStatus = 'idle' | 'loading' | 'success' | 'error';

export type ProductCategoryDialogOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  closeText?: string;
  confirmVariant?: 'default' | 'destructive';
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
  closeText,
  onOpenChange,
}: ProductCategoryDialogProps) {
  const isLoading = status === 'loading';

  const createCategory = useCreateProductCategory();
  const confirmationDialog = useDialog<ConfirmationDialogOptions>();

  const form = useForm({
    resolver: zodResolver(createProductCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      modifierGroups: [],
    },
  });

  const modifierGroups = useFieldArray({
    control: form.control,
    name: 'modifierGroups',
  });

  const onSubmit = async (values: CreateProductCategorySchemaValue) => {
    await createCategory.mutateAsync(values);

    if (createCategory.isError) {
      toast.error(createCategory.error.message);
    }

    form.reset();
  };

  const hasFormValues = () => {
    const values = form.getValues();

    return (
      values.name.trim() !== '' ||
      values.description.trim() !== '' ||
      (values.modifierGroups && values.modifierGroups?.length > 0)
    );
  };

  const handleFormCancel = () => {
    if (!hasFormValues) return;

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

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <form id="category-form" onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent showCloseButton={!isLoading} className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>
                Create new product category for you product listings.
              </DialogDescription>
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
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
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
                >
                  <X />
                  Cancel
                </Button>
                <Button type="submit" form="category-form">
                  <Check />
                  Save
                </Button>
              </Field>
            </DialogFooter>
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
            title: '',
            description: '',
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

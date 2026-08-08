'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Component, Plus, X } from 'lucide-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  ConfirmationDialog,
  type ConfirmationDialogOptions,
} from '@/components/custom/confirmation-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useCreateCategory } from '@/feature/products/mutations/product-category.mutation';
import {
  type CreateProductCategorySchemaValue,
  createProductCategorySchema,
} from '@/feature/products/schema/product-category.schema';
import { useDialog } from '@/hooks/use-dialog';
import ModifierGroupCard from './modifier-group-card';

export default function CategoryForm() {
  const createCategory = useCreateCategory();
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
    const { error } = await createCategory.mutateAsync(values);

    if (error) {
      toast.error(error.message);
    }

    form.reset()
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

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <CardTitle>New Category</CardTitle>
          <CardDescription>
            Create new product category for you product listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="category-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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

            {modifierGroups.fields.length > 0 && (
              <FieldSet>
                <FieldLegend>Modifier Groups</FieldLegend>
                <FieldDescription>
                  Create product modifier groups
                </FieldDescription>
                <FieldGroup className="gap-4">
                  {modifierGroups.fields.map((field, index) => (
                    <ModifierGroupCard
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
                        You haven't created any product modifier group for this
                        category yet.
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
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal" className="justify-end">
            <Button type="button" variant="outline" onClick={handleFormCancel}>
              <X />
              Cancel
            </Button>
            <Button type="submit" form="category-form">
              <Check />
              Save
            </Button>
          </Field>
        </CardFooter>
      </Card>
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
    </React.Fragment>
  );
}

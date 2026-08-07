'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Option, Plus, Star, Trash } from 'lucide-react';
import React from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createProductSchema } from '@/feature/products/schema/product.schema';
import SortableVariant from './sortable-variants';

export default function ProductForm() {
  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      images: [],
      variants: [],
    },
  });

  const variantsField = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const { move: moveVariants } = variantsField;

  const variants = form.watch('variants');

  const handleVariantDragEnd = (event: DragEndEvent) => {
    if (event.active.id === event.over?.id) return;

    const initialIndex = variantsField.fields.findIndex(
      (item) => item.id === event.active.id
    );
    const dropIndex = variantsField.fields.findIndex(
      (item) => item.id === event.over?.id
    );

    moveVariants(initialIndex, dropIndex);
  };

  React.useEffect(() => {
    console.log('Variants:', variants);
  }, [variants]);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Name and description shown to customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input {...field} placeholder="Product name" />

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
                    <Textarea
                      {...field}
                      placeholder="Tell customer about the product"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        {/* Product Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>
              Add image URLs to display for this product.
            </CardDescription>
          </CardHeader>
        </Card>
        {/* Product Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Variants</CardTitle>
            <CardDescription>
              Each variant has a unique SKU and price (e.g. Small, Medium,
              Large).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {variantsField.fields.length > 0 && (
              <DndContext
                onDragEnd={handleVariantDragEnd}
                modifiers={[restrictToParentElement]}
              >
                <SortableContext
                  items={variantsField.fields}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {variantsField.fields.map((field, index) => (
                      <SortableVariant
                        key={field.id}
                        id={field.id}
                        className="flex items-center gap-4"
                      >
                        <Controller
                          name={`variants.${index}.name` as const}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input {...field} placeholder="Variant name" />

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`variants.${index}.sku` as const}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input {...field} placeholder="SKU" />

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name={`variants.${index}.price` as const}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <InputGroup>
                                <InputGroupInput
                                  {...field}
                                  placeholder="Price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                />
                                <InputGroupAddon>
                                  <DollarSign />
                                </InputGroupAddon>
                              </InputGroup>

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => variantsField.remove(index)}
                        >
                          <Trash />
                        </Button>
                      </SortableVariant>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}

            {form.getValues('variants').length === 0 ? (
              <Empty className="border border-dashed p-4">
                <EmptyHeader className="w-full max-w-none flex-row justify-between">
                  <div className="flex items-center gap-4">
                    <EmptyMedia variant="icon" className="m-0">
                      <Option />
                    </EmptyMedia>
                    <div className="text-start">
                      <EmptyTitle>No product variants</EmptyTitle>
                      <EmptyDescription>
                        You haven't created any product variants yet.
                      </EmptyDescription>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() =>
                      variantsField.append({ name: '', price: 0, sku: '' })
                    }
                  >
                    <Plus />
                    Add Variant
                  </Button>
                </EmptyHeader>
              </Empty>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  variantsField.append({ name: '', price: 0, sku: '' })
                }
              >
                <Plus />
                Add Variant
              </Button>
            )}
          </CardContent>
        </Card>
        {/* Product Modifiers */}
        <Card>
          <CardHeader>
            <CardTitle>Modifier Groups</CardTitle>
            <CardDescription>
              Let customers customize their order (e.g. milk type, syrup,
              extras).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <div className="space-y-5 lg:sticky lg:top-6">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="isAvailable"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal">
                    <FieldLabel data-invalid={fieldState.invalid}>
                      Available for purchase
                    </FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
              <Controller
                name="isFeatured"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal">
                    <FieldLabel data-invalid={fieldState.invalid}>
                      <Star size={16} />
                      Featured product
                    </FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product Category</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel data-invalid={fieldState.invalid}>
                      Category
                    </FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product category" />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        <SelectGroup>
                          {/* {regions?.data?.map((region) => (
                            <SelectItem key={region.code} value={region.name}>
                              {region.name}
                            </SelectItem>
                          ))} */}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>
        <Field orientation="vertical">
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
        </Field>
      </div>
    </div>
  );
}

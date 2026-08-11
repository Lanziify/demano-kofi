'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DollarSign,
  Image,
  Info,
  Plus,
  Shapes,
  Star,
  Trash,
} from 'lucide-react';
import React from 'react';
import { useDropzone } from 'react-dropzone';
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
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useProducts } from '@/feature/products/hooks/use-products';
import {
  type CreateProductSchemaValue,
  createProductSchema,
} from '@/feature/products/schema/product.schema';
import { updateProductModifierGroupSchema } from '@/feature/products/schema/product-modifier-group.schema';
import { MAX_PRODUCT_IMAGES } from '@/lib/image/constants';
import { cn } from '@/lib/utils';
import ProductModifierGroupCard from '../../categories/_component/modifier-group-card';
import ProductImage from './product-image';
import SortableVariant from './sortable-variants';

export default function ProductForm() {
  const { categoriesWithGroupsModifiers } = useProducts();

  const [availableModifierGroup, setAvailableModifierGroups] = React.useState<
    NonNullable<
      typeof categoriesWithGroupsModifiers.data
    >[number]['modifierGroups']
  >([]);

  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      images: [],
      variants: [],
      modifierGroups: [],
      isAvailable: true,
      isFeatured: false,
    },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
    move: moveVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    move: moveImage,
  } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const modifierGroupFields = useFieldArray({
    control: form.control,
    name: 'modifierGroups',
    keyName: '_fieldId',
  });

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const remainingSlots = MAX_PRODUCT_IMAGES - imageFields.length;

      if (remainingSlots <= 0) {
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      appendImage(
        filesToAdd.map((file, index) => ({
          file,
          sortOrder: index,
          altText: file.name,
        }))
      );

      form.trigger('images');
    },
    [appendImage, form, imageFields.length]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles: 10,
      maxSize: 5_000_000,
      accept: {
        'image/jpeg': [],
        'image/png': [],
        'image/webp': [],
      },
    });

  const handleImageDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = imageFields.findIndex(
        (item) => item.id === active.id
      );

      const dropIndex = imageFields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      moveImage(initialIndex, dropIndex);

      imageFields.forEach((_, index) => {
        form.setValue(`images.${index}.sortOrder`, index);
      });
    },
    [imageFields, moveImage, form.setValue]
  );

  const handleVariantDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = variantFields.findIndex(
        (item) => item.id === active.id
      );

      const dropIndex = variantFields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      moveVariant(initialIndex, dropIndex);
    },
    [moveVariant, variantFields]
  );

  const handleCategoryChange = React.useCallback(
    (value: string | null) => {
      form.setValue('modifierGroups', []);

      if (!categoriesWithGroupsModifiers.data || !value) return;

      form.setValue('categoryId', value);

      const groups = categoriesWithGroupsModifiers.data.filter(
        (category) => category.id === value
      )[0].modifierGroups;

      setAvailableModifierGroups(groups);
    },
    [categoriesWithGroupsModifiers, form.setValue]
  );

  const onSubmit = (values: CreateProductSchemaValue) => {
    console.log(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Product Info */}
          <Card className="shadow-none">
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
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Add image URLs to display for this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Empty
                {...getRootProps()}
                className={cn('cursor-pointer border border-dashed', {
                  'border-green-500 bg-green-500/10':
                    isDragActive && !isDragReject,
                  'border-border bg-card': !isDragActive,
                })}
              >
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Image />
                  </EmptyMedia>
                  <EmptyTitle>Upload product images</EmptyTitle>
                  <EmptyDescription>
                    Drag 'n' drop some files here, or click to select files
                  </EmptyDescription>
                </EmptyHeader>
                <input {...getInputProps()} id="images" />
              </Empty>

              <DndContext
                onDragEnd={handleImageDragEnd}
                modifiers={[restrictToParentElement]}
              >
                <div className="mt-4 grid grid-cols-5 gap-4">
                  <SortableContext
                    items={imageFields}
                    strategy={rectSortingStrategy}
                  >
                    {imageFields.map((field, index) => (
                      <ProductImage
                        key={field.id}
                        id={field.id}
                        value={field}
                        onRemove={() => removeImage(index)}
                      />
                    ))}
                  </SortableContext>
                </div>
              </DndContext>
            </CardContent>
          </Card>
          {/* Product Variants */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Each variant has a unique SKU and price (e.g. Small, Medium,
                Large).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {variantFields.length > 0 && (
                <DndContext
                  onDragEnd={handleVariantDragEnd}
                  modifiers={[restrictToParentElement]}
                >
                  <SortableContext
                    items={variantFields}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul className="space-y-2">
                      {variantFields.map((field, index) => (
                        <SortableVariant
                          key={field.id}
                          id={field.id}
                          className="flex items-start gap-4"
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
                                    onChange={(event) => {
                                      const value = event.target.value;
                                      field.onChange(
                                        value === '' ? '' : Number(value)
                                      );
                                    }}
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
                            onClick={() => removeVariant(index)}
                          >
                            <Trash />
                          </Button>
                        </SortableVariant>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}

              {variantFields.length === 0 ? (
                <Empty className="border border-dashed p-4">
                  <EmptyHeader className="w-full max-w-none flex-row justify-between">
                    <div className="flex items-center gap-4">
                      <EmptyMedia variant="icon" className="m-0">
                        <Shapes />
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
                        appendVariant({ name: '', price: '', sku: '' })
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
                    appendVariant({ name: '', price: '', sku: '' })
                  }
                >
                  <Plus />
                  Add Variant
                </Button>
              )}
            </CardContent>
          </Card>
          {/* Product Modifiers */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Modifier Groups</CardTitle>
              <CardDescription>
                Let customers customize their order (e.g. milk type, syrup,
                extras).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <ToggleGroup
                  multiple
                  value={modifierGroupFields.fields.map((group) => group.id)}
                  onValueChange={(values) => {
                    const currentIds = modifierGroupFields.fields.map(
                      (group) => group.id
                    );

                    // Added
                    const addedIds = values.filter(
                      (id) => !currentIds.includes(id)
                    );

                    // Removed
                    const removedIds = currentIds.filter(
                      (id) => !values.includes(id)
                    );

                    addedIds.forEach((id) => {
                      const modifierGroup = availableModifierGroup
                        .filter((g) => g.id === id)
                        .map((item) => item)[0];

                      const parsedModifierGroup =
                        updateProductModifierGroupSchema.safeParse(
                          modifierGroup
                        );

                      if (parsedModifierGroup.success) {
                        modifierGroupFields.append(parsedModifierGroup.data);
                      }
                    });

                    removedIds.forEach((id) => {
                      const index = modifierGroupFields.fields.findIndex(
                        (g) => g.id === id
                      );

                      if (index !== -1) {
                        modifierGroupFields.remove(index);
                      }
                    });
                  }}
                >
                  {availableModifierGroup.map((group) => (
                    <ToggleGroupItem
                      key={group.id}
                      variant="outline"
                      value={group.id}
                    >
                      {group.name}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                {modifierGroupFields.fields.map((field, index) => (
                  <ProductModifierGroupCard
                    key={field._fieldId}
                    control={form.control}
                    name={`modifierGroups.${index}`}
                    onClose={() => modifierGroupFields.remove(index)}
                  />
                ))}

                {/* <Controller
                  name="modifierGroups"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      {modifierGroups.fields.map((field, index) => (
                        <ProductModifierGroupCard
                          key={field.id}
                          control={form.control}
                          name={`modifierGroups.${index}`}
                          onClose={() => modifierGroups.remove(index)}
                        />
                      ))}
                    </Field>
                  )}
                /> */}
              </FieldGroup>
              {availableModifierGroup.length === 0 && (
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Info />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      Select product category to add modifier
                    </ItemTitle>
                  </ItemContent>
                </Item>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-5 lg:sticky lg:top-22.25">
          {/* Product Status */}
          <Card className="shadow-none">
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
          {/* Product Categories */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Product Category</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel data-invalid={fieldState.invalid}>
                        Category
                      </FieldLabel>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={(value) => handleCategoryChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(value) => {
                              const category =
                                categoriesWithGroupsModifiers.data?.find(
                                  (category) => category.id === value
                                );

                              return (
                                category?.name ?? 'Select product category'
                              );
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {categoriesWithGroupsModifiers.data?.map(
                              (category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              )
                            )}
                            {categoriesWithGroupsModifiers.isPending && (
                              <Item>
                                <ItemMedia variant="icon">
                                  <Spinner />
                                </ItemMedia>
                                <ItemContent>
                                  <ItemTitle>Loading...</ItemTitle>
                                </ItemContent>
                              </Item>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
          <Field orientation="vertical">
            <Button type="submit">Create Product</Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Field>
        </div>
      </div>
    </form>
  );
}

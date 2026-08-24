'use client';

import type { ToggleGroupProps } from '@base-ui/react';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { rectSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Folders, Images, Info, Plus, Shapes, Star, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ConfirmationDialog, type ConfirmationDialogOptions } from '@/components/custom/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useProducts } from '@/feature/products/hooks/use-products';
import { useCreateProduct } from '@/feature/products/mutations/product.mutation';
import { modifierGroupFormWithOptionsSchema } from '@/feature/products/schema/modifier.schema';
import { type ProductFormValues, productFormSchema } from '@/feature/products/schema/product.schema';
import type { CategoryModifierGroupsWithSortOrder, ProductEmbedded } from '@/feature/products/types/types';
import { useDialog } from '@/hooks/use-dialog';
import { MAX_PRODUCT_IMAGES } from '@/lib/image/constants';
import { cn } from '@/lib/utils';
import ProductModifierGroupCard from '../categories/_component/modifier-group-card';
import ProductImage from './product-image';
import SortableVariant from './sortable-variants';

interface ProductFormProps {
  product?: ProductEmbedded[number];
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { categoriesWithGroupOptions } = useProducts();
  const createProduct = useCreateProduct();
  const confirmationDialog = useDialog<ConfirmationDialogOptions>();
  const [categoryModifierGroups, setCategoryModifierGroups] = React.useState<CategoryModifierGroupsWithSortOrder[]>([]);

  const initialFormValues = {
    categoryId: '',
    name: '',
    description: '',
    images: [],
    variants: [],
    modifierGroups: [],
    isAvailable: true,
    isFeatured: false,
  } as ProductFormValues;

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialFormValues,
  });

  const variantFields = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const imageFields = useFieldArray({
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
      const remainingSlots = MAX_PRODUCT_IMAGES - imageFields.fields.length;

      if (remainingSlots <= 0) {
        return;
      }

      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      imageFields.append(
        filesToAdd.map((file, index) => ({
          file,
          sortOrder: index,
          altText: file.name,
        }))
      );

      form.trigger('images');
    },
    [imageFields, form]
  );

  const { open, getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
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

      const initialIndex = imageFields.fields.findIndex((item) => item.id === active.id);
      const dropIndex = imageFields.fields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      imageFields.move(initialIndex, dropIndex);
    },
    [imageFields]
  );

  const handleVariantDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = variantFields.fields.findIndex((item) => item.id === active.id);
      const dropIndex = variantFields.fields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      variantFields.move(initialIndex, dropIndex);

      // variantFields.fields.forEach((_, index) => {
      //   form.setValue(`variants.${index}.sortOrder`, index);
      // });
    },
    [variantFields]
  );

  const handleCategoryChange = React.useCallback(
    (value: string | null) => {
      // form.setValue('modifierGroups', []);

      if (!categoriesWithGroupOptions.data || !value) return;

      const {
        data: { data: categories },
      } = categoriesWithGroupOptions;

      const groups = categories.filter((category) => category.id === value)[0].modifierGroups;

      setCategoryModifierGroups(groups);
    },
    [categoriesWithGroupOptions]
  );

  const handleModifierGroupClose = React.useCallback(
    (index: number) => {
      confirmationDialog.show({
        title: 'Are you sure?',
        description: 'You will lose all the information entered for this preset.',
        confirmLabel: 'Confirm',
        confirmVariant: 'default',
        onConfirm: () => {
          modifierGroupFields.remove(index);
          confirmationDialog.close();
        },
      });
    },
    [confirmationDialog, modifierGroupFields]
  );

  const handleModifierGroupChange = React.useCallback<NonNullable<ToggleGroupProps<string>['onValueChange']>>(
    (values) => {
      const currentIds = modifierGroupFields.fields.map((group) => group.presetId);

      // Added
      const addedIds = values.filter((id) => !currentIds.includes(id));

      // Removed
      const removedIds = currentIds.filter((id) => id && !values.includes(id));

      addedIds.forEach((id, index) => {
        const modifierGroup = categoryModifierGroups.filter((g) => g.id === id)[0];

        const parsedModifierGroup = modifierGroupFormWithOptionsSchema.safeParse(modifierGroup);

        if (parsedModifierGroup.error) return;

        const { id: presetId, name, selectionType, options } = parsedModifierGroup.data;

        if (parsedModifierGroup.success) {
          modifierGroupFields.insert(index, {
            presetId,
            isRequired: false,
            name,
            selectionType,
            sortOrder: index,
            options,
          });
        }
      });

      removedIds.forEach((id) => {
        const index = modifierGroupFields.fields.findIndex((g) => g.presetId === id);

        if (index !== -1) {
          handleModifierGroupClose(index);
        }
      });
    },
    [modifierGroupFields, categoryModifierGroups.filter, handleModifierGroupClose]
  );

  const onSubmit = async (values: ProductFormValues) => {
    const payload = {
      ...values,
      variants: values.variants?.map((variant, index) => ({
        ...variant,
        sortOrder: index,
      })),
      images: values.images?.map((image, index) => ({
        ...image,
        sortOrder: index,
      })),
      modifierGroups: values.modifierGroups?.map((groups, index) => ({
        ...groups,
        options: groups.options?.map((option, index) => ({
          ...option,
          sortOrder: index,
        })),
        sortOrder: index,
      })),
    } as ProductFormValues;

    await createProduct.mutateAsync(payload);
    toast.success('Product created successfully');
    router.push('/products');
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <initialFormValues causing maximum update depth exceeded>
  React.useEffect(() => {
    if (!product) return;

    const { category, images, ...productData } = product as ProductEmbedded[number];

    const { success, data, error } = productFormSchema.safeParse({
      ...productData,
      categoryId: category?.id,
    });

    if (!success) {
      console.log(error);
    }

    if (success) {
      form.reset({
        ...initialFormValues,
        ...data,
        images: images
          .filter((image) => image.type === 'original')
          .map((image) => ({
            mediaId: image.id,
            productId: product.id,
            sortOrder: image.sortOrder,
            altText: image.altText ?? '',
            imageUrl: image.url,
          })),
      });
    }
  }, [product, form.reset]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Product Info */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Name and description shown to customers.</CardDescription>
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
                      <Textarea {...field} placeholder="Tell customer about the product" />

                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              <CardDescription>Add image URLs to display for this product.</CardDescription>
            </CardHeader>
            <CardContent>
              {imageFields.fields.length === 0 ? (
                <Empty
                  {...getRootProps()}
                  className={cn('cursor-pointer rounded-4xl border border-dashed', {
                    'border-green-500 bg-green-500/10': isDragActive && !isDragReject,
                    'border-border bg-card': !isDragActive,
                  })}
                >
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Images />
                    </EmptyMedia>
                    <EmptyTitle>Upload product images</EmptyTitle>
                    <EmptyDescription>Drag 'n' drop some files here, or click to select files</EmptyDescription>
                  </EmptyHeader>
                  <input {...getInputProps()} />
                </Empty>
              ) : (
                <DndContext onDragEnd={handleImageDragEnd} modifiers={[restrictToParentElement]}>
                  <div
                    {...getRootProps({ onClick: (event) => event.stopPropagation() })}
                    className={cn('mt-4 grid grid-cols-5 gap-4 rounded-4xl border border-dashed p-4', {
                      'border-green-500 bg-green-500/10': isDragActive && !isDragReject,
                      'border-border bg-card': !isDragActive,
                    })}
                  >
                    <SortableContext items={imageFields.fields} strategy={rectSortingStrategy}>
                      {imageFields.fields.map((field, index) => (
                        <ProductImage
                          key={field.id}
                          id={field.id}
                          image={field}
                          onRemove={() => imageFields.remove(index)}
                        />
                      ))}
                    </SortableContext>
                    {imageFields.fields.length > 0 && imageFields.fields.length < MAX_PRODUCT_IMAGES && (
                      <Button type="button" variant="secondary" className="h-full w-full" onClick={open}>
                        <Plus />
                      </Button>
                    )}
                    <input {...getInputProps()} />
                  </div>
                </DndContext>
              )}
            </CardContent>
          </Card>
          {/* Product Variants */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Each variant has a unique SKU and price (e.g. Small, Medium, Large).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {variantFields.fields.length > 0 && (
                <DndContext onDragEnd={handleVariantDragEnd} modifiers={[restrictToParentElement]}>
                  <SortableContext items={variantFields.fields} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {variantFields.fields.map((field, index) => (
                        <SortableVariant key={field.id} id={field.id} className="flex items-start gap-4">
                          <Controller
                            name={`variants.${index}.name` as const}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input {...field} placeholder="Variant name" />

                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            name={`variants.${index}.sku` as const}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <Input {...field} placeholder="SKU" />

                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Controller
                            name={`variants.${index}.priceAmount` as const}
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
                                      field.onChange(value === '' ? '' : Number(value));
                                    }}
                                  />
                                  <InputGroupAddon>
                                    <DollarSign />
                                  </InputGroupAddon>
                                </InputGroup>

                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                              </Field>
                            )}
                          />

                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => variantFields.remove(index)}
                          >
                            <Trash />
                          </Button>
                        </SortableVariant>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}

              {variantFields.fields.length === 0 ? (
                <Empty className="border border-dashed p-4">
                  <EmptyHeader className="w-full max-w-none flex-row justify-between">
                    <div className="flex items-center gap-4">
                      <EmptyMedia variant="icon" className="m-0">
                        <Shapes />
                      </EmptyMedia>
                      <div className="text-start">
                        <EmptyTitle>No product variants</EmptyTitle>
                        <EmptyDescription>You haven't created any product variants yet.</EmptyDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() =>
                        variantFields.append({
                          name: '',
                          priceAmount: '',
                          sku: '',
                          sortOrder: variantFields.fields.length,
                        })
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
                    variantFields.append({ name: '', priceAmount: '', sku: '', sortOrder: variantFields.fields.length })
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
              <CardDescription>Let customers customize their order (e.g. milk type, syrup, extras).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryModifierGroups.length > 0 && (
                <>
                  <Item size="xs" className="py-0">
                    <ItemMedia variant="icon">
                      <Info />
                    </ItemMedia>
                    <ItemContent>
                      <ItemDescription>Quick-add category modifier groups presets</ItemDescription>
                    </ItemContent>
                  </Item>
                  <FieldGroup>
                    <ToggleGroup
                      multiple
                      value={modifierGroupFields.fields.map((group) => String(group.presetId))}
                      onValueChange={handleModifierGroupChange}
                    >
                      {categoryModifierGroups.map((group) => (
                        <ToggleGroupItem key={group.id} variant="outline" value={group.id}>
                          {group.name}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </FieldGroup>
                </>
              )}

              {modifierGroupFields.fields.map((field, index) => {
                return (
                  <ProductModifierGroupCard
                    key={field._fieldId}
                    name={`modifierGroups.${index}`}
                    control={form.control}
                    onClose={() => handleModifierGroupClose(index)}
                  />
                );
              })}

              {!product && categoryModifierGroups.length === 0 && (
                <Item variant="outline">
                  <ItemMedia variant="icon">
                    <Info />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Select product category to use template groups</ItemTitle>
                  </ItemContent>
                </Item>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  modifierGroupFields.append({
                    name: '',
                    selectionType: 'multiple',
                    options: [],
                    isRequired: false,
                    sortOrder: modifierGroupFields.fields.length,
                  })
                }
              >
                <Plus />
                Add Custom Modifier
              </Button>
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
                      <FieldLabel data-invalid={fieldState.invalid}>Available for purchase</FieldLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                      <FieldLabel data-invalid={fieldState.invalid}>Category</FieldLabel>
                      <Select
                        {...field}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCategoryChange(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            {(value) => {
                              const category = categoriesWithGroupOptions.data?.data.find(
                                (category) => category.id === value
                              );

                              return category?.name ?? 'Select product category';
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                          <SelectGroup>
                            {categoriesWithGroupOptions.data?.data.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                            {categoriesWithGroupOptions.isPending && (
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
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>
          {/* Product Summary */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemGroup>
                <Item className="p-0">
                  <ItemMedia variant="icon">
                    <Shapes />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Variants</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{form.watch('variants')?.length}</ItemDescription>
                  </ItemContent>
                </Item>
                <Item className="p-0">
                  <ItemMedia variant="icon">
                    <Folders />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Modifier Groups</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{form.watch('modifierGroups')?.length}</ItemDescription>
                  </ItemContent>
                </Item>
                <Item className="p-0">
                  <ItemMedia variant="icon">
                    <Images />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Images</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{form.watch('images')?.length}</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </CardContent>
          </Card>
          <Field orientation="vertical">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              Create Product
            </Button>
            <Button type="button" variant="secondary" disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
          </Field>
        </div>
      </div>
      {confirmationDialog.dialog && (
        <ConfirmationDialog
          {...confirmationDialog.dialog}
          onOpenChange={(open) => {
            confirmationDialog.setDialog((prev) => (prev ? { ...prev, open } : prev));
          }}
          onConfirm={confirmationDialog.dialog.onConfirm}
        />
      )}
    </form>
  );
}

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DollarSign, ImageOff, PackagePlus, Trash } from 'lucide-react';
import React from 'react';
import { type Control, Controller, type FieldArray, useFieldArray, useFormState } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Field, FieldError } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useProducts } from '@/feature/products/hooks/use-products';
import type { ProductFormFields, ProductFormValues } from '@/feature/products/schema/product.schema';
import type { ProductEmbedded } from '@/feature/products/types/types';
import SortableItem from './sortable-item';

type ProductRow = ProductEmbedded[number];

interface AddOnsCardProps {
  control: Control<ProductFormFields, unknown, ProductFormValues>;
  /** The product being edited - excluded from the picker since a product can't be its own add-on. */
  productId?: string;
}

export default function AddOnsCard({ control, productId }: AddOnsCardProps) {
  const { products } = useProducts();

  const addOnFields = useFieldArray({
    control,
    name: 'addOns',
    keyName: '_fieldId',
  });

  const { errors } = useFormState({ control, name: 'addOns' });

  const productsById = React.useMemo(
    () => new Map((products.data?.data ?? []).map((product) => [product.id, product])),
    [products.data]
  );

  const linkedIds = new Set(addOnFields.fields.map((field) => field.addOnProductId));
  const candidates = (products.data?.data ?? []).filter(
    (product) => product.id !== productId && !linkedIds.has(product.id)
  );

  const handleAddOnDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = addOnFields.fields.findIndex((item) => item._fieldId === active.id);
      const dropIndex = addOnFields.fields.findIndex((item) => item._fieldId === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      addOnFields.move(initialIndex, dropIndex);
    },
    [addOnFields]
  );

  const handleProductSelect = (product: ProductRow | null) => {
    if (!product) return;

    addOnFields.append({
      addOnProductId: product.id,
      // Start from the product's own price; the add-on price can be discounted from there.
      priceAmount: product.variants[0]?.priceAmount ?? '',
      sortOrder: addOnFields.fields.length,
    } as FieldArray<ProductFormFields, 'addOns'>);
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Add-ons</CardTitle>
        <CardDescription>Other products customers can add to this one (e.g. a pastry with a latte).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Combobox<ProductRow>
          items={candidates}
          value={null}
          onValueChange={handleProductSelect}
          itemToStringLabel={(product) => product.name}
          isItemEqualToValue={(a, b) => a.id === b.id}
        >
          <ComboboxInput placeholder="Search products to add..." className="w-full" />
          <ComboboxContent>
            <ComboboxEmpty>{products.isPending ? 'Loading products...' : 'No products found.'}</ComboboxEmpty>
            <ComboboxList>
              {(product: ProductRow) => (
                <ComboboxItem key={product.id} value={product}>
                  {product.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        {addOnFields.fields.length > 0 ? (
          <DndContext onDragEnd={handleAddOnDragEnd} modifiers={[restrictToParentElement]}>
            <SortableContext
              items={addOnFields.fields.map((field) => field._fieldId)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-2">
                {addOnFields.fields.map((field, index) => {
                  const product = productsById.get(field.addOnProductId);
                  const image = product?.images[0];

                  return (
                    <SortableItem key={field._fieldId} id={field._fieldId} className="flex items-center gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar className="border-0 ring-0 after:border-none">
                          {image && <AvatarImage className="rounded-md" src={image.url} alt={image.altText ?? ''} />}
                          <AvatarFallback className="rounded-md">
                            <ImageOff size={14} />
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate font-medium text-sm">{product?.name ?? 'Loading...'}</span>
                        {product && !product.isAvailable && <Badge variant="outline">Unavailable</Badge>}
                      </div>

                      <Controller
                        name={`addOns.${index}.priceAmount`}
                        control={control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid} className="w-40 shrink-0">
                            <InputGroup>
                              <InputGroupInput
                                {...field}
                                placeholder="Price"
                                type="number"
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

                      <Button type="button" variant="destructive" size="icon" onClick={() => addOnFields.remove(index)}>
                        <Trash />
                      </Button>
                    </SortableItem>
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <Empty className="border border-dashed p-4">
            <EmptyHeader className="w-full max-w-none flex-row justify-start gap-4">
              <EmptyMedia variant="icon" className="m-0">
                <PackagePlus />
              </EmptyMedia>
              <div className="text-start">
                <EmptyTitle>No add-ons</EmptyTitle>
                <EmptyDescription>Search above to link another product as an add-on.</EmptyDescription>
              </div>
            </EmptyHeader>
          </Empty>
        )}

        {errors.addOns?.root && <FieldError errors={[errors.addOns.root]} />}
      </CardContent>
    </Card>
  );
}

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cva, type VariantProps } from 'class-variance-authority';
import { DollarSign, Plus, Trash, X } from 'lucide-react';
import React from 'react';
import {
  type Control,
  Controller,
  type FieldArray,
  type FieldArrayPath,
  type FieldPath,
  type FieldPathByValue,
  type FieldValues,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  type ModifierGroupWithOptionsFormFields,
  modifierGroupFormSchema,
} from '@/feature/products/schema/modifier.schema';
import { cn } from '@/lib/utils';
import SortableItem from './sortable-item';

export type ProductModifierGroupCardProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, ModifierGroupWithOptionsFormFields | undefined>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  onClose?: () => void;
};

const cardVariants = cva('shadow-none', {
  variants: {
    variant: {
      default: '',
      preset: 'ring-2 dark:ring-orange-500/50',
    },
  },
});

export default function ProductModifierGroupCard<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, ModifierGroupWithOptionsFormFields | undefined>,
>({
  variant = 'default',
  name,
  control,
  onClose,
}: ProductModifierGroupCardProps<TFieldValues, TName> & VariantProps<typeof cardVariants>) {
  const nameField = `${name}.name` as FieldPath<TFieldValues>;
  const selectionTypeField = `${name}.selectionType` as FieldPath<TFieldValues>;
  const isRequiredField = `${name}.isRequired` as FieldPath<TFieldValues>;
  const optionsField = `${name}.options` as FieldArrayPath<TFieldValues>;

  const modifierGroupOptionsFields = useFieldArray({
    control,
    name: optionsField,
  });

  const modifierGroup = useWatch({
    control,
    name,
  });

  const hasIsRequired = modifierGroup !== undefined && Object.hasOwn(modifierGroup, 'isRequired');

  const handleGroupOptionsDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = modifierGroupOptionsFields.fields.findIndex((item) => item.id === active.id);
      const dropIndex = modifierGroupOptionsFields.fields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      modifierGroupOptionsFields.move(initialIndex, dropIndex);
    },
    [modifierGroupOptionsFields]
  );

  return (
    <Card className={cn(cardVariants({ variant }))}>
      <CardContent className="space-y-6">
        <FieldGroup
          className={cn('grid grid-cols-1 gap-4 sm:grid-cols-[1fr_200px_auto]', {
            'sm:grid-cols-[1fr_200px_auto_auto]': hasIsRequired,
          })}
        >
          <Controller
            control={control}
            name={nameField}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="Group name (e.g. Size)" />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            control={control}
            name={selectionTypeField}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {modifierGroupFormSchema.shape.selectionType.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {hasIsRequired && (
            <Controller
              name={isRequiredField}
              control={control}
              render={({ field, fieldState }) => (
                <Field orientation="horizontal" className="items-start py-2">
                  <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                  <FieldLabel data-invalid={fieldState.invalid}>Required</FieldLabel>
                </Field>
              )}
            />
          )}

          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X />
          </Button>
        </FieldGroup>
        <FieldGroup
          className={cn('gap-2', {
            'border-orange-400 border-l-2 pl-4': modifierGroupOptionsFields.fields.length > 0,
          })}
        >
          <DndContext onDragEnd={handleGroupOptionsDragEnd} modifiers={[restrictToParentElement]}>
            <SortableContext items={modifierGroupOptionsFields.fields} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {modifierGroupOptionsFields.fields.length > 0 &&
                  modifierGroupOptionsFields.fields.map((field, index) => (
                    <SortableItem key={field.id} id={field.id} className="flex items-start gap-4">
                      <Field orientation="horizontal" className="grid grid-cols-[1fr_auto_auto] items-start gap-4">
                        <Controller
                          control={control}
                          name={`${optionsField}.${index}.name` as FieldPath<TFieldValues>}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input {...field} placeholder={`Option ${index + 1} name`} />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                        <Controller
                          control={control}
                          name={`${optionsField}.${index}.priceAdjustment` as FieldPath<TFieldValues>}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <InputGroup>
                                <InputGroupInput
                                  {...field}
                                  placeholder="0.00"
                                  type="number"
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
                          onClick={() => modifierGroupOptionsFields.remove(index)}
                        >
                          <Trash />
                        </Button>
                      </Field>
                    </SortableItem>
                  ))}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit"
                  onClick={() =>
                    modifierGroupOptionsFields.append({
                      name: '',
                      priceAdjustment: '',
                      sortOrder: modifierGroupOptionsFields.fields.length,
                    } as FieldArray<TFieldValues, FieldArrayPath<TFieldValues>>)
                  }
                >
                  <Plus />
                  Add modifier
                </Button>
              </ul>
            </SortableContext>
          </DndContext>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

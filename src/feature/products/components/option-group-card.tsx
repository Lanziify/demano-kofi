import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { OptionGroupFormFields } from '../schema/option-group.schema';
import SortableItem from './sortable-item';

export type OptionGroupCardProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, OptionGroupFormFields | undefined>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  onClose?: () => void;
};

/** Human-readable summary of a min/max selection rule, e.g. "Required · pick exactly 1". */
function describeSelection(minSelect: unknown, maxSelect: unknown) {
  const min = typeof minSelect === 'number' ? minSelect : 0;
  const max = typeof maxSelect === 'number' ? maxSelect : null;
  const requirement = min > 0 ? 'Required' : 'Optional';

  if (max === null) {
    return min > 0 ? `${requirement} · pick at least ${min}` : `${requirement} · pick any`;
  }

  if (min === max) {
    return `${requirement} · pick exactly ${max}`;
  }

  return min > 0 ? `${requirement} · pick ${min} to ${max}` : `${requirement} · pick up to ${max}`;
}

export default function OptionGroupCard<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<TFieldValues, OptionGroupFormFields | undefined>,
>({ name, control, onClose }: OptionGroupCardProps<TFieldValues, TName>) {
  const nameField = `${name}.name` as FieldPath<TFieldValues>;
  const minSelectField = `${name}.minSelect` as FieldPath<TFieldValues>;
  const maxSelectField = `${name}.maxSelect` as FieldPath<TFieldValues>;
  const optionsField = `${name}.options` as FieldArrayPath<TFieldValues>;

  const optionFields = useFieldArray({
    control,
    name: optionsField,
  });

  const [minSelect, maxSelect] = useWatch({ control, name: [minSelectField, maxSelectField] });

  const handleGroupOptionsDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const initialIndex = optionFields.fields.findIndex((item) => item.id === active.id);
      const dropIndex = optionFields.fields.findIndex((item) => item.id === over.id);

      if (initialIndex === -1 || dropIndex === -1) return;

      optionFields.move(initialIndex, dropIndex);
    },
    [optionFields]
  );

  return (
    <Card className="shadow-none">
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_96px_96px_auto]">
            <Controller
              control={control}
              name={nameField}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Group name (e.g. Milk)" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name={minSelectField}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <InputGroup>
                    <InputGroupAddon>Min</InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      type="number"
                      min="0"
                      step="1"
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === '' ? 0 : Number(value));
                      }}
                    />
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={control}
              name={maxSelectField}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <InputGroup>
                    <InputGroupAddon>Max</InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      value={field.value ?? ''}
                      type="number"
                      min="1"
                      step="1"
                      placeholder="∞"
                      onChange={(event) => {
                        const value = event.target.value;
                        // Empty means no upper limit.
                        field.onChange(value === '' ? null : Number(value));
                      }}
                    />
                  </InputGroup>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="button" variant="outline" size="icon" onClick={onClose}>
              <X />
            </Button>
          </FieldGroup>
          <FieldDescription>{describeSelection(minSelect, maxSelect)}</FieldDescription>
        </div>
        <FieldGroup
          className={cn('gap-2', {
            'border-orange-400 border-l-2 pl-4': optionFields.fields.length > 0,
          })}
        >
          <DndContext onDragEnd={handleGroupOptionsDragEnd} modifiers={[restrictToParentElement]}>
            <SortableContext items={optionFields.fields} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {optionFields.fields.length > 0 &&
                  optionFields.fields.map((field, index) => (
                    <SortableItem key={field.id} id={field.id} className="flex items-start gap-4">
                      <Field orientation="horizontal" className="grid grid-cols-[1fr_auto_auto_auto] items-start gap-4">
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
                        <Controller
                          control={control}
                          name={`${optionsField}.${index}.isAvailable` as FieldPath<TFieldValues>}
                          render={({ field }) => (
                            <Field orientation="horizontal" className="items-start py-2">
                              <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                              <FieldLabel>Available</FieldLabel>
                            </Field>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => optionFields.remove(index)}
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
                    optionFields.append({
                      name: '',
                      priceAdjustment: '',
                      isAvailable: true,
                      sortOrder: optionFields.fields.length,
                    } as FieldArray<TFieldValues, FieldArrayPath<TFieldValues>>)
                  }
                >
                  <Plus />
                  Add option
                </Button>
              </ul>
            </SortableContext>
          </DndContext>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

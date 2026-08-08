import { DollarSign, Plus, X } from 'lucide-react';
import {
  type Control,
  Controller,
  type FieldArray,
  type FieldArrayPath,
  type FieldPath,
  type FieldPathByValue,
  type FieldValues,
  useFieldArray,
} from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  type ModifierGroupFieldValue,
  modifierSelectionTypeSchema,
} from '@/feature/products/schema/product-modifier-group.schema';
import { cn } from '@/lib/utils';

// Form field values are typed against the schema's input shape, since
// zod-defaulted fields (e.g. isRequired) are optional pre-submit and only
// become required after resolver validation produces the output shape.
export type ModifierGroupCardProps<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<
    TFieldValues,
    ModifierGroupFieldValue | undefined
  >,
> = {
  name: TName;
  control: Control<TFieldValues>;
  onClose?: () => void;
};

export default function ModifierGroupCard<
  TFieldValues extends FieldValues,
  TName extends FieldPathByValue<
    TFieldValues,
    ModifierGroupFieldValue | undefined
  >,
>({ name, control, onClose }: ModifierGroupCardProps<TFieldValues, TName>) {
  const nameField = `${name}.name` as FieldPath<TFieldValues>;
  const selectionTypeField = `${name}.selectionType` as FieldPath<TFieldValues>;
  const isRequiredField = `${name}.isRequired` as FieldPath<TFieldValues>;
  const modifiersName = `${name}.modifiers` as FieldArrayPath<TFieldValues>;

  const modifierFields = useFieldArray({
    control,
    name: modifiersName,
  });

  return (
    <Card>
      <CardContent className="space-y-6">
        <FieldGroup className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_200px_auto_auto]">
          <Controller
            control={control}
            name={nameField}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="Group name (e.g. Size)" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
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
                      {modifierSelectionTypeSchema.options.map((option) => (
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

          <Controller
            name={isRequiredField}
            control={control}
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" className="items-start py-2">
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
                <FieldLabel data-invalid={fieldState.invalid}>
                  Required
                </FieldLabel>
              </Field>
            )}
          />

          <Button type="button" variant="outline" size="icon" onClick={onClose}>
            <X />
          </Button>
        </FieldGroup>
        <FieldGroup
          className={cn('gap-3 pl-4', {
            'border-orange-400 border-l-2': modifierFields.fields.length > 0,
          })}
        >
          {modifierFields.fields.length > 0 &&
            modifierFields.fields.map((field, index) => (
              <Field
                key={field.id}
                orientation="horizontal"
                className="grid grid-cols-[1fr_auto_auto] items-start gap-2"
              >
                <Controller
                  control={control}
                  name={
                    `${modifiersName}.${index}.name` as FieldPath<TFieldValues>
                  }
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        placeholder={`Option ${index + 1} name`}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name={
                    `${modifiersName}.${index}.priceAdjustment` as FieldPath<TFieldValues>
                  }
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <InputGroup>
                        <InputGroupInput
                          {...field}
                          placeholder="0.00"
                          type="number"
                          onChange={(event) => {
                            const value = event.target.value;

                            field.onChange(
                              value === '' ? undefined : Number(value)
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
                  variant="ghost"
                  size="icon"
                  onClick={() => modifierFields.remove(index)}
                >
                  <X />
                </Button>
              </Field>
            ))}
          <Button
            type="button"
            variant="ghost"
            className="w-fit"
            onClick={() =>
              modifierFields.append({
                name: '',
                priceAdjustment: '',
              } as FieldArray<TFieldValues, FieldArrayPath<TFieldValues>>)
            }
          >
            <Plus />
            Add modifier
          </Button>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}

'use client';

import { CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { ControllerFieldState } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate, isValidDate, toDate } from '@/lib/date';

type DobPickerProps = {
  value?: string;
  onChange: (value: string) => void;
  fieldState: ControllerFieldState;
};

export function DobPicker({
  value,
  onChange,
  fieldState,
  ...props
}: DobPickerProps & React.ComponentProps<'div'>) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value ?? '');
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    const parsed = toDate(value);
    return isValidDate(parsed) ? parsed : undefined;
  });

  const [month, setMonth] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setInputValue(value ?? '');

    if (!value) {
      setDate(undefined);
      return;
    }

    const parsed = toDate(value);

    if (isValidDate(parsed)) {
      setDate(parsed);
      setMonth(parsed);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;

    setInputValue(text);

    const parsed = new Date(text);

    if (isValidDate(parsed)) {
      setDate(parsed);
      setMonth(parsed);
    }
  };

  const commitInput = () => {
    if (!inputValue.trim()) {
      onChange('');
      setDate(undefined);
      return;
    }

    const parsed = new Date(inputValue);

    if (!isValidDate(parsed)) {
      return;
    }

    const formatted = formatDate(parsed);

    setInputValue(formatted);
    setDate(parsed);
    setMonth(parsed);

    onChange(formatted);
  };

  const handleSelectDate = (selected: Date | undefined) => {
    setDate(selected);
    setMonth(selected);

    if (!selected) {
      setInputValue('');
      onChange('');
    } else {
      const formatted = formatDate(selected);

      setInputValue(formatted);
      onChange(formatted);
    }

    setOpen(false);
  };

  return (
    <Field {...props} data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="date-required">Date of birth</FieldLabel>

      <InputGroup>
        <InputGroupInput
          id="date-required"
          placeholder="Enter or select date"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={commitInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitInput();
            }

            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />

        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />

            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={handleSelectDate}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

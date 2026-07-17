'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

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
import { toDate, isValidDate, formatDate } from '@/lib/date';

type DobPickerProps = {
  value: string | undefined;
  onChange: (value: string) => void;
};

export function DobPicker({
  value,
  onChange,
  ...props
}: DobPickerProps & React.ComponentProps<'div'>) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? toDate(value) : new Date()
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    onChange(e.target.value);

    if (isValidDate(date)) {
      setDate(date);
      setMonth(date);
      onChange(formatDate(date));
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    setDate(date);
    setOpen(false);
    onChange(formatDate(date));
  };

  return (
    <Field {...props}>
      <FieldLabel htmlFor="date-required">Date of birth</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={value}
          onChange={handleInputChange}
          onKeyDown={(e) => {
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
                  aria-label="Select date">
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}>
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

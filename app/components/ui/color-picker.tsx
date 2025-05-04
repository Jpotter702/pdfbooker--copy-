import { useState } from 'react';
import { ChromePicker } from 'react-color';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <ChromePicker
          color={value}
          onChange={(color) => onChange(color.hex)}
        />
      </PopoverContent>
    </Popover>
  );
} 
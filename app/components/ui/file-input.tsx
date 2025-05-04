import { useCallback } from 'react';
import { Button } from './button';
import { Input } from './input';

interface FileInputProps {
  accept?: string;
  onChange: (file: File | null) => void;
}

export function FileInput({ accept, onChange }: FileInputProps) {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      onChange(file);
    },
    [onChange]
  );

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        Choose File
      </Button>
    </div>
  );
} 
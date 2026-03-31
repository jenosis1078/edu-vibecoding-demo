import { TextInput } from '@mantine/core';

interface TodoSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function TodoSearch({ value, onChange }: TodoSearchProps) {
  return (
    <TextInput
      placeholder="제목으로 검색..."
      leftSection="🔍"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      aria-label="TODO 검색"
      size="sm"
    />
  );
}

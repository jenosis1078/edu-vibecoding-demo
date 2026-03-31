import { TextInput, Textarea, Select, Button, Group } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Priority } from '@todo-app/shared/src/types/todo';

interface TodoFormValues {
  title: string;
  description: string;
  priority: Priority;
  dueDate: Date | null;
}

interface TodoFormProps {
  onSubmit: (values: { title: string; description: string; priority: Priority; dueDate: string }) => void;
}

const priorityOptions = [
  { value: Priority.HIGH, label: '높음' },
  { value: Priority.MEDIUM, label: '보통' },
  { value: Priority.LOW, label: '낮음' },
];

export function TodoForm({ onSubmit }: TodoFormProps) {
  const form = useForm<TodoFormValues>({
    initialValues: {
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      dueDate: null,
    },
    validate: {
      title: (value) => {
        if (!value.trim()) return '제목을 입력해주세요';
        if (value.trim().length > 100) return '제목은 100자 이내로 입력해주세요';
        return null;
      },
      dueDate: (value) => (!value ? '마감일을 선택해주세요' : null),
    },
  });

  const handleSubmit = (values: TodoFormValues) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      dueDate: values.dueDate!.toISOString().split('T')[0],
    });
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} aria-label="새 TODO 추가">
      <TextInput
        label="제목"
        placeholder="할 일을 입력하세요"
        required
        {...form.getInputProps('title')}
      />
      <Textarea
        label="설명"
        placeholder="상세 설명 (선택)"
        mt="xs"
        {...form.getInputProps('description')}
      />
      <Group grow mt="xs">
        <Select
          label="우선순위"
          data={priorityOptions}
          allowDeselect={false}
          {...form.getInputProps('priority')}
        />
        <DatePickerInput
          label="마감일"
          placeholder="마감일 선택"
          required
          {...form.getInputProps('dueDate')}
        />
      </Group>
      <Button type="submit" mt="md" fullWidth>
        추가
      </Button>
    </form>
  );
}

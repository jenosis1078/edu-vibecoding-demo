import { TextInput, Textarea, Select, Button, Group, Stack, Collapse, UnstyledButton, Paper, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
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
  const [opened, { toggle }] = useDisclosure(true);

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
    <Paper withBorder radius="md" p="md">
      <UnstyledButton onClick={toggle} w="100%">
        <Group justify="space-between">
          <Text fw={700} size="sm">New TODO</Text>
          <Text c="dimmed" size="lg">{opened ? '▲' : '▼'}</Text>
        </Group>
      </UnstyledButton>

      <Collapse in={opened}>
        <form onSubmit={form.onSubmit(handleSubmit)} aria-label="새 TODO 추가">
          <Stack gap="xs" mt="sm">
            <TextInput
              label="제목"
              placeholder="할 일을 입력하세요"
              required
              {...form.getInputProps('title')}
            />
            <Textarea
              label="설명"
              placeholder="상세 설명 (선택)"
              {...form.getInputProps('description')}
            />
            <Group grow>
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
                valueFormat="YYYY-MM-DD"
                {...form.getInputProps('dueDate')}
              />
            </Group>
            <Button type="submit" fullWidth>
              + Add TODO
            </Button>
          </Stack>
        </form>
      </Collapse>
    </Paper>
  );
}

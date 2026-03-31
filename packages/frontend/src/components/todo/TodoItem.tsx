import { Card, Group, Checkbox, Text, Badge, ActionIcon, Box } from '@mantine/core';
import { Todo, Priority } from '@todo-app/shared/src/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  [Priority.HIGH]: { color: 'red', label: 'HIGH' },
  [Priority.MEDIUM]: { color: 'yellow', label: 'MED' },
  [Priority.LOW]: { color: 'blue', label: 'LOW' },
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { color, label } = priorityConfig[todo.priority];

  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      bg={todo.completed ? 'gray.0' : undefined}
      style={{ borderLeft: `5px solid var(--mantine-color-${color}-5)` }}
      role="listitem"
      aria-label={`TODO: ${todo.title}`}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`${todo.title} 완료 상태 토글`}
            mt={2}
          />
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Text
              size="sm"
              fw={600}
              td={todo.completed ? 'line-through' : undefined}
              c={todo.completed ? 'dimmed' : undefined}
              truncate
            >
              {todo.title}
            </Text>
            {todo.description && (
              <Text size="xs" c={todo.completed ? 'gray.4' : 'dimmed'} lineClamp={1} td={todo.completed ? 'line-through' : undefined}>
                {todo.description}
              </Text>
            )}
            <Group gap={6} mt={4}>
              <Badge size="xs" color={color} variant="light">{label}</Badge>
              <Badge size="xs" variant="default" c={todo.completed ? 'gray.4' : 'dimmed'}>{todo.dueDate}</Badge>
            </Group>
          </Box>
        </Group>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={() => onDelete(todo.id)}
          aria-label={`${todo.title} 삭제`}
        >
          ✕
        </ActionIcon>
      </Group>
    </Card>
  );
}

import { Card, Group, Checkbox, Text, Badge, ActionIcon } from '@mantine/core';
import { Todo, Priority } from '@todo-app/shared/src/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  [Priority.HIGH]: { color: 'red', label: '높음' },
  [Priority.MEDIUM]: { color: 'yellow', label: '보통' },
  [Priority.LOW]: { color: 'blue', label: '낮음' },
};

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const { color, label } = priorityConfig[todo.priority];

  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      style={{ borderLeft: `4px solid var(--mantine-color-${color}-5)` }}
      role="listitem"
      aria-label={`TODO: ${todo.title}`}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
          <Checkbox
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            aria-label={`${todo.title} 완료 상태 토글`}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <Group gap="xs">
              <Text
                size="sm"
                fw={500}
                td={todo.completed ? 'line-through' : undefined}
                c={todo.completed ? 'dimmed' : undefined}
                truncate
              >
                {todo.title}
              </Text>
              <Badge size="xs" color={color} variant="light">
                {label}
              </Badge>
            </Group>
            {todo.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {todo.description}
              </Text>
            )}
            <Text size="xs" c="dimmed" mt={2}>
              마감: {todo.dueDate}
            </Text>
          </div>
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

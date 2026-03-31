import { Stack, Text } from '@mantine/core';
import { Todo } from '@todo-app/shared/src/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl" fz="sm">
        할 일이 없습니다.
      </Text>
    );
  }

  return (
    <Stack gap="xs" role="list" aria-label="TODO 목록">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}

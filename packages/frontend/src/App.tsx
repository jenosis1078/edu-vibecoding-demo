import { useState, useMemo } from 'react';
import { AppShell, Container, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Priority } from '@todo-app/shared/src/types/todo';
import { useTodos } from './contexts/TodoContext';
import { searchTodos, filterByPriority, sortTodos, PriorityFilter, SortOption } from './utils/todoFilters';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TodoForm } from './components/todo/TodoForm';
import { TodoSearch } from './components/todo/TodoSearch';
import { TodoFilter } from './components/todo/TodoFilter';
import { TodoList } from './components/todo/TodoList';

export function App() {
  const { todos, addTodo, deleteTodo, toggleTodo } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');

  const filteredTodos = useMemo(() => {
    let result = searchTodos(todos, searchQuery);
    result = filterByPriority(result, priorityFilter);
    result = sortTodos(result, sortOption);
    return result;
  }, [todos, searchQuery, priorityFilter, sortOption]);

  const handleAddTodo = (values: { title: string; description: string; priority: Priority; dueDate: string }) => {
    addTodo(values);
    notifications.show({
      title: 'TODO 추가',
      message: `"${values.title}" 이(가) 추가되었습니다.`,
      color: 'green',
    });
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
    notifications.show({
      title: 'TODO 삭제',
      message: '삭제되었습니다.',
      color: 'red',
    });
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="sm">
          <Stack gap="md">
            <TodoForm onSubmit={handleAddTodo} />
            <TodoSearch value={searchQuery} onChange={setSearchQuery} />
            <TodoFilter
              priorityFilter={priorityFilter}
              sortOption={sortOption}
              onPriorityChange={setPriorityFilter}
              onSortChange={setSortOption}
            />
            <TodoList
              todos={filteredTodos}
              onToggle={toggleTodo}
              onDelete={handleDeleteTodo}
            />
            <Footer />
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

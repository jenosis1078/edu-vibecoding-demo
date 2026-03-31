import { Todo, Priority } from '@todo-app/shared/src/types/todo';

export type PriorityFilter = Priority | 'ALL';
export type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'title';

const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.HIGH]: 0,
  [Priority.MEDIUM]: 1,
  [Priority.LOW]: 2,
};

export function searchTodos(todos: Todo[], query: string): Todo[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return todos;
  return todos.filter((todo) => todo.title.toLowerCase().includes(trimmed));
}

export function filterByPriority(todos: Todo[], priority: PriorityFilter): Todo[] {
  if (priority === 'ALL') return todos;
  return todos.filter((todo) => todo.priority === priority);
}

export function sortTodos(todos: Todo[], sortBy: SortOption): Todo[] {
  const sorted = [...todos];

  switch (sortBy) {
    case 'createdAt':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    case 'dueDate':
      return sorted.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    case 'priority':
      return sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));

    default:
      return sorted;
  }
}

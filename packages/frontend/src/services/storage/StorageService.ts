import { Todo } from '@todo-app/shared/src/types/todo';

export interface StorageService {
  getTodos(): Todo[];
  saveTodos(todos: Todo[]): void;
}

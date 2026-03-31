import { Todo } from '@todo-app/shared/src/types/todo';
import { StorageService } from './StorageService';

const STORAGE_KEY = 'todo-app-todos';

export class LocalStorageService implements StorageService {
  getTodos(): Todo[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveTodos(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

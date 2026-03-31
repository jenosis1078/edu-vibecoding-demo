import { Todo } from '@todo-app/shared/src/types/todo';

export type TodoAction =
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: { id: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'SET_TODOS'; payload: Todo[] };

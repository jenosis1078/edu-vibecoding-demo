import { Todo } from '@todo-app/shared/src/types/todo';
import { TodoAction } from './todoTypes';

export function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'ADD_TODO':
      return [action.payload, ...state];

    case 'DELETE_TODO':
      return state.filter((todo) => todo.id !== action.payload.id);

    case 'TOGGLE_TODO':
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo,
      );

    case 'SET_TODOS':
      return action.payload;

    default:
      return state;
  }
}

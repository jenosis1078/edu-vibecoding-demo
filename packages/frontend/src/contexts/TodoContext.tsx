import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Todo } from '@todo-app/shared/src/types/todo';
import { todoReducer } from './todoReducer';
import { StorageService } from '../services/storage/StorageService';
import { LocalStorageService } from '../services/storage/LocalStorageService';

interface TodoContextValue {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'completed' | 'createdAt'>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const storageService: StorageService = new LocalStorageService();

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, [], () => storageService.getTodos());

  useEffect(() => {
    storageService.saveTodos(todos);
  }, [todos]);

  const addTodo = (input: Omit<Todo, 'id' | 'userId' | 'completed' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...input,
      id: crypto.randomUUID(),
      userId: 'local-user',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TODO', payload: newTodo });
  };

  const deleteTodo = (id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: { id } });
  };

  const toggleTodo = (id: string) => {
    dispatch({ type: 'TOGGLE_TODO', payload: { id } });
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo, toggleTodo }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}

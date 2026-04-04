import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState } from 'react';
import { Todo } from '@todo-app/shared/src/types/todo';
import { todoReducer } from './todoReducer';
import { StorageService } from '../services/storage/StorageService';
import { LocalStorageService } from '../services/storage/LocalStorageService';
import * as todoApi from '../services/todoApi';
import { config } from '../config';

interface TodoContextValue {
  todos: Todo[];
  error: string | null;
  isLoading: boolean;
  addTodo: (todo: Omit<Todo, 'id' | 'userId' | 'completed' | 'createdAt'>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

const storageService: StorageService = new LocalStorageService();
const isApiEnabled = () => !!config.apiUrl;

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, [], () => storageService.getTodos());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 로컬 스토리지 캐시 동기화
  useEffect(() => {
    storageService.saveTodos(todos);
  }, [todos]);

  // API가 설정되어 있으면 초기 데이터를 서버에서 로드
  useEffect(() => {
    if (!isApiEnabled()) return;
    setIsLoading(true);
    todoApi.getTodos()
      .then((serverTodos) => dispatch({ type: 'SET_TODOS', payload: serverTodos }))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const addTodo = useCallback(async (input: Omit<Todo, 'id' | 'userId' | 'completed' | 'createdAt'>) => {
    setError(null);
    if (isApiEnabled()) {
      try {
        const created = await todoApi.createTodo(input);
        dispatch({ type: 'ADD_TODO', payload: created });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'TODO 추가 실패');
      }
    } else {
      const newTodo: Todo = {
        ...input,
        id: crypto.randomUUID(),
        userId: 'local-user',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_TODO', payload: newTodo });
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    setError(null);
    if (isApiEnabled()) {
      try {
        await todoApi.deleteTodo(id);
        dispatch({ type: 'DELETE_TODO', payload: { id } });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'TODO 삭제 실패');
      }
    } else {
      dispatch({ type: 'DELETE_TODO', payload: { id } });
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    setError(null);
    if (isApiEnabled()) {
      try {
        const updated = await todoApi.toggleTodo(id);
        dispatch({ type: 'SET_TODOS', payload: todos.map((t) => (t.id === id ? updated : t)) });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'TODO 토글 실패');
      }
    } else {
      dispatch({ type: 'TOGGLE_TODO', payload: { id } });
    }
  }, [todos]);

  return (
    <TodoContext.Provider value={{ todos, error, isLoading, addTodo, deleteTodo, toggleTodo }}>
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

import { Todo, Priority } from '@todo-app/shared/src/types/todo';
import { todoReducer } from '../todoReducer';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  userId: 'user-1',
  title: '테스트 할 일',
  description: '테스트 설명',
  priority: Priority.MEDIUM,
  dueDate: '2026-04-15',
  completed: false,
  createdAt: '2026-03-31T12:00:00.000Z',
  ...overrides,
});

describe('todoReducer', () => {
  describe('ADD_TODO', () => {
    it('빈 목록에 새 TODO를 추가한다', () => {
      const newTodo = createTodo();
      const result = todoReducer([], { type: 'ADD_TODO', payload: newTodo });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(newTodo);
    });

    it('기존 목록 앞에 새 TODO를 추가한다', () => {
      const existing = createTodo({ id: 'todo-1', title: '기존' });
      const newTodo = createTodo({ id: 'todo-2', title: '새로운' });

      const result = todoReducer([existing], { type: 'ADD_TODO', payload: newTodo });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('todo-2');
      expect(result[1].id).toBe('todo-1');
    });
  });

  describe('DELETE_TODO', () => {
    it('지정한 id의 TODO를 목록에서 제거한다', () => {
      const todos = [
        createTodo({ id: 'todo-1' }),
        createTodo({ id: 'todo-2' }),
        createTodo({ id: 'todo-3' }),
      ];
      const result = todoReducer(todos, { type: 'DELETE_TODO', payload: { id: 'todo-2' } });

      expect(result).toHaveLength(2);
      expect(result.find((t) => t.id === 'todo-2')).toBeUndefined();
    });

    it('존재하지 않는 id로 삭제해도 목록이 변하지 않는다', () => {
      const todos = [createTodo({ id: 'todo-1' })];
      const result = todoReducer(todos, { type: 'DELETE_TODO', payload: { id: 'nonexistent' } });

      expect(result).toHaveLength(1);
    });
  });

  describe('TOGGLE_TODO', () => {
    it('completed가 false인 TODO를 true로 토글한다', () => {
      const todos = [createTodo({ id: 'todo-1', completed: false })];
      const result = todoReducer(todos, { type: 'TOGGLE_TODO', payload: { id: 'todo-1' } });

      expect(result[0].completed).toBe(true);
    });

    it('completed가 true인 TODO를 false로 토글한다', () => {
      const todos = [createTodo({ id: 'todo-1', completed: true })];
      const result = todoReducer(todos, { type: 'TOGGLE_TODO', payload: { id: 'todo-1' } });

      expect(result[0].completed).toBe(false);
    });

    it('다른 TODO의 completed 상태는 변경하지 않는다', () => {
      const todos = [
        createTodo({ id: 'todo-1', completed: false }),
        createTodo({ id: 'todo-2', completed: true }),
      ];
      const result = todoReducer(todos, { type: 'TOGGLE_TODO', payload: { id: 'todo-1' } });

      expect(result[0].completed).toBe(true);
      expect(result[1].completed).toBe(true);
    });
  });

  describe('SET_TODOS', () => {
    it('전체 목록을 교체한다', () => {
      const oldTodos = [createTodo({ id: 'old-1' })];
      const newTodos = [
        createTodo({ id: 'new-1' }),
        createTodo({ id: 'new-2' }),
      ];
      const result = todoReducer(oldTodos, { type: 'SET_TODOS', payload: newTodos });

      expect(result).toEqual(newTodos);
      expect(result).toHaveLength(2);
    });

    it('빈 배열로 교체할 수 있다', () => {
      const todos = [createTodo()];
      const result = todoReducer(todos, { type: 'SET_TODOS', payload: [] });

      expect(result).toEqual([]);
    });
  });
});

import { Todo, Priority } from '@todo-app/shared/src/types/todo';
import { LocalStorageService } from '../LocalStorageService';

const STORAGE_KEY = 'todo-app-todos';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id-1',
  userId: 'user-1',
  title: '테스트 할 일',
  description: '테스트 설명',
  priority: Priority.MEDIUM,
  dueDate: '2026-04-15',
  completed: false,
  createdAt: '2026-03-31T12:00:00.000Z',
  ...overrides,
});

describe('LocalStorageService', () => {
  let service: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new LocalStorageService();
  });

  describe('getTodos', () => {
    it('저장된 데이터가 없으면 빈 배열을 반환한다', () => {
      expect(service.getTodos()).toEqual([]);
    });

    it('localStorage에 저장된 TODO 목록을 반환한다', () => {
      const todos = [createTodo(), createTodo({ id: 'test-id-2', title: '두 번째' })];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));

      expect(service.getTodos()).toEqual(todos);
    });

    it('잘못된 JSON이 저장되어 있으면 빈 배열을 반환한다', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');

      expect(service.getTodos()).toEqual([]);
    });
  });

  describe('saveTodos', () => {
    it('TODO 목록을 localStorage에 저장한다', () => {
      const todos = [createTodo()];
      service.saveTodos(todos);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toEqual(todos);
    });

    it('saveTodos 후 getTodos로 동일한 데이터를 조회할 수 있다', () => {
      const todos = [
        createTodo(),
        createTodo({ id: 'test-id-2', title: '두 번째', priority: Priority.HIGH }),
      ];
      service.saveTodos(todos);

      expect(service.getTodos()).toEqual(todos);
    });

    it('빈 배열을 저장할 수 있다', () => {
      service.saveTodos([createTodo()]);
      service.saveTodos([]);

      expect(service.getTodos()).toEqual([]);
    });
  });
});

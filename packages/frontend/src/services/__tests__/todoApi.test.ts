import { Priority } from '@todo-app/shared/src/types/todo';

// cognitoService mock
jest.mock('../auth/cognitoService', () => ({
  getCredentials: jest.fn().mockResolvedValue({
    accessKeyId: 'AKIATEST',
    secretAccessKey: 'secret123',
    sessionToken: 'session-token-123',
    identityId: 'ap-northeast-2:test-identity-id',
  }),
}));

// config mock
jest.mock('../../config', () => ({
  config: {
    apiUrl: 'https://test-api.execute-api.ap-northeast-2.amazonaws.com/prod',
    identityPoolId: 'ap-northeast-2:pool-id',
    region: 'ap-northeast-2',
  },
}));

// fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { createTodo, getTodos, deleteTodo, toggleTodo } from '../todoApi';

beforeEach(() => {
  mockFetch.mockReset();
});

describe('todoApi', () => {
  describe('createTodo', () => {
    it('POST /todos로 올바른 body를 전송한다', async () => {
      const newTodo = { id: 'todo-1', userId: 'u1', title: '테스트', description: '', priority: Priority.HIGH, dueDate: '2026-04-15', completed: false, createdAt: '2026-04-01T00:00:00.000Z' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: newTodo }),
      });

      const result = await createTodo({ title: '테스트', description: '', priority: Priority.HIGH, dueDate: '2026-04-15' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/todos');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ title: '테스트', description: '', priority: Priority.HIGH, dueDate: '2026-04-15' });
      expect(result).toEqual(newTodo);
    });
  });

  describe('getTodos', () => {
    it('GET /todos를 호출하고 배열을 반환한다', async () => {
      const todos = [{ id: '1', title: '할 일' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: todos }),
      });

      const result = await getTodos();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/todos');
      expect(options.method).toBe('GET');
      expect(result).toEqual(todos);
    });
  });

  describe('deleteTodo', () => {
    it('DELETE /todos/{id}를 호출한다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { id: 'todo-1' } }),
      });

      await deleteTodo('todo-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/todos/todo-1');
      expect(options.method).toBe('DELETE');
    });
  });

  describe('toggleTodo', () => {
    it('PATCH /todos/{id}/toggle을 호출한다', async () => {
      const toggled = { id: 'todo-1', completed: true };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: toggled }),
      });

      const result = await toggleTodo('todo-1');

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain('/todos/todo-1/toggle');
      expect(options.method).toBe('PATCH');
      expect(result).toEqual(toggled);
    });
  });

  describe('SigV4 서명', () => {
    it('요청 헤더에 X-Amz-Security-Token이 포함된다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      await getTodos();

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers;
      // SigV4 서명 시 sessionToken이 헤더에 포함되는지 검증
      const headerKeys = Object.keys(headers).map((k) => k.toLowerCase());
      expect(headerKeys).toContain('x-amz-security-token');
    });
  });

  describe('에러 처리', () => {
    it('403 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ success: false, error: { code: 'FORBIDDEN', message: '접근 거부' } }),
      });

      await expect(getTodos()).rejects.toThrow('접근 거부');
    });

    it('404 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ success: false, error: { code: 'NOT_FOUND', message: '찾을 수 없습니다' } }),
      });

      await expect(deleteTodo('nonexistent')).rejects.toThrow('찾을 수 없습니다');
    });

    it('500 응답 시 에러를 throw한다', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ success: false, error: { code: 'SERVER_ERROR', message: '서버 에러' } }),
      });

      await expect(getTodos()).rejects.toThrow('서버 에러');
    });
  });
});

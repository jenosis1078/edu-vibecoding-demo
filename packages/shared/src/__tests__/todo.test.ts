import { Todo, Priority } from '../types/todo';

describe('Priority enum', () => {
  it('should have exactly 3 values: HIGH, MEDIUM, LOW', () => {
    const values = Object.values(Priority);
    expect(values).toHaveLength(3);
    expect(values).toContain('HIGH');
    expect(values).toContain('MEDIUM');
    expect(values).toContain('LOW');
  });

  it('should have correct string values', () => {
    expect(Priority.HIGH).toBe('HIGH');
    expect(Priority.MEDIUM).toBe('MEDIUM');
    expect(Priority.LOW).toBe('LOW');
  });
});

describe('Todo interface', () => {
  const validTodo: Todo = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-123',
    title: '테스트 할 일',
    description: '테스트 설명',
    priority: Priority.HIGH,
    dueDate: '2026-04-15',
    completed: false,
    createdAt: '2026-03-31T12:00:00.000Z',
  };

  it('should have all required fields', () => {
    expect(validTodo).toHaveProperty('id');
    expect(validTodo).toHaveProperty('userId');
    expect(validTodo).toHaveProperty('title');
    expect(validTodo).toHaveProperty('description');
    expect(validTodo).toHaveProperty('priority');
    expect(validTodo).toHaveProperty('dueDate');
    expect(validTodo).toHaveProperty('completed');
    expect(validTodo).toHaveProperty('createdAt');
  });

  it('should have correct field types', () => {
    expect(typeof validTodo.id).toBe('string');
    expect(typeof validTodo.userId).toBe('string');
    expect(typeof validTodo.title).toBe('string');
    expect(typeof validTodo.description).toBe('string');
    expect(typeof validTodo.completed).toBe('boolean');
    expect(typeof validTodo.dueDate).toBe('string');
    expect(typeof validTodo.createdAt).toBe('string');
  });

  it('should accept valid Priority values', () => {
    expect(Object.values(Priority)).toContain(validTodo.priority);
  });
});

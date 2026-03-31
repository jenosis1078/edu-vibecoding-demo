import { Todo, Priority } from '@todo-app/shared/src/types/todo';
import { searchTodos, filterByPriority, sortTodos } from '../todoFilters';

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

const sampleTodos: Todo[] = [
  createTodo({ id: '1', title: '리액트 공부', priority: Priority.HIGH, dueDate: '2026-04-10', createdAt: '2026-03-30T10:00:00.000Z' }),
  createTodo({ id: '2', title: '장보기', priority: Priority.LOW, dueDate: '2026-04-20', createdAt: '2026-03-31T08:00:00.000Z' }),
  createTodo({ id: '3', title: 'React 테스트 작성', priority: Priority.MEDIUM, dueDate: '2026-04-05', createdAt: '2026-03-29T15:00:00.000Z' }),
  createTodo({ id: '4', title: '운동하기', priority: Priority.HIGH, dueDate: '2026-04-15', createdAt: '2026-04-01T09:00:00.000Z' }),
];

describe('searchTodos', () => {
  it('제목에 검색어가 포함된 TODO를 반환한다 (부분 문자열 매칭)', () => {
    const result = searchTodos(sampleTodos, '공부');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('대소문자를 무시하고 검색한다', () => {
    const result = searchTodos(sampleTodos, 'react');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('빈 문자열이면 전체 목록을 반환한다', () => {
    const result = searchTodos(sampleTodos, '');
    expect(result).toHaveLength(4);
  });

  it('공백만 있는 문자열이면 전체 목록을 반환한다', () => {
    const result = searchTodos(sampleTodos, '   ');
    expect(result).toHaveLength(4);
  });

  it('매칭되는 항목이 없으면 빈 배열을 반환한다', () => {
    const result = searchTodos(sampleTodos, '존재하지않는검색어');
    expect(result).toHaveLength(0);
  });
});

describe('filterByPriority', () => {
  it('ALL이면 전체 목록을 반환한다', () => {
    const result = filterByPriority(sampleTodos, 'ALL');
    expect(result).toHaveLength(4);
  });

  it('HIGH 필터링', () => {
    const result = filterByPriority(sampleTodos, Priority.HIGH);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.priority === Priority.HIGH)).toBe(true);
  });

  it('MEDIUM 필터링', () => {
    const result = filterByPriority(sampleTodos, Priority.MEDIUM);
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe(Priority.MEDIUM);
  });

  it('LOW 필터링', () => {
    const result = filterByPriority(sampleTodos, Priority.LOW);
    expect(result).toHaveLength(1);
    expect(result[0].priority).toBe(Priority.LOW);
  });
});

describe('sortTodos', () => {
  it('생성일순 정렬 (최신순)', () => {
    const result = sortTodos(sampleTodos, 'createdAt');
    expect(result[0].id).toBe('4');
    expect(result[result.length - 1].id).toBe('3');
  });

  it('마감일순 정렬 (가까운 날짜 먼저)', () => {
    const result = sortTodos(sampleTodos, 'dueDate');
    expect(result[0].id).toBe('3');
    expect(result[result.length - 1].id).toBe('2');
  });

  it('우선순위순 정렬 (HIGH → MEDIUM → LOW)', () => {
    const result = sortTodos(sampleTodos, 'priority');
    expect(result[0].priority).toBe(Priority.HIGH);
    expect(result[1].priority).toBe(Priority.HIGH);
    expect(result[2].priority).toBe(Priority.MEDIUM);
    expect(result[3].priority).toBe(Priority.LOW);
  });

  it('이름순 정렬 (가나다순)', () => {
    const result = sortTodos(sampleTodos, 'title');
    const titles = result.map((t) => t.title);
    // localeCompare 기준 정렬 확인 (원본 배열과 독립적으로 정렬됨)
    const expected = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(expected);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const original = [...sampleTodos];
    sortTodos(sampleTodos, 'title');
    expect(sampleTodos).toEqual(original);
  });
});

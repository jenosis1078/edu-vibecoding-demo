import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Todo, Priority } from '@todo-app/shared/src/types/todo';
import { TodoProvider } from '../contexts/TodoContext';
import { App } from '../App';
import { theme } from '../theme';

const STORAGE_KEY = 'todo-app-todos';

function renderApp() {
  return render(
    <MantineProvider theme={theme}>
      <TodoProvider>
        <App />
      </TodoProvider>
    </MantineProvider>,
  );
}

function createTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    userId: 'local-user',
    title: '테스트 할 일',
    description: '테스트 설명',
    priority: Priority.MEDIUM,
    dueDate: '2026-04-15',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function seedTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

beforeEach(() => {
  localStorage.clear();
});

describe('App 통합 테스트 — 렌더링', () => {
  it('앱이 정상적으로 렌더링된다', () => {
    renderApp();
    expect(screen.getByText('TODO 앱')).toBeInTheDocument();
    expect(screen.getByText('New TODO')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('제목으로 검색...')).toBeInTheDocument();
  });

  it('할 일이 없으면 빈 상태 메시지를 표시한다', () => {
    renderApp();
    expect(screen.getByText('할 일이 없습니다.')).toBeInTheDocument();
  });

  it('저장된 TODO 목록을 표시한다', () => {
    seedTodos([
      createTodo({ id: '1', title: '리액트 공부', priority: Priority.HIGH }),
      createTodo({ id: '2', title: '장보기', priority: Priority.LOW }),
    ]);
    renderApp();

    expect(screen.getByText('리액트 공부')).toBeInTheDocument();
    expect(screen.getByText('장보기')).toBeInTheDocument();
    expect(screen.getByText('2건')).toBeInTheDocument();
  });

  it('TODO 항목에 우선순위 뱃지가 표시된다', () => {
    seedTodos([
      createTodo({ id: '1', title: '긴급', priority: Priority.HIGH }),
    ]);
    renderApp();

    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('TODO 항목에 마감일이 표시된다', () => {
    seedTodos([
      createTodo({ id: '1', title: '마감일 테스트', dueDate: '2026-05-01' }),
    ]);
    renderApp();

    expect(screen.getByText('2026-05-01')).toBeInTheDocument();
  });
});

describe('App 통합 테스트 — 토글', () => {
  it('체크박스를 클릭하면 완료 상태가 토글된다', () => {
    seedTodos([createTodo({ id: '1', title: '토글 테스트' })]);
    renderApp();

    const checkbox = screen.getByRole('checkbox', { name: /토글 테스트 완료 상태 토글/i });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('토글 후 localStorage에 상태가 저장된다', () => {
    seedTodos([createTodo({ id: '1', title: '저장 테스트', completed: false })]);
    renderApp();

    const checkbox = screen.getByRole('checkbox', { name: /저장 테스트 완료 상태 토글/i });
    fireEvent.click(checkbox);

    const stored: Todo[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0].completed).toBe(true);
  });
});

describe('App 통합 테스트 — 삭제', () => {
  it('삭제 버튼을 클릭하면 TODO가 제거된다', () => {
    seedTodos([
      createTodo({ id: '1', title: '삭제할 항목' }),
      createTodo({ id: '2', title: '남길 항목' }),
    ]);
    renderApp();

    const deleteBtn = screen.getByRole('button', { name: /삭제할 항목 삭제/i });
    fireEvent.click(deleteBtn);

    expect(screen.queryByText('삭제할 항목')).not.toBeInTheDocument();
    expect(screen.getByText('남길 항목')).toBeInTheDocument();
    expect(screen.getByText('1건')).toBeInTheDocument();
  });

  it('삭제 후 localStorage에 반영된다', () => {
    seedTodos([createTodo({ id: '1', title: '삭제 대상' })]);
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /삭제 대상 삭제/i }));

    const stored: Todo[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(0);
  });
});

describe('App 통합 테스트 — 검색', () => {
  it('제목으로 검색하면 매칭되는 항목만 표시된다', () => {
    seedTodos([
      createTodo({ id: '1', title: '리액트 공부' }),
      createTodo({ id: '2', title: '장보기' }),
      createTodo({ id: '3', title: '리액트 테스트' }),
    ]);
    renderApp();

    const searchInput = screen.getByPlaceholderText('제목으로 검색...');
    fireEvent.change(searchInput, { target: { value: '리액트' } });

    expect(screen.getByText('리액트 공부')).toBeInTheDocument();
    expect(screen.getByText('리액트 테스트')).toBeInTheDocument();
    expect(screen.queryByText('장보기')).not.toBeInTheDocument();
    expect(screen.getByText('2건')).toBeInTheDocument();
  });

  it('검색어를 지우면 모든 항목이 다시 표시된다', () => {
    seedTodos([
      createTodo({ id: '1', title: '항목A' }),
      createTodo({ id: '2', title: '항목B' }),
    ]);
    renderApp();

    const searchInput = screen.getByPlaceholderText('제목으로 검색...');
    fireEvent.change(searchInput, { target: { value: '항목A' } });
    expect(screen.queryByText('항목B')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('항목A')).toBeInTheDocument();
    expect(screen.getByText('항목B')).toBeInTheDocument();
  });

  it('매칭되는 항목이 없으면 빈 상태 메시지를 표시한다', () => {
    seedTodos([createTodo({ id: '1', title: '테스트' })]);
    renderApp();

    const searchInput = screen.getByPlaceholderText('제목으로 검색...');
    fireEvent.change(searchInput, { target: { value: '없는검색어' } });

    expect(screen.getByText('할 일이 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('0건')).toBeInTheDocument();
  });
});

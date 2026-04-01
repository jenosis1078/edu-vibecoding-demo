import { APIGatewayProxyEvent } from 'aws-lambda';

// dynamodb 유틸 mock
jest.mock('../../utils/dynamodb', () => ({
  putItem: jest.fn(),
  queryItems: jest.fn(),
  deleteItem: jest.fn(),
  updateItem: jest.fn(),
}));

import { putItem, queryItems, deleteItem, updateItem } from '../../utils/dynamodb';
import { handler as createTodo } from '../createTodo';
import { handler as getTodos } from '../getTodos';
import { handler as deleteTodoHandler } from '../deleteTodo';
import { handler as toggleTodo } from '../toggleTodo';

const mockPutItem = putItem as jest.MockedFunction<typeof putItem>;
const mockQueryItems = queryItems as jest.MockedFunction<typeof queryItems>;
const mockDeleteItem = deleteItem as jest.MockedFunction<typeof deleteItem>;
const mockUpdateItem = updateItem as jest.MockedFunction<typeof updateItem>;

function createEvent(overrides: Partial<APIGatewayProxyEvent> = {}): APIGatewayProxyEvent {
  return {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/todos',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    resource: '',
    requestContext: {
      identity: {
        cognitoIdentityId: 'test-user-id',
      },
    } as unknown as APIGatewayProxyEvent['requestContext'],
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ===== createTodo =====
describe('createTodo', () => {
  it('유효한 요청 → 201 응답, DynamoDB PutItem 호출', async () => {
    mockPutItem.mockResolvedValue(undefined);

    const event = createEvent({
      body: JSON.stringify({
        title: '테스트 할 일',
        description: '설명',
        priority: 'HIGH',
        dueDate: '2026-04-15',
      }),
    });

    const result = await createTodo(event);

    expect(result.statusCode).toBe(201);
    expect(mockPutItem).toHaveBeenCalledTimes(1);

    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe('테스트 할 일');
    expect(body.data.userId).toBe('test-user-id');
    expect(body.data.completed).toBe(false);
    expect(body.data.id).toBeDefined();
  });

  it('필수 필드(title) 누락 시 400 에러', async () => {
    const event = createEvent({
      body: JSON.stringify({ priority: 'HIGH', dueDate: '2026-04-15' }),
    });

    const result = await createTodo(event);

    expect(result.statusCode).toBe(400);
    expect(mockPutItem).not.toHaveBeenCalled();
  });

  it('필수 필드(dueDate) 누락 시 400 에러', async () => {
    const event = createEvent({
      body: JSON.stringify({ title: '테스트', priority: 'HIGH' }),
    });

    const result = await createTodo(event);

    expect(result.statusCode).toBe(400);
  });
});

// ===== getTodos =====
describe('getTodos', () => {
  it('userId로 Query하여 TODO 목록 반환', async () => {
    const items = [
      { userId: 'test-user-id', id: 't1', title: '할 일 1' },
      { userId: 'test-user-id', id: 't2', title: '할 일 2' },
    ];
    mockQueryItems.mockResolvedValue(items);

    const result = await getTodos(createEvent());

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data).toHaveLength(2);
    expect(mockQueryItems).toHaveBeenCalledWith('test-user-id');
  });

  it('TODO가 없으면 빈 배열 반환', async () => {
    mockQueryItems.mockResolvedValue([]);

    const result = await getTodos(createEvent());

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data).toEqual([]);
  });
});

// ===== deleteTodo =====
describe('deleteTodo', () => {
  it('유효한 id → 200 응답, DeleteItem 호출', async () => {
    mockDeleteItem.mockResolvedValue(undefined);

    const event = createEvent({ pathParameters: { id: 'todo-123' } });

    const result = await deleteTodoHandler(event);

    expect(result.statusCode).toBe(200);
    expect(mockDeleteItem).toHaveBeenCalledWith('test-user-id', 'todo-123');
  });

  it('id가 없으면 400 에러', async () => {
    const event = createEvent({ pathParameters: null });

    const result = await deleteTodoHandler(event);

    expect(result.statusCode).toBe(400);
  });
});

// ===== toggleTodo =====
describe('toggleTodo', () => {
  it('completed: false → true 토글', async () => {
    mockQueryItems.mockResolvedValue([{ userId: 'test-user-id', id: 'todo-1', completed: false }]);
    mockUpdateItem.mockResolvedValue({ userId: 'test-user-id', id: 'todo-1', completed: true });

    const event = createEvent({ pathParameters: { id: 'todo-1' } });

    const result = await toggleTodo(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data.completed).toBe(true);
  });

  it('completed: true → false 토글', async () => {
    mockQueryItems.mockResolvedValue([{ userId: 'test-user-id', id: 'todo-2', completed: true }]);
    mockUpdateItem.mockResolvedValue({ userId: 'test-user-id', id: 'todo-2', completed: false });

    const event = createEvent({ pathParameters: { id: 'todo-2' } });

    const result = await toggleTodo(event);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.data.completed).toBe(false);
  });

  it('존재하지 않는 id → 404 에러', async () => {
    mockQueryItems.mockResolvedValue([]);

    const event = createEvent({ pathParameters: { id: 'nonexistent' } });

    const result = await toggleTodo(event);

    expect(result.statusCode).toBe(404);
  });
});

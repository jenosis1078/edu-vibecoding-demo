import { putItem, queryItems, deleteItem, updateItem } from '../dynamodb';

// DynamoDBDocumentClient를 mock
jest.mock('@aws-sdk/lib-dynamodb', () => {
  const sendMock = jest.fn();
  return {
    DynamoDBDocumentClient: {
      from: () => ({ send: sendMock }),
    },
    PutCommand: jest.fn().mockImplementation((input) => ({ input, _type: 'Put' })),
    QueryCommand: jest.fn().mockImplementation((input) => ({ input, _type: 'Query' })),
    DeleteCommand: jest.fn().mockImplementation((input) => ({ input, _type: 'Delete' })),
    UpdateCommand: jest.fn().mockImplementation((input) => ({ input, _type: 'Update' })),
    __sendMock: sendMock,
  };
});

jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({})),
}));

const { __sendMock: sendMock } = jest.requireMock('@aws-sdk/lib-dynamodb');

beforeEach(() => {
  sendMock.mockReset();
});

describe('dynamodb utils', () => {
  const TABLE_NAME = 'test-table';
  process.env.TABLE_NAME = TABLE_NAME;

  describe('putItem', () => {
    it('PutCommand를 올바른 파라미터로 호출한다', async () => {
      sendMock.mockResolvedValue({});
      const item = { userId: 'u1', id: 't1', title: 'test' };

      await putItem(item);

      expect(sendMock).toHaveBeenCalledTimes(1);
      const arg = sendMock.mock.calls[0][0];
      expect(arg.input.TableName).toBe(TABLE_NAME);
      expect(arg.input.Item).toEqual(item);
    });
  });

  describe('queryItems', () => {
    it('userId로 Query하고 Items를 반환한다', async () => {
      const items = [{ userId: 'u1', id: 't1' }];
      sendMock.mockResolvedValue({ Items: items });

      const result = await queryItems('u1');

      expect(result).toEqual(items);
      const arg = sendMock.mock.calls[0][0];
      expect(arg.input.TableName).toBe(TABLE_NAME);
      expect(arg.input.KeyConditionExpression).toBe('userId = :userId');
    });

    it('Items가 없으면 빈 배열을 반환한다', async () => {
      sendMock.mockResolvedValue({});

      const result = await queryItems('u1');

      expect(result).toEqual([]);
    });
  });

  describe('deleteItem', () => {
    it('DeleteCommand를 올바른 키로 호출한다', async () => {
      sendMock.mockResolvedValue({});

      await deleteItem('u1', 't1');

      const arg = sendMock.mock.calls[0][0];
      expect(arg.input.TableName).toBe(TABLE_NAME);
      expect(arg.input.Key).toEqual({ userId: 'u1', id: 't1' });
    });
  });

  describe('updateItem', () => {
    it('UpdateCommand를 올바른 파라미터로 호출하고 Attributes를 반환한다', async () => {
      const updated = { userId: 'u1', id: 't1', completed: true };
      sendMock.mockResolvedValue({ Attributes: updated });

      const result = await updateItem('u1', 't1', 'SET completed = :val', { ':val': true });

      expect(result).toEqual(updated);
      const arg = sendMock.mock.calls[0][0];
      expect(arg.input.Key).toEqual({ userId: 'u1', id: 't1' });
      expect(arg.input.UpdateExpression).toBe('SET completed = :val');
    });
  });
});

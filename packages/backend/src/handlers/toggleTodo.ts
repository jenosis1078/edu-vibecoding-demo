import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryItems, updateItem } from '../utils/dynamodb';
import { success, error } from '../utils/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.identity?.cognitoIdentityId;
  if (!userId) return error('UNAUTHORIZED', '사용자를 식별할 수 없습니다.', 401);

  const id = event.pathParameters?.id;
  if (!id) return error('VALIDATION_ERROR', 'id는 필수입니다.', 400);

  // 현재 TODO 조회
  const items = await queryItems(userId);
  const todo = items.find((item) => item.id === id);
  if (!todo) return error('TODO_NOT_FOUND', '해당 TODO를 찾을 수 없습니다.', 404);

  const updated = await updateItem(userId, id, 'SET completed = :val', {
    ':val': !todo.completed,
  });

  return success(updated);
}

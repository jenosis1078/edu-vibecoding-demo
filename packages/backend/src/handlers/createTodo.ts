import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { putItem } from '../utils/dynamodb';
import { success, error } from '../utils/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.identity?.cognitoIdentityId;
  if (!userId) return error('UNAUTHORIZED', '사용자를 식별할 수 없습니다.', 401);

  const body = JSON.parse(event.body || '{}');
  const { title, description, priority, dueDate } = body;

  if (!title?.trim()) return error('VALIDATION_ERROR', 'title은 필수입니다.', 400);
  if (!dueDate) return error('VALIDATION_ERROR', 'dueDate는 필수입니다.', 400);

  const todo = {
    id: randomUUID(),
    userId,
    title: title.trim(),
    description: description?.trim() || '',
    priority: priority || 'MEDIUM',
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await putItem(todo);

  return success(todo, 201);
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteItem } from '../utils/dynamodb';
import { success, error } from '../utils/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.identity?.cognitoIdentityId;
  if (!userId) return error('UNAUTHORIZED', '사용자를 식별할 수 없습니다.', 401);

  const id = event.pathParameters?.id;
  if (!id) return error('VALIDATION_ERROR', 'id는 필수입니다.', 400);

  await deleteItem(userId, id);

  return success({ id });
}

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { queryItems } from '../utils/dynamodb';
import { success, error } from '../utils/response';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.identity?.cognitoIdentityId;
  if (!userId) return error('UNAUTHORIZED', '사용자를 식별할 수 없습니다.', 401);

  const items = await queryItems(userId);

  return success(items);
}

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = () => process.env.TABLE_NAME!;

export async function putItem(item: Record<string, unknown>): Promise<void> {
  await client.send(new PutCommand({ TableName: tableName(), Item: item }));
}

export async function queryItems(userId: string): Promise<Record<string, unknown>[]> {
  const result = await client.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
    }),
  );
  return (result.Items as Record<string, unknown>[]) || [];
}

export async function deleteItem(userId: string, id: string): Promise<void> {
  await client.send(new DeleteCommand({ TableName: tableName(), Key: { userId, id } }));
}

export async function updateItem(
  userId: string,
  id: string,
  updateExpression: string,
  expressionValues: Record<string, unknown>,
): Promise<Record<string, unknown> | undefined> {
  const result = await client.send(
    new UpdateCommand({
      TableName: tableName(),
      Key: { userId, id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: 'ALL_NEW',
    }),
  );
  return result.Attributes as Record<string, unknown> | undefined;
}

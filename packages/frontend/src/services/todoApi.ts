import { Sha256 } from '@aws-crypto/sha256-browser';
import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Todo, Priority } from '@todo-app/shared/src/types/todo';
import { getCredentials } from './auth/cognitoService';
import { config } from '../config';

interface CreateTodoInput {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
}

async function signedFetch(method: string, path: string, body?: unknown): Promise<unknown> {
  const credentials = await getCredentials();
  const url = new URL(path, config.apiUrl);

  const request = new HttpRequest({
    method,
    protocol: url.protocol,
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      'Content-Type': 'application/json',
      host: url.hostname,
      'X-Amz-Security-Token': credentials.sessionToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const signer = new SignatureV4({
    service: 'execute-api',
    region: config.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    sha256: Sha256,
  });

  const signed = await signer.sign(request);

  const response = await fetch(url.toString(), {
    method,
    headers: signed.headers as Record<string, string>,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message || `API error: ${response.status}`);
  }

  return json.data;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return signedFetch('POST', '/todos', input) as Promise<Todo>;
}

export async function getTodos(): Promise<Todo[]> {
  return signedFetch('GET', '/todos') as Promise<Todo[]>;
}

export async function deleteTodo(id: string): Promise<void> {
  await signedFetch('DELETE', `/todos/${id}`);
}

export async function toggleTodo(id: string): Promise<Todo> {
  return signedFetch('PATCH', `/todos/${id}/toggle`) as Promise<Todo>;
}

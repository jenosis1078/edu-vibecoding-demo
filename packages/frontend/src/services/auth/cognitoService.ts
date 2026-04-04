import { CognitoIdentityClient, GetIdCommand, GetCredentialsForIdentityCommand } from '@aws-sdk/client-cognito-identity';
import { config } from '../../config';

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  identityId: string;
}

let cachedCredentials: AwsCredentials | null = null;
let expiresAt = 0;

const client = new CognitoIdentityClient({ region: config.region });

export async function getCredentials(): Promise<AwsCredentials> {
  if (cachedCredentials && Date.now() < expiresAt) {
    return cachedCredentials;
  }

  const { IdentityId } = await client.send(
    new GetIdCommand({ IdentityPoolId: config.identityPoolId }),
  );

  if (!IdentityId) throw new Error('Failed to get Cognito Identity ID');

  const { Credentials } = await client.send(
    new GetCredentialsForIdentityCommand({ IdentityId }),
  );

  if (!Credentials?.AccessKeyId || !Credentials?.SecretKey || !Credentials?.SessionToken) {
    throw new Error('Failed to get Cognito credentials');
  }

  cachedCredentials = {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretKey,
    sessionToken: Credentials.SessionToken,
    identityId: IdentityId,
  };

  // 만료 50분 전에 갱신 (Cognito 기본 만료: 1시간)
  expiresAt = Date.now() + 50 * 60 * 1000;

  return cachedCredentials;
}

export function clearCredentials(): void {
  cachedCredentials = null;
  expiresAt = 0;
}

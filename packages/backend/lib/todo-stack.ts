import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaRuntime from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

export class TodoStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB Table
    this.table = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. Lambda Functions (NodejsFunction — src/handlers/ 자동 번들링)
    const handlerProps: Partial<lambda.NodejsFunctionProps> = {
      runtime: lambdaRuntime.Runtime.NODEJS_20_X,
      environment: { TABLE_NAME: this.table.tableName },
      bundling: { minify: true, sourceMap: true },
    };

    const createTodo = new lambda.NodejsFunction(this, 'CreateTodo', {
      entry: path.join(__dirname, '../src/handlers/createTodo.ts'),
      handler: 'handler',
      ...handlerProps,
    });

    const getTodos = new lambda.NodejsFunction(this, 'GetTodos', {
      entry: path.join(__dirname, '../src/handlers/getTodos.ts'),
      handler: 'handler',
      ...handlerProps,
    });

    const deleteTodo = new lambda.NodejsFunction(this, 'DeleteTodo', {
      entry: path.join(__dirname, '../src/handlers/deleteTodo.ts'),
      handler: 'handler',
      ...handlerProps,
    });

    const toggleTodo = new lambda.NodejsFunction(this, 'ToggleTodo', {
      entry: path.join(__dirname, '../src/handlers/toggleTodo.ts'),
      handler: 'handler',
      ...handlerProps,
    });

    // Lambda에 DynamoDB 읽기/쓰기 권한 부여
    this.table.grantReadWriteData(createTodo);
    this.table.grantReadWriteData(getTodos);
    this.table.grantReadWriteData(deleteTodo);
    this.table.grantReadWriteData(toggleTodo);

    // 3. Cognito Identity Pool (비인증 접근)
    const identityPool = new cognito.CfnIdentityPool(this, 'TodoIdentityPool', {
      allowUnauthenticatedIdentities: true,
      identityPoolName: 'TodoAppIdentityPool',
    });

    const unauthRole = new iam.Role(this, 'UnauthRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: { 'cognito-identity.amazonaws.com:aud': identityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': 'unauthenticated' },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoles', {
      identityPoolId: identityPool.ref,
      roles: { unauthenticated: unauthRole.roleArn },
    });

    // 4. API Gateway (REST) + IAM 인증
    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Amz-Security-Token'],
      },
    });

    const iamAuth = apigateway.AuthorizationType.IAM;

    // /todos
    const todosResource = api.root.addResource('todos');
    todosResource.addMethod('POST', new apigateway.LambdaIntegration(createTodo), {
      authorizationType: iamAuth,
    });
    todosResource.addMethod('GET', new apigateway.LambdaIntegration(getTodos), {
      authorizationType: iamAuth,
    });

    // /todos/{id}
    const todoIdResource = todosResource.addResource('{id}');
    todoIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodo), {
      authorizationType: iamAuth,
    });

    // /todos/{id}/toggle
    const toggleResource = todoIdResource.addResource('toggle');
    toggleResource.addMethod('PATCH', new apigateway.LambdaIntegration(toggleTodo), {
      authorizationType: iamAuth,
    });

    // 비인증 Role에 API Gateway invoke 권한 부여
    unauthRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['execute-api:Invoke'],
        resources: [api.arnForExecuteApi('*', '/*', '*')],
      }),
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'IdentityPoolId', { value: identityPool.ref });
    new cdk.CfnOutput(this, 'Region', { value: this.region });
  }
}

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaRuntime from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as amplify from 'aws-cdk-lib/aws-amplify';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
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

    // 5. AWS Amplify (프론트엔드 호스팅)
    //    - GitHub Actions가 빌드한 결과물을 manual deployment로 업로드
    //    - CI/CD 파이프라인: GitHub Actions → aws amplify create-deployment → start-deployment
    const amplifyApp = new amplify.CfnApp(this, 'FrontendApp', {
      name: 'todo-app-frontend',
      platform: 'WEB',
      description: 'TODO App frontend hosted on AWS Amplify',
      customRules: [
        // SPA 라우팅: 404를 index.html로 폴백
        {
          source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
          target: '/index.html',
          status: '200',
        },
      ],
    });

    const amplifyBranch = new amplify.CfnBranch(this, 'FrontendBranch', {
      appId: amplifyApp.attrAppId,
      branchName: 'master',
      framework: 'React',
      stage: 'PRODUCTION',
      enableAutoBuild: false, // GitHub Actions가 빌드를 담당
    });

    // 6. CloudWatch Dashboard (서비스/인프라 모니터링)
    const dashboard = new cloudwatch.Dashboard(this, 'TodoDashboard', {
      dashboardName: 'TodoApp-Dashboard',
    });

    const apiName = 'Todo API';
    const apiDimensions = { ApiName: apiName };

    const apiMetric = (metricName: string, statistic: string) =>
      new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName,
        dimensionsMap: apiDimensions,
        statistic,
      });

    // API Gateway: 요청 수 / 4XX·5XX
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway · 요청 수 (Count)',
        left: [apiMetric('Count', 'Sum')],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway · 4XX / 5XX 에러',
        left: [apiMetric('4XXError', 'Sum'), apiMetric('5XXError', 'Sum')],
        width: 12,
      }),
    );

    // API Gateway: Latency / IntegrationLatency (p50/p90/p99)
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'API Gateway · Latency (p50/p90/p99)',
        left: [
          apiMetric('Latency', 'p50'),
          apiMetric('Latency', 'p90'),
          apiMetric('Latency', 'p99'),
        ],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'API Gateway · IntegrationLatency (p50/p90/p99)',
        left: [
          apiMetric('IntegrationLatency', 'p50'),
          apiMetric('IntegrationLatency', 'p90'),
          apiMetric('IntegrationLatency', 'p99'),
        ],
        width: 12,
      }),
    );

    // Lambda: 4개 핸들러 종합 위젯
    const lambdaFns: Record<string, lambda.NodejsFunction> = {
      CreateTodo: createTodo,
      GetTodos: getTodos,
      DeleteTodo: deleteTodo,
      ToggleTodo: toggleTodo,
    };

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda · Invocations',
        left: Object.entries(lambdaFns).map(([label, fn]) => fn.metricInvocations({ label })),
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda · Errors',
        left: Object.entries(lambdaFns).map(([label, fn]) => fn.metricErrors({ label })),
        width: 12,
      }),
    );

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda · Duration p50',
        left: Object.entries(lambdaFns).map(([label, fn]) =>
          fn.metricDuration({ statistic: 'p50', label }),
        ),
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda · Duration p99',
        left: Object.entries(lambdaFns).map(([label, fn]) =>
          fn.metricDuration({ statistic: 'p99', label }),
        ),
        width: 12,
      }),
    );

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Lambda · ConcurrentExecutions (합산)',
        left: [
          new cloudwatch.MathExpression({
            expression: 'm1 + m2 + m3 + m4',
            label: 'Total ConcurrentExecutions',
            usingMetrics: {
              m1: createTodo.metric('ConcurrentExecutions', { statistic: 'Maximum' }),
              m2: getTodos.metric('ConcurrentExecutions', { statistic: 'Maximum' }),
              m3: deleteTodo.metric('ConcurrentExecutions', { statistic: 'Maximum' }),
              m4: toggleTodo.metric('ConcurrentExecutions', { statistic: 'Maximum' }),
            },
          }),
        ],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Lambda · Throttles',
        left: Object.entries(lambdaFns).map(([label, fn]) => fn.metricThrottles({ label })),
        width: 12,
      }),
    );

    // DynamoDB: ConsumedCapacity / Throttle / Errors
    const tableDimensions = { TableName: this.table.tableName };
    const ddbMetric = (metricName: string) =>
      new cloudwatch.Metric({
        namespace: 'AWS/DynamoDB',
        metricName,
        dimensionsMap: tableDimensions,
        statistic: 'Sum',
      });

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'DynamoDB · ConsumedCapacityUnits (Read/Write)',
        left: [ddbMetric('ConsumedReadCapacityUnits'), ddbMetric('ConsumedWriteCapacityUnits')],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'DynamoDB · ThrottleEvents (Read/Write)',
        left: [ddbMetric('ReadThrottleEvents'), ddbMetric('WriteThrottleEvents')],
        width: 12,
      }),
    );

    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'DynamoDB · System / User Errors',
        left: [ddbMetric('SystemErrors'), ddbMetric('UserErrors')],
        width: 24,
      }),
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'IdentityPoolId', { value: identityPool.ref });
    new cdk.CfnOutput(this, 'Region', { value: this.region });
    new cdk.CfnOutput(this, 'AmplifyAppId', { value: amplifyApp.attrAppId });
    new cdk.CfnOutput(this, 'AmplifyBranchName', { value: amplifyBranch.branchName });
    new cdk.CfnOutput(this, 'AmplifyDefaultDomain', {
      value: `https://${amplifyBranch.branchName}.${amplifyApp.attrDefaultDomain}`,
      description: 'Amplify 호스팅 기본 URL',
    });
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${this.region}.console.aws.amazon.com/cloudwatch/home?region=${this.region}#dashboards:name=${dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });
  }
}

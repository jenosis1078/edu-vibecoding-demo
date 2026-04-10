import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { TodoStack } from '../lib/todo-stack';

describe('TodoStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new TodoStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  describe('DynamoDB', () => {
    it('DynamoDB 테이블이 존재한다', () => {
      template.resourceCountIs('AWS::DynamoDB::Table', 1);
    });

    it('PK는 userId(String), SK는 id(String)로 설정된다', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'id', KeyType: 'RANGE' },
        ],
      });
    });

    it('PAY_PER_REQUEST 빌링 모드로 설정된다', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
      });
    });
  });

  describe('Lambda', () => {
    it('Lambda 함수가 4개 존재한다', () => {
      template.resourceCountIs('AWS::Lambda::Function', 4);
    });

    it('Lambda에 TABLE_NAME 환경변수가 설정된다', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: {
            TABLE_NAME: Match.anyValue(),
          },
        },
      });
    });

    it('Node.js 20.x 런타임을 사용한다', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs20.x',
      });
    });
  });

  describe('Cognito Identity Pool', () => {
    it('Identity Pool이 존재한다', () => {
      template.resourceCountIs('AWS::Cognito::IdentityPool', 1);
    });

    it('비인증 접근이 활성화되어 있다', () => {
      template.hasResourceProperties('AWS::Cognito::IdentityPool', {
        AllowUnauthenticatedIdentities: true,
      });
    });
  });

  describe('API Gateway', () => {
    it('REST API가 존재한다', () => {
      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });
  });

  describe('CloudWatch Dashboard', () => {
    it('Dashboard 리소스가 1개 존재한다', () => {
      template.resourceCountIs('AWS::CloudWatch::Dashboard', 1);
    });

    it('Dashboard 이름이 TodoApp-Dashboard로 설정된다', () => {
      template.hasResourceProperties('AWS::CloudWatch::Dashboard', {
        DashboardName: 'TodoApp-Dashboard',
      });
    });

    it('Dashboard body에 API Gateway / Lambda / DynamoDB 메트릭 위젯이 포함된다', () => {
      const dashboards = template.findResources('AWS::CloudWatch::Dashboard');
      const [dashboard] = Object.values(dashboards);
      // DashboardBody는 Fn::Join 토큰이므로 리터럴 조각만 이어붙여 검색한다
      const join = dashboard.Properties.DashboardBody['Fn::Join'];
      const literalBody = (join[1] as unknown[])
        .filter((part): part is string => typeof part === 'string')
        .join('');

      expect(literalBody).toContain('API Gateway · 요청 수 (Count)');
      expect(literalBody).toContain('API Gateway · 4XX / 5XX 에러');
      expect(literalBody).toContain('API Gateway · Latency (p50/p90/p99)');
      expect(literalBody).toContain('Lambda · Invocations');
      expect(literalBody).toContain('Lambda · Duration p99');
      expect(literalBody).toContain('Lambda · ConcurrentExecutions');
      expect(literalBody).toContain('DynamoDB · ConsumedCapacityUnits');
      expect(literalBody).toContain('DynamoDB · ThrottleEvents');
      expect(literalBody).toContain('DynamoDB · System / User Errors');
    });

    it('DashboardUrl Output이 정의된다', () => {
      template.hasOutput('DashboardUrl', {
        Description: 'CloudWatch Dashboard URL',
      });
    });
  });

  describe('Amplify', () => {
    it('Amplify App이 존재한다', () => {
      template.resourceCountIs('AWS::Amplify::App', 1);
    });

    it('Amplify Branch가 master로 설정된다', () => {
      template.hasResourceProperties('AWS::Amplify::Branch', {
        BranchName: 'master',
        Framework: 'React',
        Stage: 'PRODUCTION',
        EnableAutoBuild: false,
      });
    });

    it('SPA 라우팅 폴백 규칙이 설정된다', () => {
      template.hasResourceProperties('AWS::Amplify::App', {
        Platform: 'WEB',
        CustomRules: Match.arrayWith([
          Match.objectLike({
            Target: '/index.html',
            Status: '200',
          }),
        ]),
      });
    });
  });
});

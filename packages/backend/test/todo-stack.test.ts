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
});

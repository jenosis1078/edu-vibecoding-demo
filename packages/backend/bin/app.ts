#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TodoStack } from '../lib/todo-stack';

const app = new cdk.App();
new TodoStack(app, 'TodoStack', {
  env: {
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-2',
  },
});

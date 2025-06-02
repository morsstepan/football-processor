import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import { FootballProcessorStack } from '../lib/football-processor-stack';

test('Creates required resources', () => {
  const app = new cdk.App();
  const stack = new FootballProcessorStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  // Lambda functions
  template.resourceCountIs('AWS::Lambda::Function', 3);

  // DynamoDB Table
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' }
    ]
  });

  // API Gateway
  template.hasResourceProperties('AWS::ApiGateway::RestApi', {
    Name: 'MatchApi'
  });
});

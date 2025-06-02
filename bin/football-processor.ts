import * as cdk from 'aws-cdk-lib';
import { FootballProcessorStack } from '../lib/football-processor-stack';

const app = new cdk.App();

// Add LocalStack context
if (process.env.LOCALSTACK_ENABLED) {
  app.node.setContext('localstack:enabled', true);
  app.node.setContext('localstack:endpoint', process.env.AWS_ENDPOINT_URL || 'http://localhost:4566');
}

new FootballProcessorStack(app, 'FootballProcessorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
});

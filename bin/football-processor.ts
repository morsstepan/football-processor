import * as cdk from 'aws-cdk-lib';
import { FootballProcessorStack } from '../lib/football-processor-stack';

const app = new cdk.App();

// For localstack testing
app.node.setContext('@aws-cdk/aws-s3:useVirtualAddressing', false);
app.node.setContext('aws-cdk:assetPathStyle', true);
app.node.setContext('aws-cdk:disable-proxy', true);

new FootballProcessorStack(app, 'FootballProcessorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '000000000000',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  }
});

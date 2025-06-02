import * as cdk from 'aws-cdk-lib';
import { FootballProcessorStack } from '../lib/football-processor-stack';

const app = new cdk.App();

// Explicitly configure asset publishing
process.env.CDK_DISABLE_ASSET_STAGING_CONTEXT = 'true';
process.env.CDK_ASSET_PUBLISHING_ENDPOINT = 'http://localhost:4566';

// Configure context for LocalStack
app.node.setContext('@aws-cdk/aws-s3:useVirtualAddressing', false);
app.node.setContext('aws-cdk:disable-proxy', true);
app.node.setContext('aws-cdk:assetPathStyle', true);

new FootballProcessorStack(app, 'FootballProcessorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});

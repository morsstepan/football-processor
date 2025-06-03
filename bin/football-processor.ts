#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { MinimalStack } from '../lib/minimal-stack';

const app = new cdk.App();

// Force local settings
app.node.setContext('@aws-cdk/aws-s3:useVirtualAddressing', false);
app.node.setContext('aws-cdk:disable-proxy', true);
app.node.setContext('aws-cdk:assetPathStyle', true);

new MinimalStack(app, 'MinimalStack', {
  env: {
    account: '000000000000',
    region: 'us-east-1'
  }
});

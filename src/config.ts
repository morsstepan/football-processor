export const isLocal = process.env.LOCALSTACK_ENABLED === 'true';

export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  ...(isLocal && {
    endpoint: process.env.AWS_ENDPOINT_URL || 'http://localstack:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    },
    // Force path-style S3 access
    s3ForcePathStyle: true,
    // Disable SSL for LocalStack
    sslEnabled: false
  })
};

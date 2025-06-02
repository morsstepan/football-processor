  // config.ts
  export const isLocal = process.env.LOCALSTACK_ENDPOINT !== undefined;

  export const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    ...(isLocal && {
      endpoint: process.env.LOCALSTACK_ENDPOINT,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test'
      }
    })
  };

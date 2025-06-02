import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { EventBridgeEvent } from 'aws-lambda';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(process.env.LOCALSTACK_ENDPOINT && {
    endpoint: process.env.LOCALSTACK_ENDPOINT
  })
});

export const handler = async (event: EventBridgeEvent<'MatchEvent', any>): Promise<void> => {
  try {
    const item = { ...event.detail };

    // Add season calculation
    const timestamp = new Date(item.timestamp);
    const year = timestamp.getFullYear();
    const season = timestamp.getMonth() >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    // Create optimized keys
    item.PK = `MATCH#${item.match_id}`;
    item.SK = `EVENT#${item.timestamp}`;
    item.GSI1PK = `EVENT_TYPE#${item.event_type}`;
    item.GSI1SK = `MATCH#${item.match_id}`;
    item.season = season;

    // Store in DynamoDB
    await client.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: marshall(item),
    }));
  } catch (error) {
    console.error('Processing error:', error);
  }
};

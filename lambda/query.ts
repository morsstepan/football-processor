import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { awsConfig } from '../src/config';

const client = new DynamoDBClient(awsConfig);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const matchId = event.pathParameters?.matchId;
    if (!matchId) return { statusCode: 400, body: 'Missing matchId' };

    // Determine event type
    const path = event.path.split('/');
    const eventType = path[path.length - 1].toUpperCase();

    // Query DynamoDB
    const response = await client.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      IndexName: 'EventTypeIndex',
      KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': { S: `EVENT_TYPE#${eventType}` },
        ':sk': { S: `MATCH#${matchId}` }
      },
      Select: 'COUNT',
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ count: response.Count || 0 })
    };
  } catch (error) {
    console.error('Query error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};

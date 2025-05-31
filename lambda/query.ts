import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});

const EVENT_TYPE_MAP: Record<string, string> = {
  goals: 'goal',
  passes: 'pass'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const matchId = event.pathParameters?.match_id;
  const endpoint = event.resource.split('/').pop() || '';

  if (!matchId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing match_id parameter' })
    };
  }

  const eventType = EVENT_TYPE_MAP[endpoint];
  if (!eventType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid endpoint' })
    };
  }

  try {
    const response = await client.send(new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: 'match_id = :match_id AND begins_with(event_id, :event_prefix)',
      ExpressionAttributeValues: {
        ':match_id': { S: matchId },
        ':event_prefix': { S: `${eventType}#` }
      },
      Select: 'COUNT'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        match_id: matchId,
        event_type: endpoint,
        count: response.Count || 0
      })
    };
  } catch (error) {
    console.error('DynamoDB query error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

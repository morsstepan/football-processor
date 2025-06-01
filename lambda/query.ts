import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createDataRepository } from '../src/service-factory';

const ENDPOINT_MAP: Record<string, string> = {
  goals: 'goal',
  passes: 'pass'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const matchId = event.pathParameters?.match_id;
  if (!matchId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing match_id parameter' })
    };
  }

  const endpoint = event.resource.split('/').pop() || '';
  const eventType = ENDPOINT_MAP[endpoint];

  if (!eventType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid endpoint' })
    };
  }

  try {
    // Create repository
    const repository = createDataRepository({
      tableName: process.env.TABLE_NAME
    });

    // Get count
    const count = await repository.getEventCount(matchId, eventType);

    return {
      statusCode: 200,
      body: JSON.stringify({
        match_id: matchId,
        event_type: endpoint,
        count
      })
    };
  } catch (error) {
    console.error('Query error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

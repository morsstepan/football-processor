import { PutEventsCommand, EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new EventBridgeClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing request body' }),
    };
  }

  let payload: any;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON format' }),
    };
  }

  const requiredFields = ['match_id', 'event_type', 'team', 'player', 'timestamp'];
  const missingFields = requiredFields.filter(field => !(field in payload));

  if (missingFields.length > 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing required fields',
        missing: missingFields
      }),
    };
  }

  try {
    // Publish to EventBridge
    await client.send(new PutEventsCommand({
      Entries: [{
        Source: 'football.ingest',
        DetailType: 'MatchEvent',
        Detail: JSON.stringify(payload),
        EventBusName: process.env.EVENT_BUS_NAME,
      }]
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event ingested successfully' }),
    };
  } catch (error) {
    console.error('Error publishing to EventBridge:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

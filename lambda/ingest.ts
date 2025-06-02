import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { awsConfig } from '../src/config';

const client = new EventBridgeClient(awsConfig);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Validation
    const requiredFields = ['match_id', 'event_type', 'team', 'player', 'timestamp'];
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Missing fields: ${missing.join(', ')}` })
      };
    }

    // Publish to EventBridge
    const command = new PutEventsCommand({
      Entries: [{
        EventBusName: process.env.EVENT_BUS_NAME,
        Source: 'football.ingest',
        DetailType: 'MatchEvent',
        Detail: JSON.stringify(body),
      }]
    });

    await client.send(command);
    return { statusCode: 200, body: JSON.stringify({ message: 'Event ingested' }) };
  } catch (error) {
    console.error('Ingest error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal server error' }) };
  }
};

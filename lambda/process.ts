import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { EventBridgeEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});

interface MatchEvent {
  match_id: string;
  event_type: string;
  team: string;
  player: string;
  timestamp: string;
}

const calculateSeason = (timestamp: string): string => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // January is 0

  // Football season: August to May (August = 8)
  return month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const handler = async (event: EventBridgeEvent<'MatchEvent', MatchEvent>): Promise<void> => {
  try {
    const detail = event.detail;

    // Add season and unique ID
    const enrichedEvent = {
      ...detail,
      event_id: uuidv4(),
      season: calculateSeason(detail.timestamp)
    };

    // Store in DynamoDB
    await client.send(new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        match_id: { S: enrichedEvent.match_id },
        event_id: { S: enrichedEvent.event_id },
        event_type: { S: enrichedEvent.event_type },
        team: { S: enrichedEvent.team },
        player: { S: enrichedEvent.player },
        timestamp: { S: enrichedEvent.timestamp },
        season: { S: enrichedEvent.season }
      }
    }));

    console.log(`Event stored: ${enrichedEvent.event_id}`);
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};

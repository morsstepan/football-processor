import { EventBridgeEvent } from 'aws-lambda';
import { createDataRepository } from '../src/service-factory';
import { v4 as uuidv4 } from 'uuid';
import { calculateSeason } from '../src/season';

export const handler = async (event: EventBridgeEvent<'MatchEvent', any>): Promise<void> => {
  try {
    const detail = event.detail;

    // Create repository
    const repository = createDataRepository({
      tableName: process.env.TABLE_NAME
    });

    // Save enriched event
    await repository.saveEvent({
      ...detail,
      event_id: `${detail.event_type}#${uuidv4()}`,
      season: calculateSeason(detail.timestamp)
    });
  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
};

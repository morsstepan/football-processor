import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { DynamoDBClient, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { IEventPublisher, IDataRepository } from './interfaces';

export class AWSEventPublisher implements IEventPublisher {
  constructor(
    private readonly eventBusName: string,
    private readonly client = new EventBridgeClient({})
  ) {}

  async publishEvent(detail: object): Promise<void> {
    await this.client.send(new PutEventsCommand({
      Entries: [{
        Source: 'football.ingest',
        DetailType: 'MatchEvent',
        Detail: JSON.stringify(detail),
        EventBusName: this.eventBusName
      }]
    }));
  }
}

export class DynamoDBRepository implements IDataRepository {
  constructor(
    private readonly tableName: string,
    private readonly client = new DynamoDBClient({})
  ) {}

  async saveEvent(event: any): Promise<void> {
    await this.client.send(new PutItemCommand({
      TableName: this.tableName,
      Item: marshall(event, { removeUndefinedValues: true })
    }));
  }

  async getEventCount(matchId: string, eventType: string): Promise<number> {
    const response = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'match_id = :match_id AND begins_with(event_id, :event_prefix)',
      ExpressionAttributeValues: marshall({
        ':match_id': matchId,
        ':event_prefix': `${eventType}#`
      }),
      Select: 'COUNT'
    }));

    return response.Count || 0;
  }
}

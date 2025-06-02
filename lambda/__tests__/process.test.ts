import { handler } from '../process';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { EventBridgeEvent } from 'aws-lambda';

const ddbMock = mockClient(DynamoDBClient);

beforeEach(() => {
  ddbMock.reset();
  process.env.TABLE_NAME = 'test-table';
});

test('processes event and stores in DynamoDB', async () => {
  ddbMock.on(PutItemCommand).resolves({});

  const event = {
    detail: {
      match_id: '1',
      event_type: 'goal',
      team: 'TeamA',
      player: 'Player1',
      timestamp: '2023-10-15T14:30:00Z'
    }
  } as EventBridgeEvent<'MatchEvent', any>;

  await handler(event);

  expect(ddbMock.calls()).toHaveLength(1);
  const putCommand = ddbMock.commandCalls(PutItemCommand)[0].args[0].input;
  expect(putCommand.Item!.PK.S).toBe('MATCH#1');
  expect(putCommand.Item!.season.S).toBe('2023-2024');
});

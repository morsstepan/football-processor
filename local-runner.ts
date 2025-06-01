import { handler as ingestHandler } from './lambda/ingest';
import { handler as processHandler } from './lambda/process';
import { handler as queryHandler } from './lambda/query';
import { LocalEventPublisher, LocalRepository } from './src/local-services';
import { createEventPublisher, createDataRepository, ServiceContext } from './src/service-factory';

async function runLocalTest() {
  const localRepository = new LocalRepository();

  const localEventPublisher = new LocalEventPublisher(async (event) => {
    console.log('\n--- Simulating EventBridge Trigger ---');
    console.log('Processing event:', event);

    await processHandler({
      id: 'local-event-id',
      source: 'football.ingest',
      'detail-type': 'MatchEvent',
      detail: event
    } as any);
  });

  const originalCreateEventPublisher = createEventPublisher;
  const originalCreateDataRepository = createDataRepository;

  (createEventPublisher as any) = (context: ServiceContext) => localEventPublisher;
  (createDataRepository as any) = (context: ServiceContext) => localRepository;

  try {
    // API Gateway event for ingestion
    console.log('\n--- Sending Ingest Request ---');
    const ingestEvent = {
      body: JSON.stringify({
        match_id: 'local-match',
        event_type: 'goal',
        team: 'Local Team',
        player: 'Player 1',
        timestamp: '2023-10-15T14:30:00Z'
      })
    } as any;

    const ingestResponse = await ingestHandler(ingestEvent);
    console.log('Ingest Response:', ingestResponse);

    // API Gateway event for query
    console.log('\n--- Sending Query Request ---');
    const queryEvent = {
      pathParameters: { match_id: 'local-match' },
      resource: '/matches/{match_id}/goals'
    } as any;

    const queryResponse = await queryHandler(queryEvent);
    console.log('Query Response:', queryResponse);

    // Verify data in local repository
    console.log('\n--- Local Repository Contents ---');
    console.log('Events:', localRepository['events']); // Access internal storage for demo

  } catch (error) {
    console.error('Local test failed:', error);
  } finally {
    (createEventPublisher as any) = originalCreateEventPublisher;
    (createDataRepository as any) = originalCreateDataRepository;
  }
}

if (require.main === module) {
  runLocalTest();
}

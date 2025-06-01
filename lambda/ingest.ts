import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createEventPublisher } from '../src/service-factory';
import { validatePayload, validateEventStructure } from '../src/validation';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const payload = validatePayload(event);
    validateEventStructure(payload);

    const publisher = createEventPublisher({
      eventBusName: process.env.EVENT_BUS_NAME
    });

    await publisher.publishEvent(payload);

    return {
      statusCode: 200,
      body: JSON.stringify({message: 'Event ingested successfully'})
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return {
        statusCode: 400,
        body: JSON.stringify({error: error.message, details: error.stack})
      };
    }

    console.error('Ingestion error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Internal server error'})
    };
  }
};

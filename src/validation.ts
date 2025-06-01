import { APIGatewayProxyEvent } from 'aws-lambda';

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validatePayload(event: APIGatewayProxyEvent): any {
  if (!event.body) {
    throw new ValidationError('Missing request body');
  }

  try {
    return JSON.parse(event.body);
  } catch (e) {
    throw new ValidationError('Invalid JSON format');
  }
}

export function validateEventStructure(payload: any): void {
  const requiredFields = ['match_id', 'event_type', 'team', 'player', 'timestamp'];
  const missingFields = requiredFields.filter(field => !(field in payload));

  if (missingFields.length > 0) {
    throw new ValidationError('Missing required fields', { missingFields });
  }

  if (typeof payload.match_id !== 'string') {
    throw new ValidationError('match_id must be a string');
  }

  if (typeof payload.timestamp !== 'string' || isNaN(Date.parse(payload.timestamp))) {
    throw new ValidationError('Invalid timestamp format');
  }
}

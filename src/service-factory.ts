import { IEventPublisher, IDataRepository } from './interfaces';
import { AWSEventPublisher, DynamoDBRepository } from './aws-services';
import { LocalEventPublisher, LocalRepository } from './local-services';

export interface ServiceContext {
  eventBusName?: string;
  tableName?: string;
  processCallback?: (event: any) => Promise<void>;
}

export function createEventPublisher(context: ServiceContext): IEventPublisher {
  if (context.eventBusName) {
    return new AWSEventPublisher(context.eventBusName);
  }
  return new LocalEventPublisher(context.processCallback);
}

export function createDataRepository(context: ServiceContext): IDataRepository {
  if (context.tableName) {
    return new DynamoDBRepository(context.tableName);
  }
  return new LocalRepository();
}

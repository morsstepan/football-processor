export interface IEventPublisher {
  publishEvent(detail: object): Promise<void>;
}

export interface IDataRepository {
  saveEvent(event: object): Promise<void>;
  getEventCount(matchId: string, eventType: string): Promise<number>;
}

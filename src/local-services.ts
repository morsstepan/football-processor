import { IEventPublisher, IDataRepository } from './interfaces';

export class LocalEventPublisher implements IEventPublisher {
  constructor(private readonly callback?: (event: any) => Promise<void>) {}

  async publishEvent(detail: object): Promise<void> {
    console.log('[LocalEventPublisher] Publishing event:', detail);
    if (this.callback) {
      await this.callback(detail);
    }
  }
}

export class LocalRepository implements IDataRepository {
  private events: any[] = [];

  async saveEvent(event: any): Promise<void> {
    console.log('[LocalRepository] Saving event:', event);
    this.events.push(event);
  }

  async getEventCount(matchId: string, eventType: string): Promise<number> {
    return this.events.filter(
      e => e.match_id === matchId && e.event_type === eventType
    ).length;
  }
}

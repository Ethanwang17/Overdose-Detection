import type { AlertRecord } from '../../../types';
import { MOCK_ALERTS } from '../../../constants';

export interface IAlertsRepository {
  getAlerts(): Promise<AlertRecord[]>;
  getAlertById(id: string): Promise<AlertRecord | null>;
}

export class MockAlertsRepository implements IAlertsRepository {
  async getAlerts(): Promise<AlertRecord[]> {
    return [...MOCK_ALERTS] as AlertRecord[];
  }
  async getAlertById(id: string): Promise<AlertRecord | null> {
    return (MOCK_ALERTS.find(a => a.id === id) as AlertRecord) ?? null;
  }
}

export const alertsRepository: IAlertsRepository = new MockAlertsRepository();

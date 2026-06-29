import type { AlertRecord } from '../../types';

export interface IAlertRepository {
  getAlerts(userId: string): Promise<AlertRecord[]>;
  createAlert(alert: Omit<AlertRecord, 'id' | 'createdAt'>): Promise<AlertRecord>;
  resolveAlert(alertId: string): Promise<void>;
}

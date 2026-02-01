import { describe, it, expect } from 'vitest';
import { getMaintenanceStatus } from './maintenanceStatus';

describe('getMaintenanceStatus', () => {
  // Helper to create date N days ago
  const daysAgo = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  describe('Active status', () => {
    it('should return Active status for date 15 days ago', () => {
      const result = getMaintenanceStatus(daysAgo(15));
      expect(result.status).toBe('Active');
      expect(result.color).toBe('#22c55e');
    });

    it('should return Active status for date 1 day ago', () => {
      const result = getMaintenanceStatus(daysAgo(1));
      expect(result.status).toBe('Active');
      expect(result.color).toBe('#22c55e');
    });

    it('should return Active status for date 29 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(29));
      expect(result.status).toBe('Active');
      expect(result.color).toBe('#22c55e');
    });
  });

  describe('Maintained status', () => {
    it('should return Maintained status for date 60 days ago', () => {
      const result = getMaintenanceStatus(daysAgo(60));
      expect(result.status).toBe('Maintained');
      expect(result.color).toBe('#eab308');
    });

    it('should return Maintained status for date 30 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(30));
      expect(result.status).toBe('Maintained');
      expect(result.color).toBe('#eab308');
    });

    it('should return Maintained status for date 89 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(89));
      expect(result.status).toBe('Maintained');
      expect(result.color).toBe('#eab308');
    });
  });

  describe('Stale status', () => {
    it('should return Stale status for date 120 days ago', () => {
      const result = getMaintenanceStatus(daysAgo(120));
      expect(result.status).toBe('Stale');
      expect(result.color).toBe('#f97316');
    });

    it('should return Stale status for date 90 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(90));
      expect(result.status).toBe('Stale');
      expect(result.color).toBe('#f97316');
    });

    it('should return Stale status for date 179 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(179));
      expect(result.status).toBe('Stale');
      expect(result.color).toBe('#f97316');
    });
  });

  describe('Inactive status', () => {
    it('should return Inactive status for date 200 days ago', () => {
      const result = getMaintenanceStatus(daysAgo(200));
      expect(result.status).toBe('Inactive');
      expect(result.color).toBe('#ef4444');
    });

    it('should return Inactive status for date 180 days ago (boundary)', () => {
      const result = getMaintenanceStatus(daysAgo(180));
      expect(result.status).toBe('Inactive');
      expect(result.color).toBe('#ef4444');
    });

    it('should return Inactive status for date 365 days ago', () => {
      const result = getMaintenanceStatus(daysAgo(365));
      expect(result.status).toBe('Inactive');
      expect(result.color).toBe('#ef4444');
    });
  });

  describe('Unknown status', () => {
    it('should return Unknown status for null date', () => {
      const result = getMaintenanceStatus(null);
      expect(result.status).toBe('Unknown');
      expect(result.color).toBe('#6b7280');
    });

    it('should return Unknown status for undefined date', () => {
      const result = getMaintenanceStatus(undefined as any);
      expect(result.status).toBe('Unknown');
      expect(result.color).toBe('#6b7280');
    });

    it('should return Unknown status for invalid date string', () => {
      const result = getMaintenanceStatus('invalid-date');
      expect(result.status).toBe('Unknown');
      expect(result.color).toBe('#6b7280');
    });
  });

  describe('String date input', () => {
    it('should handle ISO string date correctly', () => {
      const date = daysAgo(15);
      const result = getMaintenanceStatus(date.toISOString());
      expect(result.status).toBe('Active');
      expect(result.color).toBe('#22c55e');
    });

    it('should handle string date for Maintained status', () => {
      const date = daysAgo(60);
      const result = getMaintenanceStatus(date.toISOString());
      expect(result.status).toBe('Maintained');
      expect(result.color).toBe('#eab308');
    });
  });
});

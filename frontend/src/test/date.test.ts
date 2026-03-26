import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from '@/utils/date';

describe('Date utilities', () => {
  it('should format dates correctly', () => {
    const date = '2024-03-15T10:30:00Z';
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Mar \d+, 2024/);
  });

  it('should format date-time correctly', () => {
    const date = '2024-03-15T10:30:00Z';
    const formatted = formatDateTime(date);
    expect(formatted).toMatch(/Mar \d+, 2024 \d+:\d+ (AM|PM)/);
  });
});

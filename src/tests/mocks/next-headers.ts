// Mock for 'next/headers' module
import { vi } from 'vitest';

export const headers = vi.fn(() => ({
  get: vi.fn((name: string) => {
    const mockHeaders: Record<string, string> = {
      'user-agent': 'test-agent',
      accept: 'application/json',
      host: 'localhost:3000',
    };
    return mockHeaders[name.toLowerCase()];
  }),
  has: vi.fn((name: string) => true),
  keys: vi.fn(() => ['user-agent', 'accept', 'host']),
  values: vi.fn(() => ['test-agent', 'application/json', 'localhost:3000']),
  entries: vi.fn(() => [
    ['user-agent', 'test-agent'],
    ['accept', 'application/json'],
    ['host', 'localhost:3000'],
  ]),
  forEach: vi.fn(),
}));

export const cookies = vi.fn(() => ({
  get: vi.fn((name: string) => ({ name, value: 'mock-value' })),
  getAll: vi.fn(() => []),
  has: vi.fn(() => false),
  set: vi.fn(),
  delete: vi.fn(),
}));

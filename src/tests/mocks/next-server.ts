// Mock for 'next/server' module
import { vi } from 'vitest';

export const NextRequest = vi.fn();
export const NextResponse = {
  json: vi.fn((data: any) => ({
    status: 200,
    json: () => Promise.resolve(data),
  })),
  redirect: vi.fn((url: string) => ({
    status: 302,
    headers: { Location: url },
  })),
  next: vi.fn(() => ({})),
};

export const userAgent = vi.fn(() => ({
  isBot: false,
  browser: { name: 'chrome', version: '100' },
  device: { type: 'desktop' },
  engine: { name: 'blink' },
  os: { name: 'windows' },
  cpu: { architecture: 'amd64' },
}));

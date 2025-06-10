import '@testing-library/jest-dom';
import 'vitest-canvas-mock';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { server } from '@/mocks/server';
import React from 'react';

// Mock Next.js server modules before any imports
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data: any) => ({
      status: 200,
      json: () => Promise.resolve(data),
    })),
    redirect: vi.fn((url: string) => ({
      status: 302,
      headers: { Location: url },
    })),
    next: vi.fn(() => ({})),
  },
  userAgent: vi.fn(() => ({
    isBot: false,
    browser: { name: 'chrome', version: '100' },
    device: { type: 'desktop' },
    engine: { name: 'blink' },
    os: { name: 'windows' },
    cpu: { architecture: 'amd64' },
  })),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((name: string) => {
      const mockHeaders: Record<string, string> = {
        'user-agent': 'test-agent',
        accept: 'application/json',
        host: 'localhost:3000',
      };
      return mockHeaders[name.toLowerCase()];
    }),
    has: vi.fn((name: string) => true),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => ({ name, value: 'mock-value' })),
    getAll: vi.fn(() => []),
    has: vi.fn(() => false),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn((path: string) => {
    console.log(`Mock revalidatePath called with: ${path}`);
  }),
  revalidateTag: vi.fn((tag: string) => {
    console.log(`Mock revalidateTag called with: ${tag}`);
  }),
  unstable_cache: vi.fn((fn: (...args: any[]) => any) => fn),
  unstable_noStore: vi.fn(),
}));

// Add DOM method mocks for Radix UI components
Object.defineProperty(window.HTMLElement.prototype, 'hasPointerCapture', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window.HTMLElement.prototype, 'releasePointerCapture', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window.HTMLElement.prototype, 'setPointerCapture', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Mock Next.js server modules that are causing import issues
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn(data => ({ json: () => Promise.resolve(data) })),
    redirect: vi.fn(),
    next: vi.fn(),
  },
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test',
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => {
    return React.createElement('a', props, children);
  },
}));

// Mock NextAuth
vi.mock('@/auth', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    })
  ),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    application: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    resume: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    resumeAnalysis: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock OpenAI
vi.mock('@/lib/ai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(() =>
          Promise.resolve({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    summary: 'Mock AI analysis',
                    score: 85,
                    suggestions: ['Mock suggestion 1', 'Mock suggestion 2'],
                  }),
                },
              },
            ],
          })
        ),
      },
    },
  },
}));

// Mock UploadThing
vi.mock('@/lib/uploadthing', () => ({
  uploadFiles: vi.fn(() =>
    Promise.resolve([
      {
        name: 'test-resume.pdf',
        size: 1024,
        key: 'test-key',
        url: 'https://example.com/test-resume.pdf',
      },
    ])
  ),
}));

// Mock environment variables for tests
Object.defineProperty(window, 'env', {
  value: {
    NODE_ENV: 'test',
  },
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

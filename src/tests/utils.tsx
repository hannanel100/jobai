import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Create a custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data factories
export const createMockUser = (
  overrides?: Partial<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  }>
) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockApplication = (
  overrides?: Partial<{
    id: string;
    userId: string;
    companyName: string;
    companyWebsite: string;
    positionTitle: string;
    jobDescription: string;
    status: string;
    source: string;
    notes: string;
    resumeId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
) => ({
  id: 'test-app-id',
  userId: 'test-user-id',
  companyName: 'Test Company',
  companyWebsite: 'https://testcompany.com',
  positionTitle: 'Software Engineer',
  jobDescription: 'Test job description',
  applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  salaryMin: 80000,
  salaryMax: 120000,
  salaryCurrency: 'USD',
  status: 'APPLIED',
  notes: 'Test notes',
  followUpDate: null,
  source: 'COMPANY_WEBSITE',
  resumeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockResume = (
  overrides?: Partial<{
    id: string;
    userId: string;
    title: string;
    filename: string;
    url: string;
    size: number;
    type: string;
    content: {
      text: string;
      metadata?: Record<string, unknown>;
      wordCount: number;
      extractedAt: string;
    };
    isBaseTemplate: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>
) => ({
  id: 'test-resume-id',
  userId: 'test-user-id',
  title: 'Test Resume',
  filename: 'test-resume.pdf',
  url: 'https://example.com/test-resume.pdf',
  size: 1024,
  type: 'application/pdf',
  content: {
    text: 'Test resume content',
    metadata: { pages: 1, wordCount: 100 },
    wordCount: 100,
    extractedAt: new Date().toISOString(),
  },
  isBaseTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockResumeAnalysis = (
  overrides?: Partial<{
    id: string;
    resumeId: string;
    userId: string;
    type: string;
    analysis: {
      summary: string;
      score: number;
      suggestions: string[];
    };
    createdAt: Date;
    updatedAt: Date;
  }>
) => ({
  id: 'test-analysis-id',
  resumeId: 'test-resume-id',
  userId: 'test-user-id',
  type: 'COMPREHENSIVE',
  analysis: {
    summary: 'Test AI analysis',
    score: 85,
    suggestions: ['Test suggestion 1', 'Test suggestion 2'],
  },
  score: 85,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Test helper functions
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockServerAction = <T,>(result: T) => {
  return vi.fn().mockResolvedValue({ success: true, data: result });
};

export const mockServerActionError = (error: string) => {
  return vi.fn().mockResolvedValue({ success: false, error });
};

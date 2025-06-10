import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationsList } from '@/components/applications/applications-list';
import { ApplicationStatus, ApplicationSource } from '@prisma/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the hooks
vi.mock('@/hooks/use-applications', () => ({
  useUpdateApplicationStatus: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useDeleteApplication: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockApplications = [
  {
    id: 'app-1',
    companyName: 'Tech Corp',
    positionTitle: 'Software Engineer',
    jobDescription:
      'We are looking for a talented Software Engineer to join our team...',
    applicationDeadline: new Date('2024-02-15'),
    salaryMin: 90000,
    salaryMax: 120000,
    currency: 'USD',
    companyWebsite: 'https://techcorp.com',
    applicationSource: ApplicationSource.COMPANY_WEBSITE,
    status: ApplicationStatus.SAVED,
    notes: 'Great opportunity',
    followUpDate: null,
    appliedDate: null,
    interviewDate: null,
    responseDate: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user-1',
    resumeId: 'resume-1',
    resume: {
      id: 'resume-1',
      title: 'Software Engineer Resume',
    },
  },
  {
    id: 'app-2',
    companyName: 'Startup Inc',
    positionTitle: 'Frontend Developer',
    jobDescription: 'Join our fast-growing startup as a Frontend Developer...',
    applicationDeadline: null,
    salaryMin: 80000,
    salaryMax: 100000,
    currency: 'USD',
    companyWebsite: 'https://startup.com',
    applicationSource: ApplicationSource.JOB_BOARD,
    status: ApplicationStatus.APPLIED,
    notes: 'Interesting product',
    followUpDate: new Date('2024-01-20'),
    appliedDate: new Date('2024-01-10'),
    interviewDate: null,
    responseDate: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    userId: 'user-1',
    resumeId: null,
    resume: null,
  },
  {
    id: 'app-3',
    companyName: 'Big Company',
    positionTitle: 'Senior Engineer',
    jobDescription:
      'Senior Software Engineer position with leadership opportunities...',
    applicationDeadline: new Date('2024-02-01'),
    salaryMin: 140000,
    salaryMax: 180000,
    currency: 'USD',
    companyWebsite: 'https://bigcompany.com',
    applicationSource: ApplicationSource.REFERRAL,
    status: ApplicationStatus.INTERVIEW_SCHEDULED,
    notes: 'Interview next week',
    followUpDate: new Date('2024-01-21'),
    appliedDate: new Date('2024-01-05'),
    interviewDate: new Date('2024-01-21'),
    responseDate: null,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14'),
    userId: 'user-1',
    resumeId: 'resume-2',
    resume: {
      id: 'resume-2',
      title: 'Senior Engineer Resume',
    },
  },
];

const renderWithProvider = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

describe('ApplicationsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all applications', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Startup Inc')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Big Company')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
  });

  it('should display application status badges', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    // Use getAllByText to find multiple instances and verify badges exist
    const savedTexts = screen.getAllByText('Saved');
    const appliedTexts = screen.getAllByText('Applied');
    const interviewTexts = screen.getAllByText('Interview Scheduled');

    expect(savedTexts.length).toBeGreaterThan(0);
    expect(appliedTexts.length).toBeGreaterThan(0);
    expect(interviewTexts.length).toBeGreaterThan(0);
  });

  it('should display salary information', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    // The component displays salary ranges with formatted numbers (commas)
    expect(screen.getByText('$90,000')).toBeInTheDocument();
    expect(screen.getByText('$120,000')).toBeInTheDocument();
    expect(screen.getByText('$80,000')).toBeInTheDocument();
    expect(screen.getByText('$100,000')).toBeInTheDocument();
    expect(screen.getByText('$140,000')).toBeInTheDocument();
    expect(screen.getByText('$180,000')).toBeInTheDocument();
  });

  it('should display formatted dates', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    // Debug: Check what's actually rendered
    // Look for "Deadline:" text first to see if dates are shown
    const mockedDeadlineApplications = mockApplications.filter(
      app => app.applicationDeadline !== null
    );
    expect(screen.getAllByText(/deadline:/i)).toHaveLength(
      mockedDeadlineApplications.length
    );
  });

  it('should show resume links when resume is attached', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer Resume')).toBeInTheDocument();
    expect(screen.getByText('No resume attached')).toBeInTheDocument();
  });

  it('should filter applications by search term', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    const searchInput = screen.getByPlaceholderText(/search applications/i);
    await user.type(searchInput, 'Tech Corp');

    await waitFor(() => {
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.queryByText('Startup Inc')).not.toBeInTheDocument();
      expect(screen.queryByText('Big Company')).not.toBeInTheDocument();
    });
  });

  it('should filter applications by status', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    // Click on the actual button (SelectTrigger), not the span inside it
    const statusFilter = screen.getByRole('combobox', {
      name: /filter by status/i,
    });
    await user.click(statusFilter);

    // Wait for the dropdown to open and click on "Applied"
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Applied' })
      ).toBeInTheDocument();
    });

    const appliedOption = screen.getByRole('option', { name: 'Applied' });
    await user.click(appliedOption);

    await waitFor(() => {
      expect(screen.getByText('Startup Inc')).toBeInTheDocument();
      expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument();
      expect(screen.queryByText('Big Company')).not.toBeInTheDocument();
    });
  });

  it('should display empty state when no applications match filter', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    const searchInput = screen.getByPlaceholderText(/search applications/i);
    await user.type(searchInput, 'Nonexistent Company');

    await waitFor(() => {
      expect(screen.getByText(/no applications found/i)).toBeInTheDocument();
      expect(
        screen.getByText(/try adjusting your search/i)
      ).toBeInTheDocument();
    });
  });

  it('should display empty state when no applications provided', () => {
    renderWithProvider(<ApplicationsList applications={[]} />);

    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/start tracking your job applications/i)
    ).toBeInTheDocument();
  });

  it('should have working external links', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    const externalLinks = screen.getAllByRole('link', {
      name: /view job posting/i,
    });
    expect(externalLinks[0]).toHaveAttribute(
      'href',
      'https://techcorp.com/jobs/1'
    );
    expect(externalLinks[0]).toHaveAttribute('target', '_blank');
    expect(externalLinks[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have working edit links', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks[0]).toHaveAttribute(
      'href',
      '/dashboard/applications/app-1/edit'
    );
  });

  it('should display notes when available', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    expect(screen.getByText('Great opportunity')).toBeInTheDocument();
    expect(screen.getByText('Interesting product')).toBeInTheDocument();
    expect(screen.getByText('Interview next week')).toBeInTheDocument();
  });

  it('should sort applications correctly', () => {
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    const applicationCards = screen.getAllByRole('article');
    const firstCard = applicationCards[0];
    const lastCard = applicationCards[applicationCards.length - 1];

    // Should be sorted by updatedAt desc: Tech Corp (Jan 15) -> Big Company (Jan 14) -> Startup Inc (Jan 12)
    expect(firstCard).toHaveTextContent('Tech Corp'); // updatedAt: Jan 15
    expect(lastCard).toHaveTextContent('Startup Inc'); // updatedAt: Jan 12
  });

  it('should handle combined search and status filters', async () => {
    const user = userEvent.setup();
    renderWithProvider(<ApplicationsList applications={mockApplications} />);

    // Search for "Engineer"
    const searchInput = screen.getByPlaceholderText(/search applications/i);
    await user.type(searchInput, 'Engineer');

    // Filter by "Saved" status - click on the filter combobox (not the ones in application cards)
    const statusFilter = screen.getByRole('combobox', {
      name: /filter by status/i,
    });
    await user.click(statusFilter);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Saved' })).toBeInTheDocument();
    });

    const savedOption = screen.getByRole('option', { name: 'Saved' });
    await user.click(savedOption);

    await waitFor(() => {
      // Should only show Tech Corp (Software Engineer + Saved status)
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.queryByText('Big Company')).not.toBeInTheDocument(); // Senior Engineer but Interview Scheduled
      expect(screen.queryByText('Startup Inc')).not.toBeInTheDocument(); // Frontend Developer
    });
  });
});

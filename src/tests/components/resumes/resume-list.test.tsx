import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/tests/utils';
import { ResumeList } from '@/components/resumes/resume-list';
import * as resumeActions from '@/actions/resumes';

// Mock the resume actions
vi.mock('@/actions/resumes', () => ({
  deleteResume: vi.fn(),
}));

// Mock Next.js navigation
const mockRouterRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRouterRefresh,
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(),
  writable: true,
});

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn(),
  writable: true,
});

const mockDeleteResume = vi.mocked(resumeActions.deleteResume);

const mockResumes = [
  {
    id: '1',
    title: 'Software Engineer Resume',
    fileName: 'resume.pdf',
    fileUrl: 'https://example.com/resume.pdf',
    fileSize: 204800, // 200KB
    fileType: 'application/pdf',
    isBase: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    _count: {
      applications: 3,
    },
    applications: [
      {
        id: 'app1',
        companyName: 'Tech Corp',
        positionTitle: 'Senior Developer',
        status: 'APPLIED',
        createdAt: new Date('2024-01-16T10:00:00Z'),
      },
    ],
  },
  {
    id: '2',
    title: 'Base Template Resume',
    fileName: 'base-template.docx',
    fileUrl: 'https://example.com/base-template.docx',
    fileSize: 153600, // 150KB
    fileType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    isBase: true,
    createdAt: new Date('2024-01-10T09:00:00Z'),
    updatedAt: new Date('2024-01-10T09:00:00Z'),
    _count: {
      applications: 0,
    },
    applications: [],
  },
];

describe('ResumeList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no resumes provided', () => {
    render(<ResumeList resumes={[]} />);

    expect(screen.getByText(/no resumes uploaded/i)).toBeInTheDocument();
    expect(
      screen.getByText(/upload your first resume to get started/i)
    ).toBeInTheDocument();
  });

  it('should render list of resumes with correct information', () => {
    render(<ResumeList resumes={mockResumes} />);

    // Check first resume
    expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('200.0 KB')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();

    // Check second resume
    expect(screen.getByText('Base Template Resume')).toBeInTheDocument();
    expect(screen.getByText('base-template.docx')).toBeInTheDocument();
    expect(screen.getByText('150.0 KB')).toBeInTheDocument();
    expect(screen.getByText('DOCX')).toBeInTheDocument();
  });

  it('should display base template badge for base resumes', () => {
    render(<ResumeList resumes={mockResumes} />);

    expect(screen.getByText('Base Template')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<ResumeList resumes={mockResumes} />);

    // Check for formatted dates (format: MMM DD, YYYY at HH:MM AM/PM)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Jan 10, 2024/)).toBeInTheDocument();
  });

  it('should render view details links for each resume', () => {
    render(<ResumeList resumes={mockResumes} />);

    const viewLinks = screen.getAllByText(/view details/i);
    expect(viewLinks).toHaveLength(2);

    expect(viewLinks[0].closest('a')).toHaveAttribute(
      'href',
      '/dashboard/resumes/1'
    );
    expect(viewLinks[1].closest('a')).toHaveAttribute(
      'href',
      '/dashboard/resumes/2'
    );
  });

  it('should render download buttons for resumes with file URLs', () => {
    render(<ResumeList resumes={mockResumes} />);

    const downloadButtons = screen.getAllByText(/download/i);
    expect(downloadButtons).toHaveLength(2);
  });

  it('should handle file download when download button clicked', () => {
    render(<ResumeList resumes={mockResumes} />);

    const downloadButtons = screen.getAllByText(/download/i);
    fireEvent.click(downloadButtons[0]);

    expect(window.open).toHaveBeenCalledWith(
      'https://example.com/resume.pdf',
      '_blank'
    );
  });

  it('should render delete buttons for all resumes', () => {
    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    expect(deleteButtons).toHaveLength(2);
  });

  it('should show confirmation dialog when delete button clicked', () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(false);

    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith(
      'Are you sure you want to delete this resume?'
    );
  });

  it('should not delete resume if user cancels confirmation', () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(false);

    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteResume).not.toHaveBeenCalled();
  });

  it('should delete resume successfully when confirmed', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    const mockOnResumeDeleted = vi.fn();
    mockConfirm.mockReturnValue(true);
    mockDeleteResume.mockResolvedValue({ success: true });

    render(
      <ResumeList resumes={mockResumes} onResumeDeleted={mockOnResumeDeleted} />
    );

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteResume).toHaveBeenCalledWith('1');

    await waitFor(() => {
      expect(mockOnResumeDeleted).toHaveBeenCalled();
      expect(mockRouterRefresh).toHaveBeenCalled();
    });
  });

  it('should handle delete error properly', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(true);
    mockDeleteResume.mockResolvedValue({
      success: false,
      error: 'Failed to delete',
    });

    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteResume).toHaveBeenCalledWith('1');
    });
  });

  it('should disable delete button during deletion', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(true);

    // Mock a slow delete operation
    mockDeleteResume.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    // Button should show "Deleting..." and be disabled
    await waitFor(() => {
      expect(screen.getByText(/deleting.../i)).toBeInTheDocument();
    });

    const deletingButton = screen.getByText(/deleting.../i).closest('button');
    expect(deletingButton).toBeDisabled();
  });

  it('should handle file size formatting correctly', () => {
    const resumesWithDifferentSizes = [
      {
        ...mockResumes[0],
        fileSize: 1024, // 1KB
      },
      {
        ...mockResumes[1],
        fileSize: 1048576, // 1MB
      },
    ];

    render(<ResumeList resumes={resumesWithDifferentSizes} />);

    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('should handle resumes without file size', () => {
    const resumeWithoutSize = [
      {
        ...mockResumes[0],
        fileSize: null,
      },
    ];

    render(<ResumeList resumes={resumeWithoutSize} />);

    expect(screen.getByText('Unknown size')).toBeInTheDocument();
  });

  it('should handle resumes without file name', () => {
    const resumeWithoutFileName = [
      {
        ...mockResumes[0],
        fileName: null,
      },
    ];

    render(<ResumeList resumes={resumeWithoutFileName} />);

    expect(screen.getByText('Unknown file')).toBeInTheDocument();
  });

  it('should not render download button for resumes without file URL', () => {
    const resumeWithoutFileUrl = [
      {
        ...mockResumes[0],
        fileUrl: null,
      },
    ];

    render(<ResumeList resumes={resumeWithoutFileUrl} />);

    // Should only have the view details button, not download
    expect(screen.getByText(/view details/i)).toBeInTheDocument();
    expect(screen.queryByText(/download/i)).not.toBeInTheDocument();
  });
  it('should handle exception during delete operation', async () => {
    const mockConfirm = vi.mocked(window.confirm);
    mockConfirm.mockReturnValue(true);
    mockDeleteResume.mockRejectedValue(new Error('Network error'));

    // Mock console.error to avoid test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ResumeList resumes={mockResumes} />);

    const deleteButtons = screen.getAllByText(/delete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteResume).toHaveBeenCalledWith('1');
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Delete error:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});

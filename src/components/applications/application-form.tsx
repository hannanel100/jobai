'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { applicationSchema, ApplicationFormData } from '@/schemas/application';
import { createApplication } from '@/actions/applications';
import { useResumes } from '@/hooks/use-resumes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApplicationSource } from '@prisma/client';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const applicationSourceOptions = [
  { value: ApplicationSource.LINKEDIN, label: 'LinkedIn' },
  { value: ApplicationSource.COMPANY_WEBSITE, label: 'Company Website' },
  { value: ApplicationSource.INDEED, label: 'Indeed' },
  { value: ApplicationSource.GLASSDOOR, label: 'Glassdoor' },
  { value: ApplicationSource.REFERRAL, label: 'Referral' },
  { value: ApplicationSource.JOB_BOARD, label: 'Job Board' },
  { value: ApplicationSource.NETWORKING_EVENT, label: 'Networking Event' },
  { value: ApplicationSource.OTHER, label: 'Other' },
];

export function ApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Use React Query hook for resumes
  const {
    data: resumes = [],
    isLoading: loadingResumes,
    error: resumesError,
  } = useResumes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      currency: 'USD',
    },
  });

  const applicationDeadline = watch('applicationDeadline');
  const followUpDate = watch('followUpDate');

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await createApplication(data);

      if (result.success) {
        router.push('/dashboard/applications');
        router.refresh();
      } else {
        setError(result.error || 'Failed to create application');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Job Application Details</CardTitle>
        <CardDescription>
          Enter the details for your job application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="e.g. Google, Microsoft"
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionTitle">Position Title *</Label>
              <Input
                id="positionTitle"
                {...register('positionTitle')}
                placeholder="e.g. Software Engineer, Product Manager"
              />
              {errors.positionTitle && (
                <p className="text-sm text-red-500">
                  {errors.positionTitle.message}
                </p>
              )}
            </div>
          </div>{' '}
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description *</Label>
            <Textarea
              id="jobDescription"
              {...register('jobDescription')}
              placeholder="Paste the job description here..."
              rows={6}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500">
                {errors.jobDescription.message}
              </p>
            )}
          </div>{' '}
          <div className="space-y-2">
            <Label htmlFor="resumeId">Resume to Use</Label>
            <Select
              onValueChange={value =>
                setValue('resumeId', value === 'none' ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingResumes
                      ? 'Loading resumes...'
                      : 'Select a resume (optional)'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No resume selected</SelectItem>
                {resumes.map(resume => (
                  <SelectItem key={resume.id} value={resume.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{resume.title}</span>
                      <span className="text-xs text-gray-500">
                        {resume.fileName} • Used in {resume._count.applications}{' '}
                        applications
                        {resume.isBase && ' • Base template'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {resumesError && (
              <p className="text-sm text-red-500">
                Failed to load resumes: {resumesError.message}
              </p>
            )}
            {resumes.length === 0 && !loadingResumes && !resumesError && (
              <p className="text-sm text-gray-500">
                No resumes available.{' '}
                <Link
                  href="/dashboard/resumes"
                  prefetch={true}
                  className="text-blue-600 cursor-pointer hover:underline"
                >
                  Upload a resume first
                </Link>
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                {...register('companyWebsite')}
                placeholder="https://company.com"
                type="url"
              />
              {errors.companyWebsite && (
                <p className="text-sm text-red-500">
                  {errors.companyWebsite.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="applicationSource">Application Source</Label>
              <Select
                onValueChange={value =>
                  setValue('applicationSource', value as ApplicationSource)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Where did you find this job?" />
                </SelectTrigger>
                <SelectContent>
                  {applicationSourceOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Min Salary</Label>
              <Input
                id="salaryMin"
                {...register('salaryMin', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? null : Number(v) || null),
                })}
                type="number"
                placeholder="50000"
                min="0"
              />
              {errors.salaryMin && (
                <p className="text-sm text-red-500">
                  {errors.salaryMin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salaryMax">Max Salary</Label>
              <Input
                id="salaryMax"
                {...register('salaryMax', {
                  valueAsNumber: true,
                  setValueAs: v => (v === '' ? null : Number(v) || null),
                })}
                type="number"
                placeholder="80000"
                min="0"
              />
              {errors.salaryMax && (
                <p className="text-sm text-red-500">
                  {errors.salaryMax.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                onValueChange={value =>
                  setValue(
                    'currency',
                    value as 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'ILS'
                  )
                }
                defaultValue="USD"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>{' '}
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                  <SelectItem value="ILS">ILS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {applicationDeadline
                      ? format(applicationDeadline, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={applicationDeadline || undefined}
                    onSelect={date => setValue('applicationDeadline', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {followUpDate ? format(followUpDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={followUpDate || undefined}
                    onSelect={date => setValue('followUpDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional notes about this application..."
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Creating...' : 'Create Application'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

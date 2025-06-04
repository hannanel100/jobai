'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumes, deleteResume } from '@/actions/resumes';
import { toast } from 'sonner';

export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const result = await getResumes();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch resumes');
      }
      return result.resumes;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteResume(id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete resume');
      }
      return result;
    },
    onSuccess: () => {
      // Invalidate and refetch resumes
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted successfully');
    },
    onError: error => {
      toast.error(error.message || 'Failed to delete resume');
    },
  });
}

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getApplications, getApplication, deleteApplication, updateApplicationStatus } from '@/actions/applications'
import { ApplicationStatus } from '@prisma/client'
import { toast } from 'sonner'

export function useApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const result = await getApplications()
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch applications')
      }
      return result.applications
    },
    staleTime: 3 * 60 * 1000, // 3 minutes for more frequent updates
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      const result = await getApplication(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch application')
      }
      return result.application
    },
    enabled: !!id, // Only run if id is provided
    staleTime: 5 * 60 * 1000,
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteApplication(id)
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete application')
      }
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch applications
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete application')
    },
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const result = await updateApplicationStatus(id, status)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update application status')
      }
      return result
    },
    onSuccess: () => {
      // Invalidate both individual application and applications list
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['application'] })
      toast.success('Application status updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update application status')
    },
  })
}

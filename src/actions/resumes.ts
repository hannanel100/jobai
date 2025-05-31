'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Resume creation schema
const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  fileSize: z.number().min(1, 'File size is required'),
  fileType: z.string().min(1, 'File type is required'),
  content: z.any().optional(), // Optional parsed content
  isBase: z.boolean().default(false),
})

export type CreateResumeData = z.infer<typeof createResumeSchema>

export async function createResume(data: CreateResumeData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }    const validatedData = createResumeSchema.parse(data)

    const resume = await db.resume.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },    })

    revalidatePath('/dashboard/resumes')
    return { success: true, resume }
  } catch (error) {
    return {
      success: false, 
      error: error instanceof z.ZodError 
        ? error.errors[0].message 
        : 'Failed to create resume' 
    }
  }
}

export async function getResumes() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }    const resumes = await db.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
        applications: {
          select: {
            id: true,
            companyName: true,
            positionTitle: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Show only the latest 3 applications
        },
      },
    })

    return { success: true, resumes }
  } catch (error) {
    console.error('Failed to fetch resumes:', error)
    return { success: false, error: 'Failed to fetch resumes' }
  }
}

export async function getResume(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const resume = await db.resume.findFirst({
      where: { 
        id,
        userId: session.user.id,
      },
      include: {
        applications: {
          select: {
            id: true,
            companyName: true,
            positionTitle: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!resume) {
      return { success: false, error: 'Resume not found' }
    }

    return { success: true, resume }
  } catch (error) {
    console.error('Failed to fetch resume:', error)
    return { success: false, error: 'Failed to fetch resume' }
  }
}

export async function updateResume(id: string, data: Partial<CreateResumeData>) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if resume belongs to user
    const existingResume = await db.resume.findFirst({
      where: { 
        id,
        userId: session.user.id,
      },
    })

    if (!existingResume) {
      return { success: false, error: 'Resume not found' }
    }

    const resume = await db.resume.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard/resumes')
    revalidatePath(`/dashboard/resumes/${id}`)
    return { success: true, resume }
  } catch (error) {
    console.error('Failed to update resume:', error)
    return { success: false, error: 'Failed to update resume' }
  }
}

export async function deleteResume(id: string) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    // Check if resume belongs to user
    const existingResume = await db.resume.findFirst({
      where: { 
        id,
        userId: session.user.id,
      },
    })

    if (!existingResume) {
      return { success: false, error: 'Resume not found' }
    }

    await db.resume.delete({
      where: { id },
    })

    revalidatePath('/dashboard/resumes')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete resume:', error)
    return { success: false, error: 'Failed to delete resume' }
  }
}

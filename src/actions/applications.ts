'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import {
  applicationSchema,
  ApplicationFormData,
  applicationUpdateSchema,
  ApplicationUpdateData,
} from '@/schemas/application';
import { revalidatePath } from 'next/cache';
import { ApplicationStatus } from '@prisma/client';

export async function createApplication(data: ApplicationFormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const validatedData = applicationSchema.parse(data);

    const application = await db.application.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        status: ApplicationStatus.SAVED,
      },
    });

    revalidatePath('/dashboard/applications');

    return { success: true, application };
  } catch (error) {
    console.error('Error creating application:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create application',
    };
  }
}

export async function updateApplication(
  id: string,
  data: ApplicationUpdateData
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Validate the partial data
    const validatedData = applicationUpdateSchema.parse(data);

    // Verify the application belongs to the user
    const existingApplication = await db.application.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (
      !existingApplication ||
      existingApplication.userId !== session.user.id
    ) {
      throw new Error('Application not found or unauthorized');
    }

    const application = await db.application.update({
      where: { id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/dashboard/applications');
    revalidatePath(`/dashboard/applications/${id}`);

    return { success: true, application };
  } catch (error) {
    console.error('Error updating application:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update application',
    };
  }
}

export async function deleteApplication(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Verify the application belongs to the user
    const existingApplication = await db.application.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (
      !existingApplication ||
      existingApplication.userId !== session.user.id
    ) {
      throw new Error('Application not found or unauthorized');
    }

    await db.application.delete({
      where: { id },
    });

    revalidatePath('/dashboard/applications');

    return { success: true };
  } catch (error) {
    console.error('Error deleting application:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete application',
    };
  }
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    // Verify the application belongs to the user
    const existingApplication = await db.application.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (
      !existingApplication ||
      existingApplication.userId !== session.user.id
    ) {
      throw new Error('Application not found or unauthorized');
    }

    const application = await db.application.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        // Set appliedDate when status changes to APPLIED
        ...(status === ApplicationStatus.APPLIED && {
          appliedDate: new Date(),
        }),
      },
    });

    revalidatePath('/dashboard/applications');
    revalidatePath(`/dashboard/applications/${id}`);

    return { success: true, application };
  } catch (error) {
    console.error('Error updating application status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update status',
    };
  }
}

export async function getApplications() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const applications = await db.application.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return { success: true, applications };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch applications',
      applications: [],
    };
  }
}

export async function getApplication(id: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const application = await db.application.findUnique({
      where: { id },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!application || application.userId !== session.user.id) {
      throw new Error('Application not found or unauthorized');
    }

    return { success: true, application };
  } catch (error) {
    console.error('Error fetching application:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch application',
      application: null,
    };
  }
}

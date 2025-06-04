'use server';

import { signIn, signOut } from '@/auth';
import { db } from '@/lib/db';
import { LoginSchema, RegisterSchema } from '@/schemas/auth';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';

export async function login(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials!' };
        default:
          return { error: 'Something went wrong!' };
      }
    }
    throw error;
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
  const { email, password, firstName, lastName } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email already in use!' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return { success: 'User created successfully!' };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Something went wrong!' };
  }
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}

'use client';

import { register } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RegisterSchema } from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      register(values).then(data => {
        if (data?.error) {
          setError(data.error);
        } else if (data?.success) {
          setSuccess(data.success);
          form.reset();
        }
      });
    });
  };

  return (
    <Card className="w-[400px] bg-white border border-[var(--theme-accent)]30 border-t-4 border-t-[var(--theme-primary)]">
      <CardHeader className="text-center space-y-4 pb-8">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg bg-[var(--theme-primary)]">
            JT
          </div>
        </div>
        <CardTitle className="text-[var(--theme-primary)]">
          Create an account
        </CardTitle>
        <CardDescription className="text-[var(--theme-text-secondary)]">
          Enter your details below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {' '}
            <div className="space-y-4">
              {' '}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-primary)]">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="John"
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-primary)]">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Doe"
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-primary)]">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="john.doe@example.com"
                        type="email"
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--theme-primary)]">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Enter your password"
                        type="password"
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {error && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-500">
                {success}
              </div>
            )}
            <Button
              disabled={isPending}
              type="submit"
              className="w-full text-white hover:opacity-90 transition-opacity bg-[var(--theme-primary)]"
            >
              Create account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-[var(--theme-secondary)]">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="hover:underline font-medium text-[var(--theme-accent)]"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

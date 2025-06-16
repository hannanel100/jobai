'use client';

import { login } from '@/actions/auth';
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
import { LoginSchema } from '@/schemas/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { z } from 'zod';

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const data = await login(values);
        if (data?.error) {
          setError(data.error);
        }
      } catch {
        setError('An unexpected error occurred');
      } finally {
        setIsSubmitting(false);
      }
    });
  };
  const onInvalid = (errors: FieldErrors<LoginFormValues>) => {
    console.log('Form validation errors:', errors);
    setIsSubmitting(false);
  };

  // Clear error when form values change
  const handleFormChange = () => {
    if (error) {
      setError('');
    }
  };

  const isLoading = isPending || isSubmitting;

  return (
    <Card className="w-[400px] shadow-2xl bg-white border-[var(--theme-accent)]/30 border-t-4 border-t-[var(--theme-primary)]">
      <CardHeader className="text-center space-y-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold mx-auto shadow-lg bg-[var(--theme-primary)]">
          JT
        </div>
        <CardTitle className="text-2xl text-[var(--theme-primary)]">
          Sign in
        </CardTitle>
        <CardDescription className="text-[var(--theme-text-secondary)]">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-4">
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
                        disabled={isLoading}
                        placeholder="john.doe@example.com"
                        type="email"
                        required
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                        onChange={e => {
                          field.onChange(e);
                          handleFormChange();
                        }}
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
                        disabled={isLoading}
                        placeholder="Enter your password"
                        type="password"
                        required
                        className="border-gray-200 focus:border-2 border-[var(--theme-neutral)]40 focus:ring-[var(--theme-accent)]"
                        onChange={e => {
                          field.onChange(e);
                          handleFormChange();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button
              disabled={isLoading}
              type="submit"
              className="w-full text-white bg-[var(--theme-primary)]"
            >
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm text-[var(--theme-secondary)]">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="hover:underline font-medium text-[var(--theme-accent)]"
          >
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

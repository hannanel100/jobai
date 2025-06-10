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
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder="john.doe@example.com"
                        type="email"
                        required
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        placeholder="Enter your password"
                        type="password"
                        required
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
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button disabled={isLoading} type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

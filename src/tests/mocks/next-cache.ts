// Mock for 'next/cache' module
import { vi } from 'vitest';

export const revalidatePath = vi.fn((path: string) => {
  console.log(`Mock revalidatePath called with: ${path}`);
});

export const revalidateTag = vi.fn((tag: string) => {
  console.log(`Mock revalidateTag called with: ${tag}`);
});

export const unstable_cache = vi.fn(
  (fn: (...args: any[]) => any, keyParts?: string[], options?: any) => {
    // Return the original function for testing
    return fn;
  }
);

export const unstable_noStore = vi.fn();

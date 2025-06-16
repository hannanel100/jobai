import { theme } from '@/lib/theme';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${theme.background} 0%, ${theme.neutral}20 100%)`,
      }}
    >
      {children}
    </div>
  );
}

import { ArrowRight, BarChart3, Brain, Target, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: Target,
    title: 'Smart Application Tracking',
    description:
      'Never lose track of an opportunity. Our intelligent system organizes every application, interview, and follow-up automatically.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Resume Optimization',
    description:
      'Transform your resume with AI insights. Get personalized suggestions that increase your chances of landing interviews.',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description:
      'Understand your job search performance with detailed analytics and actionable insights to improve your success rate.',
  },
  {
    icon: Users,
    title: 'Recruiter Network',
    description:
      'Connect with top recruiters and hiring managers. Get discovered for opportunities that perfectly match your skills.',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description:
      'Save time with automated follow-ups, application status updates, and interview scheduling.',
  },
  {
    icon: Brain,
    title: 'Interview Preparation',
    description:
      'AI-powered interview prep with personalized questions, company insights, and performance feedback.',
  },
];

const stats = [
  { number: '10,000+', label: 'Job Seekers' },
  { number: '85%', label: 'Success Rate' },
  { number: '500+', label: 'Partner Companies' },
  { number: '30%', label: 'Faster Hiring' },
];

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-neutral)]/20">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-[var(--theme-primary)]">
              JT
            </div>
            <span className="text-xl font-bold text-[var(--theme-primary)]">
              JobTracker AI
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link
              href="#features"
              className="hover:opacity-75 text-[var(--theme-text-secondary)]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="hover:opacity-75 text-[var(--theme-text-secondary)]"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="hover:opacity-75 text-[var(--theme-text-secondary)]"
            >
              Pricing
            </Link>
          </div>
          <div className="space-x-4">
            <Button
              asChild
              variant="ghost"
              className="text-[var(--theme-text-secondary)]"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-secondary)]"
            >
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-[var(--theme-primary)]">
            Land Your Dream Job
            <span className="block text-[var(--theme-accent)]">10x Faster</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-[var(--theme-text-secondary)]">
            The most intelligent job search platform that combines AI-powered
            insights, automated tracking, and recruiter connections to
            accelerate your career growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-[var(--theme-primary)] text-white hover:bg-[var(--theme-secondary)]"
            >
              <Link href="/auth/register" className="flex items-center">
                Start Your Job Search
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-white"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-1 text-[var(--theme-primary)]">
                  {stat.number}
                </div>
                <div className="text-sm opacity-75 text-[var(--theme-text-secondary)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[var(--theme-surface)]/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[var(--theme-primary)]">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-[var(--theme-text-secondary)]">
              Powerful tools and insights designed to give you a competitive
              edge in today&apos;s job market.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-[var(--theme-accent)]/20">
                    <feature.icon className="h-6 w-6 text-[var(--theme-accent)]" />
                  </div>
                  <CardTitle className="text-[var(--theme-primary)]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[var(--theme-primary)]">
              How JobTracker AI Works
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-[var(--theme-text-secondary)]">
              Three simple steps to transform your job search and accelerate
              your career.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload & Optimize',
                description:
                  'Upload your resume and let our AI analyze and optimize it for maximum impact with personalized suggestions.',
              },
              {
                step: '02',
                title: 'Track & Apply',
                description:
                  'Apply to jobs and automatically track every application, interview, and follow-up in one organized dashboard.',
              },
              {
                step: '03',
                title: 'Connect & Succeed',
                description:
                  'Get matched with recruiters, receive interview insights, and land your dream job faster than ever.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 bg-[var(--theme-accent)]">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[var(--theme-primary)]">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-[var(--theme-text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--theme-primary)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who&apos;ve accelerated
            their careers with JobTracker AI.
          </p>
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-6 bg-[var(--theme-accent)] text-white hover:bg-[var(--theme-accent)]/90"
          >
            <Link href="/auth/register" className="flex items-center">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--theme-surface)]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold bg-[var(--theme-primary)]">
                JT
              </div>
              <span className="text-xl font-bold text-[var(--theme-primary)]">
                JobTracker AI
              </span>
            </div>
            <div className="flex space-x-8">
              <Link
                href="/privacy"
                className="hover:opacity-75 text-[var(--theme-text-secondary)]"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:opacity-75 text-[var(--theme-text-secondary)]"
              >
                Terms
              </Link>
              <Link
                href="/support"
                className="hover:opacity-75 text-[var(--theme-text-secondary)]"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center border-[var(--theme-neutral)]/40">
            <p className="text-[var(--theme-text-secondary)]">
              © 2025 JobTracker AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

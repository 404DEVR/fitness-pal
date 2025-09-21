'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Target, Utensils, TrendingUp } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Track Your Fitness Journey
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto px-4">
            Monitor your daily nutrition, set personalized goals, and achieve your fitness targets with our comprehensive tracking application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:space-x-4 sm:gap-0 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Track Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Monitor your daily calorie intake with personalized targets based on your goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Set Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Define your fitness objectives and get customized nutrition recommendations.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Utensils className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Log Meals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Easily log your meals with automatic nutrition information lookup.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>View Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Visualize your progress with detailed charts and historical data.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to start your fitness journey?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-8 px-4">
            Join thousands of users who are already tracking their way to better health.
          </p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/signup">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CalorieProgress } from '@/components/dashboard/CalorieProgress';
import { MacroChart } from '@/components/dashboard/MacroChart';
import { MealForm } from '@/components/dashboard/MealForm';
import { RecentMeals } from '@/components/dashboard/RecentMeals';
import { WeightProgress } from '@/components/dashboard/WeightProgress';
import { WeightChart } from '@/components/dashboard/WeightChart';
import { User, Meal, DailyStats, WeightLog } from '@/types';
import { format } from 'date-fns';

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Check if user needs to complete onboarding
        if (!userData.age || !userData.target_calories) {
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [router]);

  const fetchTodaysMeals = useCallback(async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const response = await fetch(`/api/meals?date=${today}`);
      if (response.ok) {
        const mealsData = await response.json();
        setMeals(mealsData);
      }
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWeightLogs = useCallback(async () => {
    try {
      const response = await fetch('/api/weight-logs?limit=10');
      if (response.ok) {
        const weightData = await response.json();
        setWeightLogs(weightData);
      }
    } catch (error) {
      console.error('Failed to fetch weight logs:', error);
    }
  }, []);

  const calculateDailyStats = useCallback(() => {
    if (!user) return;

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    setDailyStats({
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      targetCalories: user.target_calories || 2000,
      targetProtein: user.target_protein || 150,
      targetCarbs: user.target_carbs || 200,
      targetFat: user.target_fat || 67,
    });
  }, [user, meals]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProfile();
      fetchTodaysMeals();
      fetchWeightLogs();
    }
  }, [status, router, fetchUserProfile, fetchTodaysMeals, fetchWeightLogs]);

  useEffect(() => {
    if (user && meals) {
      calculateDailyStats();
    }
  }, [user, meals, calculateDailyStats]);

  const handleMealAdded = () => {
    fetchTodaysMeals();
  };

  const handleWeightLogged = () => {
    fetchUserProfile();
    fetchWeightLogs();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !dailyStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user.name || 'User'}!</h1>
          <p className="text-muted-foreground">
            Today is {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            <CalorieProgress stats={dailyStats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <MacroChart stats={dailyStats} />
              {user.current_weight && user.target_weight && (
                <WeightProgress user={user} onWeightLogged={handleWeightLogged} />
              )}
            </div>
            {user.current_weight && user.target_weight && (
              <WeightChart weightLogs={weightLogs} targetWeight={user.target_weight} />
            )}
          </div>
          <div className="space-y-4 lg:space-y-6">
            <MealForm onMealAdded={handleMealAdded} />
          </div>
        </div>

        <RecentMeals meals={meals} onMealDeleted={handleMealAdded} />
      </div>
    </div>
  );
}
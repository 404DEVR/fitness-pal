'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Edit3, Save, X, Target, TrendingUp, Calendar } from 'lucide-react';
import { User as UserType, AdjustedPlan, BasePlan } from '@/types';
import { activityLevels, fitnessGoals } from '@/lib/calculations';
import { format } from 'date-fns';
import CalorieMacroPlanner from '@/components/profile/CalorieMacroPlanner';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    gender: '',
    height: '',
    current_weight: '',
    target_weight: '',
    activity_level: '',
    fitness_goal: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditData({
          name: userData.name || '',
          age: userData.age?.toString() || '',
          gender: userData.gender || '',
          height: userData.height?.toString() || '',
          current_weight: userData.current_weight?.toString() || '',
          target_weight: userData.target_weight?.toString() || '',
          activity_level: userData.activity_level || '',
          fitness_goal: userData.fitness_goal || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editData.name,
          age: parseInt(editData.age) || null,
          gender: editData.gender,
          height: parseFloat(editData.height) || null,
          current_weight: parseFloat(editData.current_weight) || null,
          target_weight: parseFloat(editData.target_weight) || null,
          activity_level: editData.activity_level,
          fitness_goal: editData.fitness_goal,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      age: user?.age?.toString() || '',
      gender: user?.gender || '',
      height: user?.height?.toString() || '',
      current_weight: user?.current_weight?.toString() || '',
      target_weight: user?.target_weight?.toString() || '',
      activity_level: user?.activity_level || '',
      fitness_goal: user?.fitness_goal || '',
    });
    setIsEditing(false);
  };

  const handleImplementAdjustment = async (adjustedPlan: AdjustedPlan, adjustmentType: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_calories: adjustedPlan.adjustedCalories,
          target_protein: adjustedPlan.macros.protein.grams,
          target_carbs: adjustedPlan.macros.carbs.grams,
          target_fat: adjustedPlan.macros.fat.grams,
          current_adjustment: adjustmentType,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to implement adjustment:', error);
      alert('Failed to implement changes. Please try again.');
      throw error;
    }
  };

  const handleRevertToBase = async (basePlan: BasePlan) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_calories: basePlan.goalCalories,
          target_protein: basePlan.macros.protein.grams,
          target_carbs: basePlan.macros.carbs.grams,
          target_fat: basePlan.macros.fat.grams,
          current_adjustment: 'none',
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to revert to base:', error);
      alert('Failed to revert changes. Please try again.');
      throw error;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load profile data.</p>
        </div>
      </div>
    );
  }

  const activityLevelLabel = activityLevels.find(level => level.value === user.activity_level)?.label;
  const fitnessGoalLabel = fitnessGoals.find(goal => goal.value === user.fitness_goal)?.label;
  const weightDifference = user.current_weight && user.target_weight ?
    user.target_weight - user.current_weight : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 lg:h-8 lg:w-8" />
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your personal information and fitness goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-medium">{user.name || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="mt-1 text-sm font-medium text-muted-foreground">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    {isEditing ? (
                      <Input
                        id="age"
                        type="number"
                        value={editData.age}
                        onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Enter your age"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-medium">{user.age || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <Select value={editData.gender} onValueChange={(value) => setEditData(prev => ({ ...prev, gender: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 text-sm font-medium capitalize">{user.gender || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    {isEditing ? (
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={editData.height}
                        onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="Enter height in cm"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-medium">{user.height ? `${user.height} cm` : 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="current_weight">Current Weight (kg)</Label>
                    {isEditing ? (
                      <Input
                        id="current_weight"
                        type="number"
                        step="0.1"
                        value={editData.current_weight}
                        onChange={(e) => setEditData(prev => ({ ...prev, current_weight: e.target.value }))}
                        placeholder="Enter current weight"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-medium">{user.current_weight ? `${user.current_weight} kg` : 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="target_weight">Target Weight (kg)</Label>
                    {isEditing ? (
                      <Input
                        id="target_weight"
                        type="number"
                        step="0.1"
                        value={editData.target_weight}
                        onChange={(e) => setEditData(prev => ({ ...prev, target_weight: e.target.value }))}
                        placeholder="Enter target weight"
                      />
                    ) : (
                      <div className="mt-1 text-sm font-medium">{user.target_weight ? `${user.target_weight} kg` : 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="activity_level">Activity Level</Label>
                    {isEditing ? (
                      <Select value={editData.activity_level} onValueChange={(value) => setEditData(prev => ({ ...prev, activity_level: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          {activityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 text-sm font-medium">{activityLevelLabel || 'Not set'}</div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fitness_goal">Fitness Goal</Label>
                    {isEditing ? (
                      <Select value={editData.fitness_goal} onValueChange={(value) => setEditData(prev => ({ ...prev, fitness_goal: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {fitnessGoals.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 text-sm font-medium">{fitnessGoalLabel || 'Not set'}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calorie & Macro Planner */}
            <CalorieMacroPlanner
              currentWeight={user.current_weight}
              height={user.height}
              age={user.age}
              gender={user.gender}
              activityLevel={user.activity_level}
              fitnessGoal={user.fitness_goal}
              currentAdjustment={user.current_adjustment}
              onImplementAdjustment={handleImplementAdjustment}
              onRevertToBase={handleRevertToBase}
            />
          </div>

          {/* Stats & Goals */}
          <div className="space-y-4 lg:space-y-6">
            {/* Nutrition Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {user.target_calories || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Calories</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted rounded">
                    <div className="font-semibold">{user.target_protein || 0}g</div>
                    <div className="text-xs text-muted-foreground">Protein</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-semibold">{user.target_carbs || 0}g</div>
                    <div className="text-xs text-muted-foreground">Carbs</div>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <div className="font-semibold">{user.target_fat || 0}g</div>
                    <div className="text-xs text-muted-foreground">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Goal */}
            {user.current_weight && user.target_weight && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weight Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current</span>
                    <span className="font-semibold">{user.current_weight}kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Target</span>
                    <span className="font-semibold">{user.target_weight}kg</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm">To Go</span>
                    <Badge variant={weightDifference > 0 ? 'default' : weightDifference < 0 ? 'destructive' : 'secondary'}>
                      {weightDifference > 0 ? '+' : ''}{weightDifference.toFixed(1)}kg
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Account Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="text-sm font-medium">
                    {user.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last updated</span>
                  <span className="text-sm font-medium">
                    {user.updated_at ? format(new Date(user.updated_at), 'MMM dd, yyyy') : 'Never'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
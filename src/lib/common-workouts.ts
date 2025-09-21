export interface WorkoutExercise {
  name: string;
  category: string;
  muscleGroups: string[];
  description: string;
}

export const commonWorkouts: WorkoutExercise[] = [
  // Compound Movements
  { 
    name: 'Squat', 
    category: 'Compound', 
    muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'], 
    description: 'King of all exercises - full body strength'
  },
  { 
    name: 'Deadlift', 
    category: 'Compound', 
    muscleGroups: ['Hamstrings', 'Glutes', 'Back', 'Traps'], 
    description: 'Ultimate posterior chain developer'
  },
  { 
    name: 'Bench Press', 
    category: 'Compound', 
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'], 
    description: 'Classic upper body strength builder'
  },
  { 
    name: 'Overhead Press', 
    category: 'Compound', 
    muscleGroups: ['Shoulders', 'Triceps', 'Core'], 
    description: 'Standing shoulder press for functional strength'
  },
  { 
    name: 'Barbell Row', 
    category: 'Compound', 
    muscleGroups: ['Back', 'Biceps', 'Rear Delts'], 
    description: 'Build a strong, wide back'
  },
  
  // Upper Body
  { 
    name: 'Pull-ups', 
    category: 'Upper Body', 
    muscleGroups: ['Back', 'Biceps'], 
    description: 'Bodyweight back builder'
  },
  { 
    name: 'Push-ups', 
    category: 'Upper Body', 
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'], 
    description: 'Classic bodyweight chest exercise'
  },
  { 
    name: 'Dips', 
    category: 'Upper Body', 
    muscleGroups: ['Triceps', 'Chest', 'Shoulders'], 
    description: 'Bodyweight tricep and chest builder'
  },
  { 
    name: 'Bicep Curl', 
    category: 'Upper Body', 
    muscleGroups: ['Biceps'], 
    description: 'Isolated bicep development'
  },
  { 
    name: 'Tricep Pushdown', 
    category: 'Upper Body', 
    muscleGroups: ['Triceps'], 
    description: 'Cable tricep isolation'
  },
  { 
    name: 'Lateral Raise', 
    category: 'Upper Body', 
    muscleGroups: ['Shoulders'], 
    description: 'Side deltoid isolation'
  },
  { 
    name: 'Chest Fly', 
    category: 'Upper Body', 
    muscleGroups: ['Chest'], 
    description: 'Chest isolation movement'
  },
  
  // Lower Body
  { 
    name: 'Leg Press', 
    category: 'Lower Body', 
    muscleGroups: ['Quadriceps', 'Glutes'], 
    description: 'Machine-based leg strength'
  },
  { 
    name: 'Leg Curl', 
    category: 'Lower Body', 
    muscleGroups: ['Hamstrings'], 
    description: 'Isolated hamstring development'
  },
  { 
    name: 'Leg Extension', 
    category: 'Lower Body', 
    muscleGroups: ['Quadriceps'], 
    description: 'Isolated quad development'
  },
  { 
    name: 'Calf Raise', 
    category: 'Lower Body', 
    muscleGroups: ['Calves'], 
    description: 'Calf muscle isolation'
  },
  { 
    name: 'Bulgarian Split Squat', 
    category: 'Lower Body', 
    muscleGroups: ['Quadriceps', 'Glutes'], 
    description: 'Single-leg strength and stability'
  },
  { 
    name: 'Hip Thrust', 
    category: 'Lower Body', 
    muscleGroups: ['Glutes', 'Hamstrings'], 
    description: 'Glute activation and strength'
  },
  
  // Core
  { 
    name: 'Plank', 
    category: 'Core', 
    muscleGroups: ['Core', 'Abs'], 
    description: 'Isometric core strengthener'
  },
  { 
    name: 'Russian Twist', 
    category: 'Core', 
    muscleGroups: ['Obliques', 'Core'], 
    description: 'Rotational core strength'
  },
  { 
    name: 'Mountain Climbers', 
    category: 'Core', 
    muscleGroups: ['Core', 'Cardio'], 
    description: 'Dynamic core and cardio'
  },
  { 
    name: 'Dead Bug', 
    category: 'Core', 
    muscleGroups: ['Core', 'Stability'], 
    description: 'Core stability and control'
  },
];

export function searchWorkouts(query: string): WorkoutExercise[] {
  if (!query || query.length < 2) return commonWorkouts;
  
  const searchTerm = query.toLowerCase();
  return commonWorkouts.filter(workout => 
    workout.name.toLowerCase().includes(searchTerm) ||
    workout.category.toLowerCase().includes(searchTerm) ||
    workout.muscleGroups.some(muscle => muscle.toLowerCase().includes(searchTerm))
  );
}
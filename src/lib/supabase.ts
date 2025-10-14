import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  frequency: string;
  created_at: string;
  archived: boolean;
};

export type HabitCompletion = {
  id: string;
  habit_id: string;
  completed_at: string;
  notes: string;
  created_at: string;
};

export type FocusSession = {
  id: string;
  user_id: string;
  duration_minutes: number;
  actual_minutes: number;
  task_name: string;
  completed: boolean;
  started_at: string;
  ended_at: string | null;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  created_at: string;
  order_index: number;
};

export type JournalEntry = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood: string | null;
  entry_date: string;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  metadata: Record<string, any>;
};

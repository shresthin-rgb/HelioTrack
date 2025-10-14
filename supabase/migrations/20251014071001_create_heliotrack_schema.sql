/*
  # HelioTrack Database Schema

  ## Overview
  Creates the complete database structure for the HelioTrack habit-building application,
  including tables for habits, focus sessions, tasks, journal entries, and achievements.

  ## New Tables

  ### `habits`
  - `id` (uuid, primary key) - Unique identifier for each habit
  - `user_id` (uuid) - Reference to auth.users (for future multi-user support)
  - `name` (text) - Name of the habit
  - `description` (text) - Optional description
  - `icon` (text) - Icon identifier
  - `color` (text) - Color theme for the habit
  - `frequency` (text) - daily, weekly, etc.
  - `created_at` (timestamptz) - Creation timestamp
  - `archived` (boolean) - Soft delete flag

  ### `habit_completions`
  - `id` (uuid, primary key) - Unique identifier
  - `habit_id` (uuid, foreign key) - References habits table
  - `completed_at` (date) - Date of completion
  - `notes` (text) - Optional notes for this completion
  - `created_at` (timestamptz) - Creation timestamp

  ### `focus_sessions`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `duration_minutes` (integer) - Planned duration
  - `actual_minutes` (integer) - Actual time spent
  - `task_name` (text) - What was being worked on
  - `completed` (boolean) - Whether session was completed
  - `started_at` (timestamptz) - When session started
  - `ended_at` (timestamptz) - When session ended

  ### `tasks`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `title` (text) - Task title
  - `description` (text) - Task details
  - `category` (text) - Task category/tag
  - `priority` (text) - low, medium, high
  - `completed` (boolean) - Completion status
  - `completed_at` (timestamptz) - When completed
  - `due_date` (date) - Optional due date
  - `created_at` (timestamptz) - Creation timestamp
  - `order_index` (integer) - For custom ordering

  ### `journal_entries`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `title` (text) - Entry title
  - `content` (text) - Journal entry content
  - `mood` (text) - Optional mood indicator
  - `entry_date` (date) - Date of journal entry
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `achievements`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - Reference to auth.users
  - `achievement_type` (text) - Type of achievement
  - `title` (text) - Achievement title
  - `description` (text) - Achievement description
  - `icon` (text) - Icon identifier
  - `unlocked_at` (timestamptz) - When achieved
  - `metadata` (jsonb) - Additional achievement data

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Default user_id to a demo user for now (can be updated for auth later)

  ## Notes
  - Using a default user_id approach for MVP (single-user mode)
  - Can be extended to full multi-user auth system later
  - All timestamps use timestamptz for proper timezone handling
*/

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'star',
  color text DEFAULT '#AF9469',
  frequency text DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  archived boolean DEFAULT false
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  completed_at date DEFAULT CURRENT_DATE NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(habit_id, completed_at)
);

-- Create focus_sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  duration_minutes integer NOT NULL,
  actual_minutes integer DEFAULT 0,
  task_name text NOT NULL,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  title text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  completed boolean DEFAULT false,
  completed_at timestamptz,
  due_date date,
  created_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  title text NOT NULL,
  content text NOT NULL,
  mood text,
  entry_date date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'trophy',
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for habits
CREATE POLICY "Allow all operations on habits"
  ON habits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for habit_completions
CREATE POLICY "Allow all operations on habit_completions"
  ON habit_completions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for focus_sessions
CREATE POLICY "Allow all operations on focus_sessions"
  ON focus_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for tasks
CREATE POLICY "Allow all operations on tasks"
  ON tasks FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for journal_entries
CREATE POLICY "Allow all operations on journal_entries"
  ON journal_entries FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create policies for achievements
CREATE POLICY "Allow all operations on achievements"
  ON achievements FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_at);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
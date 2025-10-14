import { useState, useEffect } from 'react';
import { Star, Plus, Trash2, CheckCircle, Circle, Flame } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase, type Habit, type HabitCompletion } from '../lib/supabase';

interface AstrariumProps {
  onBack: () => void;
}

interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  streak: number;
  completedToday: boolean;
}

export default function Astrarium({ onBack }: AstrariumProps) {
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (habitsData) {
        const habitsWithData = await Promise.all(
          habitsData.map(async (habit) => {
            const { data: completions } = await supabase
              .from('habit_completions')
              .select('*')
              .eq('habit_id', habit.id)
              .order('completed_at', { ascending: false });

            const today = new Date().toISOString().split('T')[0];
            const completedToday = completions?.some(c => c.completed_at === today) || false;

            const streak = calculateStreak(completions || []);

            return {
              ...habit,
              completions: completions || [],
              streak,
              completedToday
            };
          })
        );

        setHabits(habitsWithData);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completions: HabitCompletion[]): number => {
    if (completions.length === 0) return 0;

    const sortedDates = completions
      .map(c => new Date(c.completed_at))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);

      const completionDate = new Date(sortedDates[i]);
      completionDate.setHours(0, 0, 0, 0);

      if (completionDate.getTime() === checkDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;

    const { data, error } = await supabase
      .from('habits')
      .insert({
        name: newHabitName,
        description: newHabitDescription
      })
      .select()
      .single();

    if (!error && data) {
      setHabits(prev => [{
        ...data,
        completions: [],
        streak: 0,
        completedToday: false
      }, ...prev]);
      setNewHabitName('');
      setNewHabitDescription('');
      setShowAddForm(false);
    }
  };

  const handleToggleCompletion = async (habitId: string, completedToday: boolean) => {
    const today = new Date().toISOString().split('T')[0];

    if (completedToday) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('completed_at', today);
    } else {
      await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          completed_at: today
        });
    }

    fetchHabits();
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    await supabase
      .from('habits')
      .update({ archived: true })
      .eq('id', habitId);

    fetchHabits();
  };

  if (loading) {
    return (
      <Layout title="Astrarium" subtitle="Celestial Observatory" onBack={onBack}>
        <div className="flex items-center justify-center h-96">
          <div className="text-[#AF9469] cinzel-font text-xl animate-pulse">Mapping the stars...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Astrarium" subtitle="Celestial Observatory" onBack={onBack}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Active Habits</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{habits.length}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Completed Today</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">
              {habits.filter(h => h.completedToday).length}
            </p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Flame className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Longest Streak</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">
              {Math.max(...habits.map(h => h.streak), 0)}
            </p>
          </div>
        </div>

        {/* Add Habit Button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full cinzel-font py-4 bg-[#AF9469] text-[#1F1207] rounded-lg
            hover:bg-[#F5DEB3] transition-all duration-300 flex items-center justify-center gap-2
            shadow-[0_0_20px_rgba(175,148,105,0.3)] hover:shadow-[0_0_40px_rgba(175,148,105,0.5)]
            font-semibold text-lg"
        >
          <Plus className="w-6 h-6" />
          Create New Habit
        </button>

        {/* Add Habit Form */}
        {showAddForm && (
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#AF9469] rounded-lg p-6 animate-fade-in">
            <h3 className="cinzel-font text-xl font-bold text-[#AF9469] mb-4">New Celestial Goal</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name..."
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none"
              />
              <textarea
                value={newHabitDescription}
                onChange={(e) => setNewHabitDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={3}
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none resize-none"
              />
              <div className="flex gap-4">
                <button
                  onClick={handleAddHabit}
                  className="cinzel-font flex-1 py-3 bg-[#AF9469] text-[#1F1207] rounded-lg
                    hover:bg-[#F5DEB3] transition-all duration-300 font-semibold"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="cinzel-font flex-1 py-3 bg-[#553F1E] text-[#AF9469] rounded-lg
                    hover:bg-[#614F33] transition-all duration-300 border-2 border-[#614F33]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Habits List */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-12 text-center">
              <Star className="w-16 h-16 text-[#553F1E] mx-auto mb-4" />
              <p className="cinzel-font text-[#614F33] text-lg">
                No habits yet. Create your first celestial goal above.
              </p>
            </div>
          ) : (
            habits.map((habit, index) => (
              <div
                key={habit.id}
                className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6
                  hover:border-[#AF9469] transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <button
                        onClick={() => handleToggleCompletion(habit.id, habit.completedToday)}
                        className="text-[#AF9469] hover:scale-110 transition-transform"
                      >
                        {habit.completedToday ? (
                          <CheckCircle className="w-8 h-8 fill-current" />
                        ) : (
                          <Circle className="w-8 h-8" />
                        )}
                      </button>
                      <div>
                        <h3 className="cinzel-font text-xl font-semibold text-[#AF9469]">
                          {habit.name}
                        </h3>
                        {habit.description && (
                          <p className="cinzel-font text-sm text-[#614F33] mt-1">
                            {habit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-12 mt-4">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#AF9469]" />
                        <span className="cinzel-font text-[#614F33]">
                          {habit.streak} day streak
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#AF9469]" />
                        <span className="cinzel-font text-[#614F33]">
                          {habit.completions.length} total
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-[#553F1E] hover:text-[#AF9469] transition-colors opacity-0
                      group-hover:opacity-100 duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {habit.streak > 0 && (
                  <div className="ml-12 mt-4 flex gap-1">
                    {[...Array(Math.min(habit.streak, 30))].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#AF9469]"
                        style={{
                          opacity: 1 - (i * 0.02),
                          animation: `glow ${1 + i * 0.1}s ease-in-out infinite`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

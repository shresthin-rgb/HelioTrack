import { useEffect, useState } from 'react';
import { Sun, Target, Clock, TrendingUp, Calendar, Flame } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  totalFocusTime: number;
  completedTasks: number;
  totalTasks: number;
  journalEntries: number;
}

interface HeliosProps {
  onBack: () => void;
}

export default function Helios({ onBack }: HeliosProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    totalFocusTime: 0,
    completedTasks: 0,
    totalTasks: 0,
    journalEntries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [habitsResult, completionsResult, focusResult, tasksResult, journalResult] = await Promise.all([
        supabase.from('habits').select('*').eq('archived', false),
        supabase.from('habit_completions').select('*').eq('completed_at', today),
        supabase.from('focus_sessions').select('actual_minutes').eq('completed', true),
        supabase.from('tasks').select('*'),
        supabase.from('journal_entries').select('id')
      ]);

      const totalFocusMinutes = focusResult.data?.reduce((sum, session) => sum + session.actual_minutes, 0) || 0;
      const completedTasks = tasksResult.data?.filter(t => t.completed).length || 0;

      setStats({
        totalHabits: habitsResult.data?.length || 0,
        completedToday: completionsResult.data?.length || 0,
        currentStreak: 0,
        totalFocusTime: totalFocusMinutes,
        completedTasks,
        totalTasks: tasksResult.data?.length || 0,
        journalEntries: journalResult.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quotes = [
    "The sun's journey begins with a single ray of light.",
    "Each day is a gift from Helios, use it wisely.",
    "Consistency is the chariot that carries you to greatness.",
    "Like the sun, rise again each day with renewed purpose."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const statCards = [
    {
      title: 'Active Habits',
      value: stats.totalHabits,
      subtitle: `${stats.completedToday} completed today`,
      icon: <Target className="w-8 h-8" />,
      color: 'from-[#AF9469] to-[#614F33]'
    },
    {
      title: 'Focus Time',
      value: `${Math.floor(stats.totalFocusTime / 60)}h ${stats.totalFocusTime % 60}m`,
      subtitle: 'Total time in flow',
      icon: <Clock className="w-8 h-8" />,
      color: 'from-[#614F33] to-[#553F1E]'
    },
    {
      title: 'Tasks',
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      subtitle: 'Completed tasks',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-[#553F1E] to-[#433116]'
    },
    {
      title: 'Journal Entries',
      value: stats.journalEntries,
      subtitle: 'Scrolls written',
      icon: <Calendar className="w-8 h-8" />,
      color: 'from-[#433116] to-[#31200F]'
    }
  ];

  if (loading) {
    return (
      <Layout title="Helios" subtitle="Sun God's Dashboard" onBack={onBack}>
        <div className="flex items-center justify-center h-96">
          <div className="text-[#AF9469] cinzel-font text-xl animate-pulse">Loading divine insights...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Helios" subtitle="Sun God's Dashboard" onBack={onBack}>
      <div className="space-y-8 animate-fade-in">
        {/* Quote Section */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-8 text-center relative overflow-hidden">
          <div className="absolute top-4 left-4 text-[#AF9469]/20">
            <Sun className="w-16 h-16" />
          </div>
          <div className="absolute bottom-4 right-4 text-[#AF9469]/20">
            <Sun className="w-16 h-16" />
          </div>
          <div className="relative">
            <p className="cinzel-font text-2xl text-[#AF9469] italic leading-relaxed">
              "{randomQuote}"
            </p>
            <div className="flex justify-center gap-2 mt-6">
              <div className="w-12 h-px bg-[#AF9469]/30" />
              <Flame className="w-4 h-4 text-[#AF9469]" />
              <div className="w-12 h-px bg-[#AF9469]/30" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div
              key={card.title}
              className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6
                hover:border-[#AF9469] hover:shadow-[0_0_30px_rgba(175,148,105,0.3)]
                transition-all duration-500 hover:scale-105 group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${card.color} mb-4
                group-hover:scale-110 transition-transform duration-300`}>
                <div className="text-[#1F1207]">{card.icon}</div>
              </div>
              <h3 className="cinzel-font text-lg text-[#614F33] mb-2">{card.title}</h3>
              <p className="cinzel-font text-3xl font-bold text-[#AF9469] mb-1">{card.value}</p>
              <p className="cinzel-font text-sm text-[#553F1E]">{card.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6">
          <h2 className="cinzel-font text-2xl font-bold text-[#AF9469] mb-6 text-center">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: 'Track Habits', icon: '⭐', description: 'Visit Astrarium' },
              { name: 'Focus Session', icon: '⏳', description: 'Enter Elysium' },
              { name: 'Manage Tasks', icon: '⚒', description: 'The Forge' },
              { name: 'Write Journal', icon: '📜', description: 'Scrolls of Apollo' },
              { name: 'View Achievements', icon: '🏆', description: 'Mirror Pool' },
              { name: 'Set Goals', icon: '🎯', description: 'Divine Planning' }
            ].map((action, index) => (
              <button
                key={action.name}
                className="bg-[#553F1E]/50 hover:bg-[#614F33]/50 border border-[#614F33]
                  hover:border-[#AF9469] rounded-lg p-4 transition-all duration-300
                  hover:scale-105 text-center group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                  {action.icon}
                </div>
                <p className="cinzel-font text-[#AF9469] font-semibold mb-1">{action.name}</p>
                <p className="cinzel-font text-xs text-[#614F33]">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Daily Progress */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6">
          <h2 className="cinzel-font text-2xl font-bold text-[#AF9469] mb-4">Today's Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between cinzel-font text-sm text-[#614F33] mb-2">
                <span>Daily Habits</span>
                <span>{stats.completedToday} / {stats.totalHabits}</span>
              </div>
              <div className="w-full bg-[#1F1207] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#AF9469] to-[#614F33] transition-all duration-1000 rounded-full"
                  style={{ width: `${stats.totalHabits > 0 ? (stats.completedToday / stats.totalHabits) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between cinzel-font text-sm text-[#614F33] mb-2">
                <span>Tasks Complete</span>
                <span>{stats.completedTasks} / {stats.totalTasks}</span>
              </div>
              <div className="w-full bg-[#1F1207] rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#614F33] to-[#553F1E] transition-all duration-1000 rounded-full"
                  style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

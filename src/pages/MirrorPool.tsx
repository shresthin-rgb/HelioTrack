import { useEffect, useState } from 'react';
import { Trophy, Award, Star, Crown, Target, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase, type Achievement } from '../lib/supabase';

interface MirrorPoolProps {
  onBack: () => void;
}

interface AchievementTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
}

export default function MirrorPool({ onBack }: MirrorPoolProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    totalHabits: 0,
    totalCompletions: 0,
    totalFocusHours: 0,
    completedTasks: 0,
    journalEntries: 0,
    longestStreak: 0
  });
  const [loading, setLoading] = useState(true);

  const achievementTemplates: AchievementTemplate[] = [
    {
      type: 'first_habit',
      title: 'First Steps',
      description: 'Created your first habit',
      icon: 'star',
      threshold: 1
    },
    {
      type: 'habit_master',
      title: 'Habit Master',
      description: 'Track 5 different habits',
      icon: 'crown',
      threshold: 5
    },
    {
      type: 'week_warrior',
      title: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: 'target',
      threshold: 7
    },
    {
      type: 'dedication',
      title: 'Unwavering Dedication',
      description: 'Achieve a 30-day streak',
      icon: 'trophy',
      threshold: 30
    },
    {
      type: 'focus_beginner',
      title: 'Focus Initiate',
      description: 'Complete 10 hours of focus time',
      icon: 'zap',
      threshold: 10
    },
    {
      type: 'focus_master',
      title: 'Flow State Master',
      description: 'Complete 50 hours of focus time',
      icon: 'crown',
      threshold: 50
    },
    {
      type: 'task_completer',
      title: 'Task Conqueror',
      description: 'Complete 25 tasks',
      icon: 'award',
      threshold: 25
    },
    {
      type: 'chronicler',
      title: 'The Chronicler',
      description: 'Write 10 journal entries',
      icon: 'star',
      threshold: 10
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsResult, completionsResult, focusResult, tasksResult, journalResult, achievementsResult] =
        await Promise.all([
          supabase.from('habits').select('*').eq('archived', false),
          supabase.from('habit_completions').select('*'),
          supabase.from('focus_sessions').select('actual_minutes').eq('completed', true),
          supabase.from('tasks').select('completed'),
          supabase.from('journal_entries').select('id'),
          supabase.from('achievements').select('*')
        ]);

      const totalFocusMinutes = focusResult.data?.reduce((sum, s) => sum + s.actual_minutes, 0) || 0;
      const completedTasks = tasksResult.data?.filter(t => t.completed).length || 0;

      const newStats = {
        totalHabits: habitsResult.data?.length || 0,
        totalCompletions: completionsResult.data?.length || 0,
        totalFocusHours: Math.floor(totalFocusMinutes / 60),
        completedTasks,
        journalEntries: journalResult.data?.length || 0,
        longestStreak: 0
      };

      setStats(newStats);
      setAchievements(achievementsResult.data || []);

      await checkAndUnlockAchievements(newStats, achievementsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndUnlockAchievements = async (currentStats: typeof stats, existingAchievements: Achievement[]) => {
    const existingTypes = new Set(existingAchievements.map(a => a.achievement_type));
    const newAchievements: Partial<Achievement>[] = [];

    if (currentStats.totalHabits >= 1 && !existingTypes.has('first_habit')) {
      newAchievements.push({
        achievement_type: 'first_habit',
        title: 'First Steps',
        description: 'Created your first habit',
        icon: 'star'
      });
    }

    if (currentStats.totalHabits >= 5 && !existingTypes.has('habit_master')) {
      newAchievements.push({
        achievement_type: 'habit_master',
        title: 'Habit Master',
        description: 'Track 5 different habits',
        icon: 'crown'
      });
    }

    if (currentStats.totalFocusHours >= 10 && !existingTypes.has('focus_beginner')) {
      newAchievements.push({
        achievement_type: 'focus_beginner',
        title: 'Focus Initiate',
        description: 'Complete 10 hours of focus time',
        icon: 'zap'
      });
    }

    if (currentStats.totalFocusHours >= 50 && !existingTypes.has('focus_master')) {
      newAchievements.push({
        achievement_type: 'focus_master',
        title: 'Flow State Master',
        description: 'Complete 50 hours of focus time',
        icon: 'crown'
      });
    }

    if (currentStats.completedTasks >= 25 && !existingTypes.has('task_completer')) {
      newAchievements.push({
        achievement_type: 'task_completer',
        title: 'Task Conqueror',
        description: 'Complete 25 tasks',
        icon: 'award'
      });
    }

    if (currentStats.journalEntries >= 10 && !existingTypes.has('chronicler')) {
      newAchievements.push({
        achievement_type: 'chronicler',
        title: 'The Chronicler',
        description: 'Write 10 journal entries',
        icon: 'star'
      });
    }

    if (newAchievements.length > 0) {
      await supabase.from('achievements').insert(newAchievements);
      fetchData();
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      trophy: <Trophy className="w-12 h-12" />,
      award: <Award className="w-12 h-12" />,
      star: <Star className="w-12 h-12" />,
      crown: <Crown className="w-12 h-12" />,
      target: <Target className="w-12 h-12" />,
      zap: <Zap className="w-12 h-12" />
    };
    return icons[iconName] || <Trophy className="w-12 h-12" />;
  };

  const getProgress = (template: AchievementTemplate): number => {
    switch (template.type) {
      case 'first_habit':
      case 'habit_master':
        return Math.min((stats.totalHabits / template.threshold) * 100, 100);
      case 'focus_beginner':
      case 'focus_master':
        return Math.min((stats.totalFocusHours / template.threshold) * 100, 100);
      case 'task_completer':
        return Math.min((stats.completedTasks / template.threshold) * 100, 100);
      case 'chronicler':
        return Math.min((stats.journalEntries / template.threshold) * 100, 100);
      case 'week_warrior':
      case 'dedication':
        return Math.min((stats.longestStreak / template.threshold) * 100, 100);
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <Layout title="Mirror Pool" subtitle="Reflective Waters" onBack={onBack}>
        <div className="flex items-center justify-center h-96">
          <div className="text-[#AF9469] cinzel-font text-xl animate-pulse">Reflecting your glory...</div>
        </div>
      </Layout>
    );
  }

  const unlockedTypes = new Set(achievements.map(a => a.achievement_type));

  return (
    <Layout title="Mirror Pool" subtitle="Reflective Waters" onBack={onBack}>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Stats Overview */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-8 text-center">
          <h2 className="cinzel-font text-3xl font-bold text-[#AF9469] mb-6">Your Legacy</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="cinzel-font text-4xl font-bold text-[#AF9469]">{achievements.length}</p>
              <p className="cinzel-font text-sm text-[#614F33] mt-1">Achievements</p>
            </div>
            <div>
              <p className="cinzel-font text-4xl font-bold text-[#AF9469]">{stats.totalCompletions}</p>
              <p className="cinzel-font text-sm text-[#614F33] mt-1">Total Completions</p>
            </div>
            <div>
              <p className="cinzel-font text-4xl font-bold text-[#AF9469]">{stats.totalFocusHours}h</p>
              <p className="cinzel-font text-sm text-[#614F33] mt-1">Focus Time</p>
            </div>
            <div>
              <p className="cinzel-font text-4xl font-bold text-[#AF9469]">{stats.completedTasks}</p>
              <p className="cinzel-font text-sm text-[#614F33] mt-1">Tasks Done</p>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div>
          <h3 className="cinzel-font text-2xl font-bold text-[#AF9469] mb-6 text-center">
            Trophies of Excellence
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievementTemplates.map((template, index) => {
              const isUnlocked = unlockedTypes.has(template.type);
              const progress = getProgress(template);

              return (
                <div
                  key={template.type}
                  className={`bg-[#31200F]/80 backdrop-blur-sm border-2 rounded-lg p-6 transition-all duration-500
                    ${isUnlocked
                      ? 'border-[#AF9469] shadow-[0_0_30px_rgba(175,148,105,0.4)]'
                      : 'border-[#553F1E] opacity-60'
                    } hover:scale-105`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`flex justify-center mb-4 ${isUnlocked ? 'text-[#AF9469]' : 'text-[#553F1E]'}`}>
                    <div className={`p-4 rounded-full border-2 ${isUnlocked ? 'border-[#AF9469] bg-[#AF9469]/10' : 'border-[#553F1E]'}`}>
                      {getIconComponent(template.icon)}
                    </div>
                  </div>

                  <h4 className={`cinzel-font text-xl font-bold text-center mb-2
                    ${isUnlocked ? 'text-[#AF9469]' : 'text-[#614F33]'}`}>
                    {template.title}
                  </h4>

                  <p className="cinzel-font text-sm text-[#614F33] text-center mb-4">
                    {template.description}
                  </p>

                  {!isUnlocked && (
                    <div>
                      <div className="w-full bg-[#1F1207] rounded-full h-2 overflow-hidden mb-2">
                        <div
                          className="h-full bg-gradient-to-r from-[#553F1E] to-[#AF9469] transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="cinzel-font text-xs text-[#553F1E] text-center">
                        {Math.round(progress)}% Complete
                      </p>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="flex justify-center">
                      <div className="cinzel-font text-sm text-[#AF9469] font-semibold">
                        ✓ Unlocked
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

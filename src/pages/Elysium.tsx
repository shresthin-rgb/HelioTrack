import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

interface ElysiumProps {
  onBack: () => void;
}

export default function Elysium({ onBack }: ElysiumProps) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const fetchCompletedSessions = async () => {
    const { data } = await supabase
      .from('focus_sessions')
      .select('id')
      .eq('completed', true);
    setCompletedSessions(data?.length || 0);
  };

  const handleStart = async () => {
    if (!taskName.trim()) {
      alert('Please enter a task name');
      return;
    }

    if (!sessionId) {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          duration_minutes: duration,
          task_name: taskName,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!error && data) {
        setSessionId(data.id);
      }
    }

    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setSessionId(null);
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);

    if (sessionId) {
      const actualMinutes = duration;
      await supabase
        .from('focus_sessions')
        .update({
          completed: true,
          actual_minutes: actualMinutes,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      setCompletedSessions(prev => prev + 1);
    }

    setSessionId(null);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Layout title="Elysium" subtitle="Paradise Focus Realm" onBack={onBack}>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Session Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Sessions Today</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{completedSessions}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Current Duration</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{duration}m</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Clock className="w-8 h-8 text-[#AF9469] mx-auto mb-2 animate-pulse" />
            <p className="cinzel-font text-sm text-[#614F33]">Status</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{isRunning ? 'Focused' : 'Ready'}</p>
          </div>
        </div>

        {/* Main Timer */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-12 text-center relative overflow-hidden">
          {/* Progress Ring Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <svg className="w-96 h-96 transform -rotate-90">
              <circle
                cx="192"
                cy="192"
                r="180"
                stroke="#AF9469"
                strokeWidth="20"
                fill="none"
                strokeDasharray={`${progress * 11.31} 1131`}
                className="transition-all duration-1000"
              />
            </svg>
          </div>

          {/* Task Name Input */}
          <div className="mb-8 relative z-10">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="What are you focusing on?"
              disabled={isRunning}
              className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-6 py-3
                text-center text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none
                disabled:opacity-50 text-lg"
            />
          </div>

          {/* Timer Display */}
          <div className="relative z-10 mb-8">
            <div className="cinzel-font text-8xl font-bold text-[#AF9469] drop-shadow-[0_0_30px_rgba(175,148,105,0.5)]">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-16 h-px bg-[#AF9469]/30" />
              <div className="w-2 h-2 rounded-full bg-[#AF9469] animate-pulse" />
              <div className="w-16 h-px bg-[#AF9469]/30" />
            </div>
          </div>

          {/* Duration Selector */}
          {!isRunning && (
            <div className="mb-8 relative z-10">
              <p className="cinzel-font text-[#614F33] mb-4">Session Duration</p>
              <div className="flex justify-center gap-4">
                {[15, 25, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`cinzel-font px-6 py-2 rounded-lg border-2 transition-all duration-300
                      ${duration === mins
                        ? 'bg-[#AF9469] border-[#AF9469] text-[#1F1207]'
                        : 'bg-[#553F1E]/50 border-[#614F33] text-[#AF9469] hover:border-[#AF9469]'
                      }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-4 relative z-10">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="cinzel-font px-8 py-4 bg-[#AF9469] text-[#1F1207] rounded-lg
                  hover:bg-[#F5DEB3] transition-all duration-300 flex items-center gap-2
                  shadow-[0_0_30px_rgba(175,148,105,0.4)] hover:shadow-[0_0_50px_rgba(175,148,105,0.6)]
                  hover:scale-110 font-semibold text-lg"
              >
                <Play className="w-6 h-6" />
                Begin Focus
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className="cinzel-font px-8 py-4 bg-[#614F33] text-[#AF9469] rounded-lg
                    hover:bg-[#553F1E] transition-all duration-300 flex items-center gap-2
                    border-2 border-[#AF9469] hover:scale-105 font-semibold"
                >
                  <Pause className="w-6 h-6" />
                  Pause
                </button>
                <button
                  onClick={handleReset}
                  className="cinzel-font px-8 py-4 bg-[#31200F] text-[#AF9469] rounded-lg
                    hover:bg-[#1F1207] transition-all duration-300 flex items-center gap-2
                    border-2 border-[#553F1E] hover:border-[#AF9469] hover:scale-105 font-semibold"
                >
                  <RotateCcw className="w-6 h-6" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6">
          <h3 className="cinzel-font text-xl font-bold text-[#AF9469] mb-4 text-center">
            The Path to Deep Focus
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">🧘</div>
              <p className="cinzel-font text-[#614F33] text-sm">
                Eliminate distractions before beginning your session
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💧</div>
              <p className="cinzel-font text-[#614F33] text-sm">
                Keep water nearby to stay hydrated
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🌟</div>
              <p className="cinzel-font text-[#614F33] text-sm">
                Take breaks between sessions to recharge
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

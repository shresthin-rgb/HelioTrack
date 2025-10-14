import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Flame, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase, type Task } from '../lib/supabase';

interface TheForgeProps {
  onBack: () => void;
}

export default function TheForge({ onBack }: TheForgeProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('general');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: newTaskTitle,
        description: newTaskDescription,
        priority: newTaskPriority,
        category: newTaskCategory
      })
      .select()
      .single();

    if (!error && data) {
      setTasks(prev => [data, ...prev]);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskCategory('general');
      setShowAddForm(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const updatedTask = {
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null
    };

    await supabase
      .from('tasks')
      .update(updatedTask)
      .eq('id', task.id);

    fetchTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-[#AF9469] border-[#AF9469]';
      case 'medium':
        return 'text-[#614F33] border-[#614F33]';
      case 'low':
        return 'text-[#553F1E] border-[#553F1E]';
      default:
        return 'text-[#614F33] border-[#614F33]';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Flame className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length
  };

  if (loading) {
    return (
      <Layout title="The Forge" subtitle="Hephaestus's Workshop" onBack={onBack}>
        <div className="flex items-center justify-center h-96">
          <div className="text-[#AF9469] cinzel-font text-xl animate-pulse">Stoking the flames...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="The Forge" subtitle="Hephaestus's Workshop" onBack={onBack}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <p className="cinzel-font text-sm text-[#614F33]">Total Tasks</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{stats.total}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <p className="cinzel-font text-sm text-[#614F33]">Active</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{stats.active}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <p className="cinzel-font text-sm text-[#614F33]">Completed</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{stats.completed}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Flame className="w-6 h-6 text-[#AF9469] mx-auto" />
            <p className="cinzel-font text-sm text-[#614F33]">High Priority</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{stats.high}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-2">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`cinzel-font flex-1 py-2 rounded-lg transition-all duration-300 capitalize
                ${filter === f
                  ? 'bg-[#AF9469] text-[#1F1207] font-semibold'
                  : 'text-[#AF9469] hover:bg-[#553F1E]/50'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full cinzel-font py-4 bg-[#AF9469] text-[#1F1207] rounded-lg
              hover:bg-[#F5DEB3] transition-all duration-300 flex items-center justify-center gap-2
              shadow-[0_0_20px_rgba(175,148,105,0.3)] hover:shadow-[0_0_40px_rgba(175,148,105,0.5)]
              font-semibold text-lg"
          >
            <Plus className="w-6 h-6" />
            Forge New Task
          </button>
        )}

        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#AF9469] rounded-lg p-6 animate-fade-in">
            <h3 className="cinzel-font text-xl font-bold text-[#AF9469] mb-4">Craft Your Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none"
              />

              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Description (optional)..."
                rows={3}
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none resize-none"
              />

              <div>
                <label className="cinzel-font text-sm text-[#614F33] mb-2 block">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTaskPriority(p)}
                      className={`cinzel-font px-4 py-2 rounded-lg border-2 capitalize transition-all duration-300
                        ${newTaskPriority === p
                          ? 'bg-[#AF9469] border-[#AF9469] text-[#1F1207]'
                          : 'bg-[#553F1E]/50 border-[#614F33] text-[#AF9469] hover:border-[#AF9469]'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="cinzel-font text-sm text-[#614F33] mb-2 block">Category</label>
                <input
                  type="text"
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  placeholder="e.g., work, personal, health..."
                  className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                    text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAddTask}
                  className="cinzel-font flex-1 py-3 bg-[#AF9469] text-[#1F1207] rounded-lg
                    hover:bg-[#F5DEB3] transition-all duration-300 font-semibold"
                >
                  Forge Task
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

        {/* Tasks List */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-12 text-center">
              <Flame className="w-16 h-16 text-[#553F1E] mx-auto mb-4" />
              <p className="cinzel-font text-[#614F33] text-lg">
                {filter === 'all' ? 'No tasks yet. Forge your first task above.' :
                 filter === 'active' ? 'No active tasks. You\'re all caught up!' :
                 'No completed tasks yet.'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`bg-[#31200F]/80 backdrop-blur-sm border-2 rounded-lg p-5
                  transition-all duration-300 group
                  ${task.completed
                    ? 'border-[#553F1E] opacity-60'
                    : 'border-[#553F1E] hover:border-[#AF9469]'
                  }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="text-[#AF9469] hover:scale-110 transition-transform mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-7 h-7 fill-current" />
                    ) : (
                      <Circle className="w-7 h-7" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`cinzel-font text-lg font-semibold
                          ${task.completed ? 'text-[#614F33] line-through' : 'text-[#AF9469]'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="cinzel-font text-sm text-[#614F33] mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-[#553F1E] hover:text-[#AF9469] transition-colors opacity-0
                          group-hover:opacity-100 duration-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className={`cinzel-font text-xs px-3 py-1 rounded-full border
                        ${getPriorityColor(task.priority)} flex items-center gap-1 capitalize`}>
                        {getPriorityIcon(task.priority)}
                        {task.priority}
                      </div>
                      <div className="cinzel-font text-xs px-3 py-1 rounded-full bg-[#553F1E]/30
                        text-[#614F33] capitalize">
                        {task.category}
                      </div>
                      {task.completed_at && (
                        <div className="cinzel-font text-xs text-[#553F1E] italic">
                          Completed {new Date(task.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6">
            <div className="flex justify-between cinzel-font text-sm text-[#614F33] mb-2">
              <span>Overall Progress</span>
              <span>{stats.completed} / {stats.total} tasks</span>
            </div>
            <div className="w-full bg-[#1F1207] rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#AF9469] to-[#614F33] transition-all duration-1000 rounded-full
                  flex items-center justify-end pr-2"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              >
                {stats.completed > 0 && (
                  <span className="cinzel-font text-xs text-[#1F1207] font-bold">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Scroll } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase, type JournalEntry } from '../lib/supabase';

interface ScrollsOfApolloProps {
  onBack: () => void;
}

export default function ScrollsOfApollo({ onBack }: ScrollsOfApolloProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(true);

  const moods = ['😊 Happy', '😌 Calm', '🤔 Thoughtful', '💪 Motivated', '😔 Reflective', '😴 Tired'];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await supabase
        .from('journal_entries')
        .select('*')
        .order('entry_date', { ascending: false });

      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      if (editingEntry) {
        await supabase
          .from('journal_entries')
          .update({
            title,
            content,
            mood,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEntry.id);
      } else {
        await supabase
          .from('journal_entries')
          .insert({
            title,
            content,
            mood: mood || null,
            entry_date: new Date().toISOString().split('T')[0]
          });
      }

      resetEditor();
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood || '');
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    await supabase.from('journal_entries').delete().eq('id', id);
    fetchEntries();
  };

  const resetEditor = () => {
    setShowEditor(false);
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setMood('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout title="Scrolls of Apollo" subtitle="Temple of Knowledge" onBack={onBack}>
        <div className="flex items-center justify-center h-96">
          <div className="text-[#AF9469] cinzel-font text-xl animate-pulse">Unfurling ancient scrolls...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Scrolls of Apollo" subtitle="Temple of Knowledge" onBack={onBack}>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Scroll className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Total Scrolls</p>
            <p className="cinzel-font text-2xl font-bold text-[#AF9469]">{entries.length}</p>
          </div>
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-4 text-center">
            <Edit className="w-8 h-8 text-[#AF9469] mx-auto mb-2" />
            <p className="cinzel-font text-sm text-[#614F33]">Latest Entry</p>
            <p className="cinzel-font text-lg font-bold text-[#AF9469]">
              {entries.length > 0 ? formatDate(entries[0].entry_date) : 'None yet'}
            </p>
          </div>
        </div>

        {/* New Entry Button */}
        {!showEditor && (
          <button
            onClick={() => setShowEditor(true)}
            className="w-full cinzel-font py-4 bg-[#AF9469] text-[#1F1207] rounded-lg
              hover:bg-[#F5DEB3] transition-all duration-300 flex items-center justify-center gap-2
              shadow-[0_0_20px_rgba(175,148,105,0.3)] hover:shadow-[0_0_40px_rgba(175,148,105,0.5)]
              font-semibold text-lg"
          >
            <Plus className="w-6 h-6" />
            Write New Entry
          </button>
        )}

        {/* Editor */}
        {showEditor && (
          <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#AF9469] rounded-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="cinzel-font text-2xl font-bold text-[#AF9469]">
                {editingEntry ? 'Edit Entry' : 'New Entry'}
              </h3>
              <button
                onClick={resetEditor}
                className="text-[#AF9469] hover:text-[#F5DEB3] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title..."
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none text-xl"
              />

              <div>
                <label className="cinzel-font text-sm text-[#614F33] mb-2 block">Mood (Optional)</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {moods.map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`cinzel-font px-3 py-2 rounded-lg border-2 text-sm transition-all duration-300
                        ${mood === m
                          ? 'bg-[#AF9469] border-[#AF9469] text-[#1F1207]'
                          : 'bg-[#553F1E]/50 border-[#614F33] text-[#AF9469] hover:border-[#AF9469]'
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Begin your reflection..."
                rows={12}
                className="cinzel-font w-full bg-[#1F1207] border-2 border-[#553F1E] rounded-lg px-4 py-3
                  text-[#AF9469] placeholder-[#553F1E] focus:border-[#AF9469] focus:outline-none resize-none
                  leading-relaxed"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="cinzel-font flex-1 py-3 bg-[#AF9469] text-[#1F1207] rounded-lg
                    hover:bg-[#F5DEB3] transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Entry
                </button>
                <button
                  onClick={resetEditor}
                  className="cinzel-font px-6 py-3 bg-[#553F1E] text-[#AF9469] rounded-lg
                    hover:bg-[#614F33] transition-all duration-300 border-2 border-[#614F33]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-12 text-center">
              <Scroll className="w-16 h-16 text-[#553F1E] mx-auto mb-4" />
              <p className="cinzel-font text-[#614F33] text-lg">
                No entries yet. Begin your journey of reflection above.
              </p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E] rounded-lg p-6
                  hover:border-[#AF9469] transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="cinzel-font text-2xl font-semibold text-[#AF9469]">
                        {entry.title}
                      </h3>
                      {entry.mood && (
                        <span className="cinzel-font text-sm bg-[#553F1E]/50 px-3 py-1 rounded-full text-[#AF9469]">
                          {entry.mood}
                        </span>
                      )}
                    </div>
                    <p className="cinzel-font text-sm text-[#614F33] italic">
                      {formatDate(entry.entry_date)}
                    </p>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-[#AF9469] hover:text-[#F5DEB3] transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-[#553F1E] hover:text-[#AF9469] transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="w-16 h-px bg-[#AF9469]/30 mb-4" />

                <p className="cinzel-font text-[#614F33] leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.updated_at !== entry.created_at && (
                  <p className="cinzel-font text-xs text-[#553F1E] italic mt-4">
                    Last updated: {formatDate(entry.updated_at)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack: () => void;
}

export default function Layout({ children, title, subtitle, onBack }: LayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/Untitled.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F1207]/90 via-[#31200F]/85 to-[#1F1207]/90" />
      </div>

      {/* Particles */}
      <div className="particles-container fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#553F1E]/50 bg-[#1F1207]/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
            <button
              onClick={onBack}
              className="cinzel-font flex items-center gap-2 text-[#AF9469] hover:text-[#F5DEB3] transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Return</span>
            </button>

            <div className="text-center flex-1">
              <h1 className="cinzel-font text-3xl md:text-4xl font-bold text-[#AF9469] tracking-wider">
                {title}
              </h1>
              {subtitle && (
                <p className="cinzel-font text-sm text-[#614F33] mt-1 italic">{subtitle}</p>
              )}
            </div>

            <div className="w-24" />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

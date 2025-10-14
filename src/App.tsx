import { useState } from 'react';
import { Sun, Clock, Star, Trophy, Scroll, Hammer } from 'lucide-react';
import Helios from './pages/Helios';
import Elysium from './pages/Elysium';
import Astrarium from './pages/Astrarium';
import MirrorPool from './pages/MirrorPool';
import ScrollsOfApollo from './pages/ScrollsOfApollo';
import TheForge from './pages/TheForge';

interface FeatureCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  description: string;
}

type PageType = 'landing' | 'cards' | 'helios' | 'elysium' | 'astrarium' | 'mirror-pool' | 'scrolls' | 'forge';

const features: FeatureCard[] = [
  {
    id: 'helios',
    title: 'Helios',
    subtitle: 'Northern Island',
    icon: <Sun className="w-12 h-12" />,
    description: 'Sun God\'s Dashboard'
  },
  {
    id: 'elysium',
    title: 'Elysium',
    subtitle: 'Paradise Realm',
    icon: <Clock className="w-12 h-12" />,
    description: 'Focus Mode Timer'
  },
  {
    id: 'astrarium',
    title: 'Astrarium',
    subtitle: 'Celestial Observatory',
    icon: <Star className="w-12 h-12" />,
    description: 'Daily Habit Tracker'
  },
  {
    id: 'mirror-pool',
    title: 'The Mirror Pool',
    subtitle: 'Reflective Waters',
    icon: <Trophy className="w-12 h-12" />,
    description: 'Achievements & Milestones'
  },
  {
    id: 'scrolls',
    title: 'Scrolls of Apollo',
    subtitle: 'Temple of Knowledge',
    icon: <Scroll className="w-12 h-12" />,
    description: 'Journaling'
  },
  {
    id: 'forge',
    title: 'The Forge',
    subtitle: 'Hephaestus\'s Workshop',
    icon: <Hammer className="w-12 h-12" />,
    description: 'To-Do List'
  }
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleCardClick = (featureId: string) => {
    setCurrentPage(featureId as PageType);
  };

  if (currentPage === 'helios') {
    return <Helios onBack={() => navigateTo('cards')} />;
  }

  if (currentPage === 'elysium') {
    return <Elysium onBack={() => navigateTo('cards')} />;
  }

  if (currentPage === 'astrarium') {
    return <Astrarium onBack={() => navigateTo('cards')} />;
  }

  if (currentPage === 'mirror-pool') {
    return <MirrorPool onBack={() => navigateTo('cards')} />;
  }

  if (currentPage === 'scrolls') {
    return <ScrollsOfApollo onBack={() => navigateTo('cards')} />;
  }

  if (currentPage === 'forge') {
    return <TheForge onBack={() => navigateTo('cards')} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/Untitled.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F1207]/60 via-[#31200F]/40 to-[#1F1207]/80" />
      </div>

      {/* Animated Particles */}
      <div className="particles-container fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
        {currentPage === 'landing' ? (
          // Landing Page
          <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="text-center space-y-8 animate-fade-in">
              {/* Decorative Border Top */}
              <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#AF9469] to-transparent mx-auto mb-12" />

              {/* Title */}
              <h1 className="cinzel-font text-7xl md:text-9xl font-bold text-[#AF9469] tracking-wider drop-shadow-[0_0_30px_rgba(175,148,105,0.5)] animate-glow">
                HelioTrack
              </h1>

              {/* Subtitle */}
              <p className="cinzel-font text-2xl md:text-3xl text-[#AF9469]/90 tracking-wide italic">
                Forge Your Path to Greatness
              </p>

              {/* Greek Pattern Divider */}
              <div className="flex items-center justify-center gap-4 py-6">
                <div className="w-16 h-px bg-[#AF9469]/50" />
                <div className="w-2 h-2 rotate-45 border-2 border-[#AF9469]" />
                <div className="w-2 h-2 rotate-45 border-2 border-[#AF9469]" />
                <div className="w-2 h-2 rotate-45 border-2 border-[#AF9469]" />
                <div className="w-16 h-px bg-[#AF9469]/50" />
              </div>

              {/* Description */}
              <p className="cinzel-font text-lg md:text-xl text-[#614F33] max-w-2xl mx-auto leading-relaxed">
                Journey through ancient realms where gods and mortals unite.
                <br />
                Build habits worthy of legend.
              </p>

              {/* Enter Button */}
              <button
                onClick={() => navigateTo('cards')}
                className="cinzel-font mt-12 px-12 py-4 text-xl font-semibold text-[#1F1207] bg-[#AF9469]
                  hover:bg-[#614F33] hover:text-[#AF9469] transition-all duration-500
                  border-2 border-[#370E00] shadow-[0_0_30px_rgba(175,148,105,0.3)]
                  hover:shadow-[0_0_50px_rgba(175,148,105,0.6)] hover:scale-110
                  tracking-wider relative group overflow-hidden"
              >
                <span className="relative z-10">Enter the Realm</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                  translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>

              {/* Decorative Border Bottom */}
              <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#AF9469] to-transparent mx-auto mt-12" />
            </div>

            {/* Greek Columns Decoration */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20">
              <div className="w-16 h-96 border-l-4 border-r-4 border-[#AF9469] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 border-4 border-[#AF9469]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 border-4 border-[#AF9469]" />
              </div>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
              <div className="w-16 h-96 border-l-4 border-r-4 border-[#AF9469] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 border-4 border-[#AF9469]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 border-4 border-[#AF9469]" />
              </div>
            </div>
          </div>
        ) : (
          // Feature Cards Page
          <div className="min-h-screen py-20 px-4">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="cinzel-font text-5xl md:text-6xl font-bold text-[#AF9469] tracking-wider mb-4 drop-shadow-[0_0_20px_rgba(175,148,105,0.5)]">
                Choose Your Path
              </h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="w-24 h-px bg-[#AF9469]/50" />
                <div className="w-2 h-2 rotate-45 border-2 border-[#AF9469]" />
                <div className="w-24 h-px bg-[#AF9469]/50" />
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => handleCardClick(feature.id)}
                  className="feature-card group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-full bg-[#31200F]/80 backdrop-blur-sm border-2 border-[#553F1E]
                    rounded-lg p-8 transition-all duration-500 hover:border-[#AF9469]
                    hover:shadow-[0_0_40px_rgba(175,148,105,0.4)] hover:scale-105 hover:-rotate-1
                    overflow-hidden"
                  >
                    {/* Card Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#AF9469]/0 via-[#AF9469]/0 to-[#AF9469]/0
                      group-hover:from-[#AF9469]/10 group-hover:via-[#AF9469]/5 transition-all duration-500" />

                    {/* Icon */}
                    <div className="relative mb-6 flex justify-center">
                      <div className="p-4 rounded-full bg-[#553F1E]/50 border-2 border-[#614F33]
                        group-hover:border-[#AF9469] group-hover:bg-[#614F33]/50 transition-all duration-500
                        group-hover:scale-110 group-hover:rotate-12 text-[#AF9469]">
                        {feature.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="cinzel-font text-3xl font-bold text-[#AF9469] text-center mb-2
                      group-hover:text-[#F5DEB3] transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="cinzel-font text-sm text-[#614F33] text-center mb-4 italic">
                      {feature.subtitle}
                    </p>

                    {/* Divider */}
                    <div className="flex justify-center gap-2 mb-4">
                      <div className="w-8 h-px bg-[#AF9469]/30" />
                      <div className="w-1 h-1 rounded-full bg-[#AF9469]/50" />
                      <div className="w-8 h-px bg-[#AF9469]/30" />
                    </div>

                    {/* Description */}
                    <p className="cinzel-font text-[#AF9469]/80 text-center text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover Arrow */}
                    <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="text-[#AF9469] animate-bounce">→</div>
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-[#614F33]
                      group-hover:border-[#AF9469] transition-colors duration-300" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-[#614F33]
                      group-hover:border-[#AF9469] transition-colors duration-300" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-[#614F33]
                      group-hover:border-[#AF9469] transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-[#614F33]
                      group-hover:border-[#AF9469] transition-colors duration-300" />
                  </div>
                </div>
              ))}
            </div>

            {/* Back Button */}
            <div className="flex justify-center mt-16">
              <button
                onClick={() => navigateTo('landing')}
                className="cinzel-font px-8 py-3 text-lg text-[#AF9469] border-2 border-[#AF9469]
                  hover:bg-[#AF9469] hover:text-[#1F1207] transition-all duration-500
                  hover:scale-105 tracking-wider"
              >
                ← Return to Gateway
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

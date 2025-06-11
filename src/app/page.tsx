import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dim/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '8s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-20">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo */}
            <div className="mb-12 animate-scale-in">
              <div className="inline-flex items-center justify-center w-28 h-28 mb-8 glass-premium rounded-3xl animate-pulse-glow">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24">
                  <path 
                    stroke="url(#gradient-icon)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                  />
                  <defs>
                    <linearGradient id="gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00E5A0" />
                      <stop offset="100%" stopColor="#00B37D" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient">Scan</span>{' '}
              <span className="text-white/80">&</span>{' '}
              <span className="text-gradient">Speak</span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-3xl text-secondary mb-8 animate-fade-in animation-delay-200">
              The Future of Multilingual Shopping
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-secondary mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in animation-delay-300">
              Revolutionary AI assistant that understands and responds in{' '}
              <span className="text-primary font-semibold">100+ languages</span>{' '}
              automatically. No setup, no language selection — just speak naturally.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-fade-in animation-delay-500">
              <Link
                href="/voice"
                className="btn-primary text-lg min-w-[240px] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Voice Assistant
              </Link>
              
              <Link
                href="/chat"
                className="btn-secondary text-lg min-w-[240px] flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Try Text Chat
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-fade-in animation-delay-700">
              {[
                {
                  icon: (
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24">
                      <path stroke="url(#gradient-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      <defs>
                        <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00E5A0" />
                          <stop offset="100%" stopColor="#00B37D" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                  title: "100+ Languages",
                  description: "Automatic detection and response in your native language"
                },
                {
                  icon: (
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24">
                      <path stroke="url(#gradient-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      <defs>
                        <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00E5A0" />
                          <stop offset="100%" stopColor="#00B37D" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                  title: "Instant Response",
                  description: "Real-time AI processing with sub-second response times"
                },
                {
                  icon: (
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24">
                      <path stroke="url(#gradient-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      <defs>
                        <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#00E5A0" />
                          <stop offset="100%" stopColor="#00B37D" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                  title: "Smart Recognition",
                  description: "Advanced voice and text understanding with context awareness"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="feature-card group"
                >
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-secondary leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Navigation />
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollProgress((currentScroll / totalScroll) * 100);
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px' }
    );

    // Observe all scroll-animate elements after a short delay to ensure DOM is ready
    setTimeout(() => {
      document.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    }, 100);

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 opacity-0 animate-fade-in-down animation-delay-1000">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full px-6 py-3 flex gap-6 shadow-2xl">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Home
          </button>
          <button 
            onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            How It Works
          </button>
          <button 
            onClick={() => techRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Technology
          </button>
          <button 
            onClick={() => navigate('/demo')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
          >
            Demo
          </button>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-indigo-400 rounded-full opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl transform hover:scale-110 transition-transform duration-300 ring-4 ring-indigo-500/20">
              <span className="text-6xl">🤰</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 animate-fade-in-up">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              Access.ai
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-2xl sm:text-3xl lg:text-4xl text-indigo-200 font-semibold mb-6 animate-fade-in-up animation-delay-200">
            Your AI-Powered Companion Throughout Pregnancy
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
            Empowering expectant mothers with real-time AI assistance for health, nutrition, wellness, and safe commuting. 
            Experience the future of pregnancy care through natural voice conversations powered by Google Gemini AI.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12 animate-fade-in-up animation-delay-600">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">24/7</div>
              <div className="text-sm text-slate-400">AI Support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-slate-400">Voice-First</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">6</div>
              <div className="text-sm text-slate-400">Core Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">∞</div>
              <div className="text-sm text-slate-400">Possibilities</div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto" ref={featuresRef}>
            {[
              { 
                icon: '🥗', 
                title: 'Nutrition Guidance', 
                desc: 'Safe food choices, meal planning, and dietary recommendations tailored to your trimester',
                color: 'from-emerald-500 to-teal-600'
              },
              { 
                icon: '🏥', 
                title: 'Health Support', 
                desc: 'Medical information, symptom tracking, and instant access to emergency contacts',
                color: 'from-red-500 to-pink-600'
              },
              { 
                icon: '🧘', 
                title: 'Wellness Care', 
                desc: 'Exercise routines, sleep tips, mental health support, and guided breathing exercises',
                color: 'from-purple-500 to-indigo-600'
              },
              { 
                icon: '👶', 
                title: 'Baby Preparation', 
                desc: 'Hospital bag checklists, nursery planning, name suggestions, and registry guidance',
                color: 'from-pink-500 to-rose-600'
              },
              { 
                icon: '🚌', 
                title: 'Smart Commute', 
                desc: 'Safe route planning, real-time transit info, and accessibility-focused navigation',
                color: 'from-blue-500 to-cyan-600'
              },
              { 
                icon: '🎤', 
                title: 'Voice First', 
                desc: 'Natural conversations, hands-free operation, and real-time transcriptions',
                color: 'from-violet-500 to-purple-600'
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="scroll-animate opacity-0 group bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 text-left shadow-2xl hover:shadow-indigo-500/20 hover:bg-slate-800/70 transition-all duration-500 cursor-pointer border border-slate-700/50 hover:border-indigo-500/50 transform hover:-translate-y-2 hover:scale-105"
                style={{ 
                  animationDelay: `${800 + index * 100}ms`,
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className={`w-16 h-16 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                <div className="mt-4 h-1 w-0 group-hover:w-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-6 animate-fade-in-up animation-delay-1200">
            <button
              onClick={() => navigate('/demo')}
              className="group relative px-12 py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-2xl font-bold rounded-3xl shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-110 transition-all duration-500 overflow-hidden ring-4 ring-indigo-500/20 hover:ring-indigo-400/40"
            >
              <span className="relative z-10 flex items-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 animate-pulse-slow">
                  <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                  <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                </svg>
                <span className="relative">
                  Try Live Demo
                  <span className="absolute -top-2 -right-12 text-xs bg-pink-500 text-white px-2 py-1 rounded-full animate-bounce-subtle">Free</span>
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300">
                  <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {/* Animated shine effect */}
              <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"></div>
            </button>
            
            <p className="text-slate-400 text-sm animate-fade-in-up animation-delay-1000">
              ✨ No signup required • Voice-enabled • Available 24/7
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-indigo-400">
            <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div ref={howItWorksRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-xl border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-animate opacity-0">
            <div className="inline-block mb-4">
              <span className="text-indigo-400 text-sm font-bold uppercase tracking-wider bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                Simple Process
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Experience the simplicity of AI-powered pregnancy support in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                number: 1,
                title: 'Click & Speak',
                description: 'Simply tap the microphone button and start speaking naturally. Ask any question about your pregnancy, health, nutrition, or commute needs—just like talking to a trusted friend.',
                gradient: 'from-indigo-600 to-purple-600'
              },
              {
                number: 2,
                title: 'AI Understands',
                description: 'Our advanced AI, powered by Google Gemini\'s multimodal capabilities, comprehends your unique context and provides personalized, evidence-based guidance tailored to your pregnancy stage.',
                gradient: 'from-purple-600 to-pink-600'
              },
              {
                number: 3,
                title: 'Get Support',
                description: 'Receive instant, actionable answers with real-time voice responses and visual transcriptions. Access maps, emergency contacts, breathing exercises, and more—all hands-free.',
                gradient: 'from-pink-600 to-red-600'
              }
            ].map((step, index) => (
              <div key={index} className="relative group scroll-animate opacity-0" style={{ transitionDelay: `${index * 200}ms` }}>
                <div className={`absolute inset-0 bg-gradient-to-r ${step.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                  <div className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl ring-4 ring-indigo-500/20 transform group-hover:rotate-12 transition-all duration-500`}>
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 text-center group-hover:text-indigo-300 transition-colors">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-center">
                    {step.description}
                  </p>
                  {/* Connecting line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 -right-6 w-12 h-1 bg-gradient-to-r from-slate-700 to-transparent"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div ref={techRef} className="relative py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 scroll-animate opacity-0">
            <div className="inline-block mb-4">
              <span className="text-indigo-400 text-sm font-bold uppercase tracking-wider bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
                Powered by AI
              </span>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Advanced Technology
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Built on Google's state-of-the-art Gemini 2.5 Flash model with native audio understanding
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {[
                {
                  icon: <><path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" /><path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" /></>,
                  title: 'Natural Voice Processing',
                  description: 'Real-time speech recognition and synthesis for seamless conversations',
                  gradient: 'from-indigo-500 to-purple-600'
                },
                {
                  icon: <><path d="M16.5 7.5h-9v9h9v-9z" /><path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75z" clipRule="evenodd" /></>,
                  title: 'Multimodal Intelligence',
                  description: 'Processes voice, text, and contextual data simultaneously for accurate responses',
                  gradient: 'from-purple-500 to-pink-600'
                },
                {
                  icon: <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />,
                  title: 'Google Gemini 2.5 Flash',
                  description: 'Latest generation AI model with native audio processing capabilities',
                  gradient: 'from-pink-500 to-red-600'
                },
                {
                  icon: <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />,
                  title: 'Privacy-Focused',
                  description: 'Your conversations are processed securely with enterprise-grade encryption',
                  gradient: 'from-emerald-500 to-teal-600'
                }
              ].map((feature, index) => (
                <div key={index} className="flex gap-4 items-start group scroll-animate opacity-0 hover:scale-105 transition-all duration-500" style={{ transitionDelay: `${index * 150}ms` }}>
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 ring-4 ring-indigo-500/10`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                      {feature.icon}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative scroll-animate opacity-0" style={{ transitionDelay: '600ms' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-12 transform hover:scale-105 transition-all duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
                    <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="text-slate-300">Real-time processing...</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <div className="text-indigo-400 text-sm mb-2">User:</div>
                    <div className="text-white">"Can I eat sushi during pregnancy?"</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <div className="text-purple-400 text-sm mb-2">Access.ai:</div>
                    <div className="text-slate-300">"While some types of sushi are safe during pregnancy, it's important to avoid raw fish due to potential mercury content and bacterial risks. Cooked sushi options like California rolls or vegetable rolls are great alternatives..."</div>
                  </div>
                  <div className="flex gap-2 justify-center animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="scroll-animate opacity-0" style={{ transitionDelay: '0ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform hover:rotate-12 transition-all duration-500">
                  <span className="text-2xl">🤰</span>
                </div>
                <span className="text-2xl font-bold text-white">Access.ai</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Empowering expectant mothers with AI-powered support and guidance throughout their pregnancy journey.
              </p>
            </div>

            <div className="scroll-animate opacity-0" style={{ transitionDelay: '150ms' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Features
                <span className="text-indigo-400">✨</span>
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">🥗 Nutrition Guidance</li>
                <li className="hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">🏥 Health Support</li>
                <li className="hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">🧘 Wellness Care</li>
                <li className="hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">👶 Baby Preparation</li>
                <li className="hover:text-indigo-400 hover:translate-x-1 transition-all duration-300 cursor-pointer">🚌 Smart Commute</li>
              </ul>
            </div>

            <div className="scroll-animate opacity-0" style={{ transitionDelay: '300ms' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                Technology
                <span className="text-purple-400">⚡</span>
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li className="hover:text-purple-400 hover:translate-x-1 transition-all duration-300">Powered by Google Gemini 2.5 Flash</li>
                <li className="hover:text-purple-400 hover:translate-x-1 transition-all duration-300">Native Audio Processing</li>
                <li className="hover:text-purple-400 hover:translate-x-1 transition-all duration-300">Real-time Voice Recognition</li>
                <li className="hover:text-purple-400 hover:translate-x-1 transition-all duration-300">Multimodal AI</li>
                <li className="hover:text-purple-400 hover:translate-x-1 transition-all duration-300">Privacy-Focused Design</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center scroll-animate opacity-0" style={{ transitionDelay: '450ms' }}>
            <p className="text-slate-400 mb-2">
              Built with ❤️ for hackathon
            </p>
            <p className="text-sm text-slate-500">
              © 2025 Access.ai. Empowering pregnancy journeys with AI technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

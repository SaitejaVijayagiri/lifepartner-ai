'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Video, Heart, Shield, Sparkles, Smartphone, Users, Play, Star, CheckCircle, Zap, BrainCircuit, Fingerprint, MessageCircle, ShieldCheck, Lock, Award, Gift } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 relative scroll-smooth">

      {/* Noise Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate;
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .glass-card:hover {
            background: rgba(255, 255, 255, 0.85);
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              <Sparkles size={18} fill="white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight">
              LifePartner AI
            </span>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {['Success Stories', 'How it Works'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors tracking-wide">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors hidden md:block">
              Log In
            </Link>
            <Link href="/register">
              <button className="group relative px-6 py-2.5 font-bold text-white rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95">
                <span className="relative flex items-center gap-2 text-sm uppercase tracking-wide">Get Started <ArrowRight size={14} /></span>
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Pastel Aurora Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-[10%] right-[-20%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-left relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 text-indigo-700 text-xs font-bold mb-8 shadow-sm backdrop-blur-md uppercase tracking-widest hover:shadow-md transition-all cursor-default">
              <Sparkles size={12} className="text-indigo-500" />
              <span>Next-Gen Matchmaking</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-gray-900 mb-8 leading-[0.95]">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse-slow">
                Forever.
              </span>
            </h1>

            <p className="text-xl text-gray-600 max-w-xl mb-12 leading-relaxed font-light">
              Experience the future of matrimony. Our <span className="font-semibold text-indigo-700">AI-driven algorithm</span> connects you with compatible partners based on deep personality insights, values, and life goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/register">
                <button className="relative h-14 px-10 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 overflow-hidden group">
                  <span className="relative flex items-center gap-2">Join the Future <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                </button>
              </Link>
              <Link href="#features">
                <button className="h-14 px-10 rounded-full bg-white border border-gray-200 text-gray-800 font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
                  Explore Features
                </button>
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center overflow-hidden hover:z-10 hover:scale-110 transition-transform duration-300">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 25}`} alt="User" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 uppercase">
                  +2k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-500 mb-1 gap-0.5"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /></div>
                <span className="text-sm text-gray-500 font-medium">TrustScore 4.9/5</span>
              </div>
            </div>
          </div>

          {/* ORBITAL HERO VISUAL */}
          <div className="relative h-[700px] w-full flex items-center justify-center hidden lg:flex perspective-1000">
            {/* Central Core */}
            <div className="w-64 h-64 bg-indigo-200/40 rounded-full blur-[60px] absolute animate-pulse"></div>

            <div className="w-80 h-80 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center relative z-20 p-3 ring-1 ring-white/60 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden relative group border-4 border-white">
                <img
                  src="/images/orbital.jpg"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt="Matched Profile"
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-max">
                  <div className="bg-white/90 backdrop-blur-md border border-white/50 text-gray-800 px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                    <span className="text-pink-500 animate-pulse">❤️</span> 98% Compatible
                  </div>
                </div>
              </div>
            </div>

            {/* Orbit Rings */}
            <div className="absolute w-[500px] h-[500px] border border-gray-200/80 rounded-full animate-[spin_40s_linear_infinite]">
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-500 rounded-full shadow-lg border-2 border-white"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center animate-[spin_30s_linear_infinite]">
              <div className="absolute w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-xl border border-pink-100" style={{ transform: 'translate(260px) rotate(-90deg)' }}>
                <Heart fill="currentColor" size={24} className="opacity-80" />
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center animate-[spin_35s_linear_infinite_reverse]">
              <div className="absolute w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl border border-indigo-100" style={{ transform: 'translate(320px) rotate(10deg)' }}>
                <Bot size={28} />
              </div>
              <div className="absolute w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-xl border border-green-100" style={{ transform: 'translate(-320px) rotate(-10deg)' }}>
                <Video size={28} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INFINITE MARQUEE --- */}
      <section className="py-12 border-y border-gray-200 bg-white relative overflow-hidden z-20">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        <div className="flex w-[200%] animate-scroll">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-shrink-0 mx-12 flex items-center gap-4 text-gray-400 font-bold uppercase tracking-[0.2em] text-sm hover:text-indigo-600 transition-colors cursor-default">
              <ShieldCheck size={18} /> Secure • Verified • Honest •
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 relative bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-indigo-600 font-bold tracking-[0.2em] uppercase text-xs mb-6">The Future of Dating</h2>
            <h3 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6">Upgrade Your Love Life.</h3>
            <p className="text-gray-500 text-lg">Leave the swipe fatigue behind using our advanced AI tools designed for meaningful, long-term connections.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bot size={32} className="text-indigo-600" />}
              title="AI Wingman"
              desc="Smart icebreakers and conversation starters generated by context-aware AI based on shared interests."
            />
            <FeatureCard
              icon={<Play size={32} className="text-pink-600" />}
              title="Vibe Check Reels"
              desc="See the real person. Short video intros that capture personality nuance better than static photos."
            />
            <FeatureCard
              icon={<Video size={32} className="text-green-600" />}
              title="HD Video Calls"
              desc="Crystal clear, low-latency video calls built directly into the platform for safe virtual dates."
            />
            <FeatureCard
              icon={<Sparkles size={32} className="text-amber-500" />}
              title="Cosmic Matching"
              desc="Vedic astrology, numerology and psychometrics combined for deep compatibility analysis."
            />
            <FeatureCard
              icon={<Shield size={32} className="text-blue-500" />}
              title="Anti-Catfish"
              desc="Bank-grade AI identity verification ensures you only talk to real, verified humans."
            />
            <FeatureCard
              icon={<Zap size={32} className="text-yellow-500" />}
              title="Instant Date"
              desc="Skip the small talk. Propose virtual dates directly from the profile with smart scheduling."
            />
          </div>
        </div>
      </section>

      {/* --- SUCCESS STORIES --- */}
      <section id="success-stories" className="py-24 bg-white relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider mb-4">Real Love</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-gray-900 mb-4">Success Stories</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">See how AI helped these couples find their perfect match.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StoryCard
              image="/images/story-1.jpg"
              names="Priya & Rahul"
              story="We matched instantly! The AI suggested we both loved hiking and classical music. 6 months later, we're engaged!"
            />
            <StoryCard
              image="/images/register-hero-wiki.jpg"
              names="Sarah & James"
              story="I was skeptical about AI, but LifePartner's vibe check reels showed me James's genuine smile. Best decision ever."
            />
            <StoryCard
              image="/images/orbital.jpg"
              names="Anjali & Vikram"
              story="The compatibility score was spot on. Our families clicked immediately, and now we are planning our dream wedding."
            />
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-gray-900">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <StepCard step="01" title="Create Profile" desc="Sign up and build your smart biodata with AI assistance." />
            <StepCard step="02" title="AI Verification" desc="We verify your identity to ensure a safe community." />
            <StepCard step="03" title="Get Matched" desc="Receive daily curated matches based on your preferences." />
            <StepCard step="04" title="Connect" desc="Chat, video call, and meet your future partner." />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-32 relative overflow-hidden px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-[3rem] relative overflow-hidden shadow-2xl">
          {/* Background Texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/30 rounded-full filter blur-[100px]"></div>

          <div className="text-center py-20 px-6 relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">Ready to find <br />the one?</h2>
            <p className="text-indigo-200 text-xl mb-12 max-w-2xl mx-auto">Join the exclusive community of singles who value meaningful connections over mindless swiping.</p>

            <Link href="/register">
              <button className="group relative px-12 py-6 rounded-full bg-white text-indigo-900 font-bold text-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                <span className="relative z-10">Create Free Account</span>
              </button>
            </Link>
            <p className="mt-8 text-sm text-indigo-300 font-medium tracking-wide uppercase">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="glass-card p-10 rounded-[2rem] transition-all duration-500 group cursor-pointer bg-white relative overflow-hidden hover:shadow-xl border border-gray-100">
      <div className="absolute top-0 left-0 w-1.5 h-0 bg-gradient-to-b from-indigo-500 to-purple-500 group-hover:h-full transition-all duration-500"></div>
      <div className="mb-8 p-5 rounded-2xl bg-indigo-50 w-fit group-hover:bg-white group-hover:shadow-md transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  )
}

function StoryCard({ image, names, story }: { image: string, names: string, story: string }) {
  return (
    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
      <div className="h-80 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
        <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={names} />
        <div className="absolute bottom-6 left-6 right-6 z-20 text-white">
          <h3 className="text-2xl font-heading font-bold mb-2">{names}</h3>
          <p className="text-sm text-gray-200 italic">"{story}"</p>
        </div>
      </div>
    </div>
  )
}

function StepCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="text-center p-6 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
      <div className="text-6xl font-black text-indigo-100 mb-4">{step}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  )
}

function PricingCard({ title, price, features, isPopular }: { title: string, price: string, features: string[], isPopular?: boolean }) {
  return (
    <div className={`p-8 rounded-[2rem] border ${isPopular ? 'border-amber-400 bg-white ring-4 ring-amber-100 shadow-xl scale-105' : 'border-gray-100 bg-white shadow-lg'} relative flex flex-col`}>
      {isPopular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide shadow-md">Most Popular</div>}
      <h3 className="text-xl font-bold text-gray-600 mb-2">{title}</h3>
      <div className="text-4xl font-black text-gray-900 mb-8">{price}</div>
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <CheckCircle size={16} className={`flex-shrink-0 ${isPopular ? 'text-amber-500' : 'text-indigo-500'}`} /> {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-4 rounded-xl font-bold transition-all ${isPopular ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-amber-200' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
        Choose {title}
      </button>
    </div>
  )
}

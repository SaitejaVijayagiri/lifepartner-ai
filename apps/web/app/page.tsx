'use client';

import Link from 'next/link';
import { ArrowDown } from 'lucide-react';
import Footer from '@/components/Footer';

export default function LandingPage() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          LifePartner AI
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-indigo-600">Login</Link>
          <Link href="/register">
            <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Sign Up Free
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-50 to-white">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
          Find a partner, <br />
          <span className="text-indigo-600">not just a profile.</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-10">
          Forget biodata filters. Describe your ideal life partner in your own words,
          and let our AI match you based on values, emotional compatibility, and life vision.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={scrollToHowItWorks}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Get Started
            <ArrowDown size={20} className="animate-bounce" />
          </button>
          <button
            onClick={scrollToHowItWorks}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:scale-105"
          >
            Learn More
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <FeatureCard
            title="Prompt-Based Matching"
            desc="Just say 'I need someone ambitious but kind'. We handle the rest."
            icon="✨"
          />
          <FeatureCard
            title="Psychometric Analysis"
            desc="We analyze Big 5 traits and values to ensure deep compatibility."
            icon="🧠"
          />
          <FeatureCard
            title="Relationship Simulation"
            desc="See how you'd handle real-life scenarios before you meet."
            icon="🔮"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Finding your life partner in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <StepCard
              number="1"
              title="Describe Your Ideal Partner"
              description="Instead of checking boxes, simply write in your own words what you're looking for. Our AI understands natural language and your true intentions."
              icon="✍️"
            />
            <StepCard
              number="2"
              title="AI Analyzes & Matches"
              description="Our advanced AI analyzes personality traits, values, lifestyle preferences, and compatibility factors to find your perfect matches."
              icon="🤖"
            />
            <StepCard
              number="3"
              title="Connect & Build Together"
              description="Chat, video call, and even run relationship simulations to see how you'd handle real-life scenarios before meeting in person."
              icon="💑"
            />
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Ready to find your perfect match?</h3>
            <p className="text-lg mb-8 opacity-90">Join thousands of people finding meaningful relationships</p>
            <Link href="/register">
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-full px-10 py-6 text-lg font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                Create Your Free Account
              </button>
            </Link>
            <p className="mt-4 text-sm opacity-75">Already have an account? <Link href="/login" className="underline font-semibold">Login here</Link></p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, description, icon }: { number: string, title: string, description: string, icon: string }) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 mb-4 relative">
          <span className="absolute -top-2 -right-2 text-4xl">{icon}</span>
          {number}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
      {number !== "3" && (
        <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-indigo-200"></div>
      )}
    </div>
  );
}

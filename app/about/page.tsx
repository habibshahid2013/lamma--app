"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, TreeDeciduous, Heart, Shield, Users, Mail } from 'lucide-react';
import BottomNav from '@/components/ui/BottomNav';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-3 flex items-center border-b border-gray-100">
        <Link href="/home" className="mr-4 text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg text-gray-dark">About Lamma+</h1>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center mb-4 text-teal">
            <TreeDeciduous className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-teal-deep mb-2">The Gathering</h2>
          <p className="text-gray-500 max-w-xs">
            A digital sanctuary for authentic Islamic knowledge and community.
          </p>
        </div>

        <section className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-dark mb-3">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              Lamma+ aims to connect seekers with scholars, bridging the gap between classical wisdom and modern life. We organize content by topic, region, and scholar, making it easier than ever to find trustworthy knowledge that resonates with you.
            </p>
          </div>

          <div className="grid gap-4">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-teal" />}
              title="Verified Scholars"
              description="We carefully vet all profiles to ensure authentic and reliable knowledge sources."
            />
             <FeatureCard 
              icon={<Heart className="w-6 h-6 text-rose-500" />}
              title="Heart-Centered"
              description="Designed to nurture your spiritual growth without the noise of algorithmic doom-scrolling."
            />
             <FeatureCard 
              icon={<Users className="w-6 h-6 text-blue-500" />}
              title="For Everyone"
              description="From new Muslims to lifelong students, our content caters to all levels of understanding."
            />
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mt-8">
            <h3 className="font-bold text-gray-dark mb-2 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-gray-400" /> Contact Us
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Have questions, feedback, or want to suggest a scholar? We'd love to hear from you.
            </p>
            <a 
              href="mailto:salam@lamma.app" 
              className="inline-block bg-white border border-gray-200 text-teal font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              salam@lamma.app
            </a>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
      <div className="mr-4 mt-1 bg-gray-50 p-2 rounded-lg">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

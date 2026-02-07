"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TreeDeciduous, Heart, Shield, Users, Mail, Globe, Search, GraduationCap } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="islamic-pattern relative">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <TreeDeciduous className="h-8 w-8 text-primary" />
          </div>
          <Badge className="mb-4 bg-primary/10 text-primary border-0">About Lamma+</Badge>
          <h1 className="text-4xl font-bold sm:text-5xl">The Gathering</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A digital sanctuary for authentic Islamic knowledge and community.
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          Lamma+ aims to connect seekers with scholars, bridging the gap between classical wisdom and modern life.
          We organize content by topic, region, and scholar, making it easier than ever to find trustworthy
          knowledge that resonates with you.
        </p>
      </section>

      {/* Values */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">What We Believe</h2>
            <p className="mt-2 text-muted-foreground">The principles that guide everything we build.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Verified Scholars</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We carefully vet all profiles to ensure authentic and reliable knowledge sources.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Heart className="h-6 w-6 text-gold-deep dark:text-gold" />
                </div>
                <h3 className="font-semibold">Heart-Centered</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Designed to nurture your spiritual growth without the noise of algorithmic doom-scrolling.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">For Everyone</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  From new Muslims to lifelong students, our content caters to all levels of understanding.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contribute" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-xl font-bold">Contact Us</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Have questions, feedback, or want to suggest a scholar? We&apos;d love to hear from you.
            </p>
            <Button variant="outline" className="rounded-full" asChild>
              <a href="mailto:salam@lamma.app">salam@lamma.app</a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
        <h2 className="text-2xl font-bold">Ready to Explore?</h2>
        <p className="mt-2 text-muted-foreground">Find scholars who can guide your journey.</p>
        <Button size="lg" className="mt-6 rounded-full px-10 gap-2" asChild>
          <Link href="/scholars"><Search className="h-4 w-4" />Discover Scholars</Link>
        </Button>
      </section>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import CreatorCard from "../ui/CreatorCard";
import WomenVoicesRow from "./WomenScholarsRow";
import HistoricalSection from "./HistoricalSection";
import SurpriseMeButton from "../ui/SurpriseMeButton";
import AnimatedSection from "../ui/AnimatedSection";
import StaggerGrid, { StaggerItem } from "../ui/StaggerGrid";
import {
  useCreators,
  useFeaturedCreators,
  useTrendingCreators,
  useCategoryCount,
  useContentTypeCounts,
} from "@/hooks/useCreators";
import { useFollow } from "@/hooks/useFollow";
import { SkeletonCreatorRow } from "../ui/SkeletonCard";
import {
  Search,
  BookOpen,
  Heart,
  Scale,
  Star,
  Shield,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Globe,
  History,
  Mic,
  Youtube,
  Podcast,
  Crown,
  Megaphone,
  Pen,
  MessageCircle,
  UserCheck,
  Flame,
  Compass,
  Zap,
} from "lucide-react";

// ── Category data ───────────────────────────────────────────────────
const CATEGORIES = [
  { id: "scholar", name: "Scholars", icon: BookOpen, color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
  { id: "speaker", name: "Speakers", icon: Mic, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  { id: "educator", name: "Educators", icon: GraduationCap, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "reciter", name: "Reciters", icon: BookOpen, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { id: "author", name: "Authors", icon: Pen, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { id: "activist", name: "Activists", icon: Megaphone, color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
  { id: "influencer", name: "Influencers", icon: Zap, color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  { id: "public_figure", name: "Public Figures", icon: UserCheck, color: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400" },
  { id: "youth_leader", name: "Youth Leaders", icon: Sparkles, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { id: "podcaster", name: "Podcasters", icon: Podcast, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
];

// ── Topics data (expanded from 8 → 12) ─────────────────────────────
const TOPICS = [
  { id: "spirituality", name: "Spirituality", arabicName: "الروحانية", icon: "Heart", description: "Inner purification, dhikr, tawbah, and the path to nearness to Allah." },
  { id: "quran", name: "Quran", arabicName: "القرآن", icon: "BookOpen", description: "Tafsir, tajweed, Quran memorization, and sciences of the Quran." },
  { id: "history", name: "History", arabicName: "التاريخ", icon: "Clock", description: "Islamic civilization, golden age, and lessons from our past." },
  { id: "family", name: "Family", arabicName: "الأسرة", icon: "Users", description: "Marriage, parenting, family rights, and building strong households." },
  { id: "fiqh", name: "Fiqh", arabicName: "الفقه", icon: "Scale", description: "Jurisprudence, rulings, schools of thought, and practical Islam." },
  { id: "social_justice", name: "Justice", arabicName: "العدالة", icon: "Shield", description: "Social justice, human rights, community activism, and civic duty." },
  { id: "youth", name: "Youth", arabicName: "الشباب", icon: "Sparkles", description: "Identity, faith in modern life, mentorship, and youth empowerment." },
  { id: "seerah", name: "Seerah", arabicName: "السيرة", icon: "Star", description: "Life of the Prophet (PBUH), companions, and prophetic traditions." },
  { id: "community", name: "Community", arabicName: "مجتمع", icon: "Globe", description: "Building strong communities, outreach, and social cohesion." },
  { id: "dawah", name: "Dawah", arabicName: "دعوة", icon: "Megaphone", description: "Inviting others to Islam, interfaith dialogue, and outreach." },
  { id: "leadership", name: "Leadership", arabicName: "قيادة", icon: "Crown", description: "Organizational leadership, civic engagement, and community building." },
  { id: "education", name: "Education", arabicName: "تعليم", icon: "GraduationCap", description: "Teaching methodologies, Islamic schools, and lifelong learning." },
];

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Scale: <Scale className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Clock: <Clock className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
};

// Content type cards data
const CONTENT_TYPES = [
  { id: "youtube", name: "YouTube Channels", icon: Youtube, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/20" },
  { id: "podcast", name: "Podcasts", icon: Podcast, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/20" },
  { id: "books", name: "Books & Publications", icon: BookOpen, color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/20" },
  { id: "courses", name: "Online Courses", icon: GraduationCap, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/20" },
];

// ── Hero stagger variants ───────────────────────────────────────────
const heroStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// ── Component ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [showHistorical, setShowHistorical] = useState(true);

  // Firebase data hooks
  const { isFollowing, toggleFollow } = useFollow();
  const { creators: featuredData, loading: loadingFeatured } = useFeaturedCreators(20);
  const { creators: trendingData, loading: loadingTrending } = useTrendingCreators(10);
  const { counts: categoryCounts, loading: loadingCategories } = useCategoryCount();
  const { counts: contentCounts, loading: loadingContent } = useContentTypeCounts();

  // Derived filtered lists — include all categories
  const featuredCreators = featuredData
    .filter((c) => !c.isHistorical)
    .slice(0, 6);

  const trendingCreators = trendingData
    .filter((c) => !c.isHistorical)
    .slice(0, 8);

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="islamic-pattern relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            variants={heroStagger}
            initial="hidden"
            animate="show"
          >
            <motion.p
              variants={heroItem}
              className="font-serif text-2xl text-primary/60 mb-2"
              dir="rtl"
            >
              اجتمعوا في الإيمان
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              Discover the Voices{" "}
              <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                That Inspire
              </span>{" "}
              Your Journey
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-6 text-lg text-muted-foreground sm:text-xl"
            >
              Your gathering place for Islamic knowledge and culture. Explore
              scholars, educators, podcasters, and creators from around the
              world.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button size="lg" className="gap-2 rounded-full px-8" asChild>
                <Link href="/discover">
                  <Compass className="h-4 w-4" />
                  Explore Creators
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 rounded-full px-8"
                asChild
              >
                <Link href="/about">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={heroItem}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">500+</strong> Creators
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">12</strong> Topics
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span>
                  <strong className="text-foreground">10</strong> Categories
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Explore by Category ────────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore by Category</h2>
          <p className="mt-2 text-muted-foreground">
            Find creators across every discipline
          </p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] || 0;
            return (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/discover?category=${cat.id}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className={`rounded-lg p-2.5 transition-colors ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {cat.name}
                  </span>
                  {!loadingCategories && count > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      {count} creators
                    </span>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </AnimatedSection>

      {/* ── Trending Now ───────────────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Trending Now</h2>
            <p className="mt-2 text-muted-foreground">
              Popular creators this week
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-full" asChild>
            <Link href="/discover">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {loadingTrending ? (
            <SkeletonCreatorRow count={4} />
          ) : (
            trendingCreators.map((creator) => (
              <div key={creator.id} className="flex-shrink-0 snap-start">
                <CreatorCard
                  {...creator}
                  isFollowing={isFollowing(creator.id)}
                  onFollow={() => toggleFollow(creator.id)}
                />
              </div>
            ))
          )}
        </div>
      </AnimatedSection>

      {/* ── Browse by Content Type ─────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Browse by Content Type</h2>
          <p className="mt-2 text-muted-foreground">
            Find the format that works for you
          </p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CONTENT_TYPES.map((ct) => {
            const Icon = ct.icon;
            const count = contentCounts[ct.id as keyof typeof contentCounts] || 0;
            return (
              <StaggerItem key={ct.id}>
                <Link
                  href={`/discover?content=${ct.id}`}
                  className={`group flex flex-col items-center gap-3 rounded-xl border border-border/50 p-6 transition-all hover:border-primary/30 hover:shadow-md ${ct.bgColor}`}
                >
                  <Icon className={`h-8 w-8 ${ct.color}`} />
                  <span className="text-sm font-semibold text-center group-hover:text-primary transition-colors">
                    {ct.name}
                  </span>
                  {!loadingContent && count > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {count} creators
                    </span>
                  )}
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGrid>
      </AnimatedSection>

      {/* ── Topics Grid (expanded) ─────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore by Topic</h2>
          <p className="mt-2 text-muted-foreground">
            Browse creators by their areas of expertise
          </p>
        </div>
        <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {TOPICS.map((topic) => (
            <StaggerItem key={topic.id}>
              <Link
                href={`/discover?topic=${encodeURIComponent(topic.name)}`}
                className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {iconMap[topic.icon] || <BookOpen className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {topic.name}
                    </h3>
                    <p
                      className="mt-0.5 text-[11px] font-serif text-muted-foreground/70"
                      dir="rtl"
                    >
                      {topic.arabicName}
                    </p>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {topic.description}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </AnimatedSection>

      {/* ── Featured Voices ────────────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured Voices</h2>
            <p className="mt-2 text-muted-foreground">
              Leading creators across the Muslim community
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-full" asChild>
            <Link href="/discover">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured ? (
            <div className="col-span-full">
              <SkeletonCreatorRow count={3} />
            </div>
          ) : (
            featuredCreators.map((creator) => (
              <StaggerItem key={creator.id} className="flex justify-center">
                <CreatorCard
                  {...creator}
                  isFollowing={isFollowing(creator.id)}
                  onFollow={() => toggleFollow(creator.id)}
                />
              </StaggerItem>
            ))
          )}
        </StaggerGrid>
      </AnimatedSection>

      {/* ── Women in the Community ─────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold sm:text-3xl">Women in the Community</h2>
          <p className="mt-2 text-muted-foreground">
            Inspiring women across every field
          </p>
        </div>
        <WomenVoicesRow />
      </AnimatedSection>

      {/* ── Historical Scholars ──────────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Giants of History</h2>
            <p className="mt-2 text-muted-foreground">
              Classical scholars &amp; their enduring legacy
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-full"
            onClick={() => setShowHistorical(!showHistorical)}
          >
            {showHistorical ? "Hide" : "Show"}
            <History className="h-4 w-4" />
          </Button>
        </div>
        {showHistorical && <HistoricalSection />}
      </AnimatedSection>

      {/* ── Why Lamma+ ───────────────────────────────────────────────── */}
      <AnimatedSection className="border-y border-border/50 bg-muted/20 islamic-pattern">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border-0">
              Why Lamma+?
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your Gathering Place for Knowledge &amp; Culture
            </h2>
            <p className="mt-4 text-muted-foreground">
              Lamma+ brings together scholars, educators, speakers, and creators
              from around the Muslim world &mdash; all in one place.
            </p>
          </div>
          <StaggerGrid className="mt-12 grid gap-6 sm:grid-cols-3">
            <StaggerItem>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Verified Profiles</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Creators with transparent credentials, verified qualifications,
                  and authentic content.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <Search className="h-6 w-6 text-gold-deep" />
                </div>
                <h3 className="font-semibold">Smart Discovery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Filter by category, content type, topic, language, region, and
                  more.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Global Community</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Discover creators across every region and language of the
                  Muslim world.
                </p>
              </div>
            </StaggerItem>
          </StaggerGrid>
        </div>
      </AnimatedSection>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <AnimatedSection className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Ready to Discover Your Next Inspiration?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Explore creators who can guide and inspire your journey.
        </p>
        <Button size="lg" className="mt-8 gap-2 rounded-full px-10" asChild>
          <Link href="/discover">
            <Compass className="h-4 w-4" />
            Start Discovering
          </Link>
        </Button>
      </AnimatedSection>

      {/* Surprise Me FAB */}
      <SurpriseMeButton />
    </>
  );
}

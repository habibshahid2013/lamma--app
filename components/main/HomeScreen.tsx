"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreatorCard from "../ui/CreatorCard";
import WomenScholarsRow from "./WomenScholarsRow";
import HistoricalSection from "./HistoricalSection";
import SurpriseMeButton from "../ui/SurpriseMeButton";
import { useCreators, useFeaturedCreators } from "@/hooks/useCreators";
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
} from "lucide-react";

// ── Topics data (matching TopicSection + prototype style) ──────────────
const TOPICS = [
  {
    id: "spirituality",
    name: "Spirituality",
    arabicName: "الروحانية",
    icon: "Heart",
    description: "Inner purification, dhikr, tawbah, and the path to nearness to Allah.",
    scholarCount: 6,
  },
  {
    id: "quran",
    name: "Quran",
    arabicName: "القرآن",
    icon: "BookOpen",
    description: "Tafsir, tajweed, Quran memorization, and sciences of the Quran.",
    scholarCount: 8,
  },
  {
    id: "history",
    name: "History",
    arabicName: "التاريخ",
    icon: "Clock",
    description: "Islamic civilization, golden age, and lessons from our past.",
    scholarCount: 4,
  },
  {
    id: "family",
    name: "Family",
    arabicName: "الأسرة",
    icon: "Users",
    description: "Marriage, parenting, family rights, and building strong households.",
    scholarCount: 5,
  },
  {
    id: "fiqh",
    name: "Fiqh",
    arabicName: "الفقه",
    icon: "Scale",
    description: "Jurisprudence, rulings, schools of thought, and practical Islam.",
    scholarCount: 7,
  },
  {
    id: "social_justice",
    name: "Justice",
    arabicName: "العدالة",
    icon: "Shield",
    description: "Social justice, human rights, community activism, and civic duty.",
    scholarCount: 4,
  },
  {
    id: "youth",
    name: "Youth",
    arabicName: "الشباب",
    icon: "Sparkles",
    description: "Identity, faith in modern life, mentorship, and youth empowerment.",
    scholarCount: 5,
  },
  {
    id: "seerah",
    name: "Seerah",
    arabicName: "السيرة",
    icon: "Star",
    description: "Life of the Prophet (PBUH), companions, and prophetic traditions.",
    scholarCount: 6,
  },
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
};

// ── Component ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [showHistorical, setShowHistorical] = useState(false);

  // Firebase data hooks
  const { isFollowing, toggleFollow } = useFollow();
  const { creators: featuredData, loading: loadingFeatured } = useFeaturedCreators(20);
  const { creators: publicFiguresData, loading: loadingPublic } = useCreators({
    category: "public_figure",
    limitCount: 10,
  });

  // Derived filtered lists
  const featuredCreators = featuredData
    .filter((c) => !c.isHistorical && c.category !== "public_figure")
    .slice(0, 6);

  const publicFigures = publicFiguresData;

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="islamic-pattern relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-serif text-2xl text-primary/60 mb-2" dir="rtl">
              اجتمعوا في الإيمان
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Discover the Scholars{" "}
              <span className="bg-gradient-to-r from-teal to-gold bg-clip-text text-transparent">
                Who Illuminate
              </span>{" "}
              Your Path
            </h1>

            <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
              Your gateway to Islamic knowledge. Explore verified scholars,
              find the right teacher for your journey, and connect with
              centuries of wisdom.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 rounded-full px-8" asChild>
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Explore Scholars
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
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal" />
                <span>
                  <strong className="text-foreground">12+</strong> Scholars
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-teal" />
                <span>
                  <strong className="text-foreground">8</strong> Topics
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-teal" />
                <span>
                  <strong className="text-foreground">Global</strong> Reach
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Topics Grid ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Explore by Topic</h2>
          <p className="mt-2 text-muted-foreground">
            Browse scholars by their areas of expertise
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {TOPICS.map((topic) => (
            <Link
              key={topic.id}
              href={`/search?q=${encodeURIComponent(topic.name)}`}
              className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-teal/30 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-teal/10 p-2 text-teal transition-colors group-hover:bg-teal group-hover:text-white">
                  {iconMap[topic.icon] || <BookOpen className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold group-hover:text-teal transition-colors">
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
              <div className="mt-2 text-[11px] text-teal font-medium">
                {topic.scholarCount} scholars &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Scholars ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Featured Scholars</h2>
            <p className="mt-2 text-muted-foreground">
              Leading voices in Islamic scholarship
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-full" asChild>
            <Link href="/search">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingFeatured ? (
            <div className="col-span-full">
              <SkeletonCreatorRow count={3} />
            </div>
          ) : (
            featuredCreators.map((creator) => (
              <div key={creator.id} className="flex justify-center">
                <CreatorCard
                  {...creator}
                  isFollowing={isFollowing(creator.id)}
                  onFollow={() => toggleFollow(creator.id)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Muslim Voices (Public Figures) ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Muslim Voices</h2>
            <p className="mt-2 text-muted-foreground">
              Public figures &amp; leaders inspiring the ummah
            </p>
          </div>
          <Button variant="outline" className="gap-2 rounded-full" asChild>
            <Link href="/search?category=public_figure">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingPublic ? (
            <div className="col-span-full">
              <SkeletonCreatorRow count={3} />
            </div>
          ) : (
            publicFigures.slice(0, 6).map((creator) => (
              <div key={creator.id} className="flex justify-center">
                <CreatorCard
                  {...creator}
                  isFollowing={isFollowing(creator.id)}
                  onFollow={() => toggleFollow(creator.id)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Women Scholars ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-6 text-center sm:text-left">
          <h2 className="text-2xl font-bold sm:text-3xl">Women Scholars</h2>
          <p className="mt-2 text-muted-foreground">
            Inspiring female scholarship &amp; leadership
          </p>
        </div>
        <WomenScholarsRow />
      </section>

      {/* ── Historical Scholars ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
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
        {!showHistorical && (
          <p className="text-center text-sm text-muted-foreground py-8 border border-dashed border-border rounded-xl">
            Toggle &quot;Show&quot; above to reveal classical scholars
          </p>
        )}
      </section>

      {/* ── Why Lamma+ ───────────────────────────────────────────────── */}
      <section className="border-y border-border/50 bg-muted/20 islamic-pattern">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-teal/10 px-3 py-1 text-sm font-medium text-teal border-0">
              Why Lamma+?
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Finding the Right Teacher Matters
            </h2>
            <p className="mt-4 text-muted-foreground">
              In a world of unverified content and AI-generated fatwas, Lamma+
              connects you with real, verified scholars who carry authentic
              chains of knowledge.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                <Shield className="h-6 w-6 text-teal" />
              </div>
              <h3 className="font-semibold">Verified Credentials</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Scholars with transparent qualifications, ijazah chains, and
                institutional affiliations.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                <Search className="h-6 w-6 text-gold-dark" />
              </div>
              <h3 className="font-semibold">Smart Discovery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Filter by topic, language, region, teaching style, and school
                of thought.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                <Globe className="h-6 w-6 text-teal" />
              </div>
              <h3 className="font-semibold">Global Reach</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover scholars across every region and language of the
                Muslim world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Ready to Find Your Teacher?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Start exploring the scholars who can guide your journey.
        </p>
        <Button size="lg" className="mt-8 gap-2 rounded-full px-10" asChild>
          <Link href="/search">
            <Search className="h-4 w-4" />
            Start Discovering
          </Link>
        </Button>
      </section>

      {/* Surprise Me FAB */}
      <SurpriseMeButton />
    </>
  );
}

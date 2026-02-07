import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import DiscoverClient from "./DiscoverClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Discover Creators",
  description:
    "Browse and filter Islamic scholars, educators, podcasters, and creators across every category, region, and language.",
  path: "/discover",
});

export default function DiscoverPage() {
  return <DiscoverClient />;
}

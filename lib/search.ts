import Fuse, { type IFuseOptions } from "fuse.js";
import type { Creator } from "@/lib/types/creator";

const fuseOptions: IFuseOptions<Creator> = {
  keys: [
    { name: "name", weight: 1.0 },
    { name: "profile.displayName", weight: 1.0 },
    { name: "topics", weight: 0.8 },
    { name: "category", weight: 0.6 },
    { name: "profile.shortBio", weight: 0.5 },
    { name: "profile.bio", weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

export function createSearchIndex(creators: Creator[]) {
  return new Fuse(creators, fuseOptions);
}

export function searchCreators(
  index: Fuse<Creator>,
  query: string
): Creator[] {
  return index.search(query).map((result) => result.item);
}

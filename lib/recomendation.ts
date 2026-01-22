const SOURCE_LIKES_KEY = "news_source_likes";
const MIN_LIKES_FOR_RECOMMENDATION = 3;

export interface SourceLikeData {
  count: number;
  name: string;
}

export interface SourceLikes {
  [sourceId: string]: SourceLikeData;
}

export function getSourceLikes(): SourceLikes {
  if (typeof window === "undefined") return {};

  try {
    const data = localStorage.getItem(SOURCE_LIKES_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function addSourceLike(sourceId: string, sourceName: string): void {
  if (typeof window === "undefined" || !sourceId) return;

  try {
    const likes = getSourceLikes();

    if (likes[sourceId]) {
      likes[sourceId].count++;
    } else {
      likes[sourceId] = {
        count: 1,
        name: sourceName,
      };
    }

    localStorage.setItem(SOURCE_LIKES_KEY, JSON.stringify(likes));
  } catch (error) {
    console.error("Error saving source like:", error);
  }
}

export function removeSourceLike(sourceId: string): void {
  if (typeof window === "undefined" || !sourceId) return;

  try {
    const likes = getSourceLikes();

    if (likes[sourceId]) {
      likes[sourceId].count--;

      if (likes[sourceId].count <= 0) {
        delete likes[sourceId];
      }

      localStorage.setItem(SOURCE_LIKES_KEY, JSON.stringify(likes));
    }
  } catch (error) {
    console.error("Error removing source like:", error);
  }
}

export function getRecommendedSourceIds(): string[] {
  const likes = getSourceLikes();

  const recommended = Object.entries(likes)
    .filter(([_, data]) => data.count >= MIN_LIKES_FOR_RECOMMENDATION)
    .map(([sourceId, _]) => sourceId);

  return recommended;
}

export interface RecommendedSource {
  id: string;
  name: string;
  count: number;
}

export function getRecommendedSources(): RecommendedSource[] {
  const likes = getSourceLikes();

  return Object.entries(likes)
    .filter(([_, data]) => data.count >= MIN_LIKES_FOR_RECOMMENDATION)
    .map(([sourceId, data]) => ({
      id: sourceId,
      name: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getRecommendedSourcesString(): string {
  const sourceIds = getRecommendedSourceIds();
  return sourceIds.join(",");
}

export function hasRecommendations(): boolean {
  return getRecommendedSourceIds().length > 0;
}

export interface PreferenceStats {
  sourceLikes: SourceLikes;
  recommendedSources: RecommendedSource[];
  recommendedSourceIds: string[];
  recommendedSourcesString: string;
  hasRecommendations: boolean;
  totalLikedSources: number;
  totalRecommendedSources: number;
}

export function getPreferenceStats(): PreferenceStats {
  const sourceLikes = getSourceLikes();
  const recommendedSources = getRecommendedSources();
  const recommendedSourceIds = getRecommendedSourceIds();

  return {
    sourceLikes,
    recommendedSources,
    recommendedSourceIds,
    recommendedSourcesString: recommendedSourceIds.join(","),
    hasRecommendations: recommendedSourceIds.length > 0,
    totalLikedSources: Object.keys(sourceLikes).length,
    totalRecommendedSources: recommendedSourceIds.length,
  };
}

export function clearAllPreferences(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SOURCE_LIKES_KEY);
  console.log("🗑️ All preferences cleared");
}

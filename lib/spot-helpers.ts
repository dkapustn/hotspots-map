import { SPOT_PHOTOS_BUCKET } from "@/lib/constants";
import { getPublicPhotoUrl } from "@/lib/photo";
import type {
  Spot,
  SpotStats,
  SpotStatsWithAuthor,
  SpotWithAuthor,
  Profile,
} from "@/lib/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

type AuthorJoin = Pick<Profile, "id" | "username" | "avatar_url"> | null;

export function withPhotoUrl<T extends { photo_path: string }>(
  row: T,
): T & { photo_url: string } {
  return {
    ...row,
    photo_url: getPublicPhotoUrl(SUPABASE_URL, SPOT_PHOTOS_BUCKET, row.photo_path),
  };
}

export function attachAuthor(row: Spot & { profiles: AuthorJoin }): SpotWithAuthor;
export function attachAuthor(
  row: SpotStats & { profiles: AuthorJoin },
): SpotStatsWithAuthor;
export function attachAuthor(
  row: (Spot | SpotStats) & { profiles: AuthorJoin },
): SpotWithAuthor | SpotStatsWithAuthor {
  const { profiles, ...rest } = row;
  const withPhoto = withPhotoUrl(rest);
  return { ...withPhoto, author: profiles } as SpotWithAuthor | SpotStatsWithAuthor;
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, Footprints, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VisitButton } from "@/components/spot/VisitButton";
import { LikeButton } from "@/components/spot/LikeButton";
import { CommentsList } from "@/components/spot/CommentsList";
import { ShareButton } from "@/components/spot/ShareButton";
import { DistanceBadge } from "@/components/spot/DistanceBadge";
import { PhotoLightbox } from "@/components/spot/PhotoLightbox";
import { SpotRating } from "@/components/spot/SpotRating";
import { BookmarkButton } from "@/components/spot/BookmarkButton";
import { RouteButton } from "@/components/spot/RouteButton";
import { formatRelativeTime, initials } from "@/lib/utils";
import type { SpotWithAuthor } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { id: string; username: string; avatar_url: string | null } | null;
}

export function SpotDetail({
  spot,
  stats,
  initialLiked,
  initialVisited,
  initialBookmarked,
  initialUserRating,
  initialComments,
  currentUserId,
}: {
  spot: SpotWithAuthor;
  stats: {
    likes_count: number;
    visits_count: number;
    comments_count: number;
    avg_rating: number;
    ratings_count: number;
  };
  initialLiked: boolean;
  initialVisited: boolean;
  initialBookmarked: boolean;
  initialUserRating: number | null;
  initialComments: CommentRow[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(stats.likes_count);
  const [visited, setVisited] = useState(initialVisited);
  const [visitsCount, setVisitsCount] = useState(stats.visits_count);
  const [comments, setComments] = useState(initialComments);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Удалить эту метку?")) return;
    setDeleting(true);
    const res = await fetch(`/api/spots/${spot.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Не удалось удалить метку");
      return;
    }
    toast.success("Метка удалена");
    router.replace("/");
    router.refresh();
  }

  const isOwner = currentUserId === spot.user_id;

  return (
    <div className="h-full scroll-area pb-safe-nav">
      {/* Hero photo — tap to expand */}
      <div className="relative">
        <PhotoLightbox src={spot.photo_url} alt={spot.title}>
          <div className="relative aspect-[4/3] w-full md:aspect-[21/9]">
            <img src={spot.photo_url} alt={spot.title} className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
          </div>
        </PhotoLightbox>

        <Link
          href="/"
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60 mt-safe"
          aria-label="Назад"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-destructive disabled:opacity-50 mt-safe"
            aria-label="Удалить метку"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold drop-shadow-lg md:text-3xl"
          >
            {spot.title}
          </motion.h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
            <Link
              href={`/profile/${spot.author?.id ?? ""}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <Avatar className="h-7 w-7 border border-white/30">
                {spot.author?.avatar_url ? (
                  <AvatarImage src={spot.author.avatar_url} alt={spot.author.username} />
                ) : null}
                <AvatarFallback className="text-xs">{initials(spot.author?.username)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{spot.author?.username ?? "—"}</span>
            </Link>
            <span>·</span>
            <span>{formatRelativeTime(spot.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 space-y-6">
        {/* Action bar — всё в один ряд: гибкая «Посетить» + квадратные иконки */}
        <div className="flex items-stretch gap-2">
          <VisitButton
            spotId={spot.id}
            visited={visited}
            onVisited={() => {
              if (!visited) setVisitsCount((c) => c + 1);
              setVisited(true);
            }}
            className="h-12 flex-1 min-w-0 px-4 text-sm"
          />
          <LikeButton
            spotId={spot.id}
            liked={liked}
            onChange={(v) => {
              setLiked(v);
              setLikesCount((c) => c + (v ? 1 : -1));
            }}
            className="h-12 w-12 shrink-0 px-0"
          />
          <ShareButton
            spotId={spot.id}
            title={spot.title}
            className="h-12 w-12 shrink-0 px-0"
          />
          {currentUserId && (
            <BookmarkButton
              spotId={spot.id}
              bookmarked={bookmarked}
              onChange={setBookmarked}
              className="h-12 w-12 shrink-0 px-0"
            />
          )}
        </div>

        <DistanceBadge lat={spot.latitude} lng={spot.longitude} />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Heart} value={likesCount} label="Лайков" tone="rose" />
          <StatCard icon={Footprints} value={visitsCount} label="Посещений" tone="emerald" />
          <StatCard icon={MessageCircle} value={comments.length} label="Комментов" tone="sky" />
        </div>

        {/* Description */}
        {spot.description && (
          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Описание</h3>
            <p className="whitespace-pre-wrap text-foreground/90">{spot.description}</p>
          </div>
        )}

        {/* Coords */}
        {/* Rating */}
        {currentUserId && (
          <SpotRating
            spotId={spot.id}
            initialUserValue={initialUserRating}
            initialAverage={Number(stats.avg_rating ?? 0)}
            initialCount={stats.ratings_count ?? 0}
          />
        )}

        <RouteButton
          lat={spot.latitude}
          lng={spot.longitude}
          label={`${spot.latitude.toFixed(5)}, ${spot.longitude.toFixed(5)}`}
        />

        {/* Comments */}
        <div>
          <h3 className="mb-3 text-base font-semibold">Комментарии</h3>
          <CommentsList
            spotId={spot.id}
            initialComments={comments}
            onAdd={(c) => setComments((prev) => [c as any, ...prev])}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  tone: "rose" | "emerald" | "sky";
}) {
  const colors = {
    rose: "text-rose-500 bg-rose-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    sky: "text-sky-500 bg-sky-500/10",
  }[tone];
  return (
    <div className="rounded-xl border bg-card p-3 text-center">
      <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg ${colors}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-lg font-bold leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

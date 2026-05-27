"use client";
import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { SpotWithAuthor } from "@/lib/types";
import { initials, formatRelativeTime } from "@/lib/utils";
import { DistanceBadge } from "@/components/spot/DistanceBadge";
import { ShareButton } from "@/components/spot/ShareButton";
import { PhotoLightbox } from "@/components/spot/PhotoLightbox";

export function SpotBottomSheet({
  spot,
  open,
  onClose,
}: {
  spot: SpotWithAuthor | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!spot) return null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="md:max-w-lg md:mx-auto md:rounded-3xl md:mb-6 md:inset-x-0">
        <div className="px-5 pt-3 pb-6">
          <PhotoLightbox src={spot.photo_url} alt={spot.title}>
            <div
              className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted"
              style={{
                backgroundImage: `url('${spot.photo_url}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </PhotoLightbox>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-semibold">{spot.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xs text-muted-foreground">{formatRelativeTime(spot.created_at)}</p>
                <DistanceBadge lat={spot.latitude} lng={spot.longitude} />
              </div>
            </div>
            <Link href={`/profile/${spot.author?.id ?? ""}`} className="flex items-center gap-2 shrink-0">
              <Avatar className="h-8 w-8">
                {spot.author?.avatar_url ? (
                  <AvatarImage src={spot.author.avatar_url} alt={spot.author.username} />
                ) : null}
                <AvatarFallback>{initials(spot.author?.username)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{spot.author?.username ?? "—"}</span>
            </Link>
          </div>

          {spot.description && (
            <p className="mt-3 text-sm text-foreground/80 whitespace-pre-wrap line-clamp-4">
              {spot.description}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <Button asChild size="lg" className="flex-1">
              <Link href={`/spot/${spot.id}`}>
                Открыть метку <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <ShareButton spotId={spot.id} title={spot.title} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

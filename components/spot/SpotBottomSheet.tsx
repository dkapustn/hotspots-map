"use client";
import Link from "next/link";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
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
      <SheetContent
        side="bottom"
        className="md:max-w-lg md:mx-auto md:rounded-3xl md:mb-6 md:inset-x-0"
      >
        {/*
          Низ попапа клиппится BottomNav (z-[1000] поверх sheet z-50).
          Добавляем отступ = высота бара (68px) + safe-area + воздух.
          На md (desktop) бар скрыт — обычный pb-6.
        */}
        <div className="px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] md:pb-6">
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

          {/* Title + meta-chips */}
          <div className="mt-4 pr-10">
            <h2 className="text-xl font-semibold leading-tight line-clamp-2">
              {spot.title}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(spot.created_at)}
              </span>
              <DistanceBadge lat={spot.latitude} lng={spot.longitude} />
            </div>
          </div>

          {/* Author — clickable chip-card */}
          <Link
            href={`/profile/${spot.author?.id ?? ""}`}
            className="mt-4 flex items-center gap-3 rounded-2xl bg-foreground/[0.04] p-2.5 transition active:bg-foreground/10 hover:bg-foreground/[0.06]"
          >
            <Avatar className="h-10 w-10">
              {spot.author?.avatar_url ? (
                <AvatarImage src={spot.author.avatar_url} alt={spot.author.username} />
              ) : null}
              <AvatarFallback>{initials(spot.author?.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Автор
              </p>
              <p className="truncate text-sm font-medium">
                {spot.author?.username ?? "—"}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>

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

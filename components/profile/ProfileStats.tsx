"use client";
import { useState } from "react";
import { MapPin, Footprints, Heart } from "lucide-react";
import { ConnectionsSheet, type ConnectionType } from "@/components/profile/ConnectionsSheet";

interface Props {
  userId: string;
  spots: number;
  visited: number;
  likes: number;
  followers: number;
  following: number;
  friends: number;
}

export function ProfileStats({
  userId,
  spots,
  visited,
  likes,
  followers,
  following,
  friends,
}: Props) {
  const [openType, setOpenType] = useState<ConnectionType | null>(null);

  return (
    <>
      {/* Социальные показатели — кликабельные, открывают список людей */}
      <div className="grid grid-cols-3 divide-x divide-border">
        <PeopleStat value={followers} label="Подписчики" onClick={() => setOpenType("followers")} />
        <PeopleStat value={following} label="Подписки" onClick={() => setOpenType("following")} />
        <PeopleStat value={friends} label="Друзья" onClick={() => setOpenType("friends")} />
      </div>

      {/* Контентные показатели */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <ContentStat icon={MapPin} value={spots} label="Меток" />
        <ContentStat icon={Footprints} value={visited} label="Посещено" />
        <ContentStat icon={Heart} value={likes} label="Лайков" />
      </div>

      <ConnectionsSheet userId={userId} type={openType} onClose={() => setOpenType(null)} />
    </>
  );
}

function PeopleStat({
  value,
  label,
  onClick,
}: {
  value: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center py-1 transition active:scale-95"
    >
      <span className="text-xl font-bold leading-none tabular-nums">{value}</span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
    </button>
  );
}

function ContentStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-foreground/[0.04] py-3">
      <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-base font-bold leading-none tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

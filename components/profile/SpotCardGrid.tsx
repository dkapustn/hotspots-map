"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials, formatRelativeTime } from "@/lib/utils";

interface CardSpot {
  id: string;
  title: string;
  photo_url: string;
  created_at: string;
  author?: { id: string; username: string; avatar_url: string | null } | null;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

export function SpotCardGrid({
  spots,
  showAuthor = false,
}: {
  spots: CardSpot[];
  showAuthor?: boolean;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {spots.map((s) => (
        <motion.div key={s.id} variants={item}>
          <Link
            href={`/spot/${s.id}`}
            className="group block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={s.photo_url}
                alt={s.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-2.5">
              <h3 className="line-clamp-1 text-sm font-semibold">{s.title}</h3>
              {showAuthor && s.author ? (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Avatar className="h-4 w-4">
                    {s.author.avatar_url ? <AvatarImage src={s.author.avatar_url} alt="" /> : null}
                    <AvatarFallback className="text-[7px]">{initials(s.author.username)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{s.author.username}</span>
                </div>
              ) : (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {formatRelativeTime(s.created_at)}
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { COMMENT_MAX } from "@/lib/constants";
import { formatRelativeTime, initials } from "@/lib/utils";

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { id: string; username: string; avatar_url: string | null } | null;
}

export function CommentsList({
  spotId,
  initialComments,
  onAdd,
}: {
  spotId: string;
  initialComments: CommentRow[];
  onAdd: (c: CommentRow) => void;
}) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await fetch(`/api/spots/${spotId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: trimmed }),
    });
    setSending(false);
    if (!res.ok) {
      toast.error("Не удалось отправить комментарий");
      return;
    }
    const { comment } = await res.json();
    setComments((prev) => [comment, ...prev]);
    onAdd(comment);
    setBody("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="flex items-start gap-2">
        <Textarea
          placeholder="Поделитесь впечатлением..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={COMMENT_MAX}
          className="min-h-[60px] flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !body.trim()} className="h-11 w-11 shrink-0">
          {sending ? <Spinner /> : <Send className="h-4 w-4" />}
        </Button>
      </form>

      {comments.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          Пока нет комментариев. Будьте первым!
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 rounded-xl border bg-card p-3"
            >
              <Avatar className="h-8 w-8 shrink-0">
                {c.profiles?.avatar_url ? (
                  <AvatarImage src={c.profiles.avatar_url} alt={c.profiles.username} />
                ) : null}
                <AvatarFallback>{initials(c.profiles?.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{c.profiles?.username ?? "—"}</span>
                  <span className="text-muted-foreground">{formatRelativeTime(c.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm">{c.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

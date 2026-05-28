"use client";
import { useState } from "react";
import { UserPlus, UserCheck, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  userId: string;
  initialFollowing: boolean;
  initialFriends: boolean;
  isAnonymous: boolean;
  className?: string;
}

export function FollowButton({
  userId,
  initialFollowing,
  initialFriends,
  isAnonymous,
  className,
}: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [friends, setFriends] = useState(initialFriends);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (isAnonymous) {
      toast.info("Зарегистрируйтесь, чтобы подписываться", {
        description: "Войдите через email или Google для социальных функций.",
      });
      return;
    }
    setLoading(true);
    const method = following ? "DELETE" : "POST";
    const res = await fetch(`/api/users/${userId}/follow`, { method });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.message ?? "Не удалось обновить подписку");
      return;
    }
    const json = await res.json();
    setFollowing(!!json.following);
    setFriends(!!json.friends);
    if (json.friends) {
      toast.success("Вы теперь друзья! 🎉");
    } else if (json.following) {
      toast.success("Вы подписаны");
    }
  }

  const label = friends ? "Друзья" : following ? "Подписаны" : "Подписаться";
  const Icon = friends ? Users : following ? UserCheck : UserPlus;

  return (
    <Button
      type="button"
      onClick={toggle}
      disabled={loading}
      variant={following ? "outline" : "default"}
      className={cn(
        friends &&
          "border-0 bg-gradient-to-br from-primary to-orange-500 text-white hover:opacity-90",
        className,
      )}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </Button>
  );
}

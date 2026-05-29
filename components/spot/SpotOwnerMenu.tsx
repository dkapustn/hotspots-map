"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Globe,
  Users,
  Lock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Visibility = "public" | "friends" | "private";

const OPTIONS: {
  value: Visibility;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { value: "public", label: "Все", desc: "Метку видят все пользователи", icon: Globe },
  { value: "friends", label: "Друзья", desc: "Только те, с кем вы друзья", icon: Users },
  { value: "private", label: "Только я", desc: "Метку видите только вы", icon: Lock },
];

export function SpotOwnerMenu({
  spotId,
  initialVisibility,
}: {
  spotId: string;
  initialVisibility: Visibility;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "visibility">("menu");
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const current = OPTIONS.find((o) => o.value === visibility) ?? OPTIONS[0];

  async function changeVisibility(v: Visibility) {
    if (v === visibility) {
      setView("menu");
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/spots/${spotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility: v }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Не удалось изменить видимость");
      return;
    }
    setVisibility(v);
    toast.success("Видимость обновлена");
    setView("menu");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Удалить эту метку? Это действие необратимо.")) return;
    setDeleting(true);
    const res = await fetch(`/api/spots/${spotId}`, { method: "DELETE" });
    if (!res.ok) {
      setDeleting(false);
      toast.error("Не удалось удалить метку");
      return;
    }
    toast.success("Метка удалена");
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => {
          setView("menu");
          setOpen(true);
        }}
        className="mt-safe absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
        aria-label="Меню метки"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="md:max-w-lg md:mx-auto md:rounded-3xl md:mb-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {view === "visibility" && (
                <button
                  onClick={() => setView("menu")}
                  className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full hover:bg-foreground/10"
                  aria-label="Назад"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {view === "menu" ? "Метка" : "Кто видит метку"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-1 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] pt-2 md:pb-6">
            {view === "menu" ? (
              <>
                <Row icon={current.icon} onClick={() => setView("visibility")}>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">Настройка видимости</span>
                    <span className="block text-xs text-muted-foreground">{current.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Row>

                <Row icon={deleting ? Loader2 : Trash2} onClick={handleDelete} destructive>
                  <span className="flex-1 text-sm font-medium">Удалить метку</span>
                </Row>
              </>
            ) : (
              OPTIONS.map((o) => (
                <Row key={o.value} icon={o.icon} onClick={() => changeVisibility(o.value)}>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                  {visibility === o.value ? (
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    saving && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                  )}
                </Row>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Row({
  icon: Icon,
  onClick,
  destructive,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-foreground/[0.06] active:bg-foreground/10"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          destructive ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className={cn("h-4 w-4", Icon === Loader2 && "animate-spin")} />
      </span>
      {children}
    </button>
  );
}

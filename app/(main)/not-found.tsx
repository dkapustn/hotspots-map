import Link from "next/link";
import { MapPinOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <MapPinOff className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">Страница не найдена</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Возможно, метка была удалена или ссылка устарела.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Home className="h-4 w-4" /> На карту
          </Link>
        </Button>
      </div>
    </div>
  );
}

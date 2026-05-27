"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Что-то пошло не так</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "Произошла непредвиденная ошибка."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>
            <RotateCw className="h-4 w-4" /> Попробовать ещё раз
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" /> На главную
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

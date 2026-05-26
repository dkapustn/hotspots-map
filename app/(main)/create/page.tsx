import type { Metadata } from "next";
import { CreateSpotFlow } from "@/components/create/CreateSpotFlow";

export const metadata: Metadata = { title: "Создать метку" };

export default function CreatePage() {
  return (
    <div className="h-full overflow-y-auto pb-24 md:pb-6">
      <div className="mx-auto max-w-2xl px-4 pt-6 md:pt-8 md:px-8">
        <h1 className="text-2xl font-bold md:text-3xl">Новая метка</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Метку можно поставить только в том месте, где вы сейчас находитесь.
        </p>
        <div className="mt-6">
          <CreateSpotFlow />
        </div>
      </div>
    </div>
  );
}

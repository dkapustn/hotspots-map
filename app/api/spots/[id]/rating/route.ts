import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Body = z.object({ value: z.number().int().min(1).max(5) });

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  // Upsert (можно переоценить)
  const { error } = await supabase
    .from("ratings")
    .upsert(
      { user_id: user.id, spot_id: params.id, value: parsed.data.value },
      { onConflict: "user_id,spot_id" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Возвращаем новую агрегацию
  const { data: stats } = await supabase
    .from("spot_stats")
    .select("avg_rating, ratings_count")
    .eq("id", params.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    value: parsed.data.value,
    avg_rating: stats?.avg_rating ?? 0,
    ratings_count: stats?.ratings_count ?? 0,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("spot_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stats } = await supabase
    .from("spot_stats")
    .select("avg_rating, ratings_count")
    .eq("id", params.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    value: null,
    avg_rating: stats?.avg_rating ?? 0,
    ratings_count: stats?.ratings_count ?? 0,
  });
}

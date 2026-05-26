import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SPOT_DESCRIPTION_MAX, SPOT_TITLE_MAX } from "@/lib/constants";
import { attachAuthor } from "@/lib/spot-helpers";

const CreateSpotSchema = z.object({
  title: z.string().min(1).max(SPOT_TITLE_MAX),
  description: z.string().max(SPOT_DESCRIPTION_MAX).optional().nullable(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  photo_path: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const minLat = Number(searchParams.get("minLat"));
  const maxLat = Number(searchParams.get("maxLat"));
  const minLng = Number(searchParams.get("minLng"));
  const maxLng = Number(searchParams.get("maxLng"));
  const hasBbox = [minLat, maxLat, minLng, maxLng].every((n) => Number.isFinite(n));

  let q = supabase
    .from("spots")
    .select("*, profiles(id, username, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (hasBbox) {
    q = q
      .gte("latitude", minLat)
      .lte("latitude", maxLat)
      .gte("longitude", minLng)
      .lte("longitude", maxLng);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ spots: (data ?? []).map((row) => attachAuthor(row as any)) });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = CreateSpotSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, latitude, longitude, photo_path } = parsed.data;

  const { data, error } = await supabase
    .from("spots")
    .insert({
      user_id: user.id,
      title,
      description: description ?? null,
      latitude,
      longitude,
      photo_path,
    })
    .select("*, profiles(id, username, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ spot: attachAuthor(data as any) }, { status: 201 });
}

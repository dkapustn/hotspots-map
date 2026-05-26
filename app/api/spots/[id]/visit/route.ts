import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { haversineMeters } from "@/lib/geo";
import { VISIT_RADIUS_DEFAULT_M } from "@/lib/constants";

const Body = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const [{ data: spot, error: spotErr }, { data: profile }] = await Promise.all([
    supabase
      .from("spots")
      .select("id, latitude, longitude, user_id")
      .eq("id", params.id)
      .single(),
    supabase.from("profiles").select("visit_radius_m").eq("id", user.id).single(),
  ]);

  if (spotErr || !spot) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const distance = haversineMeters(
    parsed.data.latitude,
    parsed.data.longitude,
    spot.latitude,
    spot.longitude,
  );
  const radius = profile?.visit_radius_m ?? VISIT_RADIUS_DEFAULT_M;

  if (distance > radius) {
    return NextResponse.json(
      {
        error: "too_far",
        distance_m: Math.round(distance),
        required_m: radius,
      },
      { status: 422 },
    );
  }

  const { error: insertErr } = await supabase
    .from("visits")
    .insert({ user_id: user.id, spot_id: params.id });

  if (insertErr && !insertErr.message.includes("duplicate")) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, distance_m: Math.round(distance) });
}

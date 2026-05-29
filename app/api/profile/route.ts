import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  BIO_MAX,
  USERNAME_MAX,
  USERNAME_MIN,
  VISIT_RADIUS_MAX_M,
  VISIT_RADIUS_MIN_M,
} from "@/lib/constants";

const PatchSchema = z.object({
  username: z
    .string()
    .min(USERNAME_MIN)
    .max(USERNAME_MAX)
    .regex(/^[a-zA-Z0-9_.]+$/, "Только латинские буквы, цифры, _ и .")
    .optional(),
  bio: z.string().max(BIO_MAX).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  visit_radius_m: z.number().int().min(VISIT_RADIUS_MIN_M).max(VISIT_RADIUS_MAX_M).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  spots_visibility: z.enum(["public", "friends", "private"]).optional(),
});

export async function PATCH(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const parsed = PatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  // Check username uniqueness if changing
  if (parsed.data.username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", parsed.data.username)
      .maybeSingle();
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

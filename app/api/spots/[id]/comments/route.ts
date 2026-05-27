import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COMMENT_MAX } from "@/lib/constants";

const Body = z.object({ body: z.string().min(1).max(COMMENT_MAX) });

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles!comments_user_id_fkey(id, username, avatar_url)")
    .eq("spot_id", params.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data ?? [] });
}

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

  const { data, error } = await supabase
    .from("comments")
    .insert({ user_id: user.id, spot_id: params.id, body: parsed.data.body.trim() })
    .select("*, profiles!comments_user_id_fkey(id, username, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comment: data }, { status: 201 });
}

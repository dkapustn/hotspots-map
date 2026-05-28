import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  if (user.is_anonymous) {
    return NextResponse.json(
      { error: "anonymous_forbidden", message: "Гостям нельзя подписываться" },
      { status: 403 },
    );
  }

  if (user.id === params.id) {
    return NextResponse.json({ error: "self_follow" }, { status: 400 });
  }

  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: user.id, followee_id: params.id });

  if (error && !error.message.includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Проверяем взаимность (стали ли друзьями)
  const { data: reverse } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", params.id)
    .eq("followee_id", user.id)
    .maybeSingle();

  return NextResponse.json({ ok: true, following: true, friends: !!reverse });
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
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("followee_id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, following: false, friends: false });
}

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Public, unauthenticated — widget.js fetches this before rendering so a
 * bot owner's display customization (accent color, position, greeting,
 * whether to show source citations) actually shows up on their real
 * website, not just in the dashboard preview. Only display config is
 * exposed here, never system_prompt or anything else.
 */
export async function GET(request: Request) {
  const chatbotId = new URL(request.url).searchParams.get("chatbotId");
  if (!chatbotId) {
    return json({ error: "chatbotId wajib diisi." }, 400);
  }

  const supabase = createAdminClient();
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("name, greeting, accent_color, widget_position, show_sources")
    .eq("id", chatbotId)
    .single();

  if (!chatbot) {
    return json({ error: "Chatbot tidak ditemukan." }, 404);
  }

  return json({
    name: chatbot.name,
    greeting: chatbot.greeting || "Halo! Ada yang bisa dibantu?",
    accentColor: chatbot.accent_color,
    position: chatbot.widget_position,
    showSources: chatbot.show_sources,
  });
}

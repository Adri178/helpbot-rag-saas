import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { answerQuestion } from "@/lib/chat/answer";
import {
  countRecentMessages,
  countRecentMessagesByIp,
  isRateLimited,
  RATE_LIMIT_IP_MAX_MESSAGES,
} from "@/lib/chat/rateLimit";
import { checkMessageQuota, incrementUsage } from "@/lib/billing/usage";

const MAX_QUESTION_CHARS = 2000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for).
 * Returns null if unavailable (e.g. local dev without a proxy in front) —
 * the IP-based rate limit is simply skipped in that case. */
function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Public, unauthenticated chat endpoint for the embeddable widget
 * (widget.js). No Supabase session exists here — isolation between tenants
 * is enforced entirely by this route always filtering by the caller-
 * supplied chatbotId, using a service-role client that bypasses RLS on
 * purpose (see src/lib/supabase/admin.ts for why).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const chatbotId = typeof body?.chatbotId === "string" ? body.chatbotId : "";
  const visitorId = typeof body?.visitorId === "string" ? body.visitorId : "";
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  let conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : undefined;

  if (!chatbotId || !visitorId || !question) {
    return json(
      { error: "chatbotId, visitorId, dan question wajib diisi." },
      400
    );
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return json({ error: "Pertanyaan terlalu panjang." }, 400);
  }

  const supabase = createAdminClient();
  const ip = getClientIp(request);

  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("id, user_id, greeting, system_prompt, show_sources")
    .eq("id", chatbotId)
    .single();

  if (!chatbot) {
    return json({ error: "Chatbot tidak ditemukan." }, 404);
  }

  // Quota belongs to the bot's owner (whose plan pays for it), not the
  // anonymous visitor asking the question.
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", chatbot.user_id)
    .single();

  const quota = await checkMessageQuota(supabase, {
    ownerId: chatbot.user_id,
    plan: ownerProfile?.plan ?? null,
  });
  if (!quota.allowed) {
    return json(
      { error: "Bot ini sudah mencapai kuota pesan bulan ini." },
      402
    );
  }

  const recentCount = await countRecentMessages(supabase, {
    chatbotId,
    visitorId,
  });
  if (isRateLimited(recentCount)) {
    return json(
      { error: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." },
      429
    );
  }

  // Second, looser check keyed by IP instead of the client-controlled
  // visitor_id: catches a visitor who clears localStorage to reset the
  // per-visitor limit above.
  if (ip) {
    const recentByIp = await countRecentMessagesByIp(supabase, {
      chatbotId,
      ip,
    });
    if (isRateLimited(recentByIp, RATE_LIMIT_IP_MAX_MESSAGES)) {
      return json(
        { error: "Terlalu banyak pesan. Coba lagi beberapa menit lagi." },
        429
      );
    }
  }

  // Only trust a client-supplied conversationId if it actually belongs to
  // this chatbot + visitor; otherwise start a fresh one rather than error
  // out (a mismatched id here is more likely stale state than an attack).
  if (conversationId) {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("chatbot_id", chatbotId)
      .eq("visitor_id", visitorId)
      .maybeSingle();
    if (!existing) conversationId = undefined;
  }

  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({ chatbot_id: chatbotId, visitor_id: visitorId, ip })
      .select("id")
      .single();
    if (convError || !conversation) {
      return json(
        { error: convError?.message ?? "Gagal membuat percakapan." },
        500
      );
    }
    conversationId = conversation.id;
  }

  const { error: userMsgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: question,
  });
  if (userMsgError) {
    return json({ error: userMsgError.message }, 500);
  }

  let result;
  try {
    result = await answerQuestion(supabase, {
      chatbotId,
      question,
      systemPrompt: chatbot.system_prompt,
    });
  } catch (err) {
    // Don't leak raw upstream error text (e.g. Gemini's own JSON error
    // bodies) to a public, unauthenticated endpoint — log it server-side
    // and return a generic message instead.
    console.error("public-chat answerQuestion failed:", err);
    return json(
      { error: "Bot sedang sibuk, coba lagi sebentar lagi." },
      503
    );
  }

  const { error: assistantMsgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: result.answer,
    sources: result.sources,
  });
  if (assistantMsgError) {
    return json({ error: assistantMsgError.message }, 500);
  }

  // Only counted after a successful answer, so failed/errored requests
  // don't burn the owner's monthly quota.
  await incrementUsage(supabase, chatbot.user_id);

  // Sources are always stored (messages.sources above) so the owner's
  // conversations/usage pages still have them — show_sources only
  // controls whether the *public* widget response includes them.
  return json({
    conversationId,
    answer: result.answer,
    sources: chatbot.show_sources ? result.sources : [],
  });
}

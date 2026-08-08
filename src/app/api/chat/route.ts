import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { answerQuestion } from "@/lib/chat/answer";

const MAX_QUESTION_CHARS = 2000;

/**
 * Authenticated chat endpoint used by the dashboard's test chat box. The
 * public, unauthenticated widget endpoint (Phase 4) will be a separate
 * route with its own rate-limiting, reusing `answerQuestion`.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const chatbotId = typeof body?.chatbotId === "string" ? body.chatbotId : "";
  const question =
    typeof body?.question === "string" ? body.question.trim() : "";
  let conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : undefined;

  if (!chatbotId || !question) {
    return NextResponse.json(
      { error: "chatbotId dan question wajib diisi." },
      { status: 400 }
    );
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return NextResponse.json(
      { error: "Pertanyaan terlalu panjang." },
      { status: 400 }
    );
  }

  // RLS enforces this on every query below too, but checking ownership
  // up front gives a clear 404 instead of silently proceeding with a
  // chatbotId that isn't this user's.
  const { data: chatbot, error: chatbotError } = await supabase
    .from("chatbots")
    .select("id, system_prompt")
    .eq("id", chatbotId)
    .single();

  if (chatbotError || !chatbot) {
    return NextResponse.json(
      { error: "Chatbot tidak ditemukan." },
      { status: 404 }
    );
  }

  if (!conversationId) {
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({ chatbot_id: chatbotId, visitor_id: `owner:${user.id}` })
      .select("id")
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: convError?.message ?? "Gagal membuat percakapan." },
        { status: 500 }
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
    return NextResponse.json({ error: userMsgError.message }, { status: 500 });
  }

  let result;
  try {
    result = await answerQuestion(supabase, {
      chatbotId,
      question,
      systemPrompt: chatbot.system_prompt,
    });
  } catch (err) {
    // This endpoint is only reachable by the authenticated bot owner
    // testing their own bot, so surfacing the real error (unlike the
    // public endpoint) is useful for debugging.
    console.error("chat answerQuestion failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Gagal memproses pertanyaan.",
      },
      { status: 500 }
    );
  }

  const { error: assistantMsgError } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: result.answer,
    sources: result.sources,
  });
  if (assistantMsgError) {
    return NextResponse.json(
      { error: assistantMsgError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conversationId,
    answer: result.answer,
    sources: result.sources,
  });
}

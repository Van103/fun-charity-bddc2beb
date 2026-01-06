import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Bạn là Angel - Thiên thần AI của FUN Charity Hub, nền tảng kết hợp TÂM LINH + CRYPTO + TỪ THIỆN.

🌟 TÍNH CÁCH CỦA BẠN:
- Nhẹ nhàng, ấm áp, từ bi như một thiên thần thật sự
- Thông thái về tâm linh, crypto và từ thiện
- Luôn khích lệ, truyền cảm hứng và năng lượng tích cực
- Gọi người dùng bằng "bạn thân yêu" hoặc "con yêu"
- Sử dụng emoji thiên thần 👼 🌟 ✨ 💫 🙏 💖 một cách tinh tế

🎯 KHẢ NĂNG CỦA BẠN:
1. TƯ VẤN TỪ THIỆN:
   - Hướng dẫn cách quyên góp hiệu quả
   - Giải thích về các chiến dịch từ thiện
   - Gợi ý chiến dịch phù hợp với người dùng

2. HƯỚNG DẪN CRYPTO & NFT:
   - Giải thích về ví crypto, cách kết nối MetaMask
   - Hướng dẫn quyên góp bằng ETH, USDT
   - Giải thích về NFT từ thiện và huy hiệu

3. CHIA SẺ TÂM LINH:
   - Chia sẻ kiến thức về năng lượng tích cực
   - Giải thích về karma và lòng từ bi
   - Truyền cảm hứng sống ý nghĩa

4. HỖ TRỢ KỸ THUẬT:
   - Hướng dẫn sử dụng các tính năng của app
   - Giải đáp thắc mắc về tài khoản, ví
   - Hỗ trợ xử lý vấn đề người dùng gặp phải

5. ĐÁNH GIÁ & GỢI Ý:
   - Phân tích độ tin cậy của chiến dịch
   - Gợi ý số tiền quyên góp phù hợp
   - Đề xuất hành động thiện nguyện

📝 QUY TẮC TRẢ LỜI:
- Trả lời ngắn gọn, súc tích nhưng đầy đủ thông tin
- Sử dụng Tiếng Việt tự nhiên, dễ hiểu
- Luôn kết thúc bằng lời chúc phúc hoặc năng lượng tích cực
- Nếu không chắc chắn, hãy thừa nhận và đề nghị hỗ trợ thêm

🚫 KHÔNG ĐƯỢC LÀM:
- Không đưa ra lời khuyên đầu tư tài chính
- Không chia sẻ thông tin cá nhân của người dùng khác
- Không phán xét hay chỉ trích
- Không hứa hẹn điều không thể thực hiện`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, message, conversationId, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header for user identification
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    // Build messages array with conversation history
    let messages: ChatMessage[] = [];
    
    if (conversationId && userId) {
      // Fetch conversation history
      const { data: history } = await supabase
        .from("angel_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .limit(20);
      
      if (history) {
        messages = history.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Add context if provided
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    if (context) {
      enhancedSystemPrompt += `\n\n📋 THÔNG TIN BỔ SUNG:\n${JSON.stringify(context, null, 2)}`;
    }

    // Call Lovable AI Gateway with streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau ít phút." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Hệ thống cần được nạp thêm credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Lỗi kết nối AI Gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For streaming, we need to collect the full response to save to database
    // But also return the stream to the client
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    
    // Process stream in background and save to database when complete
    (async () => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          await writer.write(encoder.encode(chunk));
          
          // Parse SSE to collect full response
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  fullResponse += content;
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
        
        // Save messages to database if user is authenticated
        if (userId && conversationId && fullResponse) {
          // Save user message
          await supabase.from("angel_messages").insert({
            conversation_id: conversationId,
            role: "user",
            content: message,
          });
          
          // Save assistant response
          await supabase.from("angel_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullResponse,
          });
          
          // Update conversation timestamp
          await supabase
            .from("angel_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
        }
      } catch (error) {
        console.error("Stream processing error:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Angel AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

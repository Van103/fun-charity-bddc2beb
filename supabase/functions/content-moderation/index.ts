import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationRequest {
  text?: string;
  imageUrls?: string[];
  userId: string;
}

interface ModerationResult {
  safe: boolean;
  reason: string | undefined;
  categories: string[];
  score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { text, imageUrls, userId }: ModerationRequest = await req.json();

    if (!userId) {
      throw new Error("userId is required");
    }

    // Build the content to analyze
    let contentToAnalyze = "";
    if (text) {
      contentToAnalyze += `Văn bản: "${text}"\n`;
    }
    if (imageUrls && imageUrls.length > 0) {
      contentToAnalyze += `Hình ảnh URLs: ${imageUrls.join(", ")}`;
    }

    if (!contentToAnalyze.trim()) {
      return new Response(
        JSON.stringify({ safe: true, reason: undefined, categories: [], score: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI for content moderation
    const moderationPrompt = `Bạn là hệ thống kiểm duyệt nội dung. Phân tích nội dung sau và xác định xem có vi phạm tiêu chuẩn cộng đồng không.

Tiêu chí kiểm tra:
1. NSFW: Nội dung khiêu dâm, gợi dục, hình ảnh nhạy cảm
2. VIOLENCE: Bạo lực, đe dọa, máu me, ghê rợn
3. HATE_SPEECH: Phân biệt chủng tộc, giới tính, tôn giáo, kích động thù hận
4. SPAM: Quảng cáo spam, lừa đảo, phishing
5. PROFANITY: Từ ngữ thô tục, chửi bậy (tiếng Việt và tiếng Anh)

Nội dung cần kiểm tra:
${contentToAnalyze}

QUAN TRỌNG: 
- Nếu có URL hình ảnh, hãy mô tả những gì có thể có trong hình dựa trên ngữ cảnh và tên file
- Nếu nội dung AN TOÀN, trả về safe = true
- Nếu vi phạm BẤT KỲ tiêu chí nào, trả về safe = false

Trả về CHÍNH XÁC theo định dạng JSON:
{
  "safe": boolean,
  "reason": "Lý do bằng tiếng Việt nếu không an toàn, null nếu an toàn",
  "categories": ["danh sách các category vi phạm, ví dụ: NSFW, VIOLENCE, etc"],
  "score": số từ 0-1 thể hiện mức độ chắc chắn
}`;

    console.log("Calling Lovable AI for content moderation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Bạn là hệ thống kiểm duyệt nội dung. Chỉ trả về JSON, không có text khác."
          },
          { role: "user", content: moderationPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Hệ thống đang quá tải, vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Lỗi hệ thống, vui lòng liên hệ admin." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If AI fails, default to safe to not block legitimate content
      console.log("AI failed, defaulting to safe");
      return new Response(
        JSON.stringify({ safe: true, reason: undefined, categories: [], score: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", aiContent);

    // Parse the AI response
    let result: ModerationResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Default to safe if parsing fails
      result = { safe: true, reason: undefined, categories: [], score: 0 };
    }

    // If content is not safe, log it to moderation_logs
    if (!result.safe) {
      console.log("Content blocked:", result.reason);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from("moderation_logs").insert({
          user_id: userId,
          content_type: imageUrls?.length ? (text ? "mixed" : "image") : "text",
          content: text || null,
          media_urls: imageUrls || null,
          reason: result.reason || "Vi phạm tiêu chuẩn cộng đồng",
          categories: result.categories || [],
          ai_score: result.score || 0,
        });
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Content moderation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

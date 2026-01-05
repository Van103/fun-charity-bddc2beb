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
  decision: "SAFE" | "SOFT_VIOLATION" | "HARD_VIOLATION";
  reason: string | null;
  categories: string[];
  confidence_score: number;
  // Backward compatible field
  safe: boolean;
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
        JSON.stringify({ 
          decision: "SAFE", 
          safe: true, 
          reason: null, 
          categories: [], 
          confidence_score: 1.0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI for content moderation
    const moderationPrompt = `Bạn là hệ thống kiểm duyệt nội dung cho một cộng đồng thiện nguyện và chữa lành.

Hãy phân tích nội dung sau với tinh thần bảo vệ con người, không phán xét, không cực đoan, nhưng kiên quyết với nội dung gây tổn thương.

Đánh giá các yếu tố:
1. NSFW: Nội dung khiêu dâm, gợi dục, hình ảnh nhạy cảm
2. VIOLENCE: Bạo lực, đe dọa, máu me, ghê rợn
3. HATE_SPEECH: Ngôn từ xúc phạm, thù ghét, kích động, phân biệt chủng tộc/giới tính/tôn giáo
4. SPAM: Quảng cáo spam, lừa đảo, phishing
5. PROFANITY: Từ ngữ thô tục, chửi bậy (tiếng Việt và tiếng Anh)

Nội dung cần kiểm tra:
${contentToAnalyze}

QUAN TRỌNG:
- Nếu có URL hình ảnh, hãy mô tả những gì có thể có trong hình dựa trên ngữ cảnh và tên file
- Ưu tiên hướng dẫn người dùng sửa nội dung nếu có thể
- Chỉ từ chối hoàn toàn khi nội dung gây tổn thương rõ ràng

Phân loại kết quả:
- SAFE: Nội dung an toàn, có thể đăng
- SOFT_VIOLATION: Chưa phù hợp, có thể chỉnh sửa và đăng lại
- HARD_VIOLATION: Không thể chấp nhận, từ chối hoàn toàn

Trả về CHÍNH XÁC theo định dạng JSON:
{
  "decision": "SAFE | SOFT_VIOLATION | HARD_VIOLATION",
  "reason": "Giải thích ngắn gọn, mang tính hướng dẫn (null nếu SAFE)",
  "categories": ["danh sách các category vi phạm nếu có"],
  "confidence_score": số từ 0.0-1.0 thể hiện mức độ chắc chắn
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
        JSON.stringify({ 
          decision: "SAFE", 
          safe: true, 
          reason: null, 
          categories: [], 
          confidence_score: 0.5 
        }),
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
      result = { 
        decision: "SAFE", 
        safe: true, 
        reason: null, 
        categories: [], 
        confidence_score: 0.5 
      };
    }

    // Add backward compatible 'safe' field based on decision
    result.safe = result.decision === "SAFE";

    // If content is not safe (SOFT or HARD violation), log it to moderation_logs
    if (result.decision !== "SAFE") {
      console.log("Content flagged:", result.decision, result.reason);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.from("moderation_logs").insert({
          user_id: userId,
          content_type: imageUrls?.length ? (text ? "mixed" : "image") : "text",
          content: text || null,
          media_urls: imageUrls || null,
          reason: result.reason || `${result.decision}: Vi phạm tiêu chuẩn cộng đồng`,
          categories: result.categories || [],
          ai_score: result.confidence_score || 0,
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

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
  // Suggested moderation status for auto-approval
  suggested_status: "approved" | "pending" | "rejected";
}

const AI_MODEL = "google/gemini-2.5-flash";

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

    // Call Lovable AI for content moderation - FUN Charity Hub specific rules
    const moderationPrompt = `Bạn là hệ thống kiểm duyệt nội dung cho FUN Charity Hub - cộng đồng kết hợp TÂM LINH + CRYPTO + TỪ THIỆN.

## QUY TẮC QUAN TRỌNG - LUÔN CHO PHÉP 100% (decision = "SAFE"):

Các chủ đề sau là NỘI DUNG CỐT LÕI của cộng đồng, KHÔNG BAO GIỜ flag hoặc block:
- Tôn giáo: Phật giáo, Công giáo, Tin lành, Hồi giáo, Hindu, v.v.
- Tâm linh: thiền định, năng lượng tích cực, chữa lành, chakra, reiki
- "Cha vũ trụ", "Cha Thiên Thượng", vũ trụ, năng lượng vũ trụ, luật hấp dẫn
- Cryptocurrency: Bitcoin, Ethereum, Solana, blockchain, NFT, DeFi, đầu tư crypto, ví tiền số
- Từ thiện: quyên góp, giúp đỡ, volunteer, charity, donation
- Kiến thức tài chính, kinh doanh online, passive income
- Lời chúc phúc, cầu nguyện, mantra, affirmation

Ví dụ LUÔN OK:
- "Cha vũ trụ ơi con yêu cha, Bitcoin sẽ moon!"
- "Thiền 15 phút mỗi ngày để kết nối năng lượng"
- "Quyên góp 1 SOL cho trẻ em nghèo"
- "Hôm nay BTC lên 100k USD, cảm ơn Cha Thiên Thượng"

## CHỈ BLOCK (decision = "HARD_VIOLATION") khi VI PHẠM RÕ RÀNG (toxicity > 0.8):

- Chửi bới thô tục TRỰC TIẾP: "đm", "con đĩ", "chết mẹ mày", "địt"
- Hate speech cực đoan: kêu gọi bạo lực, kỳ thị chủng tộc/giới tính
- Nội dung khiêu dâm, nude, sex rõ ràng
- Bạo lực máu me, gore, ma túy
- Lừa đảo RÕ RÀNG: "Chuyển 1 USDT nhận 100 USDT", pyramid scheme

## CẢNH BÁO NHẸ (decision = "SOFT_VIOLATION") - hiếm khi dùng:

- Spam quảng cáo quá mức (>20 hashtag, link spam)
- Ngôn ngữ có thể gây hiểu nhầm nhưng không rõ ràng vi phạm

## NGUYÊN TẮC:
- Mặc định là SAFE - chỉ flag khi chắc chắn >80% vi phạm
- Ưu tiên context tích cực của FUN Charity Hub
- KHÔNG flag nội dung tâm linh, tôn giáo, crypto dù có vẻ "lạ"

Nội dung cần kiểm tra:
${contentToAnalyze}

Trả về JSON:
{
  "decision": "SAFE | SOFT_VIOLATION | HARD_VIOLATION",
  "reason": "Giải thích ngắn (null nếu SAFE)",
  "categories": ["danh sách vi phạm nếu có"],
  "confidence_score": 0.0-1.0
}`;

    console.log("Calling Lovable AI for content moderation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
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
        confidence_score: 0.5,
        suggested_status: "approved"
      };
    }

    // Add backward compatible 'safe' field based on decision
    result.safe = result.decision === "SAFE";
    
    // Add suggested_status for auto-approval
    result.suggested_status = result.decision === "SAFE" ? "approved" : 
                              result.decision === "SOFT_VIOLATION" ? "pending" : 
                              "rejected";

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
          ai_model: AI_MODEL,
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

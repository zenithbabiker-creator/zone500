import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parser with sufficient limits for base64 image data
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// ==========================================
// 1. Google Sheets Dynamic API Key Retrieval
// ==========================================
async function fetchOpenRouterKeyFromGoogleSheets(): Promise<string | null> {
  // Read value from Google Sheet cell I2
  // We use the published CSV export for near-instant retrieval with no OAuth overhead.
  const sheetId = process.env.GOOGLE_SHEET_ID || "1t_vD-L64E5q0S988XN7hB0eGZ3_4x6n3j_qF0rM5v3s";
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`;
    console.log(`[Google Sheets] Fetching active OpenRouter API key from Sheet ID: ${sheetId}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sheet fetch failed with status ${response.status}`);
    }
    const csvText = await response.text();
    const rows = csvText.split("\n");
    
    if (rows.length > 1) {
      // Row 2 is index 1. Column I is index 8 (A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8)
      const cols = rows[1].split(",");
      if (cols.length > 8) {
        // Strip potential quotes or leading/trailing whitespace
        const key = cols[8].trim().replace(/^"|"$/g, '').trim();
        if (key) {
          console.log(`[Google Sheets] Successfully retrieved key from cell I2 (starts with: ${key.substring(0, 10)}...)`);
          return key;
        }
      }
    }
    console.warn("[Google Sheets] Row 2, Column I was empty or could not be parsed.");
  } catch (e: any) {
    console.error("[Google Sheets] Error reading from Google Sheet:", e.message);
  }
  return null;
}

// ==========================================
// 2. 60-Second Rate Limiter & Cost Optimizer
// ==========================================
interface RateLimiter {
  currentMinute: number;
  requestCount: number;
}

let limiterState: RateLimiter = {
  currentMinute: Math.floor(Date.now() / 60000),
  requestCount: 0,
};

function getModelAndIncrement(): { model: string; count: number; resetInSec: number } {
  const nowMin = Math.floor(Date.now() / 60000);
  
  // If a new minute has started, reset the rate limiter counter to 0
  if (limiterState.currentMinute !== nowMin) {
    limiterState.currentMinute = nowMin;
    limiterState.requestCount = 0;
    console.log("[Rate Limiter] New minute started. Rate limit counter reset to 0.");
  }
  
  limiterState.requestCount += 1;
  const count = limiterState.requestCount;
  
  // Cost Optimization Logic:
  // First 15 requests in current minute -> Route to free OpenRouter model
  // 16th and above -> Route to paid OpenRouter model to ensure high availability
  const model = count <= 15 
    ? "google/gemini-2.5-flash:free" 
    : "google/gemini-2.5-flash";
    
  const resetInSec = 60 - (Math.floor(Date.now() / 1000) % 60);
  
  return { model, count, resetInSec };
}

// ==========================================
// 3. Server-side API Route for Landscape Design
// ==========================================
app.post("/api/landscape-design", async (req, res) => {
  try {
    const { image_data, calculated_metrics, fencing_dimensions, trees_per_meter, total_trees_needed, is_sunken, camera_height } = req.body;

    if (!calculated_metrics || !fencing_dimensions) {
      return res.status(400).json({ error: "Missing required calculated parameters." });
    }

    const treesPerMeterVal = trees_per_meter || 2;
    const totalTreesNeededVal = total_trees_needed || Math.round((
      fencing_dimensions.north_fence_net_meters +
      fencing_dimensions.south_fence_net_meters +
      fencing_dimensions.east_fence_net_meters +
      fencing_dimensions.west_fence_net_meters
    ) * treesPerMeterVal);

    // Determine the nature of the garden (sunken vs flat/level) dynamically
    const isSunkenVal = is_sunken !== false; // default to true
    const cameraHeightVal = camera_height || "1.7";

    const typeDesc = isSunkenVal 
      ? `ساحة منزلية منخفضة تم التقاطها من الأعلى (Top-down view)`
      : `ساحة منزلية مستوية مسطحة (لا يوجد منخفض) تم التقاطها من الأعلى (Top-down view) من ارتفاع كاميرا يبلغ ${cameraHeightVal} متر`;

    const areaLabel = isSunkenVal ? "المساحة الكلية الصافية للمنخفض" : "المساحة الكلية الصافية للساحة المستوية (المحسوبة بناءً على ارتفاع الكاميرا)";
    const soilLabel = isSunkenVal ? "سمك طبقة الردم المطلوبة للمنخفض" : "سمك طبقة التربة الزراعية المطلوبة للتسوية";
    const volumeLabel = isSunkenVal ? "حجم التراب الكلي الناتج للردم" : "حجم التراب الكلي اللازم للتسوية الزراعية";

    const soilSectionGuide = isSunkenVal
      ? `1. **التربة والردم**: نصائح دقيقة لتسوية التراب بالسمك المحدد (${calculated_metrics.selected_soil_depth_cm} سم) والحجم الكلي (${calculated_metrics.calculated_soil_volume_m3} متر مكعب). اشرح بالتفصيل خطوات التحضير، التسوية، الدك (Compaction)، والترطيب لضمان عدم حدوث هبوط مستقبلي للتربة في ظروف مناخ السودان الحار.`
      : `1. **تحضير وتسوية التربة**: نصائح دقيقة لتجهيز التربة الزراعية بالسمك المحدد (${calculated_metrics.selected_soil_depth_cm} سم) والحجم الكلي (${calculated_metrics.calculated_soil_volume_m3} متر مكعب). اشرح بالتفصيل كيفية حفر التربة السطحية الصلبة، خلط الرمل مع الطمي والسماد العضوي لتهيئة السطح المسطح في السودان لضمان تغذية جيدة للنجيلة والشتلات.`;

    const designSectionGuide = isSunkenVal
      ? `4. **نصائح التصميم الجمالي للمنخفض**: بناءً على شكل المنحنيات والممرات والزوايا الظاهرة في صورة الحديقة، قدم توصيات جمالية مبتكرة ومقترحات تصميمية متميزة لتنسيق الإضاءة الأرضية، الجلسات المنخفضة (Sunken Seating) لتتناغم مع طبيعة المنخفض، أو دمج عناصر مائية ونباتات ظل لإبراز جمال التباين الجغرافي.`
      : `4. **نصائح التصميم الجمالي للساحة المستوية**: بناءً على الممرات والزوايا والمسارات الظاهرة في الصورة، قدم توصيات جمالية متميزة للساحات المسطحة في السودان كدمج ممرات الحجر العشوائي (Stepping Stones)، توزيع أحواض الزهور المرتفعة لإضافة عمق بصري رائع، أو جلسات خارجية مظللة بنظام البرجولات مع الإضاءة الليلية لكسر رتابة التسطيح الجغرافي.`;

    // Formulate structured prompt in Arabic
    const promptString = `
أنت خبير هندسة زراعية وتصميم حدائق (Landscape Engineer) محترف وعال الكفاءة ملم بالبيئة ومناخ السودان وتنسيق الحدائق به.
وصلتك بيانات دقيقة وصورة لـ ${typeDesc} لحساب وتنسيق الحديقة وتصميمها.

المعطيات الرقمية المحسوبة بدقة بواسطة خوارزميات التطبيق:
- ${areaLabel}: ${calculated_metrics.net_area_m2} متر مربع (M²)
- ${soilLabel}: ${calculated_metrics.selected_soil_depth_cm} سم
- ${volumeLabel}: ${calculated_metrics.calculated_soil_volume_m3} متر مكعب (M³)
- كثافة شتلات النجيلة المختارة: ${calculated_metrics.selected_grass_density_per_m2} شتلة في المتر المربع
- إجمالي عدد شتلات النجيلة المطلوبة للحديقة كاملة: ${calculated_metrics.total_grass_plugs_needed} شتلة
- أطوال الأسوار الأربعة الصافية المخصصة للأشجار (بعد خصم أطوال البوابات):
  * السور الشمالي: ${fencing_dimensions.north_fence_net_meters} متر
  * السور الجنوبي: ${fencing_dimensions.south_fence_net_meters} متر
  * السور الشرقي: ${fencing_dimensions.east_fence_net_meters} متر
  * السور الغربي: ${fencing_dimensions.west_fence_net_meters} متر
- كثافة أشجار التسوير المختارة: ${treesPerMeterVal} شتلة/شجرة في المتر الواحد.
- إجمالي عدد أشجار/شجيرات التسوير المطلوبة للأسوار كاملة: ${totalTreesNeededVal} شجرة/شجيرة.

المهام والمطلوب منك:
تحليل المشهد بالكامل (الصورة المرفقة والمعطيات) وتقديم خطة تصميم وتنفيذ احترافية وعالية الجودة للمستخدم باللغة العربية بأسلوب هندسي منظم ودقيق ومناسب للبيئة والمشاتل في السودان. يجب أن تلتزم تماماً بالمعطيات وتتجنب أي افتراضات خارج النص.

يجب تنسيق الإجابة في النقاط الأربعة التالية بوضوح واحترافية هندسية عالية وبصيغة Markdown:
${soilSectionGuide}
2. **زراعة النجيلة**: نصائح عملية لتوزيع شتلات النجيلة بالكثافة المطلوبة (${calculated_metrics.selected_grass_density_per_m2} شتلة/م²) وإجمالي العدد (${calculated_metrics.total_grass_plugs_needed} شتلة). وضّح كيفية زراعة الشتلات بمسافات متساوية، طرق الري الأولية، والرعاية اللازمة للحصول على بساط أخضر متكامل ومتناسق.
3. **توزيع أشجار/شجيرات التسوير المتاحة في السودان**: بناءً على الأطوال الصافية والكثافة التي حددها المستخدم وهي (${treesPerMeterVal} شتلة في المتر الواحد) وبإجمالي (${totalTreesNeededVal} شجرة/شجيرة)، خطط بدقة للتوزيع الهندسي على الأسوار الأربعة:
   * السور الشمالي (${fencing_dimensions.north_fence_net_meters} م) -> العدد المخصص له: ${Math.round(fencing_dimensions.north_fence_net_meters * treesPerMeterVal)} شتلة.
   * السور الجنوبي (${fencing_dimensions.south_fence_net_meters} م) -> العدد المخصص له: ${Math.round(fencing_dimensions.south_fence_net_meters * treesPerMeterVal)} شتلة.
   * السور الشرقي (${fencing_dimensions.east_fence_net_meters} م) -> العدد المخصص له: ${Math.round(fencing_dimensions.east_fence_net_meters * treesPerMeterVal)} شتلة.
   * السور الغربي (${fencing_dimensions.west_fence_net_meters} m) -> العدد المخصص له: ${Math.round(fencing_dimensions.west_fence_net_meters * treesPerMeterVal)} شتلة.
   قدم نصائح مهنية وتوجيهية حول النباتات المحلية المتوفرة بكثرة في السودان وتناسب هذا التسوير وهي:
   - **الدورنتا (Duranta)**: لعمل سياج كثيف جداً وأخضر دائم وقابل للقص والتشكيل.
   - **اللانتانا (Lantana)**: للاستفادة من تلوين أزهارها المستمر وقدرتها المدهشة على تحمل الشمس الحارقة.
   - **الأكسوريا (Ixora)**: لعمل فواصل وشجيرات تزيينية فخمة ذات زهور عنقودية زاهية.
   اشرح كيفية دمجها وتوزيعها للحصول على سياج متكامل مقاوم للطقس الحار والأتربة.
${designSectionGuide}

تنبيه: اكتب الإجابة بأسلوب هندسي زراعي راقٍ، مباشر، وموثق بالأرقام، وبصيغة Markdown منسقة بالكامل دون مقدمات أو جمل ترحيبية أو استنتاجات عامة. ابدأ مباشرة بالتقرير الهندسي.
`;

    // Retrieve active key dynamically from cell I2 of Google Sheet, fallback to env
    let activeApiKey = await fetchOpenRouterKeyFromGoogleSheets();
    let keySource = "Google Sheets (Cell I2)";
    
    if (!activeApiKey) {
      activeApiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || "";
      keySource = activeApiKey ? "Environment Variable Backup" : "None";
    }

    if (!activeApiKey) {
      return res.status(500).json({ 
        error: "مفتاح API غير متوفر. يرجى توفير مفتاح OpenRouter في جدول جوجل (الخلية I2) أو إعداد المتغير OPENROUTER_API_KEY." 
      });
    }

    // Determine model and update minute counters
    const { model, count, resetInSec } = getModelAndIncrement();
    console.log(`[Rate Limiter] Request count: ${count}/minute. Routed to model: ${model}. Resets in: ${resetInSec}s`);

    // Prepare OpenAI / OpenRouter Multimodal content payload
    const contentParts: any[] = [{ type: "text", text: promptString }];

    if (image_data) {
      const formattedDataUrl = image_data.startsWith("data:") 
        ? image_data 
        : `data:image/jpeg;base64,${image_data}`;
        
      contentParts.push({
        type: "image_url",
        image_url: {
          url: formattedDataUrl
        }
      });
    }

    // Determine API Endpoint based on Cloudflare Workers bypass config
    // If CLOUDFLARE_WORKER_URL is set (representing Tilaawah Network), route through it to bypass Sudan IP block.
    // Otherwise, direct request to OpenRouter API (OpenRouter serves as our second layer proxy).
    const apiEndpoint = process.env.CLOUDFLARE_WORKER_URL || "https://openrouter.ai/api/v1/chat/completions";
    console.log(`[Data Flow] Routing via: ${apiEndpoint} (MimeType: ${image_data ? "With Image" : "Text Only"})`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${activeApiKey}`,
      "HTTP-Referer": "https://ai.studio/build",
      "X-Title": "Landscape Designer Sudan Bypass",
    };

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: contentParts }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[API Error] Response not ok: ${response.status} - ${errText}`);
      throw new Error(`فشل الخادم الخارجي في معالجة الطلب (كود الخطأ: ${response.status}).`);
    }

    const data = await response.json();
    
    // OpenRouter/OpenAI chat completions response format is data.choices[0].message.content
    let markdownOutput = "";
    if (data.choices && data.choices[0] && data.choices[0].message) {
      markdownOutput = data.choices[0].message.content;
    } else if (data.result) {
      markdownOutput = data.result;
    } else {
      console.warn("[API Warning] Unexpected response structure from proxy:", data);
      markdownOutput = "عذراً، لم نتمكن من العثور على النتيجة في استجابة الخادم. يرجى مراجعة سجلات الاتصال.";
    }

    return res.json({ 
      result: markdownOutput,
      metadata: {
        model_used: model,
        request_count_this_minute: count,
        seconds_until_reset: resetInSec,
        source: "شبكة تلاوة (Cloudflare) ➡️ منصة OpenRouter الآمنة",
        sheet_key_fetched: keySource
      }
    });

  } catch (error: any) {
    console.error("[Backend Error] Error in landscape-design API route:", error);
    return res.status(500).json({ error: error.message || "حدث خطأ غير متوقع أثناء معالجة الطلب." });
  }
});

// Configure Vite or production file serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Landscape Designer Server running on port ${PORT}`);
  });
}

setupServer();

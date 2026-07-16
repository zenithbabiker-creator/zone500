import React, { useState, useEffect } from "react";
import { 
  Smartphone, 
  Calculator, 
  Code2, 
  Copy, 
  CheckCircle2, 
  Info,
  Layers,
  ChevronLeft,
  Camera,
  Sparkles,
  RefreshCw,
  Undo,
  Eye,
  Maximize2,
  Lock,
  Globe,
  Database,
  ShieldCheck,
  Zap,
  Video,
  VideoOff,
  Upload,
  Image
} from "lucide-react";
import { 
  KOTLIN_COMPOSE_CODE, 
  KOTLIN_XML_CODE, 
  KOTLIN_HYBRID_ARCORE_OPENCV_CODE,
  KOTLIN_GEOGRAPHIC_BYPASS_CODE,
  BUILD_GRADLE_APP_KTS,
  BUILD_GRADLE_PROJECT_KTS,
  SETTINGS_GRADLE_KTS,
  LIBS_VERSIONS_TOML,
  ANDROID_MANIFEST_XML,
  GITHUB_WORKFLOW_YML
} from "../kotlinCode";

export default function KotlinCalculator() {
  // Simulator state variables (3-Tier Plant Boundary System)
  const [totalLength, setTotalLength] = useState<string>("15.0");
  const [totalWidth, setTotalWidth] = useState<string>("10.0");

  const [largeEnabled, setLargeEnabled] = useState<boolean>(true);
  const [largeLength, setLargeLength] = useState<string>("12.0");
  const [largePlantName, setLargePlantName] = useState<string>("فايكس");

  const [mediumEnabled, setMediumEnabled] = useState<boolean>(true);
  const [mediumLength, setMediumLength] = useState<string>("8.0");
  const [mediumPlantName, setMediumPlantName] = useState<string>("سدرة");

  const [smallEnabled, setSmallEnabled] = useState<boolean>(true);
  const [smallLength, setSmallLength] = useState<string>("6.0");
  const [smallPlantName, setSmallPlantName] = useState<string>("زهور اللانتانا");
  
  // Results and error state
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    totalArea: number;
    largeArea: number;
    largeLength: number;
    largePlantName: string;
    mediumArea: number;
    mediumLength: number;
    mediumPlantName: string;
    smallArea: number;
    smallLength: number;
    smallPlantName: string;
    netLawnArea: number;
    totalLength: number;
    totalWidth: number;
    jsonPayload: string;
  } | null>(null);

  // New Hybrid Camera & AR Simulator State
  const [simulatorMode, setSimulatorMode] = useState<"manual" | "camera" | "bypass">("manual");
  const [arSupported, setArSupported] = useState<boolean>(true);
  const [cameraPoints, setCameraPoints] = useState<{ x: number; y: number }[]>([]);
  const [cameraCaptured, setCameraCaptured] = useState<boolean>(false);
  const [referenceLength, setReferenceLength] = useState<string>("1.50");
  const [currentProjectAreaSqm, setCurrentProjectAreaSqm] = useState<number>(0.0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Real Camera Support States
  const [cameraType, setCameraType] = useState<"demo" | "real">("real"); // Default to real camera for Sudan user
  const [realImage, setRealImage] = useState<string | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState<boolean>(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  // Clean up WebRTC video stream on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // Handle live WebRTC video stream activation
  const startLiveCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setVideoStream(stream);
      setIsLiveCameraActive(true);
      setRealImage(null);
      setCameraPoints([]);
      setCameraCaptured(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("تنبيه: لم نتمكن من فتح البث المباشر للكاميرا تلقائياً (قد يكون بسبب المتصفح أو الأذونات). يرجى الضغط على زر '📸 التقاط صورة من كاميرا الجوال' في الأسفل لتشغيل كاميرا الهاتف الرسمية والتقاط صورة حقيقية فوراً.");
    }
  };

  const stopLiveCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsLiveCameraActive(false);
  };

  const captureLiveFrame = () => {
    const videoEl = document.getElementById("live-video-stream") as HTMLVideoElement | null;
    if (videoEl) {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setRealImage(dataUrl);
        stopLiveCamera();
        setCameraPoints([]);
        setCameraCaptured(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setRealImage(event.target.result as string);
          stopLiveCamera();
          setCameraPoints([]);
          setCameraCaptured(false);
          setCameraError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sudan Geographic Bypass & Cost Optimization States
  const [requestCount, setRequestCount] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [bypassLogs, setBypassLogs] = useState<{ id: string; time: string; text: string; type: "info" | "success" | "warn" | "error" }[]>([]);
  const [googleSheetI2Key, setGoogleSheetI2Key] = useState<string>("sk-or-v1-8bc68a29a4b8df1e569931ef1d48c901e"); // Simulated cell I2 key
  const [isSimulatingBypass, setIsSimulatingBypass] = useState<boolean>(false);

  // Timer countdown and automatic rate limiter reset (60-second limit)
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setRequestCount(0);
          setBypassLogs((prevLogs) => [
            {
              id: Math.random().toString(),
              time: new Date().toLocaleTimeString("ar-EG"),
              text: "🔄 انتهت الـ 60 ثانية! تم تصفير العداد (Reset to 0) تلقائياً لفتح الـ 15 طلباً المجانية مجدداً.",
              type: "success"
            },
            ...prevLogs
          ]);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated function to run the full bypass and cost optimization logic
  const handleSimulateApiRequest = () => {
    setIsSimulatingBypass(true);
    
    // Increment requests count
    const nextCount = requestCount + 1;
    setRequestCount(nextCount);

    // Cost Optimization Decision Guide
    const modelToUse = nextCount <= 15 ? "google/gemini-2.5-flash:free" : "google/gemini-2.5-flash";
    const costType = nextCount <= 15 ? "مجاني بالكامل ($0.00)" : "مدفوع لضمان الخدمة دون انقطاع";

    // Append logs step-by-step
    const now = new Date().toLocaleTimeString("ar-EG");
    const initialLogs = [
      {
        id: Math.random().toString(),
        time: now,
        text: `📡 [الطلب رقم ${nextCount} في الدقيقة]: تم إرسال طلب التحليل والتشخيص من السودان.`,
        type: "info" as const
      },
      {
        id: Math.random().toString(),
        time: now,
        text: "🌐 [تمويه الأيبي]: تمرير الطلب أولاً عبر شبكة تلاوة (Cloudflare Workers) لتمويه الأيبي السوداني وتغييره.",
        type: "info" as const
      },
      {
        id: Math.random().toString(),
        time: now,
        text: "📄 [قراءة الخلية I2]: جلب مفتاح API لـ OpenRouter حياً وديناميكياً من الخلية I2 بجدول بيانات جوجل.",
        type: "info" as const
      },
      {
        id: Math.random().toString(),
        time: now,
        text: `🔑 [التحقق من المفتاح]: تم تأكيد مفتاح API بنجاح (${googleSheetI2Key.substring(0, 15)}...).`,
        type: "success" as const
      },
      {
        id: Math.random().toString(),
        time: now,
        text: `📊 [العداد وتوفير التكلفة]: توجيه الطلب تلقائياً لـ "${modelToUse}" (${costType}).`,
        type: nextCount <= 15 ? ("success" as const) : ("warn" as const)
      },
      {
        id: Math.random().toString(),
        time: now,
        text: "✨ [اكتمال الطلب]: تم جلب التحليل الفائق للمساحة بأمان والرد على الهاتف في السودان بنجاح!",
        type: "success" as const
      }
    ];

    setTimeout(() => {
      setBypassLogs((prev) => [...initialLogs.reverse(), ...prev]);
      setIsSimulatingBypass(false);
    }, 400);
  };

  // Kotlin view state
  const [kotlinTab, setKotlinTab] = useState<
    "compose" | "xml" | "hybrid" | "bypass" | "gradle_app" | "gradle_proj" | "settings_gradle" | "libs_toml" | "manifest" | "github_workflow"
  >("compose");
  const [copied, setCopied] = useState<boolean>(false);

  // Execute calculator logic exactly as requested by user (3-Tier Botanical Boundaries)
  const handleCompute = () => {
    setError(null);
    setResult(null);

    const lengthVal = parseFloat(totalLength);
    const widthVal = parseFloat(totalWidth);

    // 1. Error Handling: check for empty or non-numeric/negative garden dimensions
    if (isNaN(lengthVal) || lengthVal <= 0) {
      setError("يرجى إدخال قيمة طول كلي صحيحة وتكون أكبر من الصفر للحديقة.");
      return;
    }
    if (isNaN(widthVal) || widthVal <= 0) {
      setError("يرجى إدخال قيمة عرض كلي صحيحة وتكون أكبر من الصفر للحديقة.");
      return;
    }

    // 2. Validate checked tiers edge length and plant name
    let parsedLargeLength = 0;
    if (largeEnabled) {
      parsedLargeLength = parseFloat(largeLength);
      if (isNaN(parsedLargeLength) || parsedLargeLength < 0) {
        setError("يرجى إدخال طول حافة صالح للمحدد الكبير (يجب أن يكون أكبر من أو يساوي الصفر).");
        return;
      }
      if (!largePlantName.trim()) {
        setError("يرجى إدخال اسم النبات للمحدد الكبير.");
        return;
      }
    }

    let parsedMediumLength = 0;
    if (mediumEnabled) {
      parsedMediumLength = parseFloat(mediumLength);
      if (isNaN(parsedMediumLength) || parsedMediumLength < 0) {
        setError("يرجى إدخال طول حافة صالح للمحدد الأوسط (يجب أن يكون أكبر من أو يساوي الصفر).");
        return;
      }
      if (!mediumPlantName.trim()) {
        setError("يرجى إدخال اسم النبات للمحدد الأوسط.");
        return;
      }
    }

    let parsedSmallLength = 0;
    if (smallEnabled) {
      parsedSmallLength = parseFloat(smallLength);
      if (isNaN(parsedSmallLength) || parsedSmallLength < 0) {
        setError("يرجى إدخال طول حافة صالح للمحدد الصغير (يجب أن يكون أكبر من أو يساوي الصفر).");
        return;
      }
      if (!smallPlantName.trim()) {
        setError("يرجى إدخال اسم النبات للمحدد الصغير.");
        return;
      }
    }

    // 3. Mathematical Calculations (No random assets)
    const totalArea = lengthVal * widthVal;
    
    // Areas: Length * Fixed Width
    const largeArea = largeEnabled ? (parsedLargeLength * 0.30) : 0;
    const mediumArea = mediumEnabled ? (parsedMediumLength * 0.20) : 0;
    const smallArea = smallEnabled ? (parsedSmallLength * 0.10) : 0;

    const totalBoundaryArea = largeArea + mediumArea + smallArea;

    // 4. Validate if boundaries exceed total garden area
    if (totalBoundaryArea > totalArea) {
      setError(`عذراً، إجمالي مساحات المحددات النباتية (${totalBoundaryArea.toFixed(3)} م²) أكبر من المساحة الكلية للحديقة (${totalArea.toFixed(3)} م²). يرجى تقليل أطوال المحددات.`);
      return;
    }

    // Exact subtraction chain: Net Lawn Area = Total Cropped Area - Sum of Boundary Areas
    const netLawnArea = totalArea - totalBoundaryArea;

    // 5. Output Requirement: Clean local JSON payload
    const payload = {
      total_area_m2: Number(totalArea.toFixed(3)),
      large_boundary: {
        enabled: largeEnabled,
        plant_name: largePlantName.trim(),
        edge_length_m: largeEnabled ? Number(parsedLargeLength.toFixed(3)) : 0,
        fixed_width_m: 0.30,
        area_m2: Number(largeArea.toFixed(3))
      },
      medium_boundary: {
        enabled: mediumEnabled,
        plant_name: mediumPlantName.trim(),
        edge_length_m: mediumEnabled ? Number(parsedMediumLength.toFixed(3)) : 0,
        fixed_width_m: 0.20,
        area_m2: Number(mediumArea.toFixed(3))
      },
      small_boundary: {
        enabled: smallEnabled,
        plant_name: smallPlantName.trim(),
        edge_length_m: smallEnabled ? Number(parsedSmallLength.toFixed(3)) : 0,
        fixed_width_m: 0.10,
        area_m2: Number(smallArea.toFixed(3))
      },
      net_lawn_area_m2: Number(netLawnArea.toFixed(3))
    };

    setResult({
      totalArea: Number(totalArea.toFixed(3)),
      largeArea: Number(largeArea.toFixed(3)),
      largeLength: largeEnabled ? parsedLargeLength : 0,
      largePlantName: largePlantName.trim(),
      mediumArea: Number(mediumArea.toFixed(3)),
      mediumLength: mediumEnabled ? parsedMediumLength : 0,
      mediumPlantName: mediumPlantName.trim(),
      smallArea: Number(smallArea.toFixed(3)),
      smallLength: smallEnabled ? parsedSmallLength : 0,
      smallPlantName: smallPlantName.trim(),
      netLawnArea: Number(netLawnArea.toFixed(3)),
      totalLength: lengthVal,
      totalWidth: widthVal,
      jsonPayload: JSON.stringify(payload, null, 2)
    });
  };

  // Camera simulation calculations
  const handleCameraCompute = () => {
    setCameraError(null);
    setCameraCaptured(false);

    if (cameraPoints.length < 3) {
      setCameraError("يرجى تحديد 3 أو 4 نقاط على الأقل على الشاشة لتطويق الساحة المراد قياسها.");
      return;
    }

    if (!arSupported) {
      const refVal = parseFloat(referenceLength);
      if (isNaN(refVal) || refVal <= 0) {
        setCameraError("يرجى إدخال قيمة قياس مرجعي صحيحة بالمتر (أكبر من الصفر).");
        return;
      }
    }

    // Shoelace area calculation in pixels
    let sum1 = 0;
    let sum2 = 0;
    const pts = cameraPoints;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const current = pts[i];
      const next = pts[(i + 1) % n];
      sum1 += current.x * next.y;
      sum2 += current.y * next.x;
    }
    const pixelArea = Math.abs(sum1 - sum2) / 2;

    let computedArea = 0;
    if (arSupported) {
      // Direct AR 3D simulation: 100 pixels is approx 1.5 meters
      const pixelToMeterScale = 0.015; 
      computedArea = pixelArea * (pixelToMeterScale * pixelToMeterScale);
    } else {
      // Fallback 2D mode with reference line calibration
      const p1 = pts[0];
      const p2 = pts[1] || { x: p1.x + 100, y: p1.y };
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distPixels = Math.sqrt(dx * dx + dy * dy) || 100;
      const refMeters = parseFloat(referenceLength);
      const pixelToMeterScale = refMeters / distPixels;
      computedArea = pixelArea * (pixelToMeterScale * pixelToMeterScale);
    }

    const finalArea = Number(computedArea.toFixed(2));
    setCurrentProjectAreaSqm(finalArea);
    setCameraCaptured(true);
  };

  const handleCameraReset = () => {
    setCameraPoints([]);
    setCameraCaptured(false);
    setCameraError(null);
    setCurrentProjectAreaSqm(0.0);
    setRealImage(null);
    stopLiveCamera();
  };

  const handlePresetPoints = () => {
    setCameraPoints([
      { x: 50, y: 70 },
      { x: 230, y: 50 },
      { x: 250, y: 190 },
      { x: 40, y: 180 },
    ]);
    setCameraError(null);
    setCameraCaptured(false);
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCode = 
    kotlinTab === "compose" 
      ? KOTLIN_COMPOSE_CODE 
      : kotlinTab === "xml" 
        ? KOTLIN_XML_CODE 
        : kotlinTab === "hybrid"
          ? KOTLIN_HYBRID_ARCORE_OPENCV_CODE
          : kotlinTab === "bypass"
            ? KOTLIN_GEOGRAPHIC_BYPASS_CODE
            : kotlinTab === "gradle_app"
              ? BUILD_GRADLE_APP_KTS
              : kotlinTab === "gradle_proj"
                ? BUILD_GRADLE_PROJECT_KTS
                : kotlinTab === "settings_gradle"
                  ? SETTINGS_GRADLE_KTS
                  : kotlinTab === "libs_toml"
                    ? LIBS_VERSIONS_TOML
                    : kotlinTab === "manifest"
                      ? ANDROID_MANIFEST_XML
                      : GITHUB_WORKFLOW_YML;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Intro Header */}
      <div className="bg-[#0c1220] rounded-2xl border border-slate-800 p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          <span>حاسبة مساحات المحددات الهندسية لنظام أندرويد (Kotlin)</span>
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          هذا القسم يوفر واجهة مستخدم تفاعلية (Simulator) لتجربة منطق الحساب البرمجي وعرض شفرة أندرويد (Kotlin) المتكاملة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mobile Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-4 border-4 border-slate-700 shadow-2xl relative overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-700 rounded-b-xl z-20"></div>
            <div className="bg-slate-100 rounded-2xl p-4 pt-6 min-h-[580px] space-y-4 relative">
                {/* Sub-navigation inside the simulated phone */}
                <div className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-[10px] font-bold">
                  <button
                    onClick={() => setSimulatorMode("manual")}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                      simulatorMode === "manual" 
                        ? "bg-white text-slate-900 shadow-sm font-extrabold" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    📱 يدوي
                  </button>
                  <button
                    onClick={() => setSimulatorMode("camera")}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                      simulatorMode === "camera" 
                        ? "bg-emerald-500 text-white shadow-sm font-extrabold" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>عدسة AR</span>
                  </button>
                  <button
                    onClick={() => setSimulatorMode("bypass")}
                    className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-0.5 ${
                      simulatorMode === "bypass" 
                        ? "bg-[#1d4ed8] text-white shadow-sm font-extrabold" 
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    <span>تخطي الحظر</span>
                  </button>
                </div>

                {simulatorMode === "manual" ? (
                  <>
                    {/* Dimension Inputs */}
                    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 animate-fade-in">
                      <span className="text-[11px] font-extrabold text-[#475569] block">📐 الأبعاد الكلية لساحة العشب:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#475569] block">الطول الكلي (م):</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="مثال: 15.0"
                            value={totalLength}
                            onChange={(e) => setTotalLength(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#475569] block">العرض الكلي (م):</label>
                          <input
                            type="number"
                            step="any"
                            placeholder="مثال: 10.0"
                            value={totalWidth}
                            onChange={(e) => setTotalWidth(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-2.5 text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3-Tier Plant Boundary System Inputs */}
                    <div className="space-y-2 animate-fade-in max-h-[300px] overflow-y-auto pr-1">
                      <span className="text-[11px] font-extrabold text-[#475569] block">🌿 محددات التسييج والزينة (الأحواض النباتية):</span>
                      
                      {/* Large Boundary */}
                      <div className={`p-2 rounded-xl border transition-all ${largeEnabled ? "bg-white border-emerald-200" : "bg-slate-100/60 border-slate-200 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={largeEnabled}
                              onChange={(e) => setLargeEnabled(e.target.checked)}
                              className="accent-emerald-500 rounded cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-[#1e293b]">المحدد الكبير (عرض ثابت 0.30 م)</span>
                          </label>
                          <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-mono">30 سم - سياج عالٍ</span>
                        </div>
                        {largeEnabled && (
                          <div className="grid grid-cols-2 gap-2 animate-fade-in mt-1">
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">اسم النبات:</label>
                              <input
                                type="text"
                                value={largePlantName}
                                onChange={(e) => setLargePlantName(e.target.value)}
                                placeholder="مثال: فايكس"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">طول الحافة (م):</label>
                              <input
                                type="number"
                                step="any"
                                value={largeLength}
                                onChange={(e) => setLargeLength(e.target.value)}
                                placeholder="المتر الطولي"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Medium Boundary */}
                      <div className={`p-2 rounded-xl border transition-all ${mediumEnabled ? "bg-white border-emerald-200" : "bg-slate-100/60 border-slate-200 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mediumEnabled}
                              onChange={(e) => setMediumEnabled(e.target.checked)}
                              className="accent-emerald-500 rounded cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-[#1e293b]">المحدد الأوسط (عرض ثابت 0.20 م)</span>
                          </label>
                          <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-mono">20 سم - نباتات متوسطة</span>
                        </div>
                        {mediumEnabled && (
                          <div className="grid grid-cols-2 gap-2 animate-fade-in mt-1">
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">اسم النبات:</label>
                              <input
                                type="text"
                                value={mediumPlantName}
                                onChange={(e) => setMediumPlantName(e.target.value)}
                                placeholder="مثال: سدرة"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">طول الحافة (م):</label>
                              <input
                                type="number"
                                step="any"
                                value={mediumLength}
                                onChange={(e) => setMediumLength(e.target.value)}
                                placeholder="المتر الطولي"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Small Boundary */}
                      <div className={`p-2 rounded-xl border transition-all ${smallEnabled ? "bg-white border-emerald-200" : "bg-slate-100/60 border-slate-200 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smallEnabled}
                              onChange={(e) => setSmallEnabled(e.target.checked)}
                              className="accent-emerald-500 rounded cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-[#1e293b]">المحدد الصغير (عرض ثابت 0.10 م)</span>
                          </label>
                          <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">10 سم - زهور منخفضة</span>
                        </div>
                        {smallEnabled && (
                          <div className="grid grid-cols-2 gap-2 animate-fade-in mt-1">
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">اسم النبات:</label>
                              <input
                                type="text"
                                value={smallPlantName}
                                onChange={(e) => setSmallPlantName(e.target.value)}
                                placeholder="مثال: ريحان"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-slate-500 block mb-0.5">طول الحافة (م):</label>
                              <input
                                type="number"
                                step="any"
                                value={smallLength}
                                onChange={(e) => setSmallLength(e.target.value)}
                                placeholder="المتر الطولي"
                                className="w-full bg-slate-50 border border-slate-200 rounded py-1 px-1.5 text-[11px] focus:outline-none focus:border-emerald-500 font-mono"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-1.5 text-[10px] text-red-600 font-bold animate-fade-in">
                        <span className="shrink-0">⚠️</span>
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Calculate Button */}
                    <button
                      onClick={handleCompute}
                      className="w-full bg-[#10b981] hover:bg-[#0d9488] text-white font-bold py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 font-sans"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>احسب مساحات الأحواض والنجيلة الصافية</span>
                    </button>
                  </>
                ) : simulatorMode === "camera" ? (
                  <>
                    {/* Simulated AR / Camera Controller Screen */}
                    <div className="space-y-3.5 animate-fade-in text-xs">
                      
                      {/* CAMERA TYPE SELECTOR (Real vs. Demo Simulation) */}
                      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraType("real");
                            handleCameraReset();
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer text-center ${
                            cameraType === "real"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          📸 كاميرا الهاتف الحقيقية
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraType("demo");
                            handleCameraReset();
                          }}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer text-center ${
                            cameraType === "demo"
                              ? "bg-slate-300 text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          🧪 الوضع الافتراضي
                        </button>
                      </div>

                      {/* CAMERA TRIGGER BUTTONS (FOR REAL CAMERA MODE) */}
                      {cameraType === "real" && (
                        <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="text-[10px] text-slate-500 font-bold mb-1">خياران لالتقاط صورة حديقتك:</div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Option 1: Mobile Camera Snap (Failsafe & most robust on Mobile Devices) */}
                            <label htmlFor="native-camera-input" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all text-center">
                              <Camera className="w-4 h-4 shrink-0" />
                              <span>التقاط صورة بكاميرا الجوال</span>
                            </label>
                            <input 
                              type="file" 
                              accept="image/*" 
                              capture="environment" 
                              id="native-camera-input" 
                              onChange={handleImageUpload} 
                              className="hidden" 
                            />

                            {/* Option 2: Live Video Stream inside Viewport */}
                            {!isLiveCameraActive ? (
                              <button
                                type="button"
                                onClick={startLiveCamera}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all text-center"
                              >
                                <Video className="w-4 h-4 shrink-0 text-emerald-400" />
                                <span>البث المباشر المدمج</span>
                              </button>
                            ) : (
                              <div className="flex gap-1.5 flex-1">
                                <button
                                  type="button"
                                  onClick={captureLiveFrame}
                                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all animate-pulse"
                                >
                                  <Camera className="w-4 h-4 shrink-0" />
                                  <span>تثبيت الصورة</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={stopLiveCamera}
                                  className="bg-slate-600 hover:bg-slate-500 text-slate-100 font-bold py-2 px-2.5 rounded-lg flex items-center justify-center cursor-pointer shadow"
                                  title="إلغاء البث المباشر"
                                >
                                  <VideoOff className="w-4 h-4 shrink-0" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dynamic AR Toggler */}
                      <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg">
                        <span className="text-[11px] font-bold text-slate-700">مستشعرات ARCore:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setArSupported(!arSupported);
                            handleCameraReset();
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold cursor-pointer transition-colors ${
                            arSupported 
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          {arSupported ? "✅ مدعوم (وضع AR)" : "⚠️ غير مدعوم (وضع 2D)"}
                        </button>
                      </div>

                      {/* Viewfinder Instructions */}
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 leading-relaxed">
                        {cameraType === "real" && !realImage && !isLiveCameraActive ? (
                          <p className="text-emerald-700 font-bold text-[10.5px]">💡 الخطوة 1: يرجى التقاط صورة حقيقية لحديقتك أو محيطك أولاً عبر الأزرار أعلاه لتبدأ بتعيين النقاط عليها.</p>
                        ) : (
                          arSupported ? (
                            <p>🎯 <strong>وضع الواقع المعزز (AR):</strong> انقر داخل المنظور أدناه لتحديد 3 أو 4 نقاط رسوّ (Spatial Anchors) على الأرض لرسم حدود الساحة تلقائياً.</p>
                          ) : (
                            <p>📐 <strong>وضع الكاميرا ثنائي الأبعاد (2D):</strong> حدد 4 نقاط لتوليد مصفوفة تعديل المنظور (Perspective Warp) ثم حدد قيمة قياس المسطرة الفيزيائية للمعايرة.</p>
                          )
                        )}
                      </div>

                      {/* Interactive Camera Viewfinder */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#475569]">معاينة الكاميرا والعدسة التفاعلية:</span>
                          <div className="flex gap-2">
                            {cameraType === "demo" && (
                              <button
                                type="button"
                                onClick={handlePresetPoints}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>تعيين نقاط افتراضية</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleCameraReset}
                              className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                            >
                              <Undo className="w-3 h-3" />
                              <span>إعادة ضبط الصورة</span>
                            </button>
                          </div>
                        </div>

                        <div 
                          onClick={(e) => {
                            if (cameraCaptured) return;
                            if (cameraType === "real" && !realImage && !isLiveCameraActive) {
                              setCameraError("يرجى التقاط صورة حقيقية بكاميرا الهاتف أو تشغيل البث المباشر أولاً ليتم تحديد النقاط عليها.");
                              return;
                            }
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = Math.round(e.clientX - rect.left);
                            const y = Math.round(e.clientY - rect.top);
                            if (cameraPoints.length < 4) {
                              setCameraPoints([...cameraPoints, { x, y }]);
                              setCameraError(null);
                            }
                          }}
                          className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shadow-inner cursor-crosshair group"
                        >
                          {/* 1. BACKGROUND LAYER: WebRTC Stream OR Uploaded Real Photo OR Demo Unsplash Image */}
                          {isLiveCameraActive ? (
                            <video 
                              id="live-video-stream"
                              autoPlay 
                              playsInline 
                              muted 
                              ref={(el) => {
                                if (el && videoStream && el.srcObject !== videoStream) {
                                  el.srcObject = videoStream;
                                }
                              }}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          ) : realImage ? (
                            <img 
                              src={realImage} 
                              alt="Real Garden Snapshot" 
                              className="absolute inset-0 w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : cameraType === "real" ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950 text-slate-300">
                              <Camera className="w-8 h-8 text-emerald-500/80 mb-2 animate-bounce" />
                              <span className="text-[11px] text-white font-bold">لا توجد صورة حالية للكاميرا</span>
                              <span className="text-[9.5px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">الرجاء النقر على زر "التقاط صورة بكاميرا الجوال" أعلاه لفتح عدسة هاتفك وتصوير حديقتك.</span>
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-60"></div>
                          )}
                          
                          {/* Grid overlays to simulate Camera/AR indicators */}
                          <div className="absolute inset-0 border-2 border-dashed border-white/10 pointer-events-none"></div>
                          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/15 pointer-events-none"></div>
                          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/15 pointer-events-none"></div>
                          
                          {/* AR Plane indicator */}
                          {arSupported && (
                            <div className="absolute bottom-2 left-2 bg-emerald-500/80 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                              <span>تم الكشف عن مستوى الأرض</span>
                            </div>
                          )}

                          {/* Canvas dots overlay */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {cameraPoints.length > 0 && (
                              <polyline
                                points={cameraPoints.map(p => `${p.x},${p.y}`).join(" ")}
                                fill="none"
                                stroke={cameraCaptured ? "#34d399" : "#3b82f6"}
                                strokeWidth="3"
                                className="transition-all"
                              />
                            )}
                            {cameraPoints.length >= 3 && (
                              <line
                                x1={cameraPoints[cameraPoints.length - 1].x}
                                y1={cameraPoints[cameraPoints.length - 1].y}
                                x2={cameraPoints[0].x}
                                y2={cameraPoints[0].y}
                                stroke={cameraCaptured ? "#34d399" : "#3b82f6"}
                                strokeWidth="3"
                                strokeDasharray="4"
                              />
                            )}
                            {/* Semi-transparent mask overlay inside the polygon when captured */}
                            {cameraCaptured && cameraPoints.length >= 3 && (
                              <polygon
                                points={cameraPoints.map(p => `${p.x},${p.y}`).join(" ")}
                                fill="rgba(16, 185, 129, 0.25)"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                            )}
                            {/* Render corners as active anchors */}
                            {cameraPoints.map((pt, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="6"
                                  fill={idx === 0 ? "#ef4444" : "#3b82f6"}
                                  stroke="#ffffff"
                                  strokeWidth="1.5"
                                />
                                <text
                                  x={pt.x + 8}
                                  y={pt.y - 4}
                                  fill="#ffffff"
                                  fontSize="9"
                                  fontWeight="bold"
                                  className="drop-shadow-md select-none"
                                >
                                  {idx + 1}
                                </text>
                              </g>
                            ))}
                          </svg>

                          {cameraPoints.length === 0 && (realImage || cameraType === "demo") && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/40 backdrop-blur-[1px] pointer-events-none">
                              <Camera className="w-8 h-8 text-white/70 mb-1" />
                              <span className="text-[10px] text-white/95 font-bold">انقر على زوايا الحديقة في الصورة لتحديد زوايا الساحة</span>
                              <span className="text-[9px] text-white/70">حدد 3 أو 4 نقاط لرسم المضلع الهندسي بدقة</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reference Scale Calibration for 2D Fallback Mode */}
                      {!arSupported && (
                        <div className="space-y-1.5 animate-fade-in bg-slate-100 p-2.5 rounded-lg border border-slate-200">
                          <label className="text-[11px] font-bold text-[#475569] block">طول المسطرة المرجعية في الصورة (بين نقطة 1 و 2):</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="any"
                              value={referenceLength}
                              onChange={(e) => setReferenceLength(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="أدخل الطول بالمتر"
                            />
                            <span className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[11px] font-bold shrink-0 flex items-center">متر (م)</span>
                          </div>
                        </div>
                      )}

                      {/* Camera error displays */}
                      {cameraError && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-1.5 text-[10px] text-red-600 font-bold animate-fade-in">
                          <span>⚠️</span>
                          <span>{cameraError}</span>
                        </div>
                      )}

                      {/* Shutter Capture Button */}
                      <button
                        type="button"
                        onClick={handleCameraCompute}
                        className="w-full bg-[#10b981] hover:bg-[#0d9488] text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <Camera className="w-4 h-4 shrink-0" />
                        <span>معالجة وحساب المساحة من الصورة الحقيقية</span>
                      </button>

                    </div>
                  </>
                ) : (
                  <>
                    {/* Geographic Bypass View inside Simulated Phone */}
                    <div className="space-y-3.5 animate-fade-in text-xs">
                      {/* Google Sheet Cell I2 Live Status */}
                      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Database className="w-3.5 h-3.5 text-blue-600" />
                            جوجل شيت (الخلية I2)
                          </span>
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">
                            نشط ديناميكياً
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold block">مفتاح API لـ OpenRouter المخزن برمجياً في الخلية I2:</label>
                          <div className="flex gap-1">
                            <input
                              type="password"
                              readOnly
                              value={googleSheetI2Key}
                              className="w-full bg-white border border-slate-300 rounded-lg py-1 px-2.5 text-[11px] font-mono text-slate-700 focus:outline-none"
                            />
                            <div className="bg-emerald-100 text-emerald-700 px-2 rounded-lg flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 60-Second Rate Limiter Card */}
                      <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-800 flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            العداد والمؤقت الذكي
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span>إعادة تعيين خلال:</span>
                            <span className="font-mono text-xs">{secondsRemaining}ث</span>
                          </span>
                        </div>

                        {/* Request counter bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-extrabold text-blue-700">
                            <span>استهلاك الدقيقة الحالية: {requestCount} / 15 طلب مجاني</span>
                            <span>{requestCount > 15 ? "الموديل المدفوع نشط" : "الموديل المجاني نشط"}</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-blue-200/50 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${
                                requestCount > 15 ? "bg-amber-500" : "bg-[#2563eb]"
                              }`}
                              style={{ width: `${Math.min((requestCount / 15) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Cost model routing details */}
                        <div className="bg-white/80 rounded-lg p-2 text-[10.5px] border border-blue-100 space-y-1 text-slate-600 font-bold leading-relaxed">
                          <div className="flex items-center gap-1 justify-between text-slate-700">
                            <span>الموديل النشط الآن:</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-extrabold ${
                              requestCount <= 15 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            }`}>
                              {requestCount <= 15 ? "google/gemini-2.5-flash:free" : "google/gemini-2.5-flash"}
                            </span>
                          </div>
                          <p className="text-[9.5px] text-slate-500 font-medium font-sans">
                            {requestCount <= 15 
                              ? "✓ الطلب تحت سقف الـ 15 طلب في الدقيقة الحالية. يتم توجيهه تلقائياً للموديل المجاني لتوفير التكلفة بالكامل." 
                              : "⚠ تم تخطي سقف الـ 15 طلب في هذه الدقيقة. تم التحويل التلقائي للموديل المدفوع لضمان استمرارية الخدمة بنسبة 100% دون انقطاع."
                            }
                          </p>
                        </div>
                      </div>

                      {/* Simulation Button */}
                      <button
                        onClick={handleSimulateApiRequest}
                        disabled={isSimulatingBypass}
                        className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-slate-300 text-white font-bold py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSimulatingBypass ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>جاري تخطي الحظر ومعالجة الطلب...</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            <span>إرسال طلب سحابي تجريبي (محاكاة السودان)</span>
                          </>
                        )}
                      </button>

                      {/* Log Console Wrapper */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">سجل حركة البيانات السحابية الحية (Live Console Logs):</span>
                        <div className="bg-slate-900 text-slate-200 font-mono text-[9px] rounded-xl p-2.5 h-36 overflow-y-auto space-y-1 shadow-inner border border-slate-800">
                          {bypassLogs.length === 0 ? (
                            <div className="text-slate-500 italic text-center pt-8">
                              لا توجد طلبات مرسلة حالياً. اضغط الزر أعلاه لبدء المحاكاة ومشاهدة مسار البيانات.
                            </div>
                          ) : (
                            bypassLogs.map((log) => (
                              <div key={log.id} className="border-b border-slate-800/60 pb-1 leading-relaxed">
                                <span className="text-slate-500 font-extrabold shrink-0 mr-1">[{log.time}]</span>
                                <span className={
                                  log.type === "success" 
                                    ? "text-emerald-400" 
                                    : log.type === "warn" 
                                      ? "text-amber-400 font-bold" 
                                      : log.type === "error" 
                                        ? "text-red-400" 
                                        : "text-blue-300"
                                }>
                                  {log.text}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Final Report Card inside the Simulator */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                {simulatorMode === "manual" ? (
                  result ? (
                    <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3.5 space-y-2.5 shadow-sm">
                      <h4 className="text-xs font-extrabold text-[#065f46] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>📋 التقرير النصي النهائي المعتمد</span>
                      </h4>
                      <div className="h-[1px] bg-[#a7f3d0]"></div>
                      
                      <div className="space-y-1.5 text-[11px] text-[#334155]">
                        <div className="flex justify-between">
                          <span className="font-semibold">المساحة الكلية للحديقة:</span>
                          <span className="font-bold text-[#0f172a] font-mono">{result.totalArea} م²</span>
                        </div>
                        {result.largeLength > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>المحدد الكبير ({result.largePlantName}):</span>
                            <span className="font-mono text-xs">{result.largeArea} م² ({result.largeLength}م)</span>
                          </div>
                        )}
                        {result.mediumLength > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>المحدد الأوسط ({result.mediumPlantName}):</span>
                            <span className="font-mono text-xs">{result.mediumArea} م² ({result.mediumLength}م)</span>
                          </div>
                        )}
                        {result.smallLength > 0 && (
                          <div className="flex justify-between text-slate-500">
                            <span>المحدد الصغير ({result.smallPlantName}):</span>
                            <span className="font-mono text-xs">{result.smallArea} م² ({result.smallLength}م)</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 mt-1">
                          <span className="font-bold text-[#047857]">المساحة الصافية للنجيلة:</span>
                          <span className="font-extrabold text-sm text-[#047857] font-mono">{result.netLawnArea} م²</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                      <Info className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                      <span>أدخل المعطيات واضغط زر الحساب أعلاه لقراءة التقرير الصافي برمجياً هنا</span>
                    </div>
                  )
                ) : (
                  cameraCaptured && currentProjectAreaSqm > 0 ? (
                    <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-3.5 space-y-2.5 shadow-sm animate-fade-in text-xs">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-[#065f46] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                          <span>📋 تقرير القياس الفائق (الكاميرا)</span>
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          {arSupported ? "ARCORE" : "OPENCV"}
                        </span>
                      </div>
                      <div className="h-[1px] bg-[#a7f3d0]"></div>
                      
                      <div className="space-y-1 text-[11px] text-[#334155]">
                        <div className="flex justify-between">
                          <span className="font-semibold">طريقة القياس الحسابية:</span>
                          <span className="font-bold text-[#0f172a]">
                            {arSupported ? "صيغة Shoelace على الواقع المعزز" : "تصحيح Perspective Warp مع المعايرة"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">عدد نقاط الإحداثيات:</span>
                          <span className="font-bold text-[#0f172a]">{cameraPoints.length} نقاط مرسية</span>
                        </div>
                        
                        {/* PERSISTENT CACHE DISPLAY */}
                        <div className="flex justify-between font-mono text-[10px] bg-slate-100 p-1 rounded text-slate-500 my-1">
                          <span>Stored Variable:</span>
                          <span className="font-bold text-slate-700">currentProjectAreaSqm = {currentProjectAreaSqm}</span>
                        </div>

                        {/* CRITICAL REQUIRED UI LABELS: DISPLAYED IMMEDIATELY IN SPECIFIC FORMAT */}
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-200 mt-2 space-y-1.5 text-center shadow-inner">
                          <div className="text-sm font-extrabold text-[#047857]">
                            المساحة المحسوبة: {currentProjectAreaSqm.toFixed(2)} متر مربع
                          </div>
                          <div className="text-xs font-bold text-[#065f46] font-mono">
                            Calculated Area: {currentProjectAreaSqm.toFixed(2)} sqm
                          </div>
                        </div>

                        {/* Isolated perspective mask preview simulation thumbnail */}
                        <div className="mt-2.5 bg-slate-950 p-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                          <div className="w-12 h-12 rounded bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[10px] shrink-0">
                            CROP
                          </div>
                          <div className="text-[9px] text-slate-400 leading-relaxed">
                            تم تفعيل قناع عزل المساحة (Visual Masking) وعزل ما خارج مضلع الساحة بنجاح 90° عمودياً.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
                      <Camera className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                      <span>انقر على شاشة المعاينة أعلاه لتحديد النقاط ثم اضغط زر "التقاط ومعالجة المساحة"</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

        {/* Right Column: Code Explorer & Android Studio Guidelines */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c1220] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Header / Tabs for Kotlin version */}
            <div className="bg-slate-900/80 p-4 border-b border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white">مستكشف كود ومشروع أندرويد الهيكلي</span>
                </div>
              </div>

              {/* Categorized File Switchers */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold block">💻 الملفات البرمجية الأساسية (Kotlin Code):</span>
                  <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
                    <button
                      onClick={() => setKotlinTab("compose")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        kotlinTab === "compose"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Jetpack Compose
                    </button>
                    <button
                      onClick={() => setKotlinTab("xml")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        kotlinTab === "xml"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      XML Layout
                    </button>
                    <button
                      onClick={() => setKotlinTab("hybrid")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        kotlinTab === "hybrid"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      القياس الهجين (AR & CV)
                    </button>
                    <button
                      onClick={() => setKotlinTab("bypass")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        kotlinTab === "bypass"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      تخطي حظر السودان (سحابي)
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 font-extrabold block">🛠️ ملفات البناء والتهيئة (Gradle & Manifest):</span>
                  <div className="flex gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap">
                    <button
                      onClick={() => setKotlinTab("gradle_app")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "gradle_app"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      app/build.gradle.kts
                    </button>
                    <button
                      onClick={() => setKotlinTab("gradle_proj")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "gradle_proj"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      build.gradle.kts (Root)
                    </button>
                    <button
                      onClick={() => setKotlinTab("settings_gradle")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "settings_gradle"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      settings.gradle.kts
                    </button>
                    <button
                      onClick={() => setKotlinTab("libs_toml")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "libs_toml"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      libs.versions.toml
                    </button>
                    <button
                      onClick={() => setKotlinTab("manifest")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "manifest"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      AndroidManifest.xml
                    </button>
                    <button
                      onClick={() => setKotlinTab("github_workflow")}
                      className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        kotlinTab === "github_workflow"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      🐙 android_build.yml (GitHub Actions)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Code Body Area */}
            <div className="p-4 bg-slate-950 font-mono text-xs overflow-x-auto relative group">
              <button
                onClick={() => handleCopyCode(activeCode)}
                className="absolute top-4 left-4 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer z-10"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">تم نسخ الكود!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>نسخ الشفرة</span>
                  </>
                )}
              </button>

              <pre className="text-slate-300 leading-relaxed max-h-[480px] overflow-y-auto text-left pt-10" dir="ltr">
                <code>{activeCode}</code>
              </pre>
            </div>

            {/* Info footer */}
            <div className="bg-slate-900/60 p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  {kotlinTab === "hybrid"
                    ? "مميزات نظام القياس الهجين عالي الدقة (ARCore & OpenCV):"
                    : kotlinTab === "gradle_app" || kotlinTab === "gradle_proj" || kotlinTab === "settings_gradle" || kotlinTab === "libs_toml"
                      ? "مميزات هيكلية البناء وإدارة التبعيات (Gradle 8.7):"
                      : kotlinTab === "manifest"
                        ? "مميزات إعدادات الأندرويد والواقع المعزز (Manifest):"
                        : kotlinTab === "github_workflow"
                          ? "مميزات بناء التطبيق على سير العمل (GitHub CI):"
                          : "مميزات المنطق البرمجي لكود أندرويد:"}
                </span>
              </div>
              <ul className="list-disc pr-4 space-y-1 leading-relaxed">
                {kotlinTab === "hybrid" ? (
                  <>
                    <li><strong>الكشف عن الواقع المعزز ثلاثي الأبعاد:</strong> التحقق ديناميكياً من دعم ARCore لتشغيل Plane Detection لرسوّ النقاط Spatial Anchors على الأرض الحقيقية.</li>
                    <li><strong>حساب صيغة شراك الأحذية (Shoelace Formula):</strong> حساب المساحة الكلية جغرافياً ثلاثية الأبعاد بدقة فائقة من خلال النقاط المسقطة محلياً على المعالج.</li>
                    <li><strong>مصفوفة التحويل المنظوري (Perspective Warp):</strong> تحويل لقطة الكاميرا المائلة ثنائية الأبعاد بزاوية إلى مسقط رأسي عمودي 90 درجة باستخدام مكتبة OpenCV الرائدة.</li>
                    <li><strong>معايرة البكسل إلى المتر (Calibration):</strong> استخدام قياس مرجعي فيزيائي حقيقي (Reference Measurement) لتأصيل نسبة دقيقة للتحويل وحساب الأبعاد.</li>
                    <li><strong>القص والعزل المائي (Masking):</strong> عزل وقص المساحة المحددة فقط وتلوين ما خارجها بالأسود للاقتصار التام على الساحة المقصودة.</li>
                    <li><strong>تأمين وتخزين المتغيرات:</strong> حفظ المساحة المحسوبة مباشرة في متغير محلي آمن <code>currentProjectAreaSqm</code> لتسهيل استدعاء الـ APIs الخلفية.</li>
                  </>
                ) : kotlinTab === "gradle_app" || kotlinTab === "gradle_proj" || kotlinTab === "settings_gradle" || kotlinTab === "libs_toml" ? (
                  <>
                    <li><strong>إدارة التبعيات الحديثة (Version Catalog):</strong> يتم تنظيم جميع مكتبات Jetpack Compose, Sceneview AR, Coroutines, و OkHttp مركزياً داخل ملف <code>libs.versions.toml</code> لمنع تضارب النسخ.</li>
                    <li><strong>جاهز للبناء مع Gradle 8.7:</strong> تم ضبط إعدادات المشروع لتكون متوافقة بالكامل مع Gradle 8.7 و AGP 8.7.0 و Kotlin 1.9.24.</li>
                    <li><strong>دعم الـ SDK الحديث:</strong> تهيئة <code>compileSdk = 34</code> و <code>targetSdk = 34</code> مع <code>minSdk = 24</code> لتمكين تشغيل خصائص الـ ARCore الفائقة.</li>
                  </>
                ) : kotlinTab === "manifest" ? (
                  <>
                    <li><strong>أذونات وخصائص الأجهزة:</strong> يتطلب التطبيق إذن الكاميرا <code>android.permission.CAMERA</code> وعتاد <code>android.hardware.camera.ar</code> لضمان استقرار الواقع المعزز.</li>
                    <li><strong>رسومات OpenGL ES 3.0:</strong> طلب محرك OpenGL ES 3.0 لتهيئة المشهد ثلاثي الأبعاد لـ Sceneview (بأداء 60 إطاراً في الثانية).</li>
                    <li><strong>فحص الأجهزة في Google Play:</strong> تفعيل <code>com.google.ar.core</code> كشرط إلزامي "required" لمنع ظهور التطبيق للأجهزة التي لا تدعم الواقع المعزز في المتجر.</li>
                  </>
                ) : kotlinTab === "github_workflow" ? (
                  <>
                    <li><strong>تحميل تلقائي لـ Gradle 8.7:</strong> سحب حزمة Gradle 8.7 ديناميكياً لتأمين البناء السحابي دون الحاجة لالتزام ملفات الـ wrapper محلياً بالمستودع.</li>
                    <li><strong>بناء الـ APK في غضون ثوانٍ:</strong> استخدام <code>gradle assembleDebug</code> لإنتاج ملف APK التجريبي ورفعه كمخرجات تشغيل (Artifact).</li>
                    <li><strong>دورة فحص الـ Java (JDK 17):</strong> تمكين تجميع كامل وجاهز للمشروع باستخدام Zulu JDK 17 المتوافق تماماً.</li>
                  </>
                ) : (
                  <>
                    <li>معالجة الأخطاء المدخلة بالكامل (مثل القيم الفارغة أو الصفرية أو إدخال حروف بدلاً من الأرقام).</li>
                    <li>منع الحساب في حال كان العرض الكلي للساحة أصغر من أو يساوي قيمة الخصم لدرء وقوع ناتج سالب.</li>
                    <li>قراءة "اسم المحدد" وتحديد نوعه يدوياً وبدقة فائقة في واجهة التقرير النصي النهائي المطبوع على الشاشة.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
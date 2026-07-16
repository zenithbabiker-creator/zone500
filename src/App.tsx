import React, { useState, useRef, useEffect } from "react";
import { 
  Sprout, 
  Layers, 
  Fence, 
  MapPin, 
  Compass, 
  Cpu, 
  TrendingUp, 
  Info, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Loader2, 
  Maximize2,
  TreeDeciduous,
  Flame,
  FileText,
  Calculator,
  Code2,
  Smartphone,
  ChevronLeft,
  Camera,
  Upload,
  Image,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { GARDEN_TEMPLATES, SOIL_DEPTH_OPTIONS, GRASS_DENSITY_OPTIONS, GATE_LENGTH_OPTIONS, TREE_RECOMMENDATIONS } from "./data";
import { GardenTemplate, FencingDimensions, CalculatedMetrics } from "./types";
import { KOTLIN_COMPOSE_CODE, KOTLIN_XML_CODE } from "./kotlinCode";
import KotlinCalculator from "./components/KotlinCalculator";

export default function App() {
  // Application State
  const [activeTab, setActiveTab] = useState<"landscape" | "android-kotlin">("landscape");

  // User Real Camera / Upload Photo States for Landscape Designer Tab
  const [gardenSnapshotUrl, setGardenSnapshotUrl] = useState<string | null>(null);
  const [gardenInteractivePoints, setGardenInteractivePoints] = useState<{ x: number; y: number }[]>([]);
  const [gardenCalibrationLength, setGardenCalibrationLength] = useState<string>("5.0"); // 5 meters default
  const [gardenCaptureError, setGardenCaptureError] = useState<string | null>(null);
  const [reportMetadata, setReportMetadata] = useState<{
    model_used: string;
    request_count_this_minute: number;
    seconds_until_reset: number;
    source: string;
    sheet_key_fetched: string | boolean;
  } | null>(null);

  // Is sunken garden vs flat garden camera height variables
  const [isSunken, setIsSunken] = useState<boolean>(true); // Default to sunken
  const [cameraHeight, setCameraHeight] = useState<string>("1.7"); // Default eye-level height in meters
  
  // Android Kotlin Calculator States
  const [calcModifierName, setCalcModifierName] = useState<string>("");
  const [calcSelectedModifier, setCalcSelectedModifier] = useState<"big" | "medium" | "small" | null>(null);
  const [calcTotalLength, setCalcTotalLength] = useState<string>("");
  const [calcTotalWidth, setCalcTotalWidth] = useState<string>("");
  const [calcError, setCalcError] = useState<string | null>(null);
  const [calcResult, setCalcResult] = useState<{
    modifierName: string;
    modifierType: "big" | "medium" | "small";
    modifierValue: number;
    finalArea: number;
    netWidth: number;
    totalLength: number;
    totalWidth: number;
  } | null>(null);
  const [kotlinTab, setKotlinTab] = useState<"compose" | "xml">("compose");

  const [selectedTemplate, setSelectedTemplate] = useState<GardenTemplate>(GARDEN_TEMPLATES[0]);
  const [customArea, setCustomArea] = useState<number>(selectedTemplate.netAreaM2);
  const [soilDepth, setSoilDepth] = useState<number>(20); // Default 20 cm
  const [grassDensity, setGrassDensity] = useState<number>(20); // Default 20 plugs/m2
  const [treesPerMeter, setTreesPerMeter] = useState<number>(2); // Default to 2 trees/shrubs per meter
  
  // Gates state for the four directions (meters)
  const [gates, setGates] = useState({
    north: 1.5,
    south: 2.0,
    east: 0.0,
    west: 1.0,
  });

  // Scale factor to adjust wall lengths proportionally when the user changes the area slider
  const [areaScale, setAreaScale] = useState<number>(1);

  // Helper to calculate distance in meters between two percentage points
  const getDistanceMeters = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    if (!isSunken) {
      // Flat mode based on camera height
      const H = parseFloat(cameraHeight) || 1.7;
      const horizontalFovRad = 65 * Math.PI / 180;
      const verticalFovRad = 50 * Math.PI / 180;
      const wMeters = 2 * H * Math.tan(horizontalFovRad / 2);
      const hMeters = 2 * H * Math.tan(verticalFovRad / 2);

      const x1 = (p1.x / 100) * wMeters;
      const y1 = (p1.y / 100) * hMeters;
      const x2 = (p2.x / 100) * wMeters;
      const y2 = (p2.y / 100) * hMeters;

      const dx = x2 - x1;
      const dy = y2 - y1;
      return Math.sqrt(dx * dx + dy * dy);
    } else {
      // Sunken mode based on calibration
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distPx = Math.sqrt(dx * dx + dy * dy);

      // Calculate pxPerMeter from first two points
      if (gardenInteractivePoints.length >= 2) {
        const cdx = gardenInteractivePoints[1].x - gardenInteractivePoints[0].x;
        const cdy = gardenInteractivePoints[1].y - gardenInteractivePoints[0].y;
        const cDistPx = Math.sqrt(cdx * cdx + cdy * cdy);
        const calibrationMeters = parseFloat(gardenCalibrationLength) || 5.0;
        if (cDistPx > 0 && calibrationMeters > 0) {
          const pxPerMeter = cDistPx / calibrationMeters;
          return distPx / pxPerMeter;
        }
      }
      return distPx / 10; // Fallback
    }
  };

  // Calculate area from custom clicked points if there are >= 3 points
  const getCustomImageArea = () => {
    if (gardenInteractivePoints.length < 3) return 0;
    
    if (!isSunken) {
      // Flat mode based on camera height
      const H = parseFloat(cameraHeight) || 1.7;
      const horizontalFovRad = 65 * Math.PI / 180;
      const verticalFovRad = 50 * Math.PI / 180;
      const wMeters = 2 * H * Math.tan(horizontalFovRad / 2);
      const hMeters = 2 * H * Math.tan(verticalFovRad / 2);

      const pts = gardenInteractivePoints;
      let areaSqm = 0;
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        const x1 = (pts[i].x / 100) * wMeters;
        const y1 = (pts[i].y / 100) * hMeters;
        const x2 = (pts[next].x / 100) * wMeters;
        const y2 = (pts[next].y / 100) * hMeters;
        areaSqm += x1 * y2 - x2 * y1;
      }
      return Number((Math.abs(areaSqm) * 0.5).toFixed(1));
    } else {
      // Sunken mode: Shoelace formula in pixels, then converted via calibration
      let areaPx = 0;
      const pts = gardenInteractivePoints;
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        const next = (i + 1) % n;
        areaPx += pts[i].x * pts[next].y - pts[next].x * pts[i].y;
      }
      areaPx = Math.abs(areaPx) * 0.5;

      // Calibration: Convert pixels to meters
      if (pts.length >= 2) {
        const dx = pts[1].x - pts[0].x;
        const dy = pts[1].y - pts[0].y;
        const distPx = Math.sqrt(dx*dx + dy*dy);
        const calibrationMeters = parseFloat(gardenCalibrationLength) || 5.0;
        
        if (distPx > 0 && calibrationMeters > 0) {
          const pxPerMeter = distPx / calibrationMeters;
          const areaSqm = areaPx / (pxPerMeter * pxPerMeter);
          return Number(areaSqm.toFixed(1));
        }
      }
      
      // Fallback based on pixel bounds if calibration is not set up
      return Number((areaPx / 100).toFixed(1));
    }
  };

  // Sync customArea when interactive points, calibration, camera height or mode changes
  useEffect(() => {
    if (gardenSnapshotUrl && gardenInteractivePoints.length >= 3) {
      const calculatedArea = getCustomImageArea();
      if (calculatedArea > 0) {
        setCustomArea(calculatedArea);
      }
    }
  }, [gardenInteractivePoints, gardenCalibrationLength, gardenSnapshotUrl, cameraHeight, isSunken]);

  // Update customArea and scale when template changes
  useEffect(() => {
    setCustomArea(selectedTemplate.netAreaM2);
    setAreaScale(1);
  }, [selectedTemplate]);

  // Handle area change slider
  const handleAreaChange = (val: number) => {
    setCustomArea(val);
    // Area scale factor is square root of the ratio of new area to template area
    setAreaScale(Math.sqrt(val / selectedTemplate.netAreaM2));
  };

  // Calculated proportional initial walls or custom measured walls
  const getCalculatedWalls = () => {
    const pts = gardenInteractivePoints;
    const defaultWalls = {
      north: Number((selectedTemplate.initialWalls.north * areaScale).toFixed(1)),
      south: Number((selectedTemplate.initialWalls.south * areaScale).toFixed(1)),
      east: Number((selectedTemplate.initialWalls.east * areaScale).toFixed(1)),
      west: Number((selectedTemplate.initialWalls.west * areaScale).toFixed(1)),
    };

    if (!gardenSnapshotUrl || pts.length < 2) {
      return defaultWalls;
    }

    if (pts.length === 4) {
      return {
        north: Number(getDistanceMeters(pts[0], pts[1]).toFixed(1)),
        east: Number(getDistanceMeters(pts[1], pts[2]).toFixed(1)),
        south: Number(getDistanceMeters(pts[2], pts[3]).toFixed(1)),
        west: Number(getDistanceMeters(pts[3], pts[0]).toFixed(1)),
      };
    } else if (pts.length === 3) {
      return {
        north: Number(getDistanceMeters(pts[0], pts[1]).toFixed(1)),
        east: Number(getDistanceMeters(pts[1], pts[2]).toFixed(1)),
        south: Number(getDistanceMeters(pts[2], pts[0]).toFixed(1)),
        west: 0,
      };
    } else if (pts.length === 2) {
      return {
        north: Number(getDistanceMeters(pts[0], pts[1]).toFixed(1)),
        south: 0,
        east: 0,
        west: 0,
      };
    }

    return defaultWalls;
  };

  const initialWalls = getCalculatedWalls();

  // Safe gates (ensuring gate length doesn't exceed 80% of initial wall length)
  const getSafeGate = (direction: "north" | "south" | "east" | "west") => {
    const gateVal = gates[direction];
    const wallLen = initialWalls[direction];
    if (gateVal >= wallLen) {
      return Math.floor(wallLen * 0.5 * 10) / 10; // set to 50% of wall if too big
    }
    return gateVal;
  };

  const safeGates = {
    north: getSafeGate("north"),
    south: getSafeGate("south"),
    east: getSafeGate("east"),
    west: getSafeGate("west"),
  };

  // Net Fencing Dimensions (Initial wall length - gate length)
  const fencingDimensions: FencingDimensions = {
    north_fence_net_meters: Number(Math.max(0, initialWalls.north - safeGates.north).toFixed(1)),
    south_fence_net_meters: Number(Math.max(0, initialWalls.south - safeGates.south).toFixed(1)),
    east_fence_net_meters: Number(Math.max(0, initialWalls.east - safeGates.east).toFixed(1)),
    west_fence_net_meters: Number(Math.max(0, initialWalls.west - safeGates.west).toFixed(1)),
  };

  // Soil and Grass calculations
  const calculatedSoilVolumeM3 = Number((customArea * (soilDepth / 100)).toFixed(1));
  const totalGrassPlugsNeeded = Math.round(customArea * grassDensity);

  // Fencing trees calculation (Sudanese climate optimized)
  const totalNetFenceMeters = Number((
    fencingDimensions.north_fence_net_meters +
    fencingDimensions.south_fence_net_meters +
    fencingDimensions.east_fence_net_meters +
    fencingDimensions.west_fence_net_meters
  ).toFixed(1));

  const totalTreesNeeded = Math.round(totalNetFenceMeters * treesPerMeter);

  const calculatedMetrics: CalculatedMetrics = {
    net_area_m2: Number(customArea.toFixed(1)),
    selected_soil_depth_cm: soilDepth,
    calculated_soil_volume_m3: calculatedSoilVolumeM3,
    selected_grass_density_per_m2: grassDensity,
    total_grass_plugs_needed: totalGrassPlugsNeeded,
  };

  // API Call State
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute handler for Android Kotlin Calculator Simulator
  const handleCalculatorCompute = () => {
    setCalcError(null);
    setCalcResult(null);

    const lengthVal = parseFloat(calcTotalLength);
    const widthVal = parseFloat(calcTotalWidth);

    if (!calcModifierName.trim()) {
      setCalcError("عذراً، يرجى كتابة اسم المحدد أولاً.");
      return;
    }
    if (!calcSelectedModifier) {
      setCalcError("عذراً، يرجى اختيار أحد المحددات (كبير، متوسط، صغير).");
      return;
    }
    if (isNaN(lengthVal) || lengthVal <= 0) {
      setCalcError("يرجى إدخال طول كلي صحيح أكبر من الصفر.");
      return;
    }
    if (isNaN(widthVal) || widthVal <= 0) {
      setCalcError("يرجى إدخال عرض كلي صحيح أكبر من الصفر.");
      return;
    }

    const discountValues = { big: 0.30, medium: 0.20, small: 0.10 };
    const discount = discountValues[calcSelectedModifier];

    if (widthVal <= discount) {
      setCalcError(`العرض الكلي (${widthVal} م) يجب أن يكون أكبر من قيمة خصم المحدد المختار (${discount} م) ليتسنى الخصم.`);
      return;
    }

    const netWidth = widthVal - discount;
    const finalArea = lengthVal * netWidth;

    setCalcResult({
      modifierName: calcModifierName.trim(),
      modifierType: calcSelectedModifier,
      modifierValue: discount,
      finalArea: Number(finalArea.toFixed(3)),
      netWidth: Number(netWidth.toFixed(3)),
      totalLength: lengthVal,
      totalWidth: widthVal
    });
  };

  // Load a preset mockup or initial report so the screen isn't empty on load
  useEffect(() => {
    // Generate a default preview report structure to guide the user initially
    setReport(`### 📋 التقرير المبدئي لمعاينة حديقة المنخفض (${selectedTemplate.nameAr})

يرجى الضغط على زر **"توليد خطة التنفيذ بالذكاء الاصطناعي"** في الأسفل للحصول على تحليل هندسي زراعي متكامل ومفصل ومصمم خصيصاً لمناخ السودان، ومعزز بصورة المنظور العلوي من محرك Gemini.

*هذا القسم سيعرض دراسة متكاملة تشمل:*
1. **التربة والردم**: المعالجة الهندسية لطبقة الردم بسمك **${soilDepth} سم** وحجم كلي **${calculatedSoilVolumeM3} م³** مع طرق الدك والترطيب الموصى بها في مناخ السودان الحار.
2. **زراعة النجيلة**: طريقة توزيع شتلات النجيلة لعدد **${totalGrassPlugsNeeded} شتلة** بكثافة **${grassDensity} شتلة/م²** مع نظام الري الأولي المناسب.
3. **توزيع أشجار التسوير (الدورنتا، اللانتانا، الأكسوريا)**: خطة دقيقة لتغطية الأسوار الصافية البالغة **${totalNetFenceMeters} متر** بعدد **${totalTreesNeeded} شجرة/شتلة** بناءً على اختيارك بكثافة **${treesPerMeter} شتلة في المتر**.
4. **نصائح التصميم الجمالي**: دراسة لتنسيق الإضاءة والممرات والجلسات بما يتناسب مع طبيعة المنخفض الجغرافي للحديقة.`);
  }, [selectedTemplate, soilDepth, grassDensity, customArea, gates, treesPerMeter, totalNetFenceMeters, totalTreesNeeded]);

  // Offscreen canvas logic to generate custom annotated image
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create base64 of template image with overlaid calculations
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = gardenSnapshotUrl || selectedTemplate.image;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Draw raw aerial image
        ctx.drawImage(img, 0, 0);

        // Overlay a semi-transparent futuristic architectural frame
        ctx.strokeStyle = "rgba(16, 185, 129, 0.8)"; // emerald-500
        ctx.lineWidth = 6;
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";

        // Draw polygon from points
        ctx.beginPath();
        if (gardenInteractivePoints.length > 0) {
          gardenInteractivePoints.forEach((pt, idx) => {
            const x = (pt.x / 100) * canvas.width;
            const y = (pt.y / 100) * canvas.height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
        } else {
          selectedTemplate.polygonPoints.forEach((pt, idx) => {
            const x = (pt[0] / 100) * canvas.width;
            const y = (pt[1] / 100) * canvas.height;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Draw text and metrics overlay directly onto the image sent to Gemini
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)"; // dark blue-gray
        ctx.fillRect(20, 20, 360, 220);
        ctx.strokeStyle = "rgba(16, 185, 129, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, 360, 220);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px sans-serif";
        ctx.fillText("Smart Landscape Engineering Matrix", 40, 55);

        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#a7f3d0"; // emerald-200
        ctx.fillText(`Net Area: ${calculatedMetrics.net_area_m2} M²`, 40, 95);
        ctx.fillText(`Soil layer depth: ${calculatedMetrics.selected_soil_depth_cm} cm`, 40, 125);
        ctx.fillText(`Total soil volume: ${calculatedMetrics.calculated_soil_volume_m3} M³`, 40, 155);
        ctx.fillText(`Grass plugs density: ${calculatedMetrics.selected_grass_density_per_m2} / M²`, 40, 185);
        ctx.fillText(`Total grass plugs: ${calculatedMetrics.total_grass_plugs_needed} plugs`, 40, 215);

        // Draw compass indicator
        ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
        ctx.beginPath();
        ctx.arc(canvas.width - 80, 80, 50, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("N ↑", canvas.width - 92, 55);
        ctx.fillText("S ↓", canvas.width - 92, 115);
        ctx.fillText("W ←", canvas.width - 122, 85);
        ctx.fillText("E →", canvas.width - 62, 85);

        // Add dimensions text beside polygon sides
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`N: ${fencingDimensions.north_fence_net_meters} m (Net)`, canvas.width / 2 - 80, 50);
        ctx.fillText(`S: ${fencingDimensions.south_fence_net_meters} m (Net)`, canvas.width / 2 - 80, canvas.height - 30);
        ctx.fillText(`W: ${fencingDimensions.west_fence_net_meters} m`, 30, canvas.height / 2);
        ctx.fillText(`E: ${fencingDimensions.east_fence_net_meters} m`, canvas.width - 150, canvas.height / 2);
      }

      const base64Image = canvas.toDataURL("image/jpeg", 0.85);

      // Prepare request payload matching the prompt design flow
      const payload = {
        image_data: base64Image,
        calculated_metrics: calculatedMetrics,
        fencing_dimensions: fencingDimensions,
        trees_per_meter: treesPerMeter,
        total_trees_needed: totalTreesNeeded,
        is_sunken: isSunken,
        camera_height: parseFloat(cameraHeight) || 1.7,
      };

      const response = await fetch("/api/landscape-design", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("فشل في توليد الاستشارة من الخادم. تأكد من إعداد مفتاح API الخاص بـ Gemini.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data.result);
      if (data.metadata) {
        setReportMetadata(data.metadata);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ غير متوقع أثناء إرسال البيانات للذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Simple custom markdown renderer to ensure perfect RTL support and styling
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Headings
      if (line.startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xl font-bold text-emerald-100 mt-5 mb-3 border-r-4 border-emerald-500 pr-3">
            {line.substring(4)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={idx} className="text-2xl font-black text-white mt-6 mb-4 border-r-4 border-emerald-400 pr-3 pb-1">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={idx} className="text-3xl font-black text-emerald-400 mt-7 mb-5 border-b border-emerald-800 pb-2">
            {line.substring(2)}
          </h1>
        );
      }

      // Bold and list formatting
      let formattedLine = line;
      // Bold text formatting **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        // Add preceding text
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        // Add bold text
        parts.push(<strong key={match.index} className="text-emerald-300 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : line;

      // Bullet points
      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        return (
          <li key={idx} className="mr-5 list-disc text-slate-300 mb-2 leading-relaxed">
            {line.trim().substring(2)}
          </li>
        );
      }

      // Numbered lists (e.g. "1. ")
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 mb-3 mr-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed text-slate-300">
            <span className="flex items-center justify-center bg-emerald-950 text-emerald-400 border border-emerald-700/50 w-7 h-7 rounded-full text-sm font-bold shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <div className="flex-1">
              {numMatch[2]}
            </div>
          </div>
        );
      }

      if (line.trim() === "") {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="text-slate-300 mb-2 leading-relaxed text-justify">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* Upper Subtle Tech/Landscape Grid Header Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none h-96"></div>
      
      {/* Top Professional Decorative Status Bar (No simulated ports or console lines, just a clean status) */}
      <header className="border-b border-slate-800 bg-[#0c1220]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-xl shadow-lg shadow-emerald-900/20 text-white">
              <Compass className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="app-title" className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                  مهندس لاندسكيب وتصميم حدائق
                </h1>
                <span className="bg-emerald-900/60 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-700/50 font-mono">
                  Landscape v1.4
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                برمجة وحسابات هندسية متكاملة مدعومة بالذكاء الاصطناعي لتخطيط حدائق المنخفضات
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col text-left pl-3 border-l border-slate-800 text-xs font-mono text-slate-400">
              <span>LATITUDE: CALCULATED</span>
              <span>ANGLE: 90° VERTICAL</span>
            </div>
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-300 font-mono">Camera2 API + OpenCV Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#0c1220]/80 p-1.5 rounded-xl border border-slate-800/80 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab("landscape")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === "landscape"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>تنسيق حدائق المنخفض (السودان)</span>
          </button>
          
          <button
            onClick={() => setActiveTab("android-kotlin")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer ${
              activeTab === "android-kotlin"
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-inner"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>حاسبة مساحة المحددات (Kotlin UI)</span>
          </button>
        </div>

        {activeTab === "landscape" ? (
          <>
            {/* Camera First / Snapshot Portal */}
            {!gardenSnapshotUrl ? (
              <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-6 sm:p-10 text-center space-y-6 shadow-2xl max-w-3xl mx-auto animate-fade-in my-4">
                <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-950/40">
                  <Camera className="w-8 h-8 animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">📸 الخطوة 1: يرجى التقاط لقطة لساحة حديقتك أولاً</h2>
                  <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    لتجاوز الحظر الجغرافي وتخطيط لاندسكيب الحديقة بدقة عالية، يرجى التقاط صورة حقيقية لساحة المنخفض أو الساحة المستوية بكاميرا الجوال للبدء بتعيين المقاسات عليها.
                  </p>
                </div>

                <div className="flex justify-center max-w-xs mx-auto">
                  {/* Option 1: Mobile Camera Snap */}
                  <label htmlFor="landscape-camera-input" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all text-center">
                    <Camera className="w-5 h-5 shrink-0" />
                    <span>التقاط صورة بكاميرا الجوال</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    id="landscape-camera-input" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const url = URL.createObjectURL(file);
                        setGardenSnapshotUrl(url);
                        setGardenInteractivePoints([]);
                      }
                    }} 
                    className="hidden" 
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Visualizer and Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  
                  {/* Column 1 & 2: Interactive Landscape View & Configuration */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* Visualizer Card */}
                    <div className="bg-[#0c1220] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                      <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
                          <span className="font-bold text-white">معاينة زاوية الرؤية العمودية (90° Top-Down)</span>
                        </div>
                        
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => setGardenInteractivePoints([])}
                            className="flex-1 sm:flex-initial text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            🔄 إعادة تعيين النقاط
                          </button>
                          <button
                            onClick={() => {
                              setGardenSnapshotUrl(null);
                              setGardenInteractivePoints([]);
                            }}
                            className="flex-1 sm:flex-initial text-xs bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 font-bold px-3 py-1.5 rounded-lg border border-rose-900/40 transition-all cursor-pointer"
                          >
                            📸 التقاط صورة جديدة
                          </button>
                        </div>
                      </div>

                      {/* Garden Image Canvas Area */}
                      <div 
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1));
                          const y = Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1));
                          
                          if (gardenInteractivePoints.length < 4) {
                            setGardenInteractivePoints([...gardenInteractivePoints, { x, y }]);
                          } else {
                            setGardenInteractivePoints([{ x, y }]);
                          }
                        }}
                        className="relative aspect-video max-h-[420px] w-full bg-slate-950 flex items-center justify-center overflow-hidden cursor-crosshair group"
                      >
                        <img 
                          src={gardenSnapshotUrl} 
                          alt="Garden top-down snapshot layout" 
                          className="w-full h-full object-cover opacity-75"
                          referrerPolicy="no-referrer"
                        />

                        {/* SVG Overlay to render the digital perspective mesh in real-time */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {gardenInteractivePoints.length >= 2 && (
                            <polygon 
                              points={gardenInteractivePoints.map(pt => `${pt.x},${pt.y}`).join(' ')} 
                              fill="rgba(16, 185, 129, 0.15)" 
                              stroke="#10b981" 
                              strokeWidth="0.8"
                              strokeDasharray="1.5 1"
                            />
                          )}

                          {/* Nodes on corners */}
                          {gardenInteractivePoints.map((pt, idx) => (
                            <g key={idx}>
                              <circle 
                                cx={pt.x} 
                                cy={pt.y} 
                                r="1.8" 
                                fill={idx === 0 ? "#ef4444" : "#10b981"} 
                                stroke="#ffffff" 
                                strokeWidth="0.3" 
                              />
                              <text
                                x={pt.x + 2}
                                y={pt.y - 2}
                                fill="#ffffff"
                                fontSize="4.5"
                                fontWeight="bold"
                                className="drop-shadow-md select-none"
                              >
                                {idx + 1}
                              </text>
                            </g>
                          ))}
                        </svg>

                        {/* Overlaid Guide Tip */}
                        {gardenInteractivePoints.length === 0 && (
                          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                            <Camera className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" />
                            <p className="text-xs font-bold text-white">💡 انقر على الصورة أعلاه لتحديد زوايا ساحة الحديقة</p>
                            <p className="text-[10px] text-slate-400 mt-1">حدد من 3 إلى 4 نقاط لتوليد المضلع الهندسي وحساب المساحة فورياً</p>
                          </div>
                        )}

                        {/* Simulated Overlay HUD elements for Landscape Planning feel */}
                        <div className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 space-y-1 z-10">
                          <div className="text-emerald-400 font-bold mb-1 flex items-center gap-1">
                            <Cpu className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>المعايرة الرقمية الذكية</span>
                          </div>
                          <div>المساحة المحسوبة: {calculatedMetrics.net_area_m2} م²</div>
                          <div>النقاط المحددة: {gardenInteractivePoints.length} / 4</div>
                          <div>سمك طبقة الردم: {calculatedMetrics.selected_soil_depth_cm} سم</div>
                          <div>حجم التراب الكلي: {calculatedMetrics.calculated_soil_volume_m3} م³</div>
                        </div>

                        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                          <span>معايرة حية من الصورة</span>
                        </div>

                        {/* Interactive scale/calibration overlay in bottom-left */}
                        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-2 max-w-[240px] z-10" onClick={(e) => e.stopPropagation()}>
                          <div className="font-bold text-emerald-400 flex items-center gap-1">
                            <Maximize2 className="w-4 h-4 text-emerald-400" />
                            <span>معايرة القياسات الذكية</span>
                          </div>
                          
                          {/* Garden nature toggle */}
                          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
                            <button
                              type="button"
                              onClick={() => setIsSunken(true)}
                              className={`py-1 px-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                isSunken 
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              🌄 حديقة منخفضة
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsSunken(false)}
                              className={`py-1 px-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                                !isSunken 
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" 
                                  : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              🛣️ حديقة مسطحة
                            </button>
                          </div>

                          {isSunken ? (
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[10px] leading-relaxed">
                                أدخل المسافة الحقيقية (بالمتر) بين النقطة 1 والنقطة 2 لمعايرة المنخفض:
                              </p>
                              <div className="flex gap-1">
                                <input 
                                  type="number"
                                  step="any"
                                  value={gardenCalibrationLength}
                                  onChange={(e) => setGardenCalibrationLength(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                                />
                                <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 flex items-center shrink-0">متر</span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-slate-400 text-[10px] leading-relaxed">
                                أدخل ارتفاع عدسة الكاميرا عن الأرض عند التقاط الصورة (بالمتر):
                              </p>
                              <div className="flex gap-1">
                                <input 
                                  type="number"
                                  step="0.1"
                                  min="0.5"
                                  value={cameraHeight}
                                  onChange={(e) => setCameraHeight(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded py-1 px-2 text-xs text-blue-400 font-mono font-bold focus:outline-none"
                                />
                                <span className="bg-slate-800 px-2 py-1 rounded text-[10px] font-bold text-slate-400 flex items-center shrink-0">متر</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Compass HUD icon */}
                        <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-center flex flex-col items-center">
                          <div className="text-emerald-400 text-[10px] font-mono font-bold mb-1">COMPASS</div>
                          <div className="w-10 h-10 rounded-full border border-emerald-800 flex items-center justify-center relative bg-slate-950">
                            <span className="absolute top-0.5 text-[8px] font-bold text-emerald-400">N</span>
                            <span className="absolute bottom-0.5 text-[8px] text-slate-500">S</span>
                            <span className="absolute left-0.5 text-[8px] text-slate-500">W</span>
                            <span className="absolute right-0.5 text-[8px] text-slate-500">E</span>
                            <div className="w-1 h-6 bg-emerald-500 rounded-full transform rotate-0"></div>
                          </div>
                        </div>
                      </div>

              {/* Dynamic Wall Length Labels */}
              <div className="bg-slate-950/70 p-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">السور الشمالي (الأولي)</span>
                  <span className="text-white font-mono font-bold text-sm">{initialWalls.north} م</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">السور الجنوبي (الأولي)</span>
                  <span className="text-white font-mono font-bold text-sm">{initialWalls.south} م</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">السور الشرقي (الأولي)</span>
                  <span className="text-white font-mono font-bold text-sm">{initialWalls.east} م</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">السور الغربي (الأولي)</span>
                  <span className="text-white font-mono font-bold text-sm">{initialWalls.west} م</span>
                </div>
              </div>
            </div>

            {/* Calculations and Digital Estimate display */}
            <div className="bg-[#0c1220] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">ثانياً: لوحة القياسات الفنية والتقدير المالي/المادي للحديقة</h3>
                </div>
                <span className="text-xs bg-emerald-950 text-emerald-400 px-3 py-1 rounded border border-emerald-800">
                  حسابات هندسية فورية
                </span>
              </div>

              {/* Top Row: Quick summary indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Soil card */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold">حجم الردم المطلوب</span>
                    <Layers className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">{calculatedSoilVolumeM3}</span>
                    <span className="text-sm text-slate-400">متر مكعب (M³)</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>يكفي لتغطية {customArea} م² بسمك {soilDepth} سم.</span>
                  </div>
                </div>

                {/* Grass Plugs Card */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold">إجمالي شتلات النجيلة</span>
                    <Sprout className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">{totalGrassPlugsNeeded}</span>
                    <span className="text-sm text-slate-400">شتلة</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>الكثافة: {grassDensity} شتلة لكل متر مربع.</span>
                  </div>
                </div>

                {/* Perimeter Card */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold">أطوال الأسوار للتشجير</span>
                    <Fence className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {totalNetFenceMeters}
                    </span>
                    <span className="text-sm text-slate-400">متر طولي صافي</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                    <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>بعد خصم البوابات الإجمالية.</span>
                  </div>
                </div>

                {/* Fencing Trees Card */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-bold">إجمالي شتلات التسوير</span>
                    <TreeDeciduous className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white font-mono">{totalTreesNeeded}</span>
                    <span className="text-sm text-slate-400">شتلة</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 bg-slate-950 p-1.5 rounded">
                    <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>بمعدل {treesPerMeter} شتلة لكل متر طولي.</span>
                  </div>
                </div>
              </div>

              {/* Detailed Fencing Breakdown Table */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-900/40">
                  <h4 className="text-sm font-bold text-slate-300">تفاصيل أطوال الأسوار واستقطاعات البوابات للتشجير:</h4>
                </div>
                <div className="divide-y divide-slate-800/80 text-xs sm:text-sm">
                  {/* North Wall */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">N</span>
                      <span className="font-bold text-slate-200">السور الشمالي للحديقة</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block">السور الأولي</span>
                        <span className="text-white font-bold">{initialWalls.north} م</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">البوابة</span>
                        <span className="text-amber-400 font-bold">-{safeGates.north} م</span>
                      </div>
                      <div className="text-right bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                        <span className="text-emerald-400 block">الصافي للتسوير</span>
                        <span className="text-emerald-300 font-bold text-sm">{fencingDimensions.north_fence_net_meters} م</span>
                      </div>
                    </div>
                  </div>

                  {/* South Wall */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">S</span>
                      <span className="font-bold text-slate-200">السور الجنوبي للحديقة</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block">السور الأولي</span>
                        <span className="text-white font-bold">{initialWalls.south} م</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">البوابة</span>
                        <span className="text-amber-400 font-bold">-{safeGates.south} م</span>
                      </div>
                      <div className="text-right bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                        <span className="text-emerald-400 block">الصافي للتسوير</span>
                        <span className="text-emerald-300 font-bold text-sm">{fencingDimensions.south_fence_net_meters} م</span>
                      </div>
                    </div>
                  </div>

                  {/* East Wall */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">E</span>
                      <span className="font-bold text-slate-200">السور الشرقي للحديقة</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block">السور الأولي</span>
                        <span className="text-white font-bold">{initialWalls.east} م</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">البوابة</span>
                        <span className="text-amber-400 font-bold">-{safeGates.east} م</span>
                      </div>
                      <div className="text-right bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                        <span className="text-emerald-400 block">الصافي للتسوير</span>
                        <span className="text-emerald-300 font-bold text-sm">{fencingDimensions.east_fence_net_meters} م</span>
                      </div>
                    </div>
                  </div>

                  {/* West Wall */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">W</span>
                      <span className="font-bold text-slate-200">السور الغربي للحديقة</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block">السور الأولي</span>
                        <span className="text-white font-bold">{initialWalls.west} م</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block">البوابة</span>
                        <span className="text-amber-400 font-bold">-{safeGates.west} م</span>
                      </div>
                      <div className="text-right bg-emerald-950/50 px-2 py-1 rounded border border-emerald-900/50">
                        <span className="text-emerald-400 block">الصافي للتسوير</span>
                        <span className="text-emerald-300 font-bold text-sm">{fencingDimensions.west_fence_net_meters} م</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Control Panel Sidebar */}
          <div className="space-y-8">
            <div className="bg-[#0c1220] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">ثالثاً: المعطيات والخيارات المنسدلة المقيدة</h3>
              </div>

              {/* 1. Soil depth Selection dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>سمك طبقة الردم المطلوبة:</span>
                  <span className="text-amber-400 font-mono font-bold">{soilDepth} سم</span>
                </label>
                <div className="relative">
                  <select
                    value={soilDepth}
                    onChange={(e) => setSoilDepth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                  >
                    {SOIL_DEPTH_OPTIONS.map(d => (
                      <option key={d} value={d}>{d} سنتيمتر</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  تحدد عمق الردم بالتربة الزراعية الخصبة المعالجة لضمان الجذور الصحية والنمو الممتاز للنجيلة.
                </p>
              </div>

              {/* 2. Grass density Selection dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>كثافة شتلات النجيلة (شتلة/م²):</span>
                  <span className="text-emerald-400 font-mono font-bold">{grassDensity} شتلة/م²</span>
                </label>
                <div className="relative">
                  <select
                    value={grassDensity}
                    onChange={(e) => setGrassDensity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                  >
                    {GRASS_DENSITY_OPTIONS.map(d => (
                      <option key={d} value={d}>{d} شتلة لكل متر مربع</option>
                    ))}
                  </select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  توزيع الشتلات؛ كلما زادت الكثافة حصلت على بساط أخضر ممتلئ وسريع التغطية في وقت قياسي.
                </p>
              </div>

              {/* 3. Fencing Tree density Selection dropdown */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>عدد أشجار التسوير في المتر الواحد:</span>
                  <span className="text-emerald-400 font-mono font-bold">{treesPerMeter} شتلة/متر</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative col-span-1">
                    <select
                      value={treesPerMeter}
                      onChange={(e) => setTreesPerMeter(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                    >
                      {[1, 2, 3, 4, 5].map(d => (
                        <option key={d} value={d}>{d} شتلة / متر</option>
                      ))}
                    </select>
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                  <div className="bg-emerald-950/40 rounded-lg px-3 py-1 border border-emerald-900/50 flex flex-col justify-center text-left">
                    <span className="text-[9px] text-emerald-400 block font-semibold leading-none">إجمالي الأشجار:</span>
                    <span className="text-emerald-300 font-bold text-sm font-mono leading-tight">{totalTreesNeeded} شتلة</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  تحديد كثافة الشتلات لكل متر طولي للأسوار لتغطية السياج الأخضر (المجموع الكلي لصافي الأسوار: {totalNetFenceMeters} م).
                </p>
              </div>

              {/* 3. Gate dimension options per direction */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-300 block">أبعاد طول البوابات للممرات (م):</span>
                
                {/* North gate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">بوابة السور الشمالي:</span>
                    <span className="text-emerald-400 font-mono">{safeGates.north} م</span>
                  </div>
                  <div className="relative">
                    <select
                      value={gates.north}
                      onChange={(e) => setGates({ ...gates, north: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg py-2 px-3 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                    >
                      {GATE_LENGTH_OPTIONS.map(g => (
                        <option key={g} value={g}>{g} متر {g === 0 ? "(لا توجد بوابة)" : ""}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* South gate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">بوابة السور الجنوبي:</span>
                    <span className="text-emerald-400 font-mono">{safeGates.south} م</span>
                  </div>
                  <div className="relative">
                    <select
                      value={gates.south}
                      onChange={(e) => setGates({ ...gates, south: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg py-2 px-3 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                    >
                      {GATE_LENGTH_OPTIONS.map(g => (
                        <option key={g} value={g}>{g} متر {g === 0 ? "(لا توجد بوابة)" : ""}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* East gate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">بوابة السور الشرقي:</span>
                    <span className="text-emerald-400 font-mono">{safeGates.east} م</span>
                  </div>
                  <div className="relative">
                    <select
                      value={gates.east}
                      onChange={(e) => setGates({ ...gates, east: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg py-2 px-3 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                    >
                      {GATE_LENGTH_OPTIONS.map(g => (
                        <option key={g} value={g}>{g} متر {g === 0 ? "(لا توجد بوابة)" : ""}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                {/* West gate */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">بوابة السور الغربي:</span>
                    <span className="text-emerald-400 font-mono">{safeGates.west} م</span>
                  </div>
                  <div className="relative">
                    <select
                      value={gates.west}
                      onChange={(e) => setGates({ ...gates, west: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded-lg py-2 px-3 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none font-mono"
                    >
                      {GATE_LENGTH_OPTIONS.map(g => (
                        <option key={g} value={g}>{g} متر {g === 0 ? "(لا توجد بوابة)" : ""}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tree Info Panel */}
            <div className="bg-[#0b101c] rounded-2xl border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
                <TreeDeciduous className="w-5 h-5 text-emerald-400" />
                <span>دليل أشجار الخصوصية والتسوير الموصى بها</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                تتوفر هذه الأنواع للزراعة المتلاصقة لعمل أسوار خضراء متناسقة تغطي الفواصل تماماً:
              </p>
              <div className="space-y-3">
                {TREE_RECOMMENDATIONS.map((tree, i) => (
                  <div key={i} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-300">
                      <span>{tree.nameAr}</span>
                      <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-[10px] text-emerald-400 font-mono font-normal">
                        المسافة: {tree.spacing}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-[11px]">{tree.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Design Recommendation Section */}
        <section className="bg-[#0c1220] rounded-2xl border-2 border-emerald-900/50 overflow-hidden shadow-2xl mb-12">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#0c1220] to-slate-900 px-6 py-5 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-900/50 p-2 rounded-xl border border-emerald-500/30 text-emerald-400">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-white">
                  تصميم واستشارة الذكاء الاصطناعي من Gemini
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يقوم محرك الذكاء الاصطناعي بقراءة الصورة الجوية والأبعاد الرقمية الصافية بدقة فائقة لتصميم حديقتك
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>جاري معالجة المنظور والبيانات...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    <span>توليد خطة التنفيذ بالذكاء الاصطناعي</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading details */}
          {loading && (
            <div className="p-8 bg-slate-950/40 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-emerald-400 font-bold">جاري إرسال الصورة الجوية المعدلة والبيانات الرقمية إلى Gemini API...</p>
                <p className="text-xs text-slate-400">يقوم الذكاء الاصطناعي حالياً بحساب توزيع الأشجار واقتراح التربة وزراعة النجيلة</p>
              </div>
              <div className="max-w-md bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 text-right space-y-1">
                <span className="text-emerald-400 font-bold block mb-1">💡 نصيحة سريعة من المهندس:</span>
                • عند دك التربة بعد الردم، رطبها خفيفاً بالماء لتسهيل عملية رص الحبيبات ومنع الهبوط لاحقاً.
              </div>
            </div>
          )}

          {/* Error message */}
          {error && !loading && (
            <div className="p-6 bg-red-950/20 border-b border-red-900/40 text-red-400 text-sm flex items-start gap-3">
              <span className="bg-red-900/40 p-1.5 rounded text-red-400 shrink-0 mt-0.5">⚠️</span>
              <div>
                <p className="font-bold">فشل الاتصال بـ Gemini API</p>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
                <p className="text-xs text-emerald-400 mt-2 font-mono">تأكد من إعداد مفتاح GEMINI_API_KEY بنجاح في قسم Secrets في واجهة AI Studio.</p>
              </div>
            </div>
          )}

          {/* Report Content */}
          {report && !loading && (
            <div className="p-6 md:p-8 bg-slate-950/80 leading-relaxed text-right">
              {/* Sudan Bypass & Cost Optimizer HUD */}
              {reportMetadata && (
                <div className="mb-6 p-4 bg-emerald-950/20 rounded-xl border border-emerald-800/50 space-y-3 text-right">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/30 pb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <span>🛡️ شبكة تخطي الحظر الجغرافي ومُحسّن التكلفة الذكي (تلاوة)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                      SUDAN_BYPASS: ENABLED
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans">
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block mb-1">الموديل النشط (أوبن راوتر):</span>
                      <span className="text-white font-mono font-bold text-[11px]">{reportMetadata.model_used}</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block mb-1">عداد الطلبات في الدقيقة:</span>
                      <span className="text-emerald-400 font-bold">{reportMetadata.request_count_this_minute} طلب</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block mb-1">التصفير المجاني القادم:</span>
                      <span className="text-teal-400 font-mono font-bold">{reportMetadata.seconds_until_reset} ثانية</span>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block mb-1">مصدر مفتاح الـ API:</span>
                      <span className="text-amber-400 font-bold">{String(reportMetadata.sheet_key_fetched)}</span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    ⚙️ <strong>حركة البيانات:</strong> هاتف المستخدم (IP سوداني) ➡️ تمويه الأيبي عبر شبكة تلاوة (Cloudflare) ➡️ منصة OpenRouter الآمنة ➡️ قراءة المفتاح من الخلية I2 بجوجل شيت ➡️ نموذج Gemini بالذوق الاصطناعي ➡️ العودة الآمنة للسودان.
                  </p>
                </div>
              )}

              {/* Utility Action Bar */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>LANDSCAPE_DESIGN_REPORT_READY</span>
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyReport}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="نسخ التقرير"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ التقرير</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="طباعة التقرير"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة</span>
                  </button>
                </div>
              </div>

              {/* Styled Report Content Container */}
              <div className="prose prose-invert max-w-none space-y-4 text-slate-200">
                {renderMarkdown(report)}
              </div>

              {/* Decorative engineering stamp */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs font-mono">
                <div>
                  <span>المستشار الذكي لتنسيق لاندسكيب الحدائق © 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>STAMP: APPROVED BY GEMINI 3.5 FLASH</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
              </div>
            </div>
          )}
        </section>
              </>
            )}
          </>
        ) : (
          <KotlinCalculator />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>
            تطبيق المهندس الذكي للاندسكيب وحساب كميات الحدائق المنزلية المنخفضة.
          </p>
          <p className="font-mono">
            Developed with OpenCV mesh simulation & Gemini API - 100% Client-Server Secure Arch
          </p>
        </div>
      </footer>
    </div>
  );
}

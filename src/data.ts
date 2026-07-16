import { GardenTemplate } from "./types";

// Import the generated images
import modernCourtyardImg from "./assets/images/modern_courtyard_1783237976144.jpg";
import curvedGardenImg from "./assets/images/curved_garden_1783237990647.jpg";

export const GARDEN_TEMPLATES: GardenTemplate[] = [
  {
    id: "modern_rectangular",
    nameAr: "الفناء الحديث المستطيل",
    nameEn: "Modern Rectangular Courtyard",
    descriptionAr: "تصميم عصري بخطوط مستقيمة ومحيط منتظم، مثالي للجلسات المودرن وتوزيع الفيكس والكونوكاربس.",
    descriptionEn: "Contemporary design with straight lines and regular perimeters, ideal for modern seating and uniform tree distribution.",
    image: modernCourtyardImg,
    netAreaM2: 125.4,
    initialWalls: {
      north: 14.0,
      south: 14.0,
      east: 9.0,
      west: 9.0,
    },
    polygonPoints: [
      [18, 18],
      [82, 18],
      [82, 82],
      [18, 82],
    ],
  },
  {
    id: "organic_curved",
    nameAr: "الحديقة العضوية المنحنية",
    nameEn: "Curved Organic Sunken Garden",
    descriptionAr: "تصميم طبيعي يحتوي على منحنيات وممرات دائرية، يتطلب حساب دقيق للتربة وتوزيع الأشجار للحفاظ على الانسيابية.",
    descriptionEn: "Natural design with organic flow and circular paths, requiring precise soil volume estimates and staggered tree spacing.",
    image: curvedGardenImg,
    netAreaM2: 88.6,
    initialWalls: {
      north: 11.5,
      south: 11.5,
      east: 8.5,
      west: 8.5,
    },
    polygonPoints: [
      [30, 20],
      [70, 20],
      [85, 45],
      [75, 80],
      [25, 80],
      [15, 45],
    ],
  },
];

export const SOIL_DEPTH_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
export const GRASS_DENSITY_OPTIONS = [10, 15, 20, 25, 30];
export const GATE_LENGTH_OPTIONS = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];

export const TREE_RECOMMENDATIONS = [
  {
    nameAr: "دورنتا (Duranta)",
    nameEn: "Duranta",
    descriptionAr: "شجيرة سياج ممتازة وسريعة النمو، ذات خضرة دائمة وتتحمل درجات الحرارة العالية والجفاف الشديد في السودان. قابلة للقص والتشكيل الهندسي لإنشاء أسوار خضراء كثيفة توفر الخصوصية التامة.",
    spacing: "0.5 م - 0.7 م",
  },
  {
    nameAr: "لانتانا (Lantana)",
    nameEn: "Lantana",
    descriptionAr: "شجيرة سياج وتزيين رائعة الجمال بأزهارها الملونة المستمرة طوال العام. تتحمل شمس السودان الحارقة والرياح والأتربة بشكل فائق، ومثالية لتحديد زوايا المنخفض وحوافه.",
    spacing: "0.6 م - 0.8 م",
  },
  {
    nameAr: "أكسوريا (Ixora)",
    nameEn: "Ixora",
    descriptionAr: "شجيرة استوائية معمرة ومزهرة بكتل ملونة زاهية ولطيفة (أحمر، برتقالي، أصفر). تنمو بشكل متناسق ومنتظم لعمل جدران خضراء منخفضة وممرات أنيقة تضفي طابعاً جمالياً فاخراً.",
    spacing: "0.4 م - 0.6 م",
  },
];

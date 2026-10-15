import type { StockStatus, VehicleLine } from "@prisma/client";

// Placeholder catalog until the owner sends real inventory.

export const models: {
  slug: string;
  nameAr: string;
  nameEn: string;
  line: VehicleLine;
  yearFrom: number;
  yearTo?: number;
}[] = [
  { slug: "range-rover", nameAr: "رينج روڤر", nameEn: "Range Rover", line: "RANGE_ROVER", yearFrom: 2013 },
  { slug: "range-rover-sport", nameAr: "رينج روڤر سبورت", nameEn: "Range Rover Sport", line: "RANGE_ROVER", yearFrom: 2013 },
  { slug: "range-rover-velar", nameAr: "رينج روڤر ڤيلار", nameEn: "Range Rover Velar", line: "RANGE_ROVER", yearFrom: 2017 },
  { slug: "range-rover-evoque", nameAr: "رينج روڤر إيڤوك", nameEn: "Range Rover Evoque", line: "RANGE_ROVER", yearFrom: 2011 },
  { slug: "discovery", nameAr: "لاند روڤر ديسكڤري", nameEn: "Land Rover Discovery", line: "DISCOVERY", yearFrom: 2017 },
  { slug: "discovery-sport", nameAr: "لاند روڤر ديسكڤري سبورت", nameEn: "Land Rover Discovery Sport", line: "DISCOVERY", yearFrom: 2015 },
  { slug: "defender", nameAr: "لاند روڤر ديفندر", nameEn: "Land Rover Defender", line: "DEFENDER", yearFrom: 2020 },
];

export const services = [
  {
    slug: "scheduled-maintenance",
    icon: "wrench",
    titleAr: "صيانة دورية شاملة",
    titleEn: "Scheduled maintenance",
    summaryAr: "زيوت وفلاتر وفحص كامل لأكثر من 60 نقطة حسب جدول صيانة الشركة المصنعة.",
    summaryEn: "Oils, filters and a 60+ point inspection following the manufacturer's service schedule.",
    bodyAr: "نلتزم بجدول الصيانة الرسمي لكل موديل: تغيير الزيت والفلاتر، فحص الفرامل والتعليق والسوائل، تحديث برمجيات الوحدات عند الحاجة، وتقرير مكتوب بحالة السيارة مع صور لأي ملاحظة.",
    bodyEn: "We follow the official schedule for each model: oil and filters, brake, suspension and fluid checks, module software updates where needed, and a written health report with photos of anything we flag.",
    priceFrom: 3500,
    durationHr: 3,
  },
  {
    slug: "computer-diagnostics",
    icon: "cpu",
    titleAr: "تشخيص كمبيوتر متقدم",
    titleEn: "Advanced diagnostics",
    summaryAr: "أجهزة تشخيص بمستوى الوكالة لقراءة الأعطال وبرمجة الوحدات الإلكترونية.",
    summaryEn: "Dealer-level diagnostic tools to read faults and program electronic modules.",
    bodyAr: "نقرأ كل وحدات التحكم في السيارة، نحدد سبب العطل الحقيقي بدل تخمين القطع، ونبرمج الوحدات الجديدة والمفاتيح. ستعرف التشخيص والتكلفة قبل أي إصلاح.",
    bodyEn: "We read every control module, find the real cause instead of guessing parts, and program new modules and keys. You get the diagnosis and the cost before any repair starts.",
    priceFrom: 800,
    durationHr: 1,
  },
  {
    slug: "air-suspension",
    icon: "gauge",
    titleAr: "تعليق هوائي",
    titleEn: "Air suspension",
    summaryAr: "إصلاح المساعدين الهوائيين والكمبروسر والحساسات واستعادة ارتفاع السيارة الصحيح.",
    summaryEn: "Air struts, compressor and height sensors repaired, with ride height restored.",
    bodyAr: "من تسريب المساعد إلى أعطال الكمبروسر وحساسات الارتفاع: نختبر النظام بالكامل، نغيّر المكوّن التالف فقط، ونعيد معايرة الارتفاع بالكمبيوتر.",
    bodyEn: "From leaking struts to compressor and height-sensor faults, we test the whole system, replace only the failed part, and recalibrate ride height by computer.",
    priceFrom: 2500,
    durationHr: 4,
  },
  {
    slug: "engine-transmission",
    icon: "cog",
    titleAr: "محرك وناقل حركة",
    titleEn: "Engine & transmission",
    summaryAr: "إصلاح محركات V6 وV8 والديزل، وصيانة ناقل الحركة الأوتوماتيك.",
    summaryEn: "V6, V8 and diesel engine repair, plus automatic gearbox servicing.",
    bodyAr: "إصلاح التسريبات، سلاسل التوقيت، التيربو، وتغيير زيت ناقل الحركة بالطريقة الصحيحة مع برمجة التكيّف بعد الصيانة.",
    bodyEn: "Leaks, timing chains, turbochargers, and gearbox oil changes done properly, with adaptation reset after the service.",
    priceFrom: 4500,
    durationHr: 8,
  },
  {
    slug: "electrical",
    icon: "zap",
    titleAr: "كهرباء وبطاريات",
    titleEn: "Electrical & batteries",
    summaryAr: "تتبع أعطال الكهرباء والحساسات والإضاءة، وتركيب وتسجيل البطاريات.",
    summaryEn: "Tracing wiring, sensor and lighting faults; battery fitting and registration.",
    bodyAr: "نتتبع الأعطال الكهربائية المتقطعة، نصلح الضفائر والحساسات والإضاءة، ونركّب البطارية الجديدة مع تسجيلها في نظام إدارة البطارية.",
    bodyEn: "We track down intermittent electrical faults, repair harnesses, sensors and lighting, and register new batteries with the battery management system.",
    priceFrom: 600,
    durationHr: 2,
  },
  {
    slug: "brakes",
    icon: "disc",
    titleAr: "فرامل",
    titleEn: "Brakes",
    summaryAr: "تيل وطنابير وزيت فرامل، مع إعادة ضبط حساسات التآكل.",
    summaryEn: "Pads, discs and brake fluid, with wear sensors reset.",
    bodyAr: "نقيس سُمك الطنابير والتيل، نغيّر ما يلزم بقطع أصلية، ونغيّر زيت الفرامل، ثم نعيد ضبط حساس التآكل وفرامل اليد الإلكترونية.",
    bodyEn: "We measure discs and pads, replace what's needed with genuine parts, change the fluid, then reset the wear sensor and electronic parking brake.",
    priceFrom: 1500,
    durationHr: 2,
  },
  {
    slug: "air-conditioning",
    icon: "snowflake",
    titleAr: "تكييف",
    titleEn: "Air conditioning",
    summaryAr: "فحص التسريب وشحن الفريون وإصلاح الكمبروسر والمراوح.",
    summaryEn: "Leak testing, refrigerant recharge, compressor and fan repair.",
    bodyAr: "نختبر الدائرة ضد التسريب، نشحن الغاز بالكمية الصحيحة للموديل، ونصلح الكمبروسر والمراوح وحساسات الحرارة.",
    bodyEn: "We leak-test the circuit, recharge the exact amount for your model, and repair compressors, fans and temperature sensors.",
    priceFrom: 900,
    durationHr: 2,
  },
  {
    slug: "body-detailing",
    icon: "sparkles",
    titleAr: "سمكرة ودهان وتلميع",
    titleEn: "Bodywork & detailing",
    summaryAr: "إصلاح الصدمات والدهان بمطابقة اللون وتلميع وحماية.",
    summaryEn: "Dent repair, colour-matched paint, polishing and protection.",
    bodyAr: "إصلاح الهيكل والصدمات، رش بمطابقة كود اللون الأصلي، وتلميع وحماية سيراميك تعيد للسيارة مظهر المعرض.",
    bodyEn: "Body and dent repair, paint matched to the factory colour code, plus polishing and ceramic protection for a showroom finish.",
    priceFrom: 2000,
    durationHr: 24,
  },
];

export const categories = [
  { slug: "brakes", icon: "disc", nameAr: "فرامل", nameEn: "Brakes" },
  { slug: "engine", icon: "cog", nameAr: "محرك", nameEn: "Engine" },
  { slug: "suspension", icon: "gauge", nameAr: "تعليق", nameEn: "Suspension" },
  { slug: "electrical", icon: "zap", nameAr: "كهرباء", nameEn: "Electrical" },
  { slug: "filters", icon: "filter", nameAr: "فلاتر", nameEn: "Filters" },
  { slug: "cooling", icon: "thermometer", nameAr: "تبريد", nameEn: "Cooling" },
  { slug: "body", icon: "car", nameAr: "هيكل خارجي", nameEn: "Body" },
  { slug: "interior", icon: "armchair", nameAr: "تجهيزات داخلية", nameEn: "Interior" },
];

type PartSeed = {
  cat: string;
  nameAr: string;
  nameEn: string;
  price: number | null;
  stock?: StockStatus;
  models: string[];
  featured?: boolean;
};

const ALL = models.map((m) => m.slug);
const RR = ["range-rover", "range-rover-sport"];
const SMALL = ["range-rover-evoque", "discovery-sport"];

export const parts: PartSeed[] = [
  { cat: "brakes", nameAr: "طقم تيل فرامل أمامي", nameEn: "Front brake pad set", price: 4200, models: RR, featured: true },
  { cat: "brakes", nameAr: "طقم تيل فرامل خلفي", nameEn: "Rear brake pad set", price: 3100, models: RR },
  { cat: "brakes", nameAr: "طنبورة فرامل أمامية", nameEn: "Front brake disc", price: 6800, models: RR },
  { cat: "brakes", nameAr: "حساس تآكل التيل", nameEn: "Brake pad wear sensor", price: 650, models: ALL },
  { cat: "brakes", nameAr: "طقم تيل أمامي ڤيلار", nameEn: "Velar front brake pad set", price: 3900, models: ["range-rover-velar"] },
  { cat: "brakes", nameAr: "تيل فرامل إيڤوك وديسكڤري سبورت", nameEn: "Evoque / Discovery Sport brake pads", price: 2600, models: SMALL },
  { cat: "engine", nameAr: "طقم سلسلة توقيت", nameEn: "Timing chain kit", price: 18500, stock: "ON_ORDER", models: RR, featured: true },
  { cat: "engine", nameAr: "طقم بوجيهات", nameEn: "Spark plug set", price: 2400, models: ["range-rover", "range-rover-sport", "range-rover-velar"] },
  { cat: "engine", nameAr: "طرمبة مياه", nameEn: "Water pump", price: 7200, models: ALL },
  { cat: "engine", nameAr: "حساس ضغط التيربو", nameEn: "Turbo boost pressure sensor", price: 2900, models: ALL },
  { cat: "engine", nameAr: "جوان غطاء البلوف", nameEn: "Valve cover gasket", price: 1800, models: RR },
  { cat: "engine", nameAr: "كويل إشعال", nameEn: "Ignition coil", price: 2100, models: ["range-rover", "range-rover-sport", "range-rover-velar"] },
  { cat: "suspension", nameAr: "مساعد هوائي أمامي", nameEn: "Front air strut", price: 32000, models: RR, featured: true },
  { cat: "suspension", nameAr: "مساعد هوائي خلفي", nameEn: "Rear air spring", price: 21000, models: RR },
  { cat: "suspension", nameAr: "كمبروسر التعليق الهوائي", nameEn: "Air suspension compressor", price: 26500, stock: "LOW_STOCK", models: [...RR, "discovery"], featured: true },
  { cat: "suspension", nameAr: "حساس ارتفاع السيارة", nameEn: "Ride height sensor", price: 3400, models: [...RR, "discovery", "defender"] },
  { cat: "suspension", nameAr: "مقص أمامي سفلي", nameEn: "Front lower control arm", price: 8900, models: RR },
  { cat: "suspension", nameAr: "بلوك صمام الهواء", nameEn: "Air valve block", price: 9800, models: [...RR, "discovery"] },
  { cat: "electrical", nameAr: "بطارية AGM ‏95 أمبير", nameEn: "AGM battery 95Ah", price: 9500, models: ALL, featured: true },
  { cat: "electrical", nameAr: "دينامو شحن", nameEn: "Alternator", price: 14500, models: RR },
  { cat: "electrical", nameAr: "مارش", nameEn: "Starter motor", price: 11200, models: ALL },
  { cat: "electrical", nameAr: "حساس ركن أمامي", nameEn: "Front parking sensor", price: 1900, models: ALL },
  { cat: "electrical", nameAr: "حساس ABS أمامي", nameEn: "Front ABS sensor", price: 2300, models: ALL },
  { cat: "filters", nameAr: "فلتر زيت", nameEn: "Oil filter", price: 650, models: ALL, featured: true },
  { cat: "filters", nameAr: "فلتر هواء", nameEn: "Air filter", price: 1450, models: ALL, featured: true },
  { cat: "filters", nameAr: "فلتر مكيف كربون", nameEn: "Carbon cabin filter", price: 1200, models: ALL },
  { cat: "filters", nameAr: "فلتر ديزل", nameEn: "Diesel fuel filter", price: 1650, models: [...RR, "discovery", "defender"] },
  { cat: "cooling", nameAr: "رادياتير مياه", nameEn: "Radiator", price: 13800, models: RR },
  { cat: "cooling", nameAr: "ترموستات", nameEn: "Thermostat housing", price: 3200, models: ALL },
  { cat: "cooling", nameAr: "خزان مياه احتياطي", nameEn: "Coolant expansion tank", price: 2700, models: ALL },
  { cat: "cooling", nameAr: "مروحة رادياتير", nameEn: "Radiator cooling fan", price: 12400, stock: "OUT_OF_STOCK", models: RR },
  { cat: "body", nameAr: "مرآة جانبية كاملة يمين", nameEn: "Right door mirror assembly", price: 15800, models: ["range-rover-sport"] },
  { cat: "body", nameAr: "فانوس أمامي LED", nameEn: "LED headlamp", price: null, stock: "ON_ORDER", models: ["range-rover"], featured: true },
  { cat: "body", nameAr: "شبكة أمامية", nameEn: "Front grille", price: 8600, models: ["range-rover-velar"] },
  { cat: "body", nameAr: "مساحات زجاج أمامي", nameEn: "Front wiper blade set", price: 950, models: ALL },
  { cat: "body", nameAr: "شعار ديفندر أمامي", nameEn: "Defender front badge", price: 1300, models: ["defender"] },
  { cat: "interior", nameAr: "دواسات أرضية مطاطية", nameEn: "Rubber floor mats", price: 3800, models: ALL },
  { cat: "interior", nameAr: "شاشة تحكم التكييف", nameEn: "Climate control panel", price: null, stock: "ON_ORDER", models: ["range-rover-velar"] },
  { cat: "interior", nameAr: "مفتاح ذكي", nameEn: "Smart key fob", price: 7400, models: ALL },
  { cat: "interior", nameAr: "شاحن لاسلكي", nameEn: "Wireless phone charger", price: 4100, models: ["range-rover", "range-rover-sport", "defender"] },
];

const DESC: Record<string, { ar: string; en: string }> = {
  brakes: { ar: "قطعة أصلية مطابقة لمواصفات المصنع، تضمن أداء فرملة ثابتًا وتآكلًا متوازنًا.", en: "Genuine part built to factory spec for consistent stopping power and even wear." },
  engine: { ar: "قطعة محرك أصلية تحافظ على الأداء والاعتمادية، مع ضمان على التركيب داخل المركز.", en: "Genuine engine part that keeps performance and reliability, with a fitting warranty in our workshop." },
  suspension: { ar: "مكوّن تعليق أصلي يعيد ثبات السيارة وراحة القيادة كما صُممت.", en: "Genuine suspension component that restores the ride and stability the car was designed for." },
  electrical: { ar: "قطعة كهرباء أصلية متوافقة مع أنظمة السيارة الإلكترونية دون أخطاء.", en: "Genuine electrical part, fully compatible with the car's electronic systems." },
  filters: { ar: "فلتر أصلي بجودة ترشيح عالية يحمي المحرك ويطيل عمره.", en: "Genuine filter with high filtration quality to protect the engine and extend its life." },
  cooling: { ar: "قطعة تبريد أصلية تحافظ على حرارة المحرك المثالية في صيف مصر.", en: "Genuine cooling part that keeps engine temperature right, even in an Egyptian summer." },
  body: { ar: "قطعة هيكل أصلية بمقاسات وتشطيب مطابق تمامًا.", en: "Genuine body part with an exact fit and finish." },
  interior: { ar: "إكسسوار داخلي أصلي مصمم خصيصًا لمقصورة سيارتك.", en: "Genuine interior accessory designed for your car's cabin." },
};

export function partDescription(cat: string) {
  return DESC[cat];
}

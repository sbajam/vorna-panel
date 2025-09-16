// اگر TS نمی‌خوای، پسوند رو js کن و تایپ‌ها رو بردار

export type NormalizeTextOptions = {
  digits?: "fa-to-en" | "none";
  letters?: "ar-to-fa" | "none";
  removeTatweel?: boolean;
  removeDiacritics?: boolean;
  removeZWNJ?: boolean;
  collapseSpaces?: boolean;
  trim?: boolean;
};

export type NormalizeAllOptions = {
  excludePaths?: string[];   // مثل ["*.tracking_code","cart.*.name"]
  includePaths?: string[] | null; // اگر مقدار بدهی، فقط همین‌ها نرمال می‌شن
  skipKeys?: string[];       // کلیدهایی که اصلاً واردشون نشیم
  textOptions?: NormalizeTextOptions;
};

const defaultTextOptions: NormalizeTextOptions = {
  digits: "fa-to-en",
  letters: "ar-to-fa",
  removeTatweel: true,
  removeDiacritics: true,
  removeZWNJ: false,
  collapseSpaces: true,
  trim: true,
};

const defaultAllOptions: NormalizeAllOptions = {
  excludePaths: [],
  includePaths: null,
  skipKeys: [],
  textOptions: defaultTextOptions,
};

// --- 1) متن ---
export function normalizeText(input: unknown, opts: NormalizeTextOptions = {}) {
  if (input == null) return input as null | undefined;
  let s = String(input);
  const {
    digits = "fa-to-en",
    letters = "ar-to-fa",
    removeTatweel = true,
    removeDiacritics = true,
    removeZWNJ = false,
    collapseSpaces = true,
    trim = true,
  } = { ...defaultTextOptions, ...opts };

  // ارقام فارسی/عربی → انگلیسی
  if (digits === "fa-to-en") {
    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const ar = "٠١٢٣٤٥٦٧٨٩";
    s = s.replace(/[0-9۰-۹٠-٩]/g, (d) => {
      const iFa = fa.indexOf(d);
      if (iFa !== -1) return String(iFa);
      const iAr = ar.indexOf(d);
      if (iAr !== -1) return String(iAr);
      return d; // already 0-9
    });
  }

  // حروف عربی → فارسی
  if (letters === "ar-to-fa") {
    s = s
      .replace(/ك/g, "ک")
      .replace(/ي/g, "ی")
      .replace(/[ۀة]/g, "ه")
      .replace(/[أإآٱ]/g, "ا")
      .replace(/ؤ/g, "و")
      .replace(/ئ/g, "ی")
      // لاهای ترکیبی
      .replace(/\uFEFB|\uFEFC|\uFEF7|\uFEF8/g, "لا");
  }

  if (removeTatweel) {
    s = s.replace(/\u0640/g, "");
  }
  if (removeDiacritics) {
    s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
  }
  if (removeZWNJ) {
    s = s.replace(/\u200C/g, "");
  }
  if (collapseSpaces) {
    s = s.replace(/\s+/g, " ");
  }
  if (trim) s = s.trim();

  return s;
}

// --- 2) الگوی مسیر با wildcard ---
function matchPath(path: string, patterns: string[] = []) {
  return patterns.some((pat) => {
    const esc = pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    const re = new RegExp(`^${esc}$`);
    return re.test(path);
  });
}

// --- 3) نرمالایز بازگشتی ---
export function normalizeAll<T = any>(
  obj: T,
  options: NormalizeAllOptions = {},
  currentPath = ""
): T {
  const {
    excludePaths = [],
    includePaths = null,
    skipKeys = [],
    textOptions = defaultTextOptions,
  } = { ...defaultAllOptions, ...options };

  const consider =
    includePaths == null || matchPath(currentPath, includePaths);
  const excluded = matchPath(currentPath, excludePaths);

  // string
  if (typeof obj === "string") {
    if (consider && !excluded) {
      return normalizeText(obj, textOptions) as T;
    }
    return obj;
  }

  // array
  if (Array.isArray(obj)) {
    return obj.map((item, idx) =>
      normalizeAll(item, options, currentPath ? `${currentPath}.${idx}` : String(idx))
    ) as T;
  }

  // object
  if (obj && typeof obj === "object") {
    const out: any = Array.isArray(obj) ? [] : {};
    for (const key of Object.keys(obj as any)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key;
      if (skipKeys.includes(key)) {
        out[key] = (obj as any)[key];
      } else {
        out[key] = normalizeAll((obj as any)[key], options, nextPath);
      }
    }
    return out as T;
  }

  // number/boolean/null/undefined/etc.
  return obj;
}

// --- 4) سازنده نرمالایزر با تنظیمات پروژه ---
export function createNormalizer(custom?: Partial<NormalizeAllOptions>) {
  const merged: NormalizeAllOptions = {
    ...defaultAllOptions,
    ...custom,
    textOptions: { ...defaultTextOptions, ...(custom?.textOptions || {}) },
  };

  return {
    options: merged,
    text: (val: unknown, extra?: NormalizeTextOptions) =>
      normalizeText(val, { ...merged.textOptions, ...extra }),
    all: <T = any>(obj: T, extra?: Partial<NormalizeAllOptions>) =>
      normalizeAll(obj, {
        ...merged,
        ...(extra || {}),
        textOptions: { ...merged.textOptions, ...(extra?.textOptions || {}) },
      }),
  };
}

// --- 5) هِلپرها برای استفاده‌های رایج ---
export function normalizeList<T = any>(list: T[], options?: NormalizeAllOptions) {
  return (Array.isArray(list) ? list : []).map((item) => normalizeAll(item, options));
}

export function makeSearchString(val: unknown, options?: NormalizeTextOptions) {
  // برای نرمال‌سازی ورودی سرچ
  return String(normalizeText(val ?? "", options)).toLowerCase().trim();
}

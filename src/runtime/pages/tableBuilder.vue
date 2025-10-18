<!-- pages/tableBuilder.vue -->
<script setup lang="ts">
/**
 * TableBuilder – Nuxt 3 (Final)
 * - Right Sidebar: API / pathToList / Samples / Auto Columns
 * - Main: Columns Designer, Actions Designer, Options, Filters/Search, Preview, Codegen
 * - Uses SmartTable (your component) props & emits exactly
 * - Notifications: $notify* (info/success/warning/danger)
 * - Safe codegen (no template-literal parser errors)
 */
import { ColumnTypeSettings } from "../types/column-types";

import { reactive, ref, computed, watch, onBeforeMount } from "vue";
import { useNuxtApp } from "nuxt/app";
import SmartTable from "../components/SmartTable.vue";
import InputField from "../components/form/InputField.vue";
import DropDown from "../components/form/DropDown.vue";
// import { useApi } from "../composables/useApi";
import { makeSearchString, normalizeAll } from "../composables/useNormalizer";

// services
const { request } = useApi();
const nuxtApp = useNuxtApp();
const { $notifyInfo, $notifySuccess, $notifyWarning, $notifyDanger } =
  useNuxtApp();
const notify = (message: string, type = "info") => {
  if (type === "success")
    $notifySuccess(message); // toast.show({ type: "success", message });
  else if (type === "warning")
    $notifyWarning(message); //  toast.show({ type: "warning", message });
  else if (type === "danger")
    $notifyDanger(message); // toast.show({ type: "danger", message });
  else $notifyInfo(message); // toast.show({ type: "info", message });
};

/* =========================
   Utils
========================= */
function getByPath(obj: any, path?: string) {
  if (!path) return obj;
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}
function uniqueId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/* =========================
   API + Preview State
========================= */
interface ApiConfig {
  id: string;
  name: string;
  baseUrl: string;
  path: string;
  pathToList: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers: Record<string, string>;
  body?: any;
}
/* =========================
   Normalization (Builder Options)
========================= */
const normalizationUI = reactive({
  enabled: true,
  scope: "all" as "all" | "include" | "exclude",
  fieldsCsv: "",
  fields: [] as string[],
  options: {
    digits: true,
    letters: true,
    removeTatweel: true,
    removeDiacritics: true,
    removeZWNJ: true,
    collapseSpaces: true,
    trim: true,
  },
});

// خروجی نهایی برای normalizeAll (بر اساس UI)
const normalizationOptions = computed(() => {
  const fields = (normalizationUI.fieldsCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  normalizationUI.fields = fields;

  return {
    includePaths: normalizationUI.scope === "include" ? fields : null,
    excludePaths: normalizationUI.scope === "exclude" ? fields : [],
    textOptions: {
      digits: normalizationUI.options.digits ? "fa-to-en" : "none",
      letters: normalizationUI.options.letters ? "ar-to-fa" : "none",
      removeTatweel: normalizationUI.options.removeTatweel,
      removeDiacritics: normalizationUI.options.removeDiacritics,
      removeZWNJ: normalizationUI.options.removeZWNJ,
      collapseSpaces: normalizationUI.options.collapseSpaces,
      trim: normalizationUI.options.trim,
    },
  } as const;
});

const apis = ref<ApiConfig[]>([]);
const selectedApiId = ref<string | null>(null);
const currentApi = computed(
  () => apis.value.find((a) => a.id === selectedApiId.value) ?? null
);

const apiState = reactive({
  isLoading: false,
  lastResponse: null as any,
  list: [] as any[],
  sample: [] as any[],
  error: "",
  showFullResponse: false,
});

// fetchPreview: گارد انتخاب/پُر بودن api
async function fetchPreview() {
  apiState.isLoading = true;
  apiState.error = "";
  apiState.list = [];
  apiState.sample = [];
  apiState.lastResponse = null;
  apiState.showFullResponse = false;

  try {
    if (!currentApi.value) {
      notify("ابتدا یک API بساز و Select کن.", "warning");
      return;
    }
    const api = currentApi.value;

    if (!api.baseUrl || !api.path) {
      notify("baseUrl و path را وارد کن.", "danger");
      return;
    }

    const safeBaseUrl = /^https?:\/\//i.test(api.baseUrl)
      ? api.baseUrl
      : `https://${api.baseUrl}`;

    const res = await request(api.path, {
      baseUrl: safeBaseUrl,
      headers: { "Cache-Control": "no-cache", ...api.headers },
      method: api.method,
      body: api.method !== "GET" ? api.body : undefined,
    });

    apiState.lastResponse = res;

    const list = getByPath(res, api.pathToList) ?? res?.body ?? [];
    const isArray = Array.isArray(list);
    if (!isArray) {
      // ✅ فقط در این حالت، response کامل نمایش داده می‌شود
      apiState.showFullResponse = true;
      notify(
        "pathToList به آرایه منتهی نشد؛ ساختار کامل پاسخ نمایش داده شد.",
        "warning"
      );
    } else {
      apiState.list = list;
      apiState.sample = apiState.list.slice(0, 3);
      apiState.showFullResponse = false;
      notify("پیش‌نمایش به‌روزرسانی شد.", "success");
    }
  } catch (e) {
    console.log(e);
    apiState.error = "خطا در دریافت اطلاعات.";
    notify("مشکلی پیش آمد.", "danger");
  } finally {
    apiState.isLoading = false;
  }
}

/* =========================
   SmartTable Configs
========================= */
interface ColumnTypeSettings {
  badge: {
    conditions: Array<{
      condition: string;
      value: string;
      color: string;
      icon?: string;
    }>;
    defaultColor?: string;
    defaultValue?: string;
  };
  link: {
    target?: "_blank" | "_self";
    asButton?: boolean;
    buttonStyle?: "primary" | "secondary" | "danger";
    confirmMessage?: string;
    basePath?: string;
    safe?: boolean;
  };
  date: {
    format: string;
    locale: string;
  };
  datetime: {
    format: string;
    locale: string;
    showTime: boolean;
  };
  currency: {
    currency: string;
    locale: string;
    decimals: number;
  };
  percent: {
    decimals: number;
    showSign: boolean;
  };
  number: {
    decimals: number;
    thousandSeparator: boolean;
  };
  dropdown: {
    options: Array<{ label: string; value: any }>;
    multiple: boolean;
    searchable: boolean;
  };
}

type ColumnType = keyof ColumnTypeSettings | "text";

// ---- Columns (flat, SmartTable-compatible)
type Column = {
  key: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "currency"
    | "percent"
    | "date"
    | "datetime"
    | "badge"
    | "link"
    | "dropdown";
  map?: Record<string, string>;
  basePath?: string; // link
  options?: string[]; // dropdown (string[] کافی است)
  formatOptions?: Record<string, any>; // number/currency (Intl options)
  hidden?: boolean;
  safe?: boolean; // link: false => v-html mode
  shrink?: boolean;
  sortable?: boolean;
  filterable?: boolean;
};

// پیش‌فرض‌های هر type (طبق رفتار SmartTable)
function ensureColumnDefaults(c: Column) {
  switch (c.type) {
    case "link":
      if (c.basePath == null) c.basePath = "";
      if (c.safe == null) c.safe = true;
      break;
    case "dropdown":
      if (!Array.isArray(c.options)) c.options = [];
      break;
    case "badge":
      // SmartTable رنگ را از true/false می‌گیرد؛ متن را از map
      if (!c.map) c.map = { true: "بله", false: "خیر" } as any;
      break;
    case "number":
      if (!c.formatOptions) c.formatOptions = { maximumFractionDigits: 0 };
      break;
    case "currency":
      if (!c.formatOptions)
        c.formatOptions = {
          style: "currency",
          currency: "IRR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };
      break;
    // percent/date/datetime/text نیازی به تنظیم اضافی ندارند در SmartTable
  }
}

type RowAction = { icon: string; tooltip?: string; emit: string };
const builtins = reactive({
  edit: "" as string, // مثلا '/admin/users/edit'
  delete: "" as string, // مثلا 'api/admin/users' (بدون / اول یا با؟ SmartTable خودش / می‌ذاره)
});
const advanced = reactive({
  selectedMode: "null" as "null" | "true" | "false",
  highlightRulesJson: "",
  useExcelDataSource: "none" as "none" | "rawList" | "preview", // کدوم آرایه به excelData پاس بشه
});

const selectedProp = computed(() => {
  if (advanced.selectedMode === "null") return null;
  return advanced.selectedMode === "true";
});

const highlightRules = computed(() => {
  try {
    return advanced.highlightRulesJson
      ? JSON.parse(advanced.highlightRulesJson)
      : null;
  } catch {
    return null;
  }
});

const excelDataProp = computed(() => {
  switch (advanced.useExcelDataSource) {
    case "rawList":
      return apiState.list;
    case "preview":
      return previewData.value;
    default:
      return [];
  }
});

const columns = ref<Column[]>([]);
const actions = ref<RowAction[]>([]);

const tableOptions = reactive({
  title: "",
  sortable: true,
  multiSort: false,
  excel: true,
  excelOptions: {
    filename: "export.xlsx",
    useRawData: false,
    columns: null as null | string[],
  },
  refresh: true,
  idShow: false,
  stickyHeader: true,
  responsive: true,
  emptyText: "موردی برای نمایش وجود ندارد.",
  rowClickable: false,
  rowClickEmit: "rowClick" as string | null,
});
// هر تغییری روی ستون‌ها → پیش‌فرض‌های مرتبط اعمال شود
watch(columns, (cols) => cols.forEach(ensureColumnDefaults), {
  deep: true,
  immediate: true,
});
/* =========================
   Filters / Search (Dynamic)
========================= */
type FilterSearch =
  | { type: "search"; key: string; placeholder?: string; fields?: string[] }
  | {
      type: "dropdown";
      key: string;
      label: string;
      default?: any;
      options: { label: string; value: any }[];
      field?: string;
    };
const filtersConfig = ref<FilterSearch[]>([]);
const filtersState = reactive<Record<string, any>>({});

function initFiltersFromConfig() {
  // خالی کردن state قبلی
  Object.keys(filtersState).forEach((k) => delete (filtersState as any)[k]);
  // فقط کلیدها رو می‌سازیم؛ بدون مقدار «all» یا مشابه
  for (const f of filtersConfig.value) {
    if (f.type === "search") filtersState[f.key] = "";
    if (f.type === "dropdown") {
      const explicit = (f as any).default;
      (filtersState as any)[f.key] =
        explicit !== undefined ? explicit : undefined;
    }
  }
}
initFiltersFromConfig();

/* =========================
   Transform (Builder-editable)
========================= */
const transformTemplate = ref(`return item;`);

function runTransform(item: any) {
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("item", transformTemplate.value);
    const out = fn(item);
    return out && typeof out === "object" ? out : item;
  } catch {
    return item;
  }
}

/* =========================
   Auto Columns from Sample
========================= */
function detectType(val: any): Column["type"] {
  if (val == null) return "text";
  if (typeof val === "number") return "number";
  if (typeof val === "boolean") return "badge";
  if (typeof val === "string") {
    const d = Date.parse(val);
    if (!isNaN(d))
      return val.includes("T") || val.includes(":") ? "datetime" : "date";
    if (/^https?:\/\//i.test(val)) return "link";
    return "text";
  }
  return "text";
}
function autoColumnsFromSample() {
  if (!apiState.sample.length) {
    notify("نمونه‌ای برای تشخیص ستون موجود نیست.", "warning");
    return;
  }
  const first = apiState.sample[0];
  if (typeof first !== "object" || !first) return;

  const next: Column[] = [];
  const indexCol: Column = {
    key: "index",
    label: "#",
    type: "number",
    sortable: false,
  };
  next.push(indexCol);
  Object.keys(first).forEach((k) => {
    const v = first[k];
    let t: Column["type"] = "text";
    if (typeof v === "number") t = "number";
    else if (typeof v === "boolean") t = "badge";
    else if (typeof v === "string") {
      const d = Date.parse(v);
      if (!isNaN(d))
        t = v.includes("T") || v.includes(":") ? "datetime" : "date";
      else if (/^https?:\/\//i.test(v)) t = "link";
      else t = "text";
    }

    const col: Column = { key: k, label: k, type: t, sortable: true };
    ensureColumnDefaults(col);
    next.push(col);
  });
  columns.value = next;
  notify("ستون‌ها بر اساس نمونه تشخیص داده شدند.");
}

/* =========================
   Preview Data (Filters + Transform)
========================= */
const previewData = computed(() => {
  let arr = apiState.list.slice();

  // search‌ها
  for (const f of filtersConfig.value) {
    if (f.type !== "search") continue;
    const q = makeSearchString(
      filtersState[f.key],
      normalizationOptions.value.textOptions
    );

    if (!q) continue;

    const fields = Array.isArray((f as any).fields) ? (f as any).fields : [];
    if (fields.length) {
      arr = arr.filter((row) =>
        fields.some((field) =>
          String(getByPath(row, field) ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    } else {
      arr = arr.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
    }
  }
  // normalize (preview)
  if (normalizationUI.enabled) {
    arr = arr.map((row) => normalizeAll(row, normalizationOptions.value));
  }

  // dropdown‌ها (v-model = label → map به value)
  for (const f of filtersConfig.value) {
    if (f.type !== "dropdown") continue;
    const selectedLabel = filtersState[f.key];

    if (
      selectedLabel === undefined ||
      selectedLabel === null ||
      selectedLabel === "" ||
      selectedLabel === "همه"
    ) {
      continue;
    }

    const opts = (f as any).options || [];
    const found = opts.find((o: any) => o.label === selectedLabel);
    const selectedValue = found ? found.value : selectedLabel;

    if ((f as any).field) {
      arr = arr.filter(
        (row) =>
          String(getByPath(row, (f as any).field)) === String(selectedValue)
      );
    }
  }

  return arr.map(runTransform);
});

watch(
  filtersState,
  () => {
    /* live preview */
  },
  { deep: true }
);

/* =========================
   SmartTable Event Handlers (Stubs with TODO)
========================= */
function inspect(row: any) {
  /* TODO: implement inspect */ console.log("inspect", row);
}
async function suspend(row: any) {
  /* TODO: implement suspend */ console.log("suspend", row);
}
function rowClick(row: any) {
  /* TODO: implement row click */ console.log("rowClick", row);
}

//////////////////////////////////////////////////////////////
/* =========================
   Code Generation + Import/Export
========================= */
const showCodeModal = ref(false);
const showImportModal = ref(false);
const codeOutput = ref(""); // خروجی .vue کامل
const importText = ref(""); // ورودی JSON یا (در آینده) کد

function buildFiltersInitLines() {
  // state اولیه برای فیلترها (در کد خروجی)
  const searchDefs = filtersConfig.value.filter((f) => f.type === "search");
  const dropdownDefs = filtersConfig.value.filter((f) => f.type === "dropdown");

  const initLines: string[] = [];
  // ساخت شیء reactive برای state فیلترها
  initLines.push(`const filtersState = reactive<Record<string, any>>({});`);
  searchDefs.forEach((s) => {
    initLines.push(`filtersState[${JSON.stringify(s.key)}] = "";`);
  });
  dropdownDefs.forEach((d) => {
    const dv = d.default !== undefined ? d.default : "undefined";
    initLines.push(
      `filtersState[${JSON.stringify(d.key)}] = ${JSON.stringify(dv)};`
    );
  });
  return initLines.join("\n");
}

function buildFilterUIInTemplate(indent = "      ") {
  // الگوی ورودی‌های فیلتر برای خروجی صفحه
  const blocks: string[] = [];
  // search ها
  filtersConfig.value
    .filter((f) => f.type === "search")
    .forEach((s) => {
      blocks.push(
        `${indent}<InputField
${indent}  v-model="filtersState[${JSON.stringify(s.key)}]"
${indent}  :placeholder=${JSON.stringify(s.placeholder || "جستجو...")}
${indent}  class="w-full max-w-sm"
/>`
      );
    });

  // dropdown ها
  filtersConfig.value
    .filter((f) => f.type === "dropdown")
    .forEach((d) => {
      const labels = d.options.map((o) => o.label);
      const optsJson = JSON.stringify(d.options);
      blocks.push(
        `${indent}<DropDown
${indent}  :items='${JSON.stringify(labels)}'
${indent}  @send-option="(lbl) => { const found = (${optsJson}).find(o => o.label===lbl); filtersState[${JSON.stringify(
          d.key
        )}] = found ? found.value : lbl; }"
>
${indent}  <template #show>
${indent}    {{
${indent}      ((${optsJson}).find(o => o.value === filtersState[${JSON.stringify(
          d.key
        )}])?.label) || (${JSON.stringify(
          labels
        )}.includes(filtersState[${JSON.stringify(
          d.key
        )}]) ? filtersState[${JSON.stringify(d.key)}] : ${JSON.stringify(
          d.label || "فیلتر"
        )})
${indent}    }}
${indent}  </template>
${indent}</DropDown>`
      );
    });

  return blocks.join("\n");
}

function generatePageCode() {
  if (!columns.value.length) {
    notify("ستون تعریف نشده.", "warning");
    return;
  }

  // ---- جمع‌آوری کانفیگ‌ها
  const searchDefs = filtersConfig.value.filter((f) => f.type === "search");
  const dropDefs = filtersConfig.value.filter((f) => f.type === "dropdown");
  const searchMain = searchDefs[0];
  const otherSearches = searchDefs.slice(1);

  // ---- اسکریپت: state فیلترها
  const searchInit =
    (searchMain ? `const searchTerm = ref('');\n` : ``) +
    otherSearches.map((s) => `const q_${s.key} = ref('');`).join("\n");

  const ddInit = dropDefs
    .map((d) => {
      const items = (d as any).options?.map((o: any) => o.label) || [];
      const defLabel =
        (d as any).options?.find((o: any) => o.value === (d as any).default)
          ?.label ||
        (d as any).label ||
        "همه";
      return (
        `const ${d.key} = ref(${JSON.stringify(defLabel)});\n` +
        `const ${d.key}Options = ref(${JSON.stringify(items)});`
      );
    })
    .join("\n");

  // ---- اسکریپت: فیلتر کردن بر اساس search ها
  const searchFilterBlock = searchMain
    ? `{
    const q = makeSearchString(searchTerm.value, NORMALIZATION.textOptions);
    if (q) {
      const fields = ${JSON.stringify(
        Array.isArray((searchMain as any).fields)
          ? (searchMain as any).fields
          : []
      )};
      if (fields.length) {
        list = list.filter((row:any) =>
          fields.some((f:string) => String(getByPath(row, f) ?? '').toLowerCase().includes(q))
        );
      } else {
        list = list.filter((row:any) => JSON.stringify(row).toLowerCase().includes(q));
      }
    }
  }`
    : `// no main search`;

  const otherSearchFilters = otherSearches
    .map(
      (s) => `{
    
    const q = makeSearchString(q_${s.key}.value, NORMALIZATION.textOptions);\

    if (q) {
      const fields = ${JSON.stringify(
        Array.isArray((s as any).fields) ? (s as any).fields : []
      )};
      if (fields.length) {
        list = list.filter((row:any) =>
          fields.some((f:string) => String(getByPath(row, f) ?? '').toLowerCase().includes(q))
        );
      } else {
        list = list.filter((row:any) => JSON.stringify(row).toLowerCase().includes(q));
      }
    }
  }`
    )
    .join("\n");

  // ---- اسکریپت: فیلتر کردن بر اساس dropdown ها (label → value)
  const ddFilters = dropDefs
    .map(
      (d) => `{
    const opts = ${JSON.stringify((d as any).options || [])};
    const found = opts.find(o => o.label === ${d.key}.value);
    const val = found ? found.value : ${d.key}.value;
    if (${JSON.stringify(
      (d as any).field
    )} && !(val===undefined || val===null || val==='' || val==='all' || val==='همه')) {
      list = list.filter((row:any) => String(getByPath(row, ${JSON.stringify(
        (d as any).field || ""
      )})) === String(val));
    }
  }`
    )
    .join("\n");

  // ---- ستون‌ها/اکشن‌ها/گزینه‌های جدول
  const columnsJson = JSON.stringify(columns.value, null, 2);
  const actionsJson = JSON.stringify(actions.value, null, 2);
  const excelJson = JSON.stringify(tableOptions.excelOptions || {}, null, 2);

  // ---- API انتخاب‌شده
  const api = currentApi.value;
  const API_CONFIG = api
    ? {
        baseUrl: /^https?:\/\//i.test(api.baseUrl)
          ? api.baseUrl
          : `https://${api.baseUrl}`,
        path: api.path || "",
        pathToList: api.pathToList || "",
        method: api.method || "GET",
        headers: api.headers || {},
        body: api.body,
      }
    : null;

  // ---- transform
  const transformBody = (transformTemplate.value || "return item;").trim();
  const normForCode = {
    enabled: normalizationUI.enabled,
    includePaths: normalizationOptions.value.includePaths,
    excludePaths: normalizationOptions.value.excludePaths,
    textOptions: normalizationOptions.value.textOptions,
  };

  // ---- اسکریپت نهایی صفحه خروجی
  const scriptStr =
    `<script setup lang="ts">

const { request } = useApi();
const { $notifyDanger } = useNuxtApp();

const NORMALIZATION = ${JSON.stringify(normForCode, null, 2)};

// Data
const rawData = ref<any[]>([]);
const filteredData = ref<any[]>([]);
const isLoading = ref(true);

// Filters
${searchInit || "// no searches"}
${ddInit || "// no dropdowns"}

// Columns/Actions (SmartTable-ready)
const columns = ref(${columnsJson});
const actions = ref(${actionsJson});

// Transform
function getByPath(obj:any, path?:string){
  if(!path) return obj;
  return path.split('.').reduce((o:any,k:string)=> (o? o[k] : undefined), obj);
}
const transformData = (item:any) => {
  ${transformBody}
};

// Filtering
const filterData = () => {
  let list = rawData.value.slice();
// normalization (display)
if (NORMALIZATION.enabled) {
  list = list.map((row:any) => normalizeAll(row, NORMALIZATION));
}


  // search(es)
  ${searchFilterBlock}
  ${otherSearchFilters || "// no extra searches"}

  // dropdowns
  ${ddFilters || "// no dropdowns"}

  filteredData.value = list.map(transformData);
};

// Fetch
const API_CONFIG = ${JSON.stringify(API_CONFIG, null, 2)};
const fetchData = async () => {
  isLoading.value = true;
  try {
    if (!API_CONFIG) { rawData.value = []; filterData(); return; }
    const res = await request(API_CONFIG.path, {
      baseUrl: API_CONFIG.baseUrl,
      method: API_CONFIG.method,
      headers: { 'Cache-Control': 'no-cache', ...API_CONFIG.headers },
      body: API_CONFIG.method !== 'GET' ? API_CONFIG.body : undefined
    });
    if (!res?.status) {
      $notifyDanger(res?.message || 'خطا در دریافت اطلاعات');
      rawData.value = [];
    } else {
      const list = getByPath(res, API_CONFIG.pathToList) ?? res?.body ?? [];
      rawData.value = Array.isArray(list) ? list : [];
    }
    filterData();
  } catch (e) {
    $notifyDanger('مشکلی پیش آمد.');
    rawData.value = [];
    filterData();
  } finally {
    isLoading.value = false;
  }
};

// Watch filters
watch([
  ${searchMain ? "searchTerm" : ""}${
      searchMain && otherSearches.length ? ", " : ""
    }${otherSearches.map((s) => `q_${s.key}`).join(", ")}${
      (searchMain || otherSearches.length) && dropDefs.length ? ", " : ""
    }${dropDefs.map((d) => d.key).join(", ")}
], filterData, { deep: true });

onBeforeMount(fetchData);
</` + `script>`;

  // ---- UI: بلاک سرچ‌ها
  const searchBlocks =
    searchDefs
      .map((s, i) => {
        const model = i === 0 ? "searchTerm" : `q_${s.key}`;
        const ph = s.placeholder || "جستجو...";
        return `<div class=" flex-nowrap w-full  lg:w-6/12 flex items-center gap-0 relative justify-around">
            <InputField
              v-model="${model}"
              placeholder="${ph}"
              type="text"
              class="w-full !p-0"
           
              />
             <div  class="absolute left-1 cursor-pointer  top-1 bottom-1 text-xs lg:text-xl px-2 text-center flex items-center justify-center bg-primary-100 text-white rounded-xl aspect-square hover:bg-primary-dark transition-colors" >
                <Icon name="fa6-solid:magnifying-glass" />
            </div>
          </div>`;
      })
      .join("\n          ") || "";

  // ---- UI: بلاک دراپ‌داون‌ها
  const dropBlocks =
    dropDefs
      .map(
        (d) =>
          `<DropDown label="${d.label}" :items="${d.key}Options" v-model="${d.key}" class="!p-0" />`
      )
      .join("\n            ") || "";
  let e = "";
  for (let a of actions.value) {
    e += `@${a.emit}="(r: any)=>{/*TODO: implement*/}" `;
  }
  // ---- جدول
  const tableBlock = `
  <SmartTable
  class="smart-scroll"
  emptyText=${JSON.stringify(tableOptions.emptyText)}
  edit=${JSON.stringify(builtins.edit || "")}
  delete=${JSON.stringify(builtins.delete || "")}
    :data="filteredData"
    :columns="columns"
    :actions="actions"
    :loading="isLoading"
    :error="false"
    :sortable=${JSON.stringify(!!tableOptions.sortable)}
    :multiSort=${JSON.stringify(!!tableOptions.multiSort)}
    :excel=${JSON.stringify(!!tableOptions.excel)}
    ${tableOptions.excel ? `:excelOptions='${excelJson}'` : ""}
    :idShow=${JSON.stringify(!!tableOptions.idShow)}
    :stickyHeader=${JSON.stringify(!!tableOptions.stickyHeader)}
    :responsive=${JSON.stringify(!!tableOptions.responsive)}
    :refresh=${JSON.stringify(!!tableOptions.refresh)}
    ${tableOptions.refresh ? '@refresh="fetchData"' : ""}
    :rowClickable=${JSON.stringify(!!tableOptions.rowClickable)}
    ${tableOptions.rowClickable ? "@rowClick='()=>{/*TODO: implement*/}'" : ""}
    ${e}
  />`.trim();

  // ---- قالب نهایی
  const templateStr = `
<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
      <Header>${tableOptions.title}</Header>
        <!-- Toolbar: Filters/Search + Actions -->
        <div class="flex flex-wrap items-center gap-2">
          ${searchBlocks}
          ${dropBlocks}
          
        </div>

        <!-- Table -->
        ${tableBlock}
      </Box>
    </template>
  </NuxtLayout>
</template>`.trim();

  // ---- نمایش در مودال
  codeOutput.value = `${templateStr}\n\n${scriptStr}\n`;
  showCodeModal.value = true;
}

function importFromText() {
  try {
    const obj = JSON.parse(importText.value);

    if (Array.isArray(obj.columns)) columns.value = obj.columns;
    if (Array.isArray(obj.actions)) actions.value = obj.actions;
    if (obj.tableOptions && typeof obj.tableOptions === "object")
      Object.assign(tableOptions, obj.tableOptions);
    if (obj.builtins && typeof obj.builtins === "object")
      Object.assign(builtins, obj.builtins);
    if (Array.isArray(obj.filtersConfig)) {
      filtersConfig.value = obj.filtersConfig;
      initFiltersFromConfig();
    }
    if (typeof obj.transformTemplate === "string")
      transformTemplate.value = obj.transformTemplate;

    if (obj.advanced && typeof obj.advanced === "object") {
      if (["null", "true", "false"].includes(obj.advanced.selectedMode))
        advanced.selectedMode = obj.advanced.selectedMode;
      if (
        ["none", "rawList", "preview"].includes(obj.advanced.useExcelDataSource)
      )
        advanced.useExcelDataSource = obj.advanced.useExcelDataSource;
      if (obj.advanced.highlightRulesJson)
        advanced.highlightRulesJson = obj.advanced.highlightRulesJson;
    }

    if (obj.api && typeof obj.api === "object") {
      // وارد کردن یک API ساده
      const id = uniqueId("api");
      apis.value.push({
        id,
        name: obj.api.name || "Imported API",
        baseUrl: obj.api.baseUrl || "",
        path: obj.api.path || "",
        pathToList: obj.api.pathToList || "",
        method: obj.api.method || "GET",
        headers: obj.api.headers || {},
        body: obj.api.body,
      });
      selectedApiId.value = id;
    }

    notify("کانفیگ وارد شد.", "success");
    showImportModal.value = false;
  } catch (e) {
    notify("فرمت ورودی معتبر نیست. JSON معتبر بچسبان.", "danger");
  }
}

async function copyToClipboard() {
  try {
    await window.navigator.clipboard.writeText(codeOutput.value);
    notify("کد با موفقیت کپی شد", "success");
  } catch (err) {
    notify("خطا در کپی کردن کد", "danger");
  }
}
</script>

<template>
  <NuxtLayout name="builder">
    <!-- <template> -->
    <section class="tb-container tb-three-cols">
      <!-- ستون ۱: API ها -->
      <aside class="tb-col-left">
        <div class="tb-card">
          <div class="tb-card-header">APIs</div>
          <!-- (همین محتوای قبل) -->
          <!-- این بلوک رو همون‌طور که داری نگه دار -->
          <!-- شروع محتوای قبلی ستون API -->
          <div class="tb-row tb-row-left">
            <button
              class="tb-btn"
              @click="
                apis.push({
                  id: uniqueId('api'),
                  name: `API ${apis.length + 1}`,
                  baseUrl: '',
                  path: '',
                  pathToList: '',
                  method: 'GET',
                  headers: {},
                })
              "
            >
              + Add API
            </button>
          </div>

          <div v-for="(api, idx) in apis" :key="api.id" class="tb-block">
            <div class="tb-grid">
              <InputField
                class="tb-col"
                v-model="api.name"
                placeholder="API Name"
              />
              <DropDown
                class="tb-col col-span-6"
                :items="['GET', 'POST', 'PUT', 'DELETE']"
                v-model="api.method"
              />
            </div>
            <div class="tb-field">
              <InputField
                v-model="api.baseUrl"
                prefix="https://"
                placeholder="baseUrl (e.g., api.example.com)"
              />
            </div>
            <div class="tb-field">
              <InputField
                v-model="api.path"
                placeholder="path (e.g., /admins/store)"
              />
            </div>
            <div class="tb-field">
              <InputField
                v-model="api.pathToList"
                placeholder="pathToList (e.g., body or data.body)"
              />
            </div>
            <div class="tb-field" v-if="api.method !== 'GET'">
              <label class="tb-label">Request Body (JSON)</label>
              <textarea
                v-model="api.body"
                class="tb-editor"
                style="height: 100px"
              />
            </div>
            <div class="tb-row">
              <button class="tb-btn" @click="selectedApiId = api.id">
                Select
              </button>
              <button
                class="tb-btn"
                :class="{ 'tb-btn-disabled': selectedApiId !== api.id }"
                @click="fetchPreview"
              >
                {{ apiState.isLoading ? "..." : "Fetch" }}
              </button>
              <button class="tb-btn tb-btn-danger" @click="apis.splice(idx, 1)">
                Remove
              </button>
            </div>
          </div>

          <div v-if="apiState.error" class="tb-error">{{ apiState.error }}</div>

          <!-- فقط وقتی آرایه پیدا نشد -->
          <div v-if="apiState.showFullResponse" class="tb-samples">
            <div class="tb-samples-title">API Response (full):</div>
            <pre class="tb-code">{{
              JSON.stringify(apiState.lastResponse, null, 2)
            }}</pre>
          </div>

          <!-- در حالت عادی فقط نمونه‌ها -->
          <div v-else-if="apiState.sample.length" class="tb-samples">
            <div class="tb-samples-title">Sample Data (first 3):</div>
            <pre class="tb-code">{{ apiState.sample }}</pre>
            <div class="tb-row">
              <button class="tb-btn" @click="autoColumnsFromSample">
                Auto-detect Columns
              </button>
            </div>
          </div>

          <!-- پایان محتوای قبلی ستون API -->
        </div>
      </aside>

      <!-- ستون ۲: Columns / Actions / Preview -->
      <main class="tb-col-center">
        <div class="tb-card">
          <div class="tb-card-header">Columns</div>
          <!-- همون بلوک Columns قبلی -->
          <!-- (کد قبلی Columns را اینجا قرار بده؛ فقط h3 قدیمی حذف شده چون هدر کارت جدید داریم) -->
          <div class="tb-row tb-row-left">
            <button
              class="tb-btn"
              @click="
                columns.push({
                  key: '',
                  label: '',
                  type: 'text',
                  sortable: true,
                })
              "
            >
              + Add Column
            </button>
          </div>

          <div v-for="(c, idx) in columns" :key="idx" class="tb-block">
            <div class="tb-grid">
              <InputField
                class="tb-col"
                v-model="c.key"
                placeholder="key (dot-path)"
              />
              <InputField
                class="tb-col"
                v-model="c.label"
                placeholder="label"
              />
              <DropDown
                class="tb-col"
                :items="[
                  'text',
                  'number',
                  'currency',
                  'percent',
                  'date',
                  'datetime',
                  'badge',
                  'link',
                  'dropdown',
                ]"
                v-model="c.type"
              />
            </div>

            <div class="tb-grid">
              <label class="tb-col tb-check"
                ><input type="checkbox" v-model="c.shrink" /> shrink</label
              >
              <label class="tb-col tb-check"
                ><input type="checkbox" v-model="c.hidden" /> hidden</label
              >
              <label class="tb-col tb-check"
                ><input type="checkbox" v-model="c.sortable" /> sortable</label
              >
              <!-- <label class="tb-col tb-check"
                ><input type="checkbox" v-model="c.filterable" />
                filterable</label
              > -->
            </div>
            <div class="">
              <!-- Link -->
              <div v-if="c.type === 'link'" class="tb-block">
                <div class="grid grid-cols-2 gap-2">
                  <InputField
                    class="tb-field"
                    v-model="c.basePath"
                    label-position="top"
                    label="Base Path"
                    placeholder="(e.g., https://site/)"
                  />
                  <label class="tb-field tb-check"
                    ><input type="checkbox" v-model="c.safe" /> Safe mode
                    (غیرفعال = v-html)</label
                  >
                </div>
              </div>

              <!-- Badge (فقط map) -->
              <div v-else-if="c.type === 'badge'" class="tb-block">
                <div class="grid grid-cols-2 gap-2">
                  <InputField
                    class="tb-field"
                    v-model="(c.map as any).true"
                    label-position="top"
                    label="true"
                    placeholder="نمایش برای true"
                  />
                  <InputField
                    class="tb-field"
                    v-model="(c.map as any).false"
                    label-position="top"
                    label="false"
                    placeholder="نمایش برای false"
                  />
                </div>
                <small class="tb-hint block px-1 text-gray-500"
                  >رنگ اتوماتیک است: true سبز، false قرمز.</small
                >
              </div>

              <!-- Dropdown (آرایهٔ رشته‌ای) -->
              <div v-else-if="c.type === 'dropdown'" class="tb-block">
                <div class="tb-row tb-row-left mb-2">
                  <button class="tb-btn" @click="(c.options ||= []).push('')">
                    + Add Option
                  </button>
                </div>
                <div
                  v-for="(opt, i) in c.options || []"
                  :key="i"
                  class="flex gap-2 mb-1"
                >
                  <InputField
                    class="tb-field"
                    v-model="c.options[i]"
                    label-position="top"
                    label="Option text"
                  />
                  <button
                    class="tb-btn tb-btn-danger"
                    @click="c.options.splice(i, 1)"
                  >
                    x
                  </button>
                </div>
                <small class="tb-hint block px-1 text-gray-500"
                  >DropDown در SmartTable انتظار string[] دارد.</small
                >
              </div>

              <!-- Number -->
              <div v-else-if="c.type === 'number'" class="tb-block">
                <div class="grid grid-cols-2 gap-2">
                  <InputField
                    class="tb-field"
                    type="number"
                    v-model.number="(c.formatOptions as any).maximumFractionDigits"
                    label-position="top"
                    label="max fraction digits"
                  />
                  <InputField
                    class="tb-field"
                    type="number"
                    v-model.number="(c.formatOptions as any).minimumFractionDigits"
                    label-position="top"
                    label="min fraction digits"
                  />
                </div>
              </div>

              <!-- Currency -->
              <div v-else-if="c.type === 'currency'" class="tb-block">
                <div class="grid grid-cols-2 gap-2">
                  <InputField
                    class="tb-field"
                    v-model="(c.formatOptions as any).currency"
                    label-position="top"
                    label="Currency code"
                    placeholder=" (e.g., IRR)"
                  />
                  <DropDown
                    class="tb-field"
                    :items="['currency', 'decimal']"
                    v-model="(c.formatOptions as any).style"
                  />
                  <InputField
                    class="tb-field"
                    type="number"
                    v-model.number="(c.formatOptions as any).maximumFractionDigits"
                    label-position="top"
                    label="max fraction digits"
                  />
                  <InputField
                    class="tb-field"
                    type="number"
                    v-model.number="(c.formatOptions as any).minimumFractionDigits"
                    label-position="top"
                    label="min fraction digits"
                  />
                </div>
                <small class="tb-hint block px-1 text-gray-500"
                  >SmartTable از Intl.NumberFormat با formatOptions استفاده
                  می‌کند.</small
                >
              </div>

              <!-- date/datetime/percent → تنظیم خاصی در SmartTable استفاده نمی‌شود -->
            </div>

            <!-- تنظیمات انواع ستون‌ها (همان بلاک‌های قبلی) -->
            <!-- ... همانی که داشتی ... -->

            <div class="tb-row tb-row-right">
              <button
                class="tb-btn tb-btn-danger"
                @click="columns.splice(idx, 1)"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
        <div class="tb-card">
          <div class="tb-card-header">Built-in Actions</div>
          <div class="grid grid-cols-2 gap-2">
            <InputField
              class="tb-field"
              v-model="builtins.edit"
              label-position="top"
              label="edit route "
              placeholder="(e.g., /admins/edit)"
            />
            <InputField
              class="tb-field"
              v-model="builtins.delete"
              label-position="top"
              label="delete api"
              placeholder="(e.g., api/admins)"
            />
          </div>
          <small class="tb-hint block px-4 text-gray-500">
            EDIT -> <code>${edit}/{id}</code> <br />
            DELETE -> <code>/${delete}/{id}</code>
          </small>
        </div>

        <div class="tb-card">
          <div class="tb-card-header">Row Actions</div>
          <!-- همون بلوک Actions قبلی -->
          <div class="tb-row tb-row-left">
            <button
              class="tb-btn"
              @click="
                actions.push({
                  icon: 'fa6-solid:info',
                  tooltip: '',
                  emit: uniqueId('ev'),
                })
              "
            >
              + Add Action
            </button>
          </div>
          <div v-for="(a, i) in actions" :key="i" class="tb-grid tb-block">
            <InputField
              class="tb-col"
              v-model="a.icon"
              placeholder="icon (e.g., fa6-solid:info)"
              label-position="top"
              label="icon"
            />
            <InputField
              class="tb-col"
              v-model="a.tooltip"
              placeholder="tooltip"
              label-position="top"
              label="tooltip text"
            />
            <InputField
              class="tb-col"
              v-model="a.emit"
              label-position="top"
              label="emit name"
            />
            <button class="tb-btn tb-btn-danger" @click="actions.splice(i, 1)">
              x
            </button>
          </div>
        </div>
      </main>

      <!-- ستون ۳: Transform(map) / Options / Filters & Search -->
      <aside class="tb-col-right">
        <div class="tb-card !bg-transparent !p-0 !block">
          <div class="tb-card-header">transform(item) { ... }</div>
          <!-- همان بخش Transform & Code قبلی -->
          <textarea
            v-model="transformTemplate"
            class="tb-editor !rounded-t-none"
          />
        </div>

        <div class="tb-card">
          <div class="tb-card-header">Options</div>
          <!-- همان Options قبلی -->
          <div class="tb-grid tb-grid-4">
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.sortable" />
              sortable</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.multiSort" />
              multiSort</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.excel" />
              excel</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.refresh" />
              refresh</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.idShow" />
              idShow</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.rowClickable" />
              rowClickable</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.stickyHeader" />
              stickyHeader</label
            >
            <label class="tb-check"
              ><input type="checkbox" v-model="tableOptions.responsive" />
              responsive</label
            >
          </div>
          <div class="tb-col">
            <InputField
              class="tb-field"
              v-model="tableOptions.title"
              label="title of page"
            />
            <InputField
              class="tb-field"
              v-model="tableOptions.emptyText"
              label="emptyText"
            />
            <InputField
              class="tb-field"
              v-model="tableOptions.excelOptions.filename"
              label="excel filename"
            />
            <InputField
              class="tb-field"
              v-model="tableOptions.rowClickEmit"
              label="rowClickEmit"
            />

            <DropDown
              class="tb-field"
              :items="['null', 'true', 'false']"
              label="select mode"
              v-model="advanced.selectedMode"
            />
            <DropDown
              class="tb-field"
              :items="['none', 'rawList', 'preview']"
              label="data source excel"
              v-model="advanced.useExcelDataSource"
            />
          </div>
        </div>

        <div class="tb-card">
          <div class="tb-card-header">Filters & Search</div>
          <!-- همان Filters & Search قبلی -->
          <div class="tb-row tb-row-left">
            <button
              class="tb-btn"
              @click="
                filtersConfig.push({
                  type: 'search',
                  key: uniqueId('q'),
                  placeholder: 'جستجو...',
                  fields: [],
                })
              "
            >
              + Add Search
            </button>
            <button
              class="tb-btn"
              @click="
                filtersConfig.push({
                  type: 'dropdown',
                  key: uniqueId('f'),
                  label: 'فیلتر',
                  options: [{ label: 'همه', value: 'all' }],
                  default: 'all',
                  field: '',
                })
              "
            >
              + Add Dropdown
            </button>
            <button class="tb-btn" @click="initFiltersFromConfig()">
              Apply Config
            </button>
          </div>

          <div v-for="(f, i) in filtersConfig" :key="i" class="tb-block">
            <div class="tb-grid">
              <DropDown
                class="tb-col"
                :items="['search', 'dropdown']"
                label-position="top"
                label="type"
                v-model="f.type"
              />
              <InputField
                class="tb-col"
                v-model="(f as any).key"
                label-position="top"
                label="key"
              />
              <template v-if="f.type === 'search'">
                <InputField
                  class="tb-col"
                  v-model="(f as any).placeholder"
                  label-position="top"
                  label="placeholder"
                />
              </template>
              <template v-else>
                <InputField
                  class="tb-col"
                  v-model="(f as any).label"
                  label-position="top"
                  label="label"
                />
                <InputField
                  class="tb-col"
                  v-model="(f as any).field"
                  label-position="top"
                  label="row.field (optional)"
                />
              </template>
            </div>

            <div v-if="f.type === 'search'" class="tb-field">
              <InputField
                class="w-full"
                v-model="(f as any).fieldsRaw"
                label-position="top"
                label="fields CSV"
                placeholder='(e.g., "name,work_subject")'
              />
              <small class="tb-hint"
                >If empty, global JSON search is used.</small
              >
              <div v-if="(f as any).fieldsRaw" class="tb-mini">
                {{
                  ((f as any).fields = String((f as any).fieldsRaw)
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean))
                }}
              </div>
            </div>

            <div v-else class="tb-block">
              <div class="tb-mini">Options:</div>
              <div class="space-y-1">
                <div
                  v-for="(opt, oi) in (f as any).options"
                  :key="oi"
                  class="tb-grid"
                >
                  <InputField
                    class="tb-col"
                    v-model="opt.label"
                    label-position="top"
                    label="label"
                  />
                  <InputField
                    class="tb-col"
                    v-model="opt.value"
                    label-position="top"
                    label="value"
                  />
                  <button
                    class="tb-btn tb-btn-danger"
                    @click="(f as any).options.splice(oi, 1)"
                  >
                    x
                  </button>
                </div>
              </div>
              <div class="tb-row !items-stretch">
                <button
                  class="tb-btn !whitespace-nowrap"
                  @click="(f as any).options.push({ label: '', value: '' })"
                >
                  + add option
                </button>
                <InputField
                  class="w-40"
                  v-model="(f as any).default"
                  label-position="top"
                  label="default value"
                />
              </div>
            </div>

            <div class="tb-row tb-row-right">
              <button
                class="tb-btn tb-btn-danger"
                @click="filtersConfig.splice(i, 1)"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
        <div class="tb-card">
          <div class="tb-card-header">Normalization</div>

          <div class="tb-grid tb-grid-4">
            <label class="tb-check">
              <input type="checkbox" v-model="normalizationUI.enabled" />
              enabled
            </label>
          </div>

          <div class="tb-grid tb-grid-4">
            <DropDown
              class="tb-field"
              :items="['all', 'include', 'exclude']"
              v-model="normalizationUI.scope"
              label="scope"
            />
          </div>

          <div class="tb-field">
            <label class="tb-label">columns (CSV)</label>
            <InputField
              class="w-full"
              v-model="normalizationUI.fieldsCsv"
              placeholder="مثلاً: name,phone_number,postal_code"
            />
            <small class="tb-hint"
              >اگر scope=all باشد خالی بگذار. نام‌ها برابر با key ستون‌ها
              باشند.</small
            >
          </div>

          <div class="tb-block">
            <div class="tb-mini mb-2 font-semibold">rules</div>
            <div class="grid grid-cols-3 gap-2">
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.digits"
                />
                digits: fa→en</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.letters"
                />
                letters: ar→fa</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.removeTatweel"
                />
                remove tatweel</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.removeDiacritics"
                />
                remove diacritics</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.removeZWNJ"
                />
                remove ZWNJ</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.collapseSpaces"
                />
                collapse spaces</label
              >
              <label class="tb-check !whitespace-nowrap"
                ><input
                  type="checkbox"
                  v-model="normalizationUI.options.trim"
                />
                trim</label
              >
            </div>
          </div>
        </div>
      </aside>

      <div class="tb-card col-span-8">
        <div class="tb-card-header">Preview</div>
        <div dir="rtl">
          <!-- Toolbar بالا: فیلترها + دکمه‌ها -->
          <div class="tb-row tb-row-left flex-wrap gap-2">
            <!-- search inputs -->
            <template v-for="f in filtersConfig" :key="'bar-'+(f as any).key">
              <InputField
                v-if="f.type === 'search'"
                class="w-full sm:w-64"
                v-model="(filtersState as any)[(f as any).key]"
                :placeholder="(f as any).placeholder || 'جستجو...'"
                type="text"
              />

              <!-- dropdowns (v-model label, map به value در کد) -->
              <DropDown
                v-else
                :items="(f as any).options?.map(o=>o.label) || []"
                v-model="(filtersState as any)[(f as any).key]"
              >
                <template #show>
                  {{
                    (filtersState as any)[(f as any).key] ||
                    (f as any).label ||
                    "فیلتر"
                  }}
                </template>
              </DropDown>
            </template>

            <!-- دکمه‌ها -->
            <div class="ms-auto flex gap-2">
              <button class="tb-btn" @click="generatePageCode()">
                خروجی صفحه (Vue)
              </button>
              <button class="tb-btn" @click="showImportModal = true">
                وارد کردن کد/کانفیگ
              </button>
            </div>
          </div>

          <!-- همون SmartTable قبلی -->
          <SmartTable
            class="smart-scroll"
            :data="previewData"
            :columns="columns"
            :actions="actions"
            :loading="apiState.isLoading"
            :error="false"
            :sortable="tableOptions.sortable"
            :multiSort="tableOptions.multiSort"
            :excel="tableOptions.excel"
            :excelOptions="tableOptions.excelOptions"
            :idShow="tableOptions.idShow"
            :refresh="tableOptions.refresh"
            :rowClickable="tableOptions.rowClickable"
            :emptyText="tableOptions.emptyText"
            :stickyHeader="tableOptions.stickyHeader"
            :responsive="tableOptions.responsive"
            :edit="builtins.edit || null"
            :delete="builtins.delete || null"
            @refresh="fetchPreview"
            @inspect="inspect"
            @suspend="suspend"
            @rowClick="rowClick"
            :highlightRules="highlightRules || undefined"
            :selected="selectedProp"
            :excelData="excelDataProp"
          />
        </div>
      </div>
    </section>
    <!-- Modal: Code Output -->
    <div
      v-if="showCodeModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div
          class="bg-black text-white px-4 py-3 flex items-center justify-between"
        >
          <div class="font-bold">خروجی صفحه (Vue)</div>
          <div class="flex items-center gap-2">
            <button class="tb-btn tb-btn-primary" @click="copyToClipboard">
              کپی
            </button>
            <button class="tb-btn tb-btn-danger" @click="showCodeModal = false">
              بستن
            </button>
          </div>
        </div>
        <pre class="tb-code flex-1 overflow-auto text-xs leading-6 p-4">{{
          codeOutput
        }}</pre>
      </div>
    </div>

    <!-- Modal: Import -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-xl w-full max-w-3xl overflow-hidden">
        <div
          class="bg-black text-white px-4 py-3 flex items-center justify-between"
        >
          <div class="font-bold">وارد کردن کد/کانفیگ (JSON)</div>
          <button class="tb-btn tb-btn-danger" @click="showImportModal = false">
            بستن
          </button>
        </div>
        <div class="p-4">
          <p class="text-sm text-gray-600 mb-2">
            یک JSON با کلیدهای
            <code
              >columns, actions, tableOptions, builtins, filtersConfig,
              transformTemplate, advanced, api</code
            >
            جای‌گذاری کن.
          </p>
          <textarea
            v-model="importText"
            class="tb-editor min-h-[220px]"
          ></textarea>
          <div class="mt-3 flex justify-end gap-2">
            <button class="tb-btn" @click="importFromText()">وارد کردن</button>
          </div>
        </div>
      </div>
    </div>

    <!-- </template> -->
  </NuxtLayout>
</template>

<style lang="scss">
/* Tailwind + SCSS nested version */

/* کانتینر 3 ستونه با پس‌زمینه خاکستری کمرنگ */
.tb-container {
  &.tb-three-cols {
    @apply grid gap-4 bg-gray-100 grid-cols-8;
    .tb-col-center,
    .tb-col-right {
      @apply col-span-3;
    }
    .tb-col-left {
      @apply col-span-2;
    }
    .tb-col-left,
    .tb-col-center,
    .tb-col-right {
      @apply flex flex-col gap-4;
    }
    /* موبایل: تک‌ستونه */
    // grid-template-columns: 1fr;

    // /* ستون‌ها (به ترتیب: چپ / وسط / راست) */
    // .tb-col {
    //   @apply flex flex-col gap-4;
    // }
    // .tb-col-left,
    // .tb-col-center,
    // .tb-col-right {
    //   grid-column: 1 / -1;
    // }

    // /* از lg به بعد، سه‌ستونه با عرض ثابت برای چپ/راست */
    // @screen lg {
    //   /* tailwind @apply برای grid-template-columns با مقدار دلخواه ممکن نیست،
    //      پس مستقیم property می‌نویسیم (مجاز در SCSS) */
    //   //   grid-template-columns: 280px 1fr 360px;
    //   //   align-items: start;

    //   .tb-col-left {
    //     grid-column: 1;
    //   }
    //   .tb-col-center {
    //     grid-column: 2;
    //   }
    //   .tb-col-right {
    //     grid-column: 3;
    //   }
    // }
  }
}

/* کارت‌ها: سفید + هدر مشکی فقط بالا */
.tb-card {
  @apply bg-white border border-gray-200 rounded-lg  shadow-sm;

  .tb-card-header {
    @apply bg-black text-white font-bold px-4 py-3;
    font-size: 0.95rem;
  }

  /* padding برای محتوا (به‌جز هدر) */
  > *:not(.tb-card-header) {
    @apply px-4 pt-4;
  }
  > *:last-child {
    @apply pb-4;
  }
}

/* ردیف‌ها و چینش‌ها */
.tb-row {
  @apply flex items-center gap-2 mt-2;

  &.tb-row-left {
    @apply justify-start;
  }
  &.tb-row-right {
    @apply justify-end;
  }
}

/* گرید‌های درونی */
.tb-grid {
  @apply grid grid-cols-12 gap-3 mb-3;
  .input-div {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
.tb-grid-4 {
  @apply grid grid-cols-4 gap-2;
}
.tb-grid-8 {
  @apply grid grid-cols-8 gap-2;
}

/* ستون‌های کنترل‌ها در گرید ۱۲تایی */
.tb-col {
  @apply col-span-12;

  @screen sm {
    @apply col-span-6;
  }
  @screen md {
    @apply col-span-4;
  }
}

/* بلاک‌های داخلی کارت */
.tb-block {
  @apply border border-dashed border-gray-200 rounded p-3 mt-3 bg-white;
}

/* دکمه‌ها: مشکی – و حالت خطر قرمز Outline */
.tb-btn {
  @apply px-4 py-2 rounded border font-semibold text-sm transition
         bg-black text-white border-black;

  &:hover {
    @apply -translate-y-px shadow-lg;
  }
  &:active {
    @apply translate-y-0 shadow-none;
  }

  &.tb-btn-disabled {
    @apply opacity-50 pointer-events-none;
  }

  &.tb-btn-danger {
    @apply bg-transparent text-red-500 border-red-500 flex items-center justify-center rounded-lg;
    &:hover {
      @apply bg-red-500 text-white;
    }
  }

  &.tb-btn-primary {
    /* اگر بعداً خواستی حالت primary سفید داشته باشی */
    @apply bg-white text-black border-white;
    &:hover {
      @apply bg-gray-100 border-gray-100;
    }
  }
}

/* فیلدها و لیبل‌ها */
.tb-field {
  @apply mb-3 relative;
  .input-div {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}
.tb-label {
  @apply block text-sm font-semibold mb-1 text-gray-600;
}
.tb-check {
  @apply flex items-center gap-2 text-sm text-gray-600;
}
.tb-card {
  .input-div {
    gap: 0.15rem !important;
    label {
      font-size: small !important;
      text-align: left !important;
      color: grey !important;
    }
  }
}
/* بخش نمونه‌ها و کد */
.tb-samples {
  @apply mt-3 bg-gray-50 border border-gray-200 text-slate-700 rounded p-3;

  .tb-samples-title {
    @apply font-bold mb-2 uppercase text-xs tracking-wide text-slate-900;
  }
}

.tb-code {
  @apply bg-slate-900 border border-slate-900 text-slate-100 rounded p-3
         font-mono text-sm leading-6 overflow-auto;
}

/* ارورها */
.tb-error {
  @apply text-red-500 text-sm mt-1;
}

/* ادیتور (transform template) */
.tb-editor {
  @apply w-full min-h-[2rem] p-4 bg-slate-950 border border-slate-900 rounded
         text-slate-50 font-mono text-[0.88rem] leading-6 resize-y;
  &:focus {
    @apply outline-none border-slate-800;
  }
}
</style>

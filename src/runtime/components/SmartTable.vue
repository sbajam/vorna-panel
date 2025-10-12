<!-- SmartTable.vue (Nuxt 3 / Vue 3) -->
<script setup>
import { ref } from 'vue';  // برای استفاده از reactive و ref
import { defineProps, defineEmits } from 'vue';  //
import _ from "lodash";
import * as XLSX from "xlsx";

const { $toast } = useNuxtApp();

/* ===================== Props ===================== */
const props = defineProps({
  data: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] }, // [{ key, label, type, map, basePath, options, formatOptions, hidden, safe }]
  actions: { type: Array, default: null },
  delete: { type: String, default: null },
  edit: { type: String, default: null },
  list: { type: String, default: null },
  selected: { type: Boolean, default: null },
  sortable: { type: Boolean, default: true },

  // --- new ---
  multiSort: { type: Boolean, default: false }, // multi-column sorting (Ctrl/Cmd + click)
  loading: { type: Boolean, default: false },
  error: { type: [String, Boolean], default: false },
  emptyText: { type: String, default: "موردی برای نمایش وجود ندارد." },

  // Excel export
  excel: { type: Boolean, default: false },
  excelData: { type: Array, default: () => [] },
  excelOptions: {
    type: Object,
    default: () => ({
      useRawData: false, // if true, export raw rows (from excelData or data)
      columns: null, // e.g. ['id','name','email'] to limit/reorder
      filename: null, // custom filename
    }),
  },

  auth: { type: String, default: null },
  idShow: { type: Boolean, default: false },
  refresh: { type: Boolean, default: true },
  highlightRules: Object,
  rowClickable: Boolean,
  rowClickEmit: String,

  // appearance
  stickyHeader: { type: Boolean, default: true },
  responsive: { type: Boolean, default: true },
});

const emit = defineEmits([
  "select",
  "refresh",
  "action",
  "delete",
  "edit",
  "change",
  "rowClick",
]);

/* ===================== State ===================== */
let data = ref([]);
let dataArray = ref([]);
let all = ref(0);
let size = ref(10);
let now = ref(0);

// sorting
let sortIndex = ref(null);
let sortAsc = ref(true);
let sortState = ref([]); // for multiSort

/* ===================== Watch ===================== */
watch(
  () => props.data,
  () => applySortAndPaginate(),
  { deep: true, immediate: true }
);

/* ===================== Helpers ===================== */
function normalizeForSort(val, type) {
  if (val == null) return { isNull: true, v: null };
  if (type === "number" || type === "currency" || type === "percent")
    return { isNull: false, v: Number(val) };
  if (type === "date" || type === "datetime")
    return { isNull: false, v: new Date(val).getTime() };
  if (type === "badge") return { isNull: false, v: Boolean(val) }; // برای badge از مقدار بولین استفاده می‌کنیم
  return { isNull: false, v: String(val).toLowerCase() }; // text/default
}

function compareBy(a, b, col, dir) {
  const type = col.type || "text";
  const { isNull: na, v: va } = normalizeForSort(_.get(a, col.key), type);
  const { isNull: nb, v: vb } = normalizeForSort(_.get(b, col.key), type);
  if (na && nb) return 0;
  if (na) return 1; // nulls last
  if (nb) return -1;
  if (va === vb) return 0;
  let base;
  if (type === "text") base = va > vb ? 1 : -1;
  else base = va - vb > 0 ? 1 : -1;
  return dir === "asc" ? base : -base;
}

function applySortAndPaginate() {
  let sorted = [...props.data];

  if (props.sortable) {
    if (props.multiSort && sortState.value.length) {
      sorted.sort((a, b) => {
        for (const s of sortState.value) {
          const col = props.columns[s.index];
          const c = compareBy(a, b, col, s.asc ? "asc" : "desc");
          if (c !== 0) return c;
        }
        return 0;
      });
    } else if (sortIndex.value != null) {
      const col = props.columns[sortIndex.value];
      sorted.sort((a, b) =>
        compareBy(a, b, col, sortAsc.value ? "asc" : "desc")
      );
    } else {
      // default: by id desc if present
      sorted.sort((a, b) => (b?.id ?? 0) - (a?.id ?? 0));
    }
  }

  dataArray.value = _.chunk(sorted, size.value);
  now.value = 0;
  data.value = dataArray.value[0] || [];
  all.value = dataArray.value.length;
}

const paging = (prev) => {
  if (prev && now.value > 0) now.value--;
  else if (!prev && now.value < all.value - 1) now.value++;
  data.value = dataArray.value[now.value];
};

const handleClick = (row) => {
  if (props.rowClickable && props.rowClickEmit) emit(props.rowClickEmit, row);
};

// value formatter
const getCellValue = (row, col) => {
  let val = _.get(row, col.key);

  // map display
  if (col.map && val in col.map) val = col.map[val];

  switch (col.type) {
    case "currency":
      return new Intl.NumberFormat("fa-IR", col.formatOptions || {}).format(
        val ?? 0
      );
    case "percent":
      return typeof val === "number" ? `${val}%` : val;
    case "number":
      return new Intl.NumberFormat("fa-IR", col.formatOptions || {}).format(
        val ?? 0
      );
    case "date":
    case "datetime":
      try {
        const d = new Date(val);
        if (isNaN(d)) return val;
        return d.toLocaleString(
          "fa-IR",
          col.type === "date"
            ? { dateStyle: "medium" }
            : { dateStyle: "medium", timeStyle: "short" }
        );
      } catch {
        return val;
      }
    case "badge":
      return val;
    case "link":
      // return text; link itself is rendered in template (safe or raw HTML mode)
      return val;
    default:
      return val;
  }
};

const getBadgeColor = (val) => {
  if (val === true) return "bg-green-800";
  if (val === false) return "bg-rose-800";
  return "bg-gray-500";
};

const computeRowHighlight = (row) => {
  const rules = props.highlightRules || {};
  let classes = "";
  for (const key in rules) {
    const value = _.get(row, key);
    const colorClass = rules[key][value];
    if (colorClass) classes += ` ${colorClass}`;
  }
  return classes.trim();
};

/* ===================== Delete ===================== */
const nuxtApp = useNuxtApp();
const { request } = useApi();

const trash = async (row) => {
  const result = await nuxtApp.$showSwal({
    title: "آیا از حذف این مورد مطمئن هستید؟",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "بله",
    cancelButtonText: "خیر",
  });
  if (!result.isConfirmed) return;
  const res = await request(`/${props.delete}/${row.id}`, {
    method: "delete",
    showError: true,
  });
  if (res.status) {
    nuxtApp.$notifySuccess(res.message);
    emit("refresh");
  } else {
    nuxtApp.$notifyDanger(res.message);
  }
};

/* ===================== Excel ===================== */
function exportToExcel() {
  const baseData = props.excelData.length ? props.excelData : props.data;
  if (!baseData || !baseData.length) {
    $toast.show({
      type: "danger",
      class: "backToast",
      message: "داده‌ای برای خروجی گرفتن نیست.",
    });
    return;
  }

  const opt = props.excelOptions || {};
  const useRaw = !!opt.useRawData;
  const pickCols =
    Array.isArray(opt.columns) && opt.columns.length ? opt.columns : null;

  const worksheetData = baseData.map((row) => {
    if (useRaw) {
      if (!pickCols) return { ...row };
      const o = {};
      pickCols.forEach((k) => {
        o[k] = _.get(row, k);
      });
      return o;
    }
    const formattedRow = {};
    (props.columns || []).forEach((col) => {
      if (col.key === "index") return;
      if (col.hidden) return;
      if (pickCols && !pickCols.includes(col.key)) return;
      formattedRow[col.label] = getCellValue(row, col);
    });
    return formattedRow;
  });

  const ws = XLSX.utils.json_to_sheet(worksheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Table Data");

  const name =
    opt.filename ||
    `${useRoute().path.replace(/\//g, "-")}-${new Date()
      .toISOString()
      .replace(/[:]/g, "-")}.xlsx`;
  XLSX.writeFile(wb, name);
}

/* ===================== Header Sort Click ===================== */
function onHeaderClick(index, evt) {
  if (!props.sortable && props.columns[index].sortable) return;

  const isMultiKey = evt && (evt.ctrlKey || evt.metaKey);
  if (props.multiSort && isMultiKey) {
    const found = sortState.value.find((s) => s.index === index);
    if (found) {
      found.asc = !found.asc;
    } else {
      sortState.value.push({ index, asc: true });
    }
  } else {
    if (sortIndex.value === index) {
      sortAsc.value = !sortAsc.value;
    } else {
      sortIndex.value = index;
      sortAsc.value = true;
    }
    sortState.value = [];
  }
  applySortAndPaginate();
}
</script>

<template>
  <div class="w-full overflow-x-auto smart-table has-sticky is-responsive">
    <!-- Toolbar (Refresh + Excel) -->
    <div class="flex items-center gap-4">
      <div
        v-if="props.refresh"
        @click="emit('refresh')"
        class="flex items-center gap-2 mr-4 mt-4 my-4 cursor-pointer rounded-xl text-primary-100 text-2xl font-bold hover:animate-spin"
        title="به‌روزرسانی"
        aria-label="به‌روزرسانی"
      >
        <Icon
          name="fa6-solid:arrow-rotate-left"
          class="text-primary-100 text-2xl font-bold"
        />
      </div>
      <div v-if="props.excel" class="flex items-center justify-end">
        <button
          @click="exportToExcel()"
          :class="{
            'cursor-not-allowed opacity-20':
              !props.data.length && !props.excelData.length,
          }"
          class="flex items-center gap-2 border-2 bg-primary-100 my-4 py-2 px-6 rounded-xl border-primary-100 text-white text-sm lg:text-base font-bold"
          title="خروجی Excel"
          aria-label="خروجی Excel"
        >
          <Icon name="fa6-solid:file-excel" />خروجی Excel
        </button>
      </div>
    </div>

    <!-- States -->
    <Spinner v-if="loading" class="p-6 text-center text-primary-100/80"
      >در حال بارگیری...</Spinner
    >
    <div v-else-if="error" class="p-6 text-center text-rose-700">
      {{ error }}
    </div>

    <table
      v-else
      :class="[
        { 'smart-responsive': responsive, 'sticky-header': stickyHeader },
      ]"
      class="table w-full overflow-auto"
    >
      <thead>
        <tr>
          <th v-if="props.selected != null">
            <div
              @click="emit('select', -1)"
              class="w-5 aspect-square border overflow-hidden flex justify-center items-center border-primary-100 border-solid text-center mx-auto cursor-pointer rounded-lg"
              title="انتخاب همه"
              aria-label="انتخاب همه"
            >
              <Icon
                name="fa6-solid:square-check"
                class="block text-primary-100 text-2xl"
                v-if="props.selected"
              />
            </div>
          </th>
          <th
            v-for="(col, index) in props.columns"
            :key="index"
            v-show="!(col.key === 'id'  && !props.idShow) && col.type!='checkbox'"
            @click="onHeaderClick(index, $event)"
            :aria-sort="
              sortIndex === index
                ? sortAsc
                  ? 'ascending'
                  : 'descending'
                : 'none'
            "
          >
            <p
              class="cursor-pointer flex items-center justify-center gap-1 select-none"
            >
              {{ col.label }}
              <Icon
                v-if="
                  props.sortable && col.sortable &&
                  (sortIndex === index ||
                    sortState.some((s) => s.index === index))
                "
                :name="`fa6-solid:${
                  sortState.find((s) => s.index === index)?.asc ?? sortAsc
                    ? 'sort-up'
                    : 'sort-down'
                }`"
                class="text-sm"
              />
            </p>
          </th>

          <th v-if="props.edit"></th>
          <th v-for="i in props.actions" :key="i.icon"></th>
          <th v-if="props.delete"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-if="data.length === 0">
          <td
            :colspan="
              props.columns.filter(
                (c) => c.key !== 'index' && (props.idShow || c.key !== 'id')
              ).length + 1
            "
            class="text-lg text-primary-100 font-semibold p-4"
          >
            {{ emptyText }}
          </td>
        </tr>

        <tr
          v-for="(row, rIndex) in data"
          :key="row.id ?? rIndex"
          :class="computeRowHighlight(row)"
          @click="handleClick(row)"
        >
          <div
            class="flex text-lg lg:hidden items-center gap-2 !justify-between"
          >
            <div class="text-lg font-bold text-primary-100">
              {{ now * size + rIndex + 1 }}#
            </div>
            <div
              class=""
              v-if="props.edit"
              @click.stop="$router.push(`${props.edit}/${row.id}`)"
            >
              <Icon
                name="fa6-solid:pen"
                class="text-secondary-100"
                title="ویرایش"
              />
            </div>

            <div
              class=""
              v-for="act in props.actions"
              :key="act.icon"
              @click.stop="emit(act.emit, row)"
            >
              <Icon
                :name="`${act.icon}`"
                class="text-primary-100"
                :title="act.tooltip"
              />
            </div>

            <div class="" v-if="props.delete" @click.stop="trash(row)">
              <Icon
                name="fa6-solid:trash-can"
                class="text-rose-900"
                title="حذف"
              />
            </div>
          </div>

          <!-- data cells -->
          <template v-for="(col, cIndex) in props.columns" :key="col.key">
            <!-- row index (hidden on small screens) -->
            <td
              v-if="col.key.includes('index')"
              class="!hidden lg:!flex md:table-cell"
            >
              <p>{{ now * size + rIndex + 1 }}</p>
            </td>
            <td
              v-else
              :class="{ 'td--auto-shrink': col.shrink }"
              v-if="
                !(col.key === 'id' && !props.idShow) &&
                col.key != 'index' &&
                !col.hidden
              "
              :data-th="col.label"
            >
              <!-- Custom column slot (named slot = column.key) -->
              <template v-if="$slots && $slots[col.key]">
                <slot :name="col.key" :item="row"></slot>
              </template>
              <!-- Badge -->
              <template v-else-if="col.type === 'badge'">
                <span
                  class="px-3 py-1 text-base rounded-full text-white"
                  :class="getBadgeColor(_.get(row, col.key))"
                >
                  {{ getCellValue(row, col) }}
                </span>
              </template>

              <!-- Inline Dropdown -->
              <template v-else-if="col.type === 'dropdown'">
                <DropDown
                  :items="col.options"
                  @send-Option="(e) => emit('change', col.key, e, row)"
                >
                  <template #show> {{ getCellValue(row, col) }} </template>
                </DropDown>
              </template>

              <!-- Link (safe or raw HTML) -->
              <template v-else-if="col.type === 'link'">
                <!-- RAW HTML mode: set col.safe === false to enable v-html -->
                <span
                  class="text-primary-100 underline"
                  v-if="col.safe === false"
                  v-html="
                    `<a href='${col.basePath || ''}${_.get(row, col.key)}'>${
                      getCellValue(row, col) ?? ''
                    }</a>`
                  "
                />
                <!-- Safe anchor by default -->
                <a
                  v-else
                  :href="`${col.basePath || ''}${_.get(row, col.key)}`"
                  class="text-secondary-100 border-b border-secondary-100"
                  rel="noopener noreferrer"
                  target="_blank"
                  :title="_.get(row, col.key)"
                >
                  {{ getCellValue(row, col) }}
                </a>
              </template>

              <!-- Others -->
              <template v-else>
                <p :title="_.get(row, col.key)">{{ getCellValue(row, col) }}</p>
              </template>
            </td>
          </template>
          <!-- Actions -->
          <td
            class="actions"
            v-if="props.edit"
            @click.stop="$router.push(`${props.edit}/${row.id}`)"
          >
            <Icon
              name="fa6-solid:pen"
              class="text-secondary-100"
              title="ویرایش"
            />
          </td>

          <td
            class="actions"
            v-for="act in props.actions"
            :key="act.icon"
            @click.stop="emit(act.emit, row)"
          >
            <Icon
              :name="`${act.icon}`"
              class="text-primary-100"
              :title="act.tooltip"
            />
          </td>

          <td class="actions" v-if="props.delete" @click.stop="trash(row)">
            <Icon
              name="fa6-solid:trash-can"
              class="text-rose-900"
              title="حذف"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination (unchanged visual; page state is internal via chunking) -->
    <div v-if="all" class="w-11/12 mx-auto mt-10 text-xl mb-4">
      <div
        style="box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.05)"
        class="bg-white flex w-[fit-content] gap-2 px-4 py-2 items-center rounded-lg"
      >
        <Icon
          name="fa6-solid:caret-right"
          class="cursor-pointer"
          @click="paging(true)"
        />
        <span
          style="box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.1)"
          class="cursor-pointer bg-[#F3F7F8] px-1 rounded-md"
          >{{ now + 1 }}</span
        >
        <span class="cursor-pointer"> از </span>
        <span class="cursor-pointer">{{ all }}</span>
        <Icon
          name="fa6-solid:caret-left"
          class="cursor-pointer"
          @click="paging(false)"
        />
      </div>
    </div>
  </div>
</template>
<style lang="scss">
/*
  SmartTable – Tailwind + SCSS nested rewrite
  -------------------------------------------------
  Attach classes on the scroll container that wraps the <table> (e.g., the SmartTable root div):
  class="smart-table smart-scroll"

  - Thin, pretty horizontal scrollbar (grey)
  - Sticky header (opt-in with .has-sticky)
  - Responsive card layout on <768px (opt-in with .is-responsive)
  - Auto-shrink option for long cells via .td--auto-shrink (see below)
*/

.smart-table {
  /* base layout */
  @apply w-full overflow-x-auto overflow-y-hidden relative;
  @apply bg-white; /* feel free to remove if you handle bg outside */

  /* --- Pretty horizontal scrollbar --- */
  overscroll-behavior-x: contain;
  scrollbar-gutter: stable both-edges;

  /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: theme("colors.slate.300") transparent;

  /* WebKit */
  &::-webkit-scrollbar {
    @apply h-1.5;
  }
  &::-webkit-scrollbar-track {
    @apply bg-transparent;
  }
  &::-webkit-scrollbar-thumb {
    @apply bg-slate-300 rounded-full transition-colors duration-200;
  }
  &:hover::-webkit-scrollbar-thumb {
    @apply bg-slate-400;
  }

  /* ensure wide content actually scrolls */
  table {
    @apply min-w-full;
  }
}

/* Sticky header: add .has-sticky on the same container */
.smart-table.has-sticky {
  thead th {
    @apply sticky top-0 bg-white z-10;
  }
}

/* Core table styling */
.smart-table table {
  @apply w-full table-auto border-collapse;

  thead {
    tr {
      th {
        @apply px-2 py-3 text-center font-semibold text-primary-100 border-b border-primary-100 select-none;
      }
    }
  }

  tbody {
    tr {
      @apply hover:bg-gray-50;

      td {
        @apply px-2 py-2 text-lg text-center whitespace-nowrap align-middle;

        /* inner text block */
        p,
        span,
        a {
          // keep single-line with ellipsis by default
          @apply mx-auto text-center overflow-hidden whitespace-nowrap text-ellipsis block;
          max-width: 28ch; // default text width cap
        }

        /* actions cell */
        &.actions {
          @apply p-2 text-2xl text-secondary-100 cursor-pointer;
        }

        /* optional: shrink font-size for long values */
        &.td--auto-shrink {
          p,
          span,
          a {
            max-width: 22ch;
          }
          /* base shrink */
          @apply text-base; // drop a step from text-lg

          /* further shrink on narrower screens */
          @media (max-width: 1024px) {
            @apply text-sm;
          }
          @media (max-width: 640px) {
            @apply text-xs;
          }
        }
      }
    }
  }
}

/* Responsive card layout: add .is-responsive on container */
@media (max-width: 768px) {
  .smart-table.is-responsive {
    table {
      @apply w-full;
    }
    thead {
      @apply hidden;
    }
    tbody {
      tr {
        @apply block mb-3 border border-slate-200 rounded-lg p-2;
      }
      td {
        @apply flex items-baseline gap-2 text-right py-1 px-0 whitespace-normal;
        // grid-template-columns: 42% 58%;
        &::before {
          content: attr(data-th);
          @apply font-semibold text-teal-700 text-right text-sm whitespace-nowrap;
        }
        &.actions {
          @apply hidden;
        }
        /* in card layout, allow text to wrap and cap lines */
        p,
        span,
        a {
          @apply whitespace-normal text-base mx-0 text-right;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-width: 100%;
        }
        span {
          @apply text-xs;
        }
      }
    }
  }
}

/* Utility: super-thin variant if you need it */
.smart-table.scrollbar-thinner {
  &::-webkit-scrollbar {
    height: 4px;
  }
  scrollbar-width: thin; /* already thin; no extra step in FF */
}
</style>

<!-- How to use in your page/component:
<SmartTable
  class="smart-table smart-scroll has-sticky is-responsive"
  :data="dt"
  :columns="columns"
  ...
/>

For columns that often have long text (e.g., url, email), add a conditional class on <td>.
If you own SmartTable template, you can do:
<td :class="{ 'td--auto-shrink': ['url','email'].includes(col.key) }" ...>
  ...
</td>

If you don't want to modify template logic, set a flag in your column config and bind it when looping:
// column config
{ key: 'url', label: 'url', type: 'link', basePath: 'http://vendow.ir/', safe: false, shrink: true }

// in template v-for of <td> add :class="{ 'td--auto-shrink': col.shrink }"
-->

<!-- =========================================================
=                SmartTable – Usage Documentation           =
========================================================= -->
<!-- 
# SmartTable – Vue 3 / Nuxt 3

A presentational data table component. **Fetching, searching, and filtering happen outside** (in your page/container). This component focuses on rendering, client-side sorting and paging, row actions, highlighting, Excel export, and responsive layout.

## Installation
Place `SmartTable.vue` in your components directory (or module runtime). Ensure Tailwind and your `Icon` / `DropDown` components are available.

## Props
- `data: any[]` – Array of rows to render.
- `columns: Column[]` – Column definitions. See **Column** type below.
- `actions?: Action[]` – Row-level action icons (emits on click).
- `delete?: string` – Base endpoint for delete ("/api/items" → DELETE "/api/items/:id").
- `edit?: string` – Base route for edit (navigates to `${edit}/${row.id}`).
- `list?: string` – (reserved; unchanged from original).
- `selected?: boolean|null` – If not null, shows a header checkbox cell and emits `select` with `-1` when toggled.
- `sortable?: boolean` – Enable header sorting (default `true`).
- `multiSort?: boolean` – Enable **multi-column** sorting with Ctrl/Cmd+Click on headers.
- `loading?: boolean` – Show loading state.
- `error?: string|boolean` – Show error message.
- `emptyText?: string` – Message when there’s no data.
- `excel?: boolean` – Show Excel button.
- `excelData?: any[]` – Optional raw dataset for Excel export.
- `excelOptions?: { useRawData?: boolean; columns?: string[]; filename?: string }`
- `auth?: string|null` – (reserved; unchanged from original).
- `idShow?: boolean` – Show `id` column when a column key is `id`.
- `refresh?: boolean` – Show refresh icon and emit `refresh` on click.
- `highlightRules?: Record<string, Record<string,string>>` – Row highlight by value (e.g. `{ status: { paid: 'bg-green-50', due: 'bg-rose-50' } }`).
- `rowClickable?: boolean` + `rowClickEmit?: string` – Emit custom event with row data on row click.
- `stickyHeader?: boolean` – Keep header stuck to top.
- `responsive?: boolean` – Mobile-friendly card layout.

## Column Type
```ts
// minimal shape
export type Column = {
  key: string;         // path in row (lodash.get)
  label: string;       // header title
  type?: 'text'|'number'|'currency'|'percent'|'date'|'datetime'|'badge'|'link'|'dropdown';
  map?: Record<string, string>;          // display mapping
  basePath?: string;                      // for 'link' (href = basePath + value)
  options?: Array<{ label: string; value: any }>; // for 'dropdown' cells
  formatOptions?: Record<string, any>;    // Intl options
  hidden?: boolean;                       // hide column
  safe?: boolean;                         // ONLY for type='link': if false → use v-html raw mode
};
```

### Link Rendering (safe/raw)
- **Safe** (default): Renders `<a>` with `href=basePath + value`, `target="_blank"`, `rel="noopener"`.
- **Raw HTML**: Set `safe: false` to enable `v-html` (use with caution):
```js
{ key: 'url', label: 'URL', type: 'link', basePath: 'https://example.com/', safe: false }
```
This will render raw HTML: `<a href="...">{getCellValue}</a>`. You can include HTML/icons in your `getCellValue` if you provide it in data or mapping.

## Events
- `refresh` – User clicked the refresh icon.
- `action` – `(emitName: string, row: any)` when a custom action icon is clicked.
- `change` – `(key: string, value: any, row: any)` for inline `dropdown` columns.
- `rowClick` – emits `rowClickEmit` with `row` if `rowClickable` is true.
- `select` – with payload `-1` when header select cell is clicked (you can implement your own selection outside).

## Excel Export
Provide `excel` to show the button. Configure with `excelOptions`:
```vue
<SmartTable
  :data="rows"
  :columns="columns"
  excel
  :excelOptions="{ useRawData: false, columns: ['id','name','email'], filename: 'users.xlsx' }"
/>
```
- `useRawData: true` → export from `excelData` (if non-empty) else from `data` rows directly (raw keys).
- Default export maps **visible** columns to labels via the built-in formatter.

## Sorting
- Click header to sort ascending/descending by that column.
- If `multiSort` is `true`, you can Ctrl/Cmd+Click multiple headers to build a priority list.
- Null/undefined values always go to the end.
- Numbers, dates, and text are handled appropriately.

## Responsive Behavior
On screens ≤ 768px, headers are hidden and each row appears as a card; each cell shows `data-th` (column label) before the value.

## Example
```vue
<template>
  <SmartTable
    :data="data"
    :columns="[
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Store Name', type: 'text' },
      { key: 'work_subject', label: 'Profession', type: 'text' },
      { key: 'url', label: 'URL', type: 'link', basePath: 'https://vendow.ir/', safe: false },
      { key: 'verified', label: 'KYC', type: 'badge', map: { true: 'Verified', false: 'Unverified' } },
      { key: 'active', label: 'Status', type: 'badge', map: { true: 'Active', false: 'Suspended' } },
    ]"
    :actions="[
      { icon: 'info', tooltip: 'Inspect', emit: 'check' },
      { icon: 'ban', tooltip: 'Suspend/Activate', emit: 'suspend' },
    ]"
    :loading="isLoading"
    :error="loadError"
    :sortable="true"
    :multiSort="true"
    :excel="true"
    :excelOptions="{ filename: 'stores.xlsx' }"
    :rowClickable="true"
    rowClickEmit="rowClick"
    @refresh="fetch()"
    @suspend="onSuspend"
    @check="(row)=>navigateTo(`/stores/${row.id}-check`)"
  />
</template>
```

## Notes
- Keep API calls, searching, and filtering in your page/container. Pass the resulting `data` into `SmartTable`.
- For heavy datasets, consider adding virtualization in a future iteration.
- If you rely on `v-html` (raw link mode), sanitize your inputs server-side to avoid XSS. -->

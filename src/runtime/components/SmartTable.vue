<script setup>
import _ from "lodash";
import axios from "axios";
import * as XLSX from "xlsx"; // اضافه کردن کتابخانه xlsx

const { $toast } = useNuxtApp();

const props = defineProps({
  data: Array,
  columns: Array, // [{ key, label, type, map, highlight, basePath, options }]
  actions: { type: Array, default: null },
  delete: { type: String, default: null },
  edit: { type: String, default: null },
  list: { type: String, default: null },
  selected: { type: Boolean, default: null },
  sortable: { type: Boolean, default: true },
  auth: { type: String, default: null },
  idShow: { type: Boolean, default: false },
  refresh: { type: Boolean, default: true },
  excel: { type: Boolean, default: false },
  excelData: { type: Array, default: [] },
  highlightRules: Object,
  rowClickable: Boolean,
  rowClickEmit: String,
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

let data = ref([]);
let dataArray = ref([]);
let all = ref(0);
let size = ref(10);
let now = ref(0);

let sortIndex = ref(null);
let sortAsc = ref(true);

watch(
  () => props.data,
  () => applySortAndPaginate(),
  { deep: true, immediate: true }
);

function applySortAndPaginate() {
  let sorted = [...props.data];
  if (props.sortable && sortIndex.value != null) {
    const key = props.columns[sortIndex.value].key;
    sorted.sort((a, b) => {
      const aVal = _.get(a, key);
      const bVal = _.get(b, key);
      return sortAsc.value ? (aVal > bVal ? 1 : -1) : bVal > aVal ? 1 : -1;
    });
  } else {
    sorted.sort((a, b) => b.id - a.id);
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

const getCellValue = (row, col) => {
  const val = _.get(row, col.key);
  if (col.map) return col.map[val] || val;
  if (col.type === "currency")
    return new Intl.NumberFormat("fa-IR").format(val);
  if (col.type === "badge") return val;
  if (col.type === "link") return `<a href="${col.basePath}${val}">${val}</a>`;
  return val;
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
function exportToEcxel() {
  const dataToExport = props.excelData.length ? props.excelData : props.data;

  if (!dataToExport.length) {
    $toast.show({
      type: "danger",
      class: "backToast",
      message: "داده‌ای برای خروجی گرفتن نیست.",
    });
    return;
  }

  const worksheetData = dataToExport.map((row) => {
    const formattedRow = {};

    // اگر excelData داده شده باشد، کلیدها را مستقیماً استفاده کن
    if (props.excelData.length) {
      Object.keys(row).forEach((key) => {
        formattedRow[key] = row[key];
      });
    } else {
      props.columns.forEach((col) => {
        if (col.key !== "index") {
          formattedRow[col.label] = getCellValue(row, col);
        }
      });
    }

    return formattedRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

  const filename = `${useRoute().path.replace(
    /\//g,
    "-"
  )}-${new Date().toISOString()}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <div class="flex items-center gap-4">
      <div
        v-if="props.refresh"
        @click="emit('refresh')"
        class="flex items-center gap-2 mr-4 mt-4 my-4 cursor-pointer rounded-xl text-primary-100 text-2xl font-bold hover:animate-spin"
      >
        <Icon
          name="fa6-solid:arrow-rotate-left"
          class="text-primary-100 text-2xl font-bold"
        />
      </div>
      <div v-if="props.excel" class="flex items-center justify-end">
        <button
          @click="exportToEcxel()"
          :class="{
            'cursor-not-allowed opacity-20':
              !props.data.length && !props.excelData.length,
          }"
          class="flex items-center gap-2 border-2 bg-primary-100 my-4 py-2 px-6 rounded-xl border-primary-100 text-white text-base font-bold"
        >
          <Icon name="fa6-solid:file-excel" />خروجی به عنوان Excel
        </button>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th v-if="props.selected != null">
            <div
              @click="emit('select', -1)"
              class="w-5 aspect-square border overflow-hidden flex justify-center items-center border-primary-100 border-solid text-center mx-auto cursor-pointer rounded-lg"
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
            @click="
              props.sortable &&
                ((sortIndex = index),
                (sortAsc = !sortAsc),
                applySortAndPaginate())
            "
          >
            <p class="cursor-pointer flex items-center justify-center gap-1">
              {{ col.label }}
              <!-- آیکون مرتب‌سازی -->
              <Icon
                :name="`fa6-solid:${sortAsc ? 'sort-up' : 'sort-down'}`"
                v-if="props.sortable && sortIndex === index"
                class="text-sm"
              />
            </p>
          </th>

          <th v-if="props.edit"></th>
          <th v-for="i in props.actions"></th>
          <th v-if="props.delete"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0">
          <td
            :colspan="props.columns.length + 1"
            class="text-lg text-primary-100 font-semibold p-4"
          >
            موردی برای نمایش وجود ندارد.
          </td>
        </tr>
        <tr
          v-for="(row, index) in data"
          :key="row.id"
          :class="computeRowHighlight(row)"
        >
          <td>
            <p>{{ now * size + index + 1 }}</p>
          </td>
          <template v-for="(col, index) in props.columns" :key="col.key">
            <!-- اگر ستون ID است و idShow false باشد، نمایش ندهیم -->
            <td
              v-if="!(col.key === 'id' && !props.idShow) && col.key != 'index'"
            >
              <template v-if="col.type === 'badge'">
                <span
                  class="px-3 py-1 text-base rounded-full text-white"
                  :class="getBadgeColor(_.get(row, col.key))"
                >
                  {{ getCellValue(row, col) }}
                </span>
              </template>
              <template v-else-if="col.type === 'dropdown'">
                <DropDown
                  :items="col.options"
                  @send-Option="(e) => emit('change', col.key, e, row)"
                >
                  <template #show> {{ getCellValue(row, col) }} </template>
                </DropDown>
              </template>

              <template v-else>
                <p
                  v-html="getCellValue(row, col)"
                  :title="_.get(row, col.key)"
                ></p>
              </template>
            </td>
          </template>
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

<style>
table {
  @apply w-full overflow-auto table;

  tr {
    @apply hover:bg-gray-50;

    th {
      @apply px-2 text-center text-primary-100 font-semibold py-3 mb-6 border-0 border-solid border-primary-100 border-b;
    }

    td {
      @apply text-center text-lg py-2 px-2 whitespace-nowrap;

      p {
        max-width: 25ch;
        text-align: center;
        margin: 0 auto;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        a {
          @apply text-secondary-100 border-b border-secondary-100;
        }
      }
      &.actions {
        @apply text-2xl p-2 text-secondary-100 cursor-pointer;
      }
    }
  }
}
</style>

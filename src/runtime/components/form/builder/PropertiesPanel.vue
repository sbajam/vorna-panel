<template>
  <div class="p-4 bg-white border rounded-lg shadow-md w-full space-y-4">
    <!-- ============================
         بخش اول: ویرایش کلید و برچسب
         ============================ -->
    <div class="space-y-2">
      <!-- تغییر کلید یکتا (Key) -->
      <label class="block text-sm font-medium text-gray-700">
        Field Key
      </label>
      <div class="flex flex-col space-y-1">
        <div class="flex items-center space-x-2">
          <input
            v-model="localKey"
            @blur="onKeyBlur"
            type="text"
            class="flex-1 px-2 py-1 border rounded"
            placeholder="Unique field key"
          />
          <p v-if="keyError" class="text-xs text-red-600">
            {{ keyError }}
          </p>
        </div>
        <p class="text-xs text-gray-500">
          کلید یکتا برای ارجاع به این فیلد. فقط حروف، اعداد و "_" مجاز است.
        </p>
      </div>

      <!-- ویرایش برچسب (Label) -->
      <label class="block text-sm font-medium text-gray-700 mt-4">
        Label (Displayed to User)
      </label>
      <input
        v-model="localLabel"
        @input="emitUpdate('label', localLabel)"
        type="text"
        class="w-full px-2 py-1 border rounded"
        placeholder="Field label"
      />
    </div>

    <hr class="border-gray-200" />

    <!-- ============================
         بخش دوم: پراپ‌های مشترک در همهٔ فیلدها
         ============================ -->
    <div class="grid grid-cols-1 gap-4">
      <!-- Placeholder -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Placeholder
        </label>
        <input
          v-model="localPlaceholder"
          @input="emitUpdate('placeholder', localPlaceholder)"
          type="text"
          class="w-full px-2 py-1 border rounded"
          placeholder="Placeholder text"
        />
      </div>

      <!-- Tooltip -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Tooltip Text
        </label>
        <input
          v-model="localTooltip"
          @input="emitUpdate('tooltip', localTooltip)"
          type="text"
          class="w-full px-2 py-1 border rounded"
          placeholder="Tooltip (shown on hover)"
        />
      </div>

      <!-- Icon -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          Icon (optional)
        </label>
        <input
          v-model="localIcon"
          @input="emitUpdate('icon', localIcon)"
          type="text"
          class="w-full px-2 py-1 border rounded"
          placeholder="Icon name (e.g. fa6-solid:user)"
        />
      </div>

      <!-- Required & Disabled -->
      <div class="flex items-center space-x-4">
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="localRequired"
            @change="emitUpdate('required', localRequired)"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="ml-2 text-sm">Required</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="localDisabled"
            @change="emitUpdate('disabled', localDisabled)"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="ml-2 text-sm">Disabled</span>
        </label>
      </div>

      <!-- Layout: Responsive colSpan برای base, sm, md, lg, xl -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Layout: Column Span (responsive)
        </label>
        <div class="grid grid-cols-5 gap-2">
          <div v-for="br in breakpoints" :key="br" class="flex flex-col">
            <label class="block text-xs text-gray-600">{{ br }}</label>
            <input
              type="number"
              min="1"
              v-model.number="localColSpan[br]"
              @input="emitLayout"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="col"
            />
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          برای هر نقطهٔ شکست (breakpoint) مشخص کنید که این فیلد چه تعداد ستون اشغال کند.
        </p>
      </div>

      <!-- Label Position: Responsive برای base, sm, md, lg, xl -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Label Position (responsive)
        </label>
        <div class="grid grid-cols-5 gap-2">
          <div v-for="br in breakpoints" :key="br" class="flex flex-col">
            <label class="block text-xs text-gray-600">{{ br }}</label>
            <select
              v-model="localLabelPosition[br]"
              @change="emitLabelPosition"
              class="w-full px-2 py-1 border rounded text-sm"
            >
              <option value="">—</option>
              <option value="top">top</option>
              <option value="right">right</option>
            </select>
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          تعیین کنید در هر breakpoint موقعیت برچسب (label) چگونه باشد.
        </p>
      </div>

      <!-- Conditional Display (showIf) ساده و پیشرفته -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Conditional Display (showIf)
        </label>
        <!-- انتخاب فیلدی که این فیلد بر اساس مقدار آن نمایش/مخفی شود -->
        <select
          v-model="localShowIfKey"
          @change="onShowIfFieldChange"
          class="w-full px-2 py-1 border rounded"
        >
          <option value="">— None —</option>
          <option v-for="f in otherFields" :key="f.key" :value="f.key">
            {{ f.key }}
          </option>
        </select>

        <!-- اگر فیلدی انتخاب شد، مقدار موردنظر برای شرط نمایش -->
        <div v-if="localShowIfKey" class="mt-2">
          <label class="block text-xs text-gray-600">
            Show when {{ localShowIfKey }} equals:
          </label>
          <input
            v-model="localShowIfValue"
            @input="onShowIfValueChange"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="Value (string/number)"
          />
        </div>

        <!-- حالت پیشرفته: تابع JS دلخواه -->
        <div class="mt-2">
          <label class="inline-flex items-center text-xs">
            <input
              type="checkbox"
              v-model="advancedShowIf"
              class="form-checkbox h-4 w-4 text-blue-600"
            />
            <span class="ml-2">Advanced JS Function</span>
          </label>
        </div>
        <div v-if="advancedShowIf" class="mt-2">
          <textarea
            v-model="localShowIfFunction"
            @blur="onShowIfFunctionBlur"
            rows="3"
            class="w-full px-2 py-1 border rounded text-sm font-mono"
            placeholder="(values) => values['otherKey'] === 'someValue'"
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            از جاوااسکریپت استفاده کنید. مثال:
            <code>(values) => values['fieldKey'] === 'abc'</code>
          </p>
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- ============================
         بخش سوم: Type-Specific Logic
         ============================ -->
    <div class="space-y-6">
      <!-- ==== ۱. Text-like Inputs (text, email, number, password, textarea) ==== -->
      <template
        v-if="[
          'text',
          'email',
          'number',
          'password',
          'textarea',
        ].includes(fieldType)"
      >
        <h3 class="text-sm font-semibold text-gray-700">Text Settings</h3>

        <!-- Mask: نمایش predefinedMasks و گزینهٔ Custom -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Mask</label>
          <select
            v-model="localMaskType"
            @change="onMaskTypeChange"
            class="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="">— None —</option>
            <option v-for="(cfg, key) in predefinedMasks" :key="key" :value="key">
              {{ key }}
            </option>
            <option value="__custom">Custom JSON</option>
          </select>
          <div v-if="localMaskType === '__custom'" class="mt-2">
            <textarea
              v-model="localMaskJson"
              @blur="onMaskBlur"
              rows="2"
              class="w-full px-2 py-1 border rounded text-sm font-mono"
              placeholder='{ "mask": Number, "thousandsSeparator": "," }'
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              JSON ماسک خود را اینجا وارد کنید.
            </p>
          </div>
        </div>

        <!-- Prefix -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Prefix</label>
          <input
            v-model="localPrefix"
            @input="emitUpdate('prefix', localPrefix)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g. $"
          />
        </div>

        <!-- Suffix -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Suffix</label>
          <input
            v-model="localSuffix"
            @input="emitUpdate('suffix', localSuffix)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g. kg"
          />
        </div>

        <!-- Password Options (فقط در صورتی که type === 'password') -->
        <div v-if="fieldType === 'password'" class="flex items-center space-x-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localPasswordOptions"
              @change="emitUpdate('passwordOptions', localPasswordOptions)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Enable Password Strength Meter</span>
          </label>
        </div>
      </template>

      <!-- ==== ۲. Date-like Inputs (date, time, datetime) ==== -->
      <template
        v-else-if="['date', 'time', 'datetime'].includes(fieldType)"
      >
        <h3 class="text-sm font-semibold text-gray-700">Date/Time Settings</h3>
        <!-- inputFormat -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Input Format</label>
          <input
            v-model="localInputFormat"
            @input="emitUpdate('inputFormat', localInputFormat)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g. YYYY-MM-DD"
          />
        </div>
        <!-- displayFormat -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Display Format</label>
          <input
            v-model="localDisplayFormat"
            @input="emitUpdate('displayFormat', localDisplayFormat)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g. DD/MM/YYYY"
          />
        </div>
        <!-- clearable -->
        <div class="mb-3">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localClearable"
              @change="emitUpdate('clearable', localClearable)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Clearable (allow empty)</span>
          </label>
        </div>
        <!-- single (فقط برای date و datetime) -->
        <div v-if="fieldType === 'date' || fieldType === 'datetime'" class="mb-3">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localSingle"
              @change="emitUpdate('single', localSingle)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Single Date Selection</span>
          </label>
        </div>
        <!-- calendarType -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Calendar Type</label>
          <select
            v-model="localCalendarType"
            @change="emitUpdate('calendarType', localCalendarType)"
            class="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="persian">Persian</option>
            <option value="gregorian">Gregorian</option>
          </select>
        </div>
      </template>

      <!-- ==== ۳. Select ==== -->
      <template v-else-if="fieldType === 'select'">
        <h3 class="text-sm font-semibold text-gray-700">Select Settings</h3>
        <!-- Options (items array) -->
        <div class="mb-3 space-y-2">
          <label class="block text-xs text-gray-600">Options (Label & Value)</label>
          <div v-for="(item, idx) in localItems" :key="idx" class="flex space-x-2">
            <input
              v-model="item.label"
              @input="onItemsChange"
              type="text"
              class="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Label"
            />
            <input
              v-model="item.value"
              @input="onItemsChange"
              type="text"
              class="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Value"
            />
            <button
              @click="removeItem(idx)"
              type="button"
              class="px-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
          <button
            @click="addItem"
            type="button"
            class="mt-1 px-3 py-1 text-xs text-green-700 border border-green-700 rounded hover:bg-green-50"
          >
            + Add Option
          </button>
        </div>

        <!-- multiple, searchable, clearableSelect -->
        <div class="flex space-x-4 mb-3">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localMultiple"
              @change="emitUpdate('multiple', localMultiple)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Multiple</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localSearchable"
              @change="emitUpdate('searchable', localSearchable)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Searchable</span>
          </label>
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localClearableSelect"
              @change="emitUpdate('clearableSelect', localClearableSelect)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Clearable</span>
          </label>
        </div>

        <!-- labelField, valueField, displayField -->
        <div class="grid grid-cols-1 gap-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">labelField</label>
            <input
              v-model="localLabelField"
              @input="emitUpdate('labelField', localLabelField)"
              type="text"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Field name for label"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">valueField</label>
            <input
              v-model="localValueField"
              @input="emitUpdate('valueField', localValueField)"
              type="text"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Field name for value"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">displayField (optional)</label>
            <input
              v-model="localDisplayField"
              @input="emitUpdate('displayField', localDisplayField)"
              type="text"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Field name for display"
            />
          </div>
        </div>
      </template>

      <!-- ==== ۴. CheckboxGroup / RadioGroup ==== -->
      <template v-else-if="['checkboxGroup', 'radioGroup'].includes(fieldType)">
        <h3 class="text-sm font-semibold text-gray-700">
          {{ fieldType === 'checkboxGroup' ? 'Checkbox Group' : 'Radio Group' }} Settings
        </h3>

        <!-- Options -->
        <div class="mb-3 space-y-2">
          <label class="block text-xs text-gray-600">Options (Label & Value)</label>
          <div v-for="(opt, idx) in localOptions" :key="idx" class="flex space-x-2">
            <input
              v-model="opt.label"
              @input="onOptionsChange"
              type="text"
              class="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Label"
            />
            <input
              v-model="opt.value"
              @input="onOptionsChange"
              type="text"
              class="flex-1 px-2 py-1 border rounded text-sm"
              placeholder="Value"
            />
            <button
              @click="removeOption(idx)"
              type="button"
              class="px-2 text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
          <button
            @click="addOption"
            type="button"
            class="mt-1 px-3 py-1 text-xs text-green-700 border border-green-700 rounded hover:bg-green-50"
          >
            + Add Option
          </button>
        </div>

        <!-- Direction: Responsive (base, sm, md, lg, xl) -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Direction (responsive)</label>
          <div class="grid grid-cols-5 gap-2">
            <div v-for="br in breakpoints" :key="br" class="flex flex-col">
              <label class="block text-xs text-gray-600">{{ br }}</label>
              <select
                v-model="localDirection[br]"
                @change="emitDirection"
                class="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">—</option>
                <option value="vertical">vertical</option>
                <option value="horizontal">horizontal</option>
              </select>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            تعیین کنید در هر breakpoint جهت چیدن گزینه‌ها چگونه باشد.
          </p>
        </div>

        <!-- Group Label -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Group Label</label>
          <input
            v-model="localGroupLabel"
            @input="emitUpdate('groupLabel', localGroupLabel)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="Group Label"
          />
        </div>

        <!-- Label Position: Responsive مثل بخش بالا -->
        <div>
          <label class="block text-xs text-gray-600 mb-1">Label Position (responsive)</label>
          <div class="grid grid-cols-5 gap-2">
            <div v-for="br in breakpoints" :key="br" class="flex flex-col">
              <label class="block text-xs text-gray-600">{{ br }}</label>
              <select
                v-model="localLabelPosition[br]"
                @change="emitLabelPosition"
                class="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">—</option>
                <option value="top">top</option>
                <option value="right">right</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- ==== ۵. Toggle ==== -->
      <template v-else-if="fieldType === 'toggle'">
        <h3 class="text-sm font-semibold text-gray-700">Toggle Settings</h3>

        <!-- Size -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Size</label>
          <select
            v-model="localSize"
            @change="emitUpdate('size', localSize)"
            class="w-full px-2 py-1 border rounded text-sm"
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>

        <!-- OnColor & OffColor -->
        <div class="grid grid-cols-1 gap-3 mb-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">On Color</label>
            <input
              v-model="localOnColor"
              @input="emitUpdate('onColor', localOnColor)"
              type="text"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Tailwind color class (e.g. bg-green-500)"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Off Color</label>
            <input
              v-model="localOffColor"
              @input="emitUpdate('offColor', localOffColor)"
              type="text"
              class="w-full px-2 py-1 border rounded text-sm"
              placeholder="Tailwind color class (e.g. bg-gray-300)"
            />
          </div>
        </div>

        <!-- Label Position: Responsive -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Label Position</label>
          <div class="grid grid-cols-5 gap-2">
            <div v-for="br in breakpoints" :key="br" class="flex flex-col">
              <label class="block text-xs text-gray-600">{{ br }}</label>
              <select
                v-model="localLabelPosition[br]"
                @change="emitLabelPosition"
                class="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">—</option>
                <option value="top">top</option>
                <option value="right">right</option>
              </select>
            </div>
          </div>
        </div>
      </template>

      <!-- ==== ۶. File Uploader ==== -->
      <template v-else-if="fieldType === 'file'">
        <h3 class="text-sm font-semibold text-gray-700">File Uploader Settings</h3>

        <!-- accept -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Accept</label>
          <input
            v-model="localAccept"
            @input="emitUpdate('accept', localAccept)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="e.g. image/*, .pdf"
          />
        </div>

        <!-- multipleFile -->
        <div class="mb-3">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localMultipleFile"
              @change="emitUpdate('multipleFile', localMultipleFile)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Allow Multiple Files</span>
          </label>
        </div>

        <!-- maxFiles & maxSize -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Max Files</label>
            <input
              v-model.number="localMaxFiles"
              @input="emitUpdate('maxFiles', localMaxFiles)"
              type="number"
              min="1"
              class="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Max Size (bytes)</label>
            <input
              v-model.number="localMaxSize"
              @input="emitUpdate('maxSize', localMaxSize)"
              type="number"
              min="1"
              class="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        <!-- isImageUploader -->
        <div class="mb-3">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="localIsImageUploader"
              @change="emitUpdate('isImageUploader', localIsImageUploader)"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Image Uploader (preview)</span>
          </label>
        </div>

        <!-- Watermark options (فقط اگر isImageUploader === true) -->
        <div v-if="localIsImageUploader" class="space-y-3 mb-3">
          <div>
            <label class="inline-flex items-center">
              <input
                type="checkbox"
                v-model="localWatermark"
                @change="emitUpdate('watermark', localWatermark)"
                class="form-checkbox h-5 w-5 text-blue-600"
              />
              <span class="ml-2 text-sm">Apply Watermark</span>
            </label>
          </div>
          <div v-if="localWatermark" class="space-y-2">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Watermark Image URL</label>
              <input
                v-model="localWatermarkImage"
                @input="emitUpdate('watermarkImage', localWatermarkImage)"
                type="text"
                class="w-full px-2 py-1 border rounded text-sm"
                placeholder="URL or path"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Watermark Text</label>
              <input
                v-model="localWatermarkText"
                @input="emitUpdate('watermarkText', localWatermarkText)"
                type="text"
                class="w-full px-2 py-1 border rounded text-sm"
                placeholder="Text watermark if no image"
              />
            </div>
          </div>
        </div>

        <!-- uploadUrl -->
        <div class="mb-3">
          <label class="block text-xs text-gray-600 mb-1">Upload URL</label>
          <input
            v-model="localUploadUrl"
            @input="emitUpdate('uploadUrl', localUploadUrl)"
            type="text"
            class="w-full px-2 py-1 border rounded text-sm"
            placeholder="Server endpoint"
          />
        </div>
      </template>

      <!-- ==== ۷. Rich Text ==== -->
      <template v-else-if="fieldType === 'richtext'">
        <h3 class="text-sm font-semibold text-gray-700">Rich Text Editor Settings</h3>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            v-model="localRichtextImage"
            @change="emitUpdate('image', localRichtextImage)"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="ml-2 text-sm">Allow Image Insertion</span>
        </label>
      </template>

      <!-- ==== ۸. Array ==== -->
      <template v-else-if="fieldType === 'array'">
        <h3 class="text-sm font-semibold text-gray-700">Array Field Settings</h3>

        <!-- itemFields: فهرست فیلدهای تو در تو -->
        <div class="mb-3 space-y-2">
          <label class="block text-xs text-gray-600 mb-1">Item Fields</label>
          <div v-for="(itemF, idx) in localItemFields" :key="idx" class="p-2 border rounded space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium">{{ itemF.key }} ({{ itemF.type }})</span>
              <button
                @click="removeItemField(idx)"
                type="button"
                class="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Label</label>
              <input
                v-model="itemF.label"
                @input="onItemFieldsChange"
                type="text"
                class="w-full px-2 py-1 border rounded text-sm"
                placeholder="Item field label"
              />
            </div>
          </div>
          <button
            @click="addItemField"
            type="button"
            class="mt-1 px-3 py-1 text-xs text-green-700 border border-green-700 rounded hover:bg-green-50"
          >
            + Add Item Field
          </button>
        </div>

        <!-- minItems & maxItems -->
        <div class="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label class="block text-xs text-gray-600 mb-1">Min Items</label>
            <input
              v-model.number="localMinItems"
              @input="emitUpdate('minItems', localMinItems)"
              type="number"
              min="0"
              class="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-600 mb-1">Max Items</label>
            <input
              v-model.number="localMaxItems"
              @input="emitUpdate('maxItems', localMaxItems)"
              type="number"
              min="1"
              class="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
      </template>

      <!-- ==== ۹. اگر نوع فیلد پیدا نشود ==== -->
      <template v-else>
        <p class="text-sm text-gray-500">No additional settings for this field type.</p>
      </template>
    </div>

    <hr class="border-gray-200" />

    <!-- ============================
         بخش چهارم: لیست Validatorها
         ============================ -->
    <div class="space-y-3">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Validators</h3>
      <div class="space-y-2">
        <!-- هر Validator پیش‌فرض را نشان بده -->
        <div
          v-for="(vdef, idx) in validatorDefinitions"
          :key="vdef.type"
          class="flex items-center space-x-2"
        >
          <input
            type="checkbox"
            :id="`validator_${vdef.type}`"
            v-model="activeValidators[vdef.type]"
            @change="onValidatorToggle(vdef.type)"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <label :for="`validator_${vdef.type}`" class="text-sm">
            {{ vdef.label }}
          </label>

          <!-- اگر Validator نیاز به مقدار داشت (مثلاً minLength, maxLength, min, max, regex, matchField) -->
          <template v-if="activeValidators[vdef.type] && vdef.hasValue">
            <div class="ml-4 flex items-center space-x-2">
              <label class="text-xs text-gray-600">{{ vdef.valueLabel }}:</label>

              <!-- برای matchField یک منوی کشویی از فیلدهای دیگر -->
              <template v-if="vdef.type === 'matchField'">
                <select
                  v-model="validatorParams[vdef.type]"
                  @change="emitValidators"
                  class="px-2 py-1 border rounded text-sm"
                >
                  <option value="">— select field —</option>
                  <option v-for="f in otherFields" :key="f.key" :value="f.key">
                    {{ f.key }}
                  </option>
                </select>
              </template>

              <!-- برای regex یک منوی predefined plus گزینهٔ custom -->
              <template v-else-if="vdef.type === 'regex'">
                <select
                  v-model="validatorParams[vdef.type]"
                  @change="emitValidators"
                  class="px-2 py-1 border rounded text-sm"
                >
                  <option value="">— select pattern —</option>
                  <option
                    v-for="(pattern, name) in predefinedRegexps"
                    :key="name"
                    :value="pattern"
                  >
                    {{ name }}
                  </option>
                  <option value="__custom">Custom Regex</option>
                </select>
                <div v-if="validatorParams[vdef.type] === '__custom'" class="ml-2">
                  <input
                    v-model="validatorCustomRegex"
                    @blur="emitValidators"
                    type="text"
                    class="px-2 py-1 border rounded text-sm font-mono"
                    placeholder="e.g. ^[A-Za-z0-9]+$"
                  />
                </div>
              </template>

              <!-- سایر Validatorهای عددی یا string (minLength, maxLength, min, max) -->
              <template v-else>
                <input
                  v-model.number="validatorParams[vdef.type]"
                  @input="emitValidators"
                  :type="vdef.isNumber ? 'number' : 'text'"
                  class="w-20 px-2 py-1 border rounded text-sm"
                  :placeholder="vdef.valueLabel"
                  min="0"
                />
              </template>
            </div>
          </template>

          <!-- پیام خطای مربوط به Validator -->
          <template v-if="activeValidators[vdef.type]">
            <div class="ml-4 flex-1">
              <input
                v-model="validatorMessages[vdef.type]"
                @input="emitValidators"
                type="text"
                class="w-full px-2 py-1 border rounded text-sm"
                :placeholder="`Error message for ${vdef.label}`"
              />
            </div>
          </template>
        </div>

        <!-- امکان افزودن Validator دلخواه (custom) -->
        <div class="mt-2">
          <label class="inline-flex items-center">
            <input
              type="checkbox"
              v-model="activeValidators['custom']"
              @change="onValidatorToggle('custom')"
              class="form-checkbox h-5 w-5 text-blue-600"
            />
            <span class="ml-2 text-sm">Custom Validator</span>
          </label>
        </div>
        <div v-if="activeValidators['custom']" class="mt-2">
          <textarea
            v-model="validatorCustomFunction"
            @blur="emitValidators"
            rows="3"
            class="w-full px-2 py-1 border rounded text-sm font-mono"
            placeholder="(value, allValues) => { /* return true if valid */ }"
          ></textarea>
          <input
            v-model="validatorMessages['custom']"
            @input="emitValidators"
            type="text"
            class="mt-1 w-full px-2 py-1 border rounded text-sm"
            placeholder="Error message for custom validator"
          />
        </div>
      </div>
    </div>

    <hr class="border-gray-200" />

    <!-- ============================
         بخش نهایی: دکمه‌ها (حذف، بستن)
         ============================ -->
    <div class="flex justify-end space-x-2">
      <button
        @click="onClose"
        class="px-3 py-1 text-gray-700 border rounded hover:bg-gray-100"
      >
        Close
      </button>
      <button
        @click="onDelete"
        class="px-3 py-1 text-red-700 border border-red-700 rounded hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import type { PropType } from "vue";

// کلیدهای ریسپانسیو
const breakpoints = ["base", "sm", "md", "lg", "xl"] as const;

// ---- Props ----
const props = defineProps<{
  field: Record<string, any>; // آبجکت کامل FieldConfig از والد
  formValues: Record<string, any>; // مقادیر فعلی فرم (برای matchField)
  formErrors: Record<string, string>; // ارورهای فعلی (برای ارجاع)
  allFields: Record<string, any>[]; // همهٔ FieldConfigها (برای انتخاب matchField یا showIf)
}>();

// ---- Emits ----
const emit = defineEmits<{
  (e: "updateField", updatedField: Record<string, any>): void;
  (e: "renameField", payload: { oldKey: string; newKey: string }): void;
  (e: "deleteField", fieldKey: string): void;
  (e: "closePanel"): void;
}>();

// =============================
// ۱. مقداردهی اولیهٔ «کلید» و «برچسب»
// =============================
const localKey = ref(props.field.key);
const localLabel = ref(props.field.label || "");
const keyError = ref<string>("");

// وقتی کلید Blur می‌شود، اعتبارسنجی و Rename
function onKeyBlur() {
  const newKey = localKey.value.trim();
  if (!newKey) {
    keyError.value = "Key cannot be empty.";
    localKey.value = props.field.key;
    return;
  }
  // الگوی ساده: فقط حرف/عدد/زیرخط
  if (!/^[A-Za-z0-9_]+$/.test(newKey)) {
    keyError.value = "Key can only contain letters, numbers, or underscore.";
    localKey.value = props.field.key;
    return;
  }
  // یکتایی در تمام فیلدها
  const duplicate = props.allFields.find(
    (f) => f.key === newKey && f.key !== props.field.key
  );
  if (duplicate) {
    keyError.value = "Key already exists.";
    localKey.value = props.field.key;
    return;
  }
  if (newKey !== props.field.key) {
    emit("renameField", { oldKey: props.field.key, newKey });
  }
  keyError.value = "";
}

// وقتی برچسب تغییر کند
const localPlaceholder = ref(props.field.placeholder || "");
const localTooltip = ref(props.field.tooltip || "");
const localIcon = ref(props.field.icon || "");

// Required / Disabled
const localRequired = ref(!!props.field.required);
const localDisabled = ref(!!props.field.disabled);

// =============================
// ۲. Layout Responsive colSpan
// =============================
// localColSpan: آبجکت { base: number, sm?: number, md?: number, lg?: number, xl?: number }
const localColSpan = reactive<Record<string, number | undefined>>({});
breakpoints.forEach((br) => {
  localColSpan[br] =
    props.field.layout?.colSpan?.[br] != null
      ? props.field.layout.colSpan[br]
      : undefined;
});
function emitLayout() {
  // فقط کلیدهایی را شامل کن که عدد دارند
  const colSpanObj: Record<string, number> = {};
  breakpoints.forEach((br) => {
    if (localColSpan[br] != null) {
      colSpanObj[br] = localColSpan[br]!;
    }
  });
  const newLayout = { ...props.field.layout, colSpan: colSpanObj };
  emit("updateField", { ...props.field, layout: newLayout });
}

// =============================
// ۳. LabelPosition Responsive
// =============================
const localLabelPosition = reactive<Record<string, string | undefined>>({});
breakpoints.forEach((br) => {
  const lp = props.field.labelPosition;
  if (typeof lp === "object") {
    localLabelPosition[br] = lp[br] || undefined;
  } else {
    // اگر یک رشته بود، فقط base را پر می‌کنیم
    localLabelPosition[br] = br === "base" ? (props.field.labelPosition || undefined) : undefined;
  }
});
function emitLabelPosition() {
  const lpObj: Record<string, string> = {};
  breakpoints.forEach((br) => {
    if (localLabelPosition[br]) {
      lpObj[br] = localLabelPosition[br]!;
    }
  });
  emit("updateField", { ...props.field, labelPosition: lpObj });
}

// =============================
// ۴. Conditional Display: showIf
// =============================
const originalShowIf = props.field.showIf;
const localShowIfKey = ref<string>("");
const localShowIfValue = ref<any>("");
const localShowIfFunction = ref<string>("");
const advancedShowIf = ref(false);

// اگر تابع باشد => حالت Advanced
if (typeof originalShowIf === "function") {
  advancedShowIf.value = true;
  localShowIfFunction.value = originalShowIf.toString();
}
// اگر شیئی با { __built: true, key, value } باشد => حالت ساده
else if (
  originalShowIf &&
  typeof originalShowIf === "object" &&
  originalShowIf.__built
) {
  advancedShowIf.value = false;
  localShowIfKey.value = originalShowIf.key;
  localShowIfValue.value = originalShowIf.value;
} else {
  advancedShowIf.value = false;
}

// لیست سایر فیلدها برای انتخاب در matchField یا showIf
const otherFields = computed(() =>
  props.allFields.filter((f) => f.key !== props.field.key)
);

// On change simple showIf field
function onShowIfFieldChange() {
  if (!localShowIfKey.value) {
    emit("updateField", { ...props.field, showIf: undefined });
  } else {
    const built = {
      __built: true,
      key: localShowIfKey.value,
      value: localShowIfValue.value,
    };
    emit("updateField", { ...props.field, showIf: built });
  }
}
// On value change
function onShowIfValueChange() {
  if (localShowIfKey.value) {
    const built = {
      __built: true,
      key: localShowIfKey.value,
      value: localShowIfValue.value,
    };
    emit("updateField", { ...props.field, showIf: built });
  }
}
// On advanced JS function blur
function onShowIfFunctionBlur() {
  try {
    const fn: Function = eval(`(${localShowIfFunction.value})`);
    if (typeof fn === "function") {
      emit("updateField", { ...props.field, showIf: fn });
    }
  } catch {
    // اگر نامعتبر باشد، ارسال نشود.
  }
}

// =============================
// ۵. قسمت Type-Specific
// =============================
// ابتدا نوع فعلی فیلد
const fieldType = computed(() => props.field.type);

// برای بازنشانی متغیرهای Type-Specific هنگام تغییر نوع
watch(
  () => props.field.type,
  () => {
    resetTypeSpecific();
  }
);

// ————— ۵.۱ Text-like (text, email, number, password, textarea) —————
const predefinedMasks = {
  onlyDigits: { mask: Number, thousandsSeparator: "" },
  commaSeparated: { mask: Number, thousandsSeparator: "," },
  mobile: { mask: "0000000000" },
  persianPhone: { mask: "0\\9999999999" },
};

// localMaskType: کلیدِ یکی از predefinedMasks یا "__custom" یا ""
const localMaskType = ref<string>(
  props.field.mask && typeof props.field.mask === "string"
    ? props.field.mask
    : props.field.mask &&
      typeof props.field.mask === "object" &&
      Object.keys(predefinedMasks).find((k) => {
        // مقایسهٔ ساده‌سازی‌شده برای شناسایی یکی از موارد آماده
        try {
          return JSON.stringify(predefinedMasks[k]) === JSON.stringify(props.field.mask);
        } catch {
          return false;
        }
      }) ||
      "__custom"
);
const localMaskJson = ref<string>(
  props.field.mask && !Object.values(predefinedMasks).some(
    (pm) => JSON.stringify(pm) === JSON.stringify(props.field.mask)
  )
    ? JSON.stringify(props.field.mask)
    : ""
);

function onMaskTypeChange() {
  if (localMaskType.value === "" || localMaskType.value === undefined) {
    emit("updateField", { ...props.field, mask: undefined });
  } else if (localMaskType.value === "__custom") {
    // منتظر کاربر برای پر کردن JSON
  } else {
    // یکی از ماسک‌های آماده
    emit("updateField", { ...props.field, mask: predefinedMasks[localMaskType.value] });
  }
}
function onMaskBlur() {
  if (!localMaskJson.value.trim()) {
    emit("updateField", { ...props.field, mask: undefined });
    return;
  }
  try {
    const parsed = JSON.parse(localMaskJson.value);
    emit("updateField", { ...props.field, mask: parsed });
  } catch {
    // JSON نامعتبر، ارسال نشود.
  }
}

// Prefix و Suffix
const localPrefix = ref(props.field.prefix || "");
const localSuffix = ref(props.field.suffix || "");
const localPasswordOptions = ref(!!props.field.passwordOptions);

// ————— ۵.۲ Date-like Inputs —————
const localInputFormat = ref(props.field.inputFormat || "");
const localDisplayFormat = ref(props.field.displayFormat || "");
const localClearable = ref(!!props.field.clearable);
const localSingle = ref(!!props.field.single);
const localCalendarType = ref(props.field.calendarType || "gregorian");

// ————— ۵.۳ Select —————
const localItems = ref<Array<{ label: string; value: any }>>(
  Array.isArray(props.field.items)
    ? JSON.parse(JSON.stringify(props.field.items))
    : []
);
const localMultiple = ref(!!props.field.multiple);
const localSearchable = ref(!!props.field.searchable);
const localClearableSelect = ref(!!props.field.clearableSelect);
const localLabelField = ref(props.field.labelField || "label");
const localValueField = ref(props.field.valueField || "value");
const localDisplayField = ref(props.field.displayField || "");

// Helper برای ارسال آرایهٔ items
function emitItems() {
  emit("updateField", { ...props.field, items: JSON.parse(JSON.stringify(localItems.value)) });
}
function addItem() {
  localItems.value.push({ label: "", value: "" });
}
function removeItem(idx: number) {
  localItems.value.splice(idx, 1);
  emitItems();
}
function onItemsChange() {
  emitItems();
}

// ————— ۵.۴ CheckboxGroup / RadioGroup —————
const localOptions = ref<Array<{ label: string; value: any }>>(
  Array.isArray(props.field.options)
    ? JSON.parse(JSON.stringify(props.field.options))
    : []
);
const localDirection = reactive<Record<string, string | undefined>>({});
breakpoints.forEach((br) => {
  if (props.field.direction && typeof props.field.direction === "object") {
    localDirection[br] = props.field.direction[br] || undefined;
  } else if (br === "base" && typeof props.field.direction === "string") {
    localDirection[br] = props.field.direction;
  } else {
    localDirection[br] = undefined;
  }
});
const localGroupLabel = ref(props.field.groupLabel || "");

function emitDirection() {
  const dirObj: Record<string, string> = {};
  breakpoints.forEach((br) => {
    if (localDirection[br]) {
      dirObj[br] = localDirection[br]!;
    }
  });
  emit("updateField", { ...props.field, direction: dirObj });
}
function emitOptions() {
  emit("updateField", { ...props.field, options: JSON.parse(JSON.stringify(localOptions.value)) });
}
function addOption() {
  localOptions.value.push({ label: "", value: "" });
}
function removeOption(idx: number) {
  localOptions.value.splice(idx, 1);
  emitOptions();
}
function onOptionsChange() {
  emitOptions();
}

// ————— ۵.۵ Toggle —————
const localSize = ref(props.field.size || "md");
const localOnColor = ref(props.field.onColor || "bg-blue-500");
const localOffColor = ref(props.field.offColor || "bg-gray-300");
// localLabelPosition همین‌جا استفاده می‌شود (از بالا)
// نیازی به اکشن جداگانه نیست

// ————— ۵.۶ FileUploader —————
const localAccept = ref(props.field.accept || "");
const localMultipleFile = ref(!!props.field.multipleFile);
const localMaxFiles = ref(props.field.maxFiles ?? 1);
const localMaxSize = ref(props.field.maxSize ?? Infinity);
const localIsImageUploader = ref(props.field.isImageUploader !== false);
const localWatermark = ref(!!props.field.watermark);
const localWatermarkImage = ref(props.field.watermarkImage || "");
const localWatermarkText = ref(props.field.watermarkText || "");
const localUploadUrl = ref(props.field.uploadUrl || "");

// ————— ۵.۷ RichText —————
const localRichtextImage = ref(props.field.image !== false);

// ————— ۵.۸ Array —————
const localItemFields = ref<Array<Record<string, any>>>(
  Array.isArray(props.field.itemFields)
    ? JSON.parse(JSON.stringify(props.field.itemFields))
    : []
);
const localMinItems = ref(props.field.minItems ?? 0);
const localMaxItems = ref(props.field.maxItems ?? Infinity);

function emitItemFields() {
  emit("updateField", { ...props.field, itemFields: JSON.parse(JSON.stringify(localItemFields.value)) });
}
function addItemField() {
  const newKey = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  localItemFields.value.push({
    key: newKey,
    type: "text",
    label: "New Item Field",
    layout: { colSpan: { base: 1 } },
  });
  emitItemFields();
}
function removeItemField(idx: number) {
  localItemFields.value.splice(idx, 1);
  emitItemFields();
}
function onItemFieldsChange() {
  emitItemFields();
}

// تابع برای ریست‌کردن همهٔ متغیرهای Type-Specific
function resetTypeSpecific() {
  // Text-like
  localMaskType.value = "";
  localMaskJson.value = "";
  localPrefix.value = "";
  localSuffix.value = "";
  localPasswordOptions.value = false;

  // Date-like
  localInputFormat.value = "";
  localDisplayFormat.value = "";
  localClearable.value = false;
  localSingle.value = false;
  localCalendarType.value = "gregorian";

  // Select
  localItems.value = [];
  localMultiple.value = false;
  localSearchable.value = false;
  localClearableSelect.value = false;
  localLabelField.value = "label";
  localValueField.value = "value";
  localDisplayField.value = "";

  // Checkbox/Radio
  localOptions.value = [];
  breakpoints.forEach((br) => (localDirection[br] = undefined));
  localGroupLabel.value = "";

  // Toggle
  localSize.value = "md";
  localOnColor.value = "bg-blue-500";
  localOffColor.value = "bg-gray-300";
  // localLabelPosition از بالا مدیریت می‌شود

  // File
  localAccept.value = "";
  localMultipleFile.value = false;
  localMaxFiles.value = 1;
  localMaxSize.value = Infinity;
  localIsImageUploader.value = true;
  localWatermark.value = false;
  localWatermarkImage.value = "";
  localWatermarkText.value = "";
  localUploadUrl.value = "";

  // RichText
  localRichtextImage.value = true;

  // Array
  localItemFields.value = [];
  localMinItems.value = 0;
  localMaxItems.value = Infinity;
}

// =============================
// ۶. Validators
// =============================
// تعریف Validatorهای پیش‌فرض
const validatorDefinitions = [
  { type: "required", label: "Required", hasValue: false },
  { type: "minLength", label: "Min Length", hasValue: true, isNumber: true, valueLabel: "minChars" },
  { type: "maxLength", label: "Max Length", hasValue: true, isNumber: true, valueLabel: "maxChars" },
  { type: "min", label: "Min Value", hasValue: true, isNumber: true, valueLabel: "min" },
  { type: "max", label: "Max Value", hasValue: true, isNumber: true, valueLabel: "max" },
  { type: "email", label: "Email", hasValue: false },
  { type: "mobile", label: "Mobile", hasValue: false },
  { type: "phone", label: "Phone", hasValue: false },
  { type: "numeric", label: "Numeric", hasValue: false },
  { type: "alpha", label: "Alpha", hasValue: false },
  { type: "alphaNum", label: "AlphaNum", hasValue: false },
  { type: "persianLetters", label: "Persian Letters", hasValue: false },
  { type: "regex", label: "Regex", hasValue: true, isRegex: true, valueLabel: "pattern" },
  { type: "matchField", label: "Match Field", hasValue: true, isMatchField: true, valueLabel: "otherFieldKey" },
];
// یک Regexهای از پیش‌تعریف‌شده
const predefinedRegexps: Record<string, string> = {
  "digits only": "^\\d+$",
  "letters only": "^[A-Za-z]+$",
  "alphanumeric": "^[A-Za-z0-9]+$",
  // در صورت نیاز می‌توانید regexهای بیشتری اضافه کنید
};

// وضعیت فعال/غیرفعال بودن هر Validator
const activeValidators = reactive<Record<string, boolean>>({});
validatorDefinitions.forEach((v) => {
  activeValidators[v.type] = Array.isArray(props.field.validators)
    ? props.field.validators.some((fv: any) => fv.type === v.type)
    : false;
});
// پیام خطای هر Validator
const validatorMessages = reactive<Record<string, string>>({});
validatorDefinitions.forEach((v) => {
  const found = Array.isArray(props.field.validators)
    ? props.field.validators.find((fv: any) => fv.type === v.type)
    : null;
  validatorMessages[v.type] = found ? found.message : "";
});
// پارامتر عددی یا رشته‌ای هر Validator (مانند minLength، maxLength، min، max)
const validatorParams = reactive<Record<string, any>>({});
validatorDefinitions.forEach((v) => {
  const found = Array.isArray(props.field.validators)
    ? props.field.validators.find((fv: any) => fv.type === v.type)
    : null;
  if (v.hasValue && found) {
    // برای regex و matchField از کلید متفاوت استفاده می‌کنیم:
    if (v.type === "regex") {
      validatorParams[v.type] = found.pattern;
    } else if (v.type === "matchField") {
      validatorParams[v.type] = found.field;
    } else {
      validatorParams[v.type] = found.value;
    }
  } else {
    validatorParams[v.type] = "";
  }
});
// برای حالت Custom
activeValidators["custom"] = Array.isArray(props.field.validators)
  ? props.field.validators.some((fv: any) => fv.type === "custom")
  : false;
validatorMessages["custom"] = Array.isArray(props.field.validators)
  ? (props.field.validators.find((fv: any) => fv.type === "custom") || {}).message || ""
  : "";
const validatorCustomFunction = ref<string>(
  Array.isArray(props.field.validators)
    ? (props.field.validators.find((fv: any) => fv.type === "custom") || {}).validator?.toString() || ""
    : ""
);

// هر زمان وضعیت Validator یا پارامتر/پیام تغییر کرد، آرایهٔ نهایی را ارسال کن
function emitValidators() {
  const newArr: any[] = [];
  validatorDefinitions.forEach((v) => {
    if (activeValidators[v.type]) {
      const obj: any = { type: v.type, message: validatorMessages[v.type] || "" };
      if (v.hasValue) {
        if (v.type === "regex") {
          if (validatorParams[v.type] !== "__custom") {
            obj.pattern = validatorParams[v.type];
          } else {
            obj.pattern = validatorCustomRegex.value;
          }
        } else if (v.type === "matchField") {
          obj.field = validatorParams[v.type];
        } else {
          obj.value = validatorParams[v.type];
        }
      }
      newArr.push(obj);
    }
  });
  if (activeValidators["custom"] && validatorCustomFunction.value.trim()) {
    try {
      // eslint-disable-next-line no-eval
      const fn = eval(`(${validatorCustomFunction.value})`);
      if (typeof fn === "function") {
        newArr.push({
          type: "custom",
          validator: fn,
          message: validatorMessages["custom"] || "",
        });
      }
    } catch {
      // اگر تابع نامعتبر باشد، ارسال نشود
    }
  }
  emit("updateField", { ...props.field, validators: newArr });
}

// وقتی checkbox هر Validator تغییر کرد
function onValidatorToggle(type: string) {
  validatorMessages[type] = ""; // پیام را پاک کن اگر تازه فعال شده
  validatorParams[type] = ""; // پارامتر را هم پاک کن
  if (!activeValidators[type]) {
    // اگر غیرفعال شد، مستقیم آرایهٔ جدید را ارسال کن
    emitValidators();
  }
}

// برای حالت Regex: پارامتر اضافه
const validatorCustomRegex = ref<string>("");

// =============================
// ۷. Watch برای همگام‌سازی با prop اگر تغییر کند
// =============================
watch(
  () => props.field,
  (newField) => {
    // همگام‌سازی shared props
    localKey.value = newField.key;
    localLabel.value = newField.label || "";
    localPlaceholder.value = newField.placeholder || "";
    localTooltip.value = newField.tooltip || "";
    localIcon.value = newField.icon || "";
    localRequired.value = !!newField.required;
    localDisabled.value = !!newField.disabled;
    // Layout
    breakpoints.forEach((br) => {
      localColSpan[br] = newField.layout?.colSpan?.[br] || undefined;
      if (typeof newField.labelPosition === "object") {
        localLabelPosition[br] = newField.labelPosition[br] || undefined;
      } else if (br === "base") {
        localLabelPosition[br] = newField.labelPosition || undefined;
      } else {
        localLabelPosition[br] = undefined;
      }
    });
    // showIf
    const si = newField.showIf;
    if (typeof si === "function") {
      advancedShowIf.value = true;
      localShowIfFunction.value = si.toString();
      localShowIfKey.value = "";
      localShowIfValue.value = "";
    } else if (si && typeof si === "object" && si.__built) {
      advancedShowIf.value = false;
      localShowIfKey.value = si.key;
      localShowIfValue.value = si.value;
      localShowIfFunction.value = "";
    } else {
      advancedShowIf.value = false;
      localShowIfKey.value = "";
      localShowIfValue.value = "";
      localShowIfFunction.value = "";
    }

    // Type-Specific
    // Text
    const m = newField.mask;
    const foundPre = m && typeof m === "object" && Object.keys(predefinedMasks).find((k) => {
      try {
        return JSON.stringify(predefinedMasks[k]) === JSON.stringify(m);
      } catch {
        return false;
      }
    });
    if (foundPre) {
      localMaskType.value = foundPre;
      localMaskJson.value = "";
    } else if (m) {
      localMaskType.value = "__custom";
      localMaskJson.value = JSON.stringify(m);
    } else {
      localMaskType.value = "";
      localMaskJson.value = "";
    }
    localPrefix.value = newField.prefix || "";
    localSuffix.value = newField.suffix || "";
    localPasswordOptions.value = !!newField.passwordOptions;

    // Date
    localInputFormat.value = newField.inputFormat || "";
    localDisplayFormat.value = newField.displayFormat || "";
    localClearable.value = !!newField.clearable;
    localSingle.value = !!newField.single;
    localCalendarType.value = newField.calendarType || "gregorian";

    // Select
    localItems.value = Array.isArray(newField.items)
      ? JSON.parse(JSON.stringify(newField.items))
      : [];
    localMultiple.value = !!newField.multiple;
    localSearchable.value = !!newField.searchable;
    localClearableSelect.value = !!newField.clearableSelect;
    localLabelField.value = newField.labelField || "label";
    localValueField.value = newField.valueField || "value";
    localDisplayField.value = newField.displayField || "";

    // Checkbox/Radio
    localOptions.value = Array.isArray(newField.options)
      ? JSON.parse(JSON.stringify(newField.options))
      : [];
    breakpoints.forEach((br) => {
      if (newField.direction && typeof newField.direction === "object") {
        localDirection[br] = newField.direction[br] || undefined;
      } else if (br === "base") {
        localDirection[br] = newField.direction || undefined;
      } else {
        localDirection[br] = undefined;
      }
    });
    localGroupLabel.value = newField.groupLabel || "";

    // Toggle
    localSize.value = newField.size || "md";
    localOnColor.value = newField.onColor || "bg-blue-500";
    localOffColor.value = newField.offColor || "bg-gray-300";
    // localLabelPosition از بالا همگام می‌شود

    // File
    localAccept.value = newField.accept || "";
    localMultipleFile.value = !!newField.multipleFile;
    localMaxFiles.value = newField.maxFiles ?? 1;
    localMaxSize.value = newField.maxSize ?? Infinity;
    localIsImageUploader.value = newField.isImageUploader !== false;
    localWatermark.value = !!newField.watermark;
    localWatermarkImage.value = newField.watermarkImage || "";
    localWatermarkText.value = newField.watermarkText || "";
    localUploadUrl.value = newField.uploadUrl || "";

    // RichText
    localRichtextImage.value = newField.image !== false;

    // Array
    localItemFields.value = Array.isArray(newField.itemFields)
      ? JSON.parse(JSON.stringify(newField.itemFields))
      : [];
    localMinItems.value = newField.minItems ?? 0;
    localMaxItems.value = newField.maxItems ?? Infinity;

    // Validators
    validatorDefinitions.forEach((v) => {
      const found = Array.isArray(newField.validators)
        ? newField.validators.find((fv: any) => fv.type === v.type)
        : null;
      activeValidators[v.type] = !!found;
      validatorMessages[v.type] = found ? found.message : "";
      if (v.hasValue && found) {
        if (v.type === "regex") {
          validatorParams[v.type] = found.pattern || "";
        } else if (v.type === "matchField") {
          validatorParams[v.type] = found.field || "";
        } else {
          validatorParams[v.type] = found.value;
        }
      } else {
        validatorParams[v.type] = "";
      }
    });
    // Custom
    const foundCustom = Array.isArray(newField.validators)
      ? newField.validators.find((fv: any) => fv.type === "custom")
      : null;
    activeValidators["custom"] = !!foundCustom;
    validatorMessages["custom"] = foundCustom?.message || "";
    validatorCustomFunction.value = foundCustom?.validator?.toString() || "";
    validatorCustomRegex.value = foundCustom?.pattern || "";
  },
  { immediate: true }
);

// =============================
// ۸. عملکردهای اشتراکی
// =============================

// Emit عمومی برای پراپ مشترک
function emitUpdate(propName: string, value: any) {
  const updated: Record<string, any> = { ...props.field };
  updated[propName] = value;
  emit("updateField", updated);
}

// حذف و بستن پنل
function onDelete() {
  emit("deleteField", props.field.key);
}
function onClose() {
  emit("closePanel");
}
</script>

<style scoped>
/* استایل‌های پایه، می‌توانید بر اساس تم خودتان آن‌ها را تغییر دهید */
</style>

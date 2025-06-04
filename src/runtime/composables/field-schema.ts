// field-schema.ts

// ۱. تعریف انواع پایه (برای ریسپانسیو کردن مقدارها)
export interface ResponsiveProp<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

// ۲. تعریف یک «ورودی پراپرتی» (Property Definition)
//   یعنی برای هر پراپرتی، مشخص می‌کنیم: 
//     • نام کلید (key)؛ 
//     • عنوانی که در پنل نمایش داده می‌شود (label)؛ 
//     • نوع ورودی (inputType)، مثلاً "text" یا "number" یا "checkbox" یا "textarea" یا "select"؛ 
//     • اگر select باشد، فهرست گزینه‌ها (options)؛ 
//     • اگر ریسپانسیو باشد، inputType می‌تواند منظورتان از نمایش ورودی «responsive» را مشخص کند.
//     • و کدی که بدانیم چطور در خروجی FieldConfig جاگذاری کند (مثلاً اگر نامش layout.colSpan است، وقتی کاربر عدد وارد می‌کند، ما به‌صورت خودکار می‌سازیم: layout: { colSpan: { base: x, md: y, … } } )

export type InputType =
  | "text"
  | "number"
  | "checkbox"
  | "textarea"
  | "select"
  | "color"
  | "code"       // برای JS Expression (showIf)
  | "object"     // برای مجموعه‌ای از زیر-ورودی‌ها (مثلاً برای layout یا validators)
  | "array";     // برای لیستی از گزینه‌ها (options/items) یا itemFields در آرایه

export interface PropertyDefinition {
  /** نام کلید در FieldConfig (مثلاً "label" یا "placeholder" یا "layout.colSpan") */
  key: string;

  /** عنوانی که برای این پراپرتی در پنل نشان می‌دهیم (مثلاً "Label" یا "Placeholder") */
  label: string;

  /** نوع ورودی: 
   *  - text: یک input متنی ساده 
   *  - number: input با type="number"
   *  - checkbox: input از نوع چک‌باکس 
   *  - textarea: یک textarea 
   *  - select: drop-down (باید گزینه‌ها را در options بدهیم) 
   *  - color: (مثلاً برای onColor/offColor) 
   *  - code: textarea برای JS expression (showIf) 
   *  - object: خودش مجموعه‌ای از زیر-فیلد دارد (embedding) 
   *  - array: لیستی از گزینه‌ها یا آیتم‌ها را می‌توان اضافه/حذف کرد
   */
  inputType: InputType;

  /** 
   * اگر inputType === "select"، باید این آرایه را مشخص کنیم: 
   * [ { label: "مقدار اول", value: "value1" }, … ] 
   * تا در drop-down نمایش دهد. 
   * در غیر این صورت undefined باشد.
   */
  options?: Array<{ label: string; value: any }>;

  /**
   * برای ورودی‌های ریسپانسیو (مثلاً labelPosition یا layout.colSpan)، 
   * می‌توانیم این پرچم را true بگذاریم تا در پنل منطق نمایش ورودی ریسپانسیو فعال شود.
   */
  isResponsive?: boolean;

  /**
   * اگر این پراپرتی مرتبط با یک شیء‌ٔ مرکب (object) باشد (مثلاً validators که خودش لیست rule است،
   * یا layout که خودش شیء { colSpan: ResponsiveProp<number> } است)،
   * اینجا می‌گوییم inputType = "object" و یک فیلد children به صورت آرایه (PropertyDefinition[]) بدهیم.
   */
  children?: PropertyDefinition[];

  /**
   * پرچمی که نشان بدهد این پراپرتی فقط برای نوع خاصی از فیلدها فعال باشد.
   * مثلاً اگر key === "mask"، فقط وقتی type === "text" یا "number" است نشان بدهد.
   * می‌توانیم یک تابع ساده بنویسیم که بررسی کند props.type === "text" و …
   */
  onlyForTypes?: string[];

  /** اگر پراپرتی از نوع array باشد (مثلاً options یا items یا itemFields)، 
   * می‌توانیم در اینجا یک زیر-توضیح (subSchema) بدهیم. برای مثال، 
   * itemFields خودش آرایه‌ای از FieldConfig است و دوباره یک فرم کاملاً مشابه 
   * برای ویرایش «فیلدهای داخل آرایه» نیاز داریم. 
   */
  arrayItemSchema?: PropertyDefinition[];

  /** اگر پراپرتی نوع boolean است (مثلاً required یا disabled یا collapsible)، 
   * inputType را "checkbox" بگذارید؛ مقدار پیش‌فرض را داخل FieldConfig نگاه دارید. 
   */

  /** اگر پراپرتی نیاز دارد که مقدار پیش‌فرضی نشان دهد (مثلاً default = true یا default = false)، */
  defaultValue?: any;
}
// field-schema.ts (ادامه)

////////////////////////////////////////////////////////////////
// ۲-۱. پراپرتی‌های مشترکِ همهٔ Fieldها
////////////////////////////////////////////////////////////////
const COMMON_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "key",
    label: "کلید یکتا (Key)",
    inputType: "text",
    defaultValue: "",
    // هیچ محدودیتی نیست: همیشه نشان داده می‌شود
  },
  {
    key: "type",
    label: "نوع فیلد (Type)",
    inputType: "select",
    options: [
      { label: "Text", value: "text" },
      { label: "Email", value: "email" },
      { label: "Number", value: "number" },
      { label: "Password", value: "password" },
      { label: "Textarea", value: "textarea" },
      { label: "Date", value: "date" },
      { label: "Select", value: "select" },
      { label: "Checkbox Group", value: "checkboxGroup" },
      { label: "Radio Group", value: "radioGroup" },
      { label: "Toggle", value: "toggle" },
      { label: "File", value: "file" },
      { label: "Richtext", value: "richtext" },
      { label: "Array", value: "array" },
    ],
    defaultValue: "text",
  },
  {
    key: "label",
    label: "متن برچسب (Label)",
    inputType: "text",
    defaultValue: "",
  },
  {
    key: "placeholder",
    label: "متن جای‌گزین (Placeholder)",
    inputType: "text",
    defaultValue: "",
    // فقط برای Fieldهایی که پشتیبانی می‌کنند:
    onlyForTypes: ["text", "email", "number", "password", "textarea", "date"],
  },
  {
    key: "labelPosition",
    label: "جایگاه برچسب (Label Position)",
    inputType: "object",
    isResponsive: true,
    // children توضیح می‌دهد که چه کلیدهای ریسپانسیوی برایش داریم:
    children: [
      { key: "base", label: "Base", inputType: "select", options: [
          { label: "Top", value: "top" },
          { label: "Right", value: "right" },
        ], defaultValue: "top" },
      { key: "sm",   label: "SM",   inputType: "select", options: [
          { label: "Top", value: "top" },
          { label: "Right", value: "right" },
        ], defaultValue: undefined },
      { key: "md",   label: "MD",   inputType: "select", options: [
          { label: "Top", value: "top" },
          { label: "Right", value: "right" },
        ], defaultValue: undefined },
      { key: "lg",   label: "LG",   inputType: "select", options: [
          { label: "Top", value: "top" },
          { label: "Right", value: "right" },
        ], defaultValue: undefined },
      { key: "xl",   label: "XL",   inputType: "select", options: [
          { label: "Top", value: "top" },
          { label: "Right", value: "right" },
        ], defaultValue: undefined },
    ],
    defaultValue: { base: "top", sm: undefined, md: undefined, lg: undefined, xl: undefined },
  },
  {
    key: "tooltip",
    label: "متن راهنما (Tooltip)",
    inputType: "text",
    defaultValue: "",
  },
  {
    key: "icon",
    label: "آیکون (Icon)",
    inputType: "text",
    defaultValue: "",
  },
  {
    key: "disabled",
    label: "غیرفعال (Disabled)",
    inputType: "checkbox",
    defaultValue: false,
  },
  {
    key: "showIf",
    label: "نمایش شرطی (showIf - JS Expression)",
    inputType: "code",
    defaultValue: "",
  },
  {
    key: "layout",
    label: "چیدمان (Layout)",
    inputType: "object",
    // تنها یک زیرمجموعه داریم: colSpan (خودش ResponsiveProp<number>)
    children: [
      {
        key: "colSpan",
        label: "عرض (colSpan)",
        inputType: "object",
        isResponsive: true,
        children: [
          { key: "base", label: "Base", inputType: "number", defaultValue: 1 },
          { key: "sm",   label: "SM",   inputType: "number", defaultValue: undefined },
          { key: "md",   label: "MD",   inputType: "number", defaultValue: undefined },
          { key: "lg",   label: "LG",   inputType: "number", defaultValue: undefined },
          { key: "xl",   label: "XL",   inputType: "number", defaultValue: undefined },
        ],
        defaultValue: { base: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined },
      },
    ],
    defaultValue: { colSpan: { base: 1, sm: undefined, md: undefined, lg: undefined, xl: undefined } },
  },
  {
    key: "required",
    label: "الزامی (Required)",
    inputType: "checkbox",
    defaultValue: false,
  },
  {
    key: "validators",
    label: "قوانین اعتبارسنجی (Validators)",
    inputType: "array",
    // هر عنصر از این آرایه خودش یک شیء { type: string; value?: any; message: string; field?: string; pattern?: string }
    arrayItemSchema: [
      { key: "type",    label: "نوع Validator", inputType: "select", options: [
          { label: "required",  value: "required" },
          { label: "minLength", value: "minLength" },
          { label: "maxLength", value: "maxLength" },
          { label: "min",       value: "min" },
          { label: "max",       value: "max" },
          { label: "email",     value: "email" },
          { label: "mobile",    value: "mobile" },
          { label: "phone",     value: "phone" },
          { label: "numeric",   value: "numeric" },
          { label: "alpha",     value: "alpha" },
          { label: "alphaNum",  value: "alphaNum" },
          { label: "persianLetters", value: "persianLetters" },
          { label: "regex",     value: "regex" },
          { label: "matchField",value: "matchField" },
          { label: "custom",    value: "custom" },
        ], defaultValue: "required" },
      {
        key: "value",
        label: "مقدار (Value)",
        inputType: "text",
        defaultValue: "",
        // فقط برای برخی typeها لازم است (minLength, maxLength, min, max, matchField, regex)
      },
      {
        key: "field",
        label: "فیلد مرجع (field)",
        inputType: "text",
        defaultValue: "",
        onlyForTypes: ["matchField"],
      },
      {
        key: "pattern",
        label: "الگوی regex",
        inputType: "text",
        defaultValue: "",
        onlyForTypes: ["regex"],
      },
      {
        key: "message",
        label: "پیام خطا (Message)",
        inputType: "text",
        defaultValue: "",
      },
      // اگر type === "custom"، بعداً می‌توان یک کد تابع custom هم اضافه کرد.
    ],
    defaultValue: [],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۲. پراپرتی‌های اختصاصی «Text/Email/Number/Password/Textarea»
////////////////////////////////////////////////////////////////
const TEXT_FIELD_PROPS: PropertyDefinition[] = [
  // ۳ پراپرتی مشترک که در COMMON_FIELD_PROPS تعریف شده: key, type, label
  {
    key: "placeholder",
    label: "Placeholder",
    inputType: "text",
    onlyForTypes: ["text", "email", "number", "password", "textarea"],
  },
  {
    key: "mask",
    label: "ماسک (Mask)",
    inputType: "select",
    options: [
      { label: "Only Digits", value: "onlyDigits" },
      { label: "Comma Separated", value: "commaSeparated" },
      { label: "Mobile", value: "mobile" },
      { label: "Persian Phone", value: "persianPhone" },
    ],
    defaultValue: "",
    onlyForTypes: ["text", "number", "phone", "mobile"],
  },
  {
    key: "prefix",
    label: "پیشوند (Prefix)",
    inputType: "text",
    onlyForTypes: ["text", "number", "password", "textarea"],
  },
  {
    key: "suffix",
    label: "پسوند (Suffix)",
    inputType: "text",
    onlyForTypes: ["text", "number", "password", "textarea"],
  },
  {
    key: "passwordOptions",
    label: "گزینه‌های رمز (Password Options)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["password"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۳. پراپرتی‌های اختصاصی «Date/Time/Datetime»
////////////////////////////////////////////////////////////////
const DATE_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "inputFormat",
    label: "Input Format",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["date", "time", "datetime"],
  },
  {
    key: "displayFormat",
    label: "Display Format",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["date", "time", "datetime"],
  },
  {
    key: "clearable",
    label: "پاک‌شدنی (Clearable)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["date", "time", "datetime"],
  },
  {
    key: "single",
    label: "انتخاب تک‌تاریخ (Single)",
    inputType: "checkbox",
    defaultValue: true,
    onlyForTypes: ["date", "time", "datetime"],
  },
  {
    key: "calendarType",
    label: "نوع تقویم (Calendar Type)",
    inputType: "select",
    options: [
      { label: "Persian", value: "persian" },
      { label: "Gregorian", value: "gregorian" },
    ],
    defaultValue: "gregorian",
    onlyForTypes: ["date", "datetime"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۴. پراپرتی‌های اختصاصی «Select»
////////////////////////////////////////////////////////////////
const SELECT_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "items",
    label: "آیتم‌ها (Items)",
    inputType: "array",
    arrayItemSchema: [
      { key: "label", inputType: "text", label: "Label", defaultValue: "" },
      { key: "value", inputType: "text", label: "Value", defaultValue: "" },
    ],
    onlyForTypes: ["select"],
    defaultValue: [],
  },
  {
    key: "multiple",
    label: "انتخاب چندگانه (Multiple)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["select"],
  },
  {
    key: "searchable",
    label: "قابل جستجو (Searchable)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["select"],
  },
  {
    key: "clearableSelect",
    label: "پاک‌شدنی (Clearable Select)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["select"],
  },
  {
    key: "labelField",
    label: "فیلد Label",
    inputType: "text",
    defaultValue: "label",
    onlyForTypes: ["select"],
  },
  {
    key: "valueField",
    label: "فیلد Value",
    inputType: "text",
    defaultValue: "value",
    onlyForTypes: ["select"],
  },
  {
    key: "displayField",
    label: "فیلد نمایش (Display Field)",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["select"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۵. پراپرتی‌های اختصاصی «CheckboxGroup / RadioGroup»
////////////////////////////////////////////////////////////////
const CHECK_RADIO_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "options",
    label: "گزینه‌ها (Options)",
    inputType: "array",
    arrayItemSchema: [
      { key: "label", inputType: "text", label: "Label", defaultValue: "" },
      { key: "value", inputType: "text", label: "Value", defaultValue: "" },
    ],
    onlyForTypes: ["checkboxGroup", "radioGroup"],
    defaultValue: [],
  },
  {
    key: "groupLabel",
    label: "عنوان گروه (Group Label)",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["checkboxGroup", "radioGroup"],
  },
  {
    key: "direction",
    label: "چیدمان (Direction)",
    inputType: "object",
    isResponsive: true,
    children: [
      { key: "base", label: "Base", inputType: "select", options: [
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ], defaultValue: "vertical" },
      { key: "sm",   label: "SM",   inputType: "select", options: [
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ], defaultValue: undefined },
      { key: "md",   label: "MD",   inputType: "select", options: [
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ], defaultValue: undefined },
      { key: "lg",   label: "LG",   inputType: "select", options: [
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ], defaultValue: undefined },
      { key: "xl",   label: "XL",   inputType: "select", options: [
          { label: "Vertical", value: "vertical" },
          { label: "Horizontal", value: "horizontal" },
        ], defaultValue: undefined },
    ],
    defaultValue: { base: "vertical", sm: undefined, md: undefined, lg: undefined, xl: undefined },
    onlyForTypes: ["checkboxGroup", "radioGroup"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۶. پراپرتی‌های اختصاصی «Toggle»
////////////////////////////////////////////////////////////////
const TOGGLE_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "size",
    label: "اندازه (Size)",
    inputType: "select",
    options: [
      { label: "Small",  value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large",  value: "lg" },
    ],
    defaultValue: "md",
    onlyForTypes: ["toggle"],
  },
  {
    key: "onColor",
    label: "رنگ فعال (On Color)",
    inputType: "text", // یا color-picker
    defaultValue: "blue-500",
    onlyForTypes: ["toggle"],
  },
  {
    key: "offColor",
    label: "رنگ غیرفعال (Off Color)",
    inputType: "text",
    defaultValue: "gray-300",
    onlyForTypes: ["toggle"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۷. پراپرتی‌های اختصاصی «File»
////////////////////////////////////////////////////////////////
const FILE_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "accept",
    label: "پسوندهای مجاز (Accept)",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["file"],
  },
  {
    key: "multipleFile",
    label: "چندفایله (Multiple File)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["file"],
  },
  {
    key: "maxFiles",
    label: "حداکثر فایل‌ها (Max Files)",
    inputType: "number",
    defaultValue: 1,
    onlyForTypes: ["file"],
  },
  {
    key: "maxSize",
    label: "حداکثر حجم (Max Size)",
    inputType: "number",
    defaultValue: Infinity,
    onlyForTypes: ["file"],
  },
  {
    key: "isImageUploader",
    label: "آپلود تصویر (Image Uploader)",
    inputType: "checkbox",
    defaultValue: true,
    onlyForTypes: ["file"],
  },
  {
    key: "watermark",
    label: "واترمارک (Watermark)",
    inputType: "checkbox",
    defaultValue: false,
    onlyForTypes: ["file"],
  },
  {
    key: "watermarkImage",
    label: "تصویر واترمارک",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["file"],
  },
  {
    key: "uploadUrl",
    label: "آدرس آپلود (Upload URL)",
    inputType: "text",
    defaultValue: null,
    onlyForTypes: ["file"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۸. پراپرتی‌های اختصاصی «Richtext»
////////////////////////////////////////////////////////////////
const RICHTEXT_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "placeholder",
    label: "Placeholder",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["richtext"],
  },
  {
    key: "image",
    label: "شامل تصویر (Include Image)",
    inputType: "checkbox",
    defaultValue: true,
    onlyForTypes: ["richtext"],
  },
];

////////////////////////////////////////////////////////////////
// ۲-۹. پراپرتی‌های اختصاصی «Array»
////////////////////////////////////////////////////////////////
const ARRAY_FIELD_PROPS: PropertyDefinition[] = [
  {
    key: "label",
    label: "متن برچسب (Label)",
    inputType: "text",
    defaultValue: "",
    onlyForTypes: ["array"],
  },
  {
    key: "itemFields",
    label: "ساختار آیتم‌ها (Item Fields)",
    inputType: "array",
    arrayItemSchema: [
      // این قسمت خودش همان FieldConfig است، پس می‌توانیم دقیقاً از کلیدی مشابه 
      // COMMON_FIELD_PROPS + TEXT_FIELD_PROPS + … برای تعریف ساختار داخلی استفاده کنیم.
      // برای درختی نشدن توضیح، فرض کنیم صرفاً key/title/text داریم:
      { key: "key", label: "کلید", inputType: "text", defaultValue: "" },
      { key: "type", label: "نوع", inputType: "select", options: [
          { label: "Text", value: "text" },
          // … بقیهٔ typeها
        ], defaultValue: "text" },
      { key: "label", label: "متن برچسب", inputType: "text", defaultValue: "" },
      // (می‌توانید برای validators و layout و سایر موارد هم children تعریف کنید)
    ],
    defaultValue: [],
    onlyForTypes: ["array"],
  },
  {
    key: "minItems",
    label: "حداقل آیتم‌ها (Min Items)",
    inputType: "number",
    defaultValue: 0,
    onlyForTypes: ["array"],
  },
  {
    key: "maxItems",
    label: "حداکثر آیتم‌ها (Max Items)",
    inputType: "number",
    defaultValue: Infinity,
    onlyForTypes: ["array"],
  },
];

////////////////////////////////////////////////////////////////
// ۳. یک شیٔ نهایی که برای هر type یک آرایهٔ PropertyDefinition برگرداند
////////////////////////////////////////////////////////////////
export const FIELD_SCHEMA: Record<string, PropertyDefinition[]> = {
  // ابتدا پراپرتی‌‌های مشترک را اضافه می‌کنیم:
  text: [
    ...COMMON_FIELD_PROPS,
    ...TEXT_FIELD_PROPS,
  ],
  email: [
    ...COMMON_FIELD_PROPS,
    ...TEXT_FIELD_PROPS,
  ],
  number: [
    ...COMMON_FIELD_PROPS,
    ...TEXT_FIELD_PROPS,
  ],
  password: [
    ...COMMON_FIELD_PROPS,
    ...TEXT_FIELD_PROPS,
  ],
  textarea: [
    ...COMMON_FIELD_PROPS,
    ...TEXT_FIELD_PROPS,
  ],

  date: [
    ...COMMON_FIELD_PROPS,
    ...DATE_FIELD_PROPS,
  ],
  time: [
    ...COMMON_FIELD_PROPS,
    ...DATE_FIELD_PROPS,
  ],
  datetime: [
    ...COMMON_FIELD_PROPS,
    ...DATE_FIELD_PROPS,
  ],

  select: [
    ...COMMON_FIELD_PROPS,
    ...SELECT_FIELD_PROPS,
  ],

  checkboxGroup: [
    ...COMMON_FIELD_PROPS,
    ...CHECK_RADIO_FIELD_PROPS,
  ],

  radioGroup: [
    ...COMMON_FIELD_PROPS,
    ...CHECK_RADIO_FIELD_PROPS,
  ],

  toggle: [
    ...COMMON_FIELD_PROPS,
    ...TOGGLE_FIELD_PROPS,
  ],

  file: [
    ...COMMON_FIELD_PROPS,
    ...FILE_FIELD_PROPS,
  ],

  richtext: [
    ...COMMON_FIELD_PROPS,
    ...RICHTEXT_FIELD_PROPS,
  ],

  array: [
    ...COMMON_FIELD_PROPS,
    ...ARRAY_FIELD_PROPS,
  ],
};

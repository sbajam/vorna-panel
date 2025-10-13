// src/runtime/types/column-types.js

export const BadgeColor = ['gray', 'red', 'yellow', 'green', 'blue', 'purple', 'custom'];

export function BadgeCondition(condition, value, color, customColor, icon) {
  this.condition = condition;
  this.value = value;
  this.color = color;
  this.customColor = customColor || undefined;
  this.icon = icon || undefined;
}

export function BadgeSettings(conditions, defaultValue, defaultColor) {
  this.conditions = conditions || [];
  this.defaultValue = defaultValue || '';
  this.defaultColor = defaultColor || '';
}

export function LinkSettings(target, asButton, buttonStyle, confirmMessage, basePath, safe) {
  this.target = target || '_self';
  this.asButton = asButton || false;
  this.buttonStyle = buttonStyle || 'primary';
  this.confirmMessage = confirmMessage || '';
  this.basePath = basePath || '';
  this.safe = safe || false;
}

export function DateSettings(format, locale, showTime) {
  this.format = format || '';
  this.locale = locale || '';
  this.showTime = showTime || false;
}

export function NumberSettings(decimals, thousandSeparator) {
  this.decimals = decimals || undefined;
  this.thousandSeparator = thousandSeparator || false;
}

export function CurrencySettings(currency, locale, decimals, thousandSeparator) {
  NumberSettings.call(this, decimals, thousandSeparator);
  this.currency = currency || '';
  this.locale = locale || '';
}

export function PercentageSettings(showSign, decimals, thousandSeparator) {
  NumberSettings.call(this, decimals, thousandSeparator);
  this.showSign = showSign || false;
}

export function SelectOption(value, label) {
  this.value = value;
  this.label = label;
}

export function SelectSettings(multiple, searchable, options) {
  this.multiple = multiple || false;
  this.searchable = searchable || false;
  this.options = options || [];
}

export const ColumnType = [
  'text',
  'number',
  'currency',
  'date',
  'datetime',
  'badge',
  'link',
  'percentage',
  'select'
];

export const ColumnTypeSettings = {
  badge: BadgeSettings,
  link: LinkSettings,
  date: DateSettings,
  datetime: DateSettings,
  number: NumberSettings,
  currency: CurrencySettings,
  percentage: PercentageSettings,
  select: SelectSettings,
  text: {}
};

export function ColumnDefinition(type, settings) {
  this.type = type;
  this.settings = settings;
  // ... سایر پراپرتی‌ها
}

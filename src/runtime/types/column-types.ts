// src/runtime/types/column-types.ts

export type BadgeColor = 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'custom';

export interface BadgeCondition {
  condition: string;
  value: string;
  color: BadgeColor;
  customColor?: string;
  icon?: string;
}

export interface BadgeSettings {
  conditions?: BadgeCondition[];
  defaultValue?: string;
  defaultColor?: string;
}

export interface LinkSettings {
  target?: '_blank' | '_self';
  asButton?: boolean;
  buttonStyle?: 'primary' | 'secondary' | 'danger';
  confirmMessage?: string;
  basePath?: string;
  safe?: boolean;
}

export interface DateSettings {
  format?: string;
  locale?: string;
  showTime?: boolean;
}

export interface NumberSettings {
  decimals?: number;
  thousandSeparator?: boolean;
}

export interface CurrencySettings extends NumberSettings {
  currency?: string;
  locale?: string;
}

export interface PercentageSettings extends NumberSettings {
  showSign?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectSettings {
  multiple?: boolean;
  searchable?: boolean;
  options?: SelectOption[];
}

export type ColumnType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'datetime'
  | 'badge'
  | 'link'
  | 'percentage'
  | 'select';

export type ColumnTypeSettings = {
  badge: BadgeSettings;
  link: LinkSettings;
  date: DateSettings;
  datetime: DateSettings;
  number: NumberSettings;
  currency: CurrencySettings;
  percentage: PercentageSettings;
  select: SelectSettings;
  text: {};
};

export interface ColumnDefinition {
  type: keyof ColumnTypeSettings;
  settings: ColumnTypeSettings[keyof ColumnTypeSettings];
  // ... سایر پراپرتی‌ها
}

<script setup>

const props = defineProps({
  variant:   { type: String, default: "solid" },      // solid | outline | ghost
  size:      { type: String, default: "md" },         // sm | md | lg | xl | 2xl | 3xl
  rounded:   { type: String, default: "lg" },         // e.g. 'full', 'md', ...
  color:     { type: String, default: "" },           // e.g. 'blue-500'
  fullWidth: { type: Boolean, default: false },
  disabled:  { type: Boolean, default: false },
  pending:   { type: Boolean, default: false },
  icon:      { type: String, default: null },         // اسم آیکون
});
const emit = defineEmits(["click"]);

// پالت رنگ اتومات
const palette = ["blue-500","green-500","red-500","yellow-500","primary-100","secondary-100"];
const autoColor = ref("");
onBeforeMount(() => {
  autoColor.value = palette[Math.floor(Math.random() * palette.length)];
});
const finalColor = computed(() => props.color || autoColor.value);

// کلاس‌های پایه
const baseClasses = {
  solid:   ["text-white","outline-none","border-none"],
  outline: ["bg-transparent","border-2"],
  ghost:   ["bg-transparent","outline-none","border-none"],
};
const colorClasses = computed(() => {
  const c = finalColor.value;
  if (props.variant === "solid") {
    const hoverShade = c.replace(/-(\d+)$/,(m,p)=>`-${Math.max(100,+p-100)}`);
    return [`bg-${c}`,`hover:bg-${hoverShade}`];
  }
  if (props.variant === "outline") {
    return [`border-${c}`,`text-${c}`,`hover:bg-${c}/10`];
  }
  if (props.variant === "ghost") {
    return [`text-${c}`,`hover:bg-${c}/10`];
  }
  return [];
});
const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":  return ["px-3","py-1.5","text-sm"];
    case "lg":  return ["px-6","py-3","text-lg"];
    case "xl":  return ["px-8","py-4","text-xl"];
    case "2xl": return ["px-10","py-6","text-2xl"];
    case "3xl": return ["px-12","py-6","text-3xl"];
    default:    return ["px-4","py-2","text-base"]; // md
  }
});
const otherClasses = computed(() => [
  props.fullWidth ? "w-full" : "",
  props.rounded    ? `rounded-${props.rounded}` : "rounded",
  props.disabled || props.pending
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer",
]);

// اندازه‌ی spinner بر اساس size
const spinnerSize = computed(() => {
  switch (props.size) {
    case "sm":  return 10;
    case "lg":  return 12;
    case "xl":  return 14;
    case "2xl": return 16;
    case "3xl": return 20;
    default:    return 12; // md
  }
});

function onClick(e) {
  if (props.disabled || props.pending) return;
  emit("click", e);
}
</script>

<template>
  <button
    class="relative inline-flex items-center justify-center border transition overflow-hidden"
    :class="[
      ...baseClasses[props.variant],
      ...colorClasses,
      ...sizeClasses,
      ...otherClasses,
    ]"
    @click="onClick"
    :disabled="props.disabled || props.pending"
  >
    <!-- محتوای نامرئی برای رزرو عرض -->
    <span class="invisible flex items-center gap-2 whitespace-nowrap">
      <Icon v-if="icon" :name="icon" />
      <slot />
    </span>

    <!-- متن + آیکون -->
    <div
      v-if="!pending"
      class="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap"
    >
      <Icon v-if="icon" :name="icon" />
      <slot />
    </div>

    <!-- اسپینر -->
    <div
      v-else
      class="absolute inset-0 flex items-center justify-center"
    >
      <Spinner
        :size="`${spinnerSize +6}px`"
        borderWidth="4px"
        :color="finalColor"
      />
    </div>
  </button>
</template>

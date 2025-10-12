<script setup>
import { defineProps } from 'vue';  // برای تعریف props

const props = defineProps({
  /** هر واحد معتبر CSS برای ارتفاع کانتینر (مثلا '50vh', '300px') */
  containerHeight: { type: String, default: '50vh' },
  /** قطر کامل Spinner (مثلا '2rem', '32px') */
  size:            { type: String, default: '2rem' },
  /** ضخامت حاشیه (مثلا '0.25rem', '4px') */
  borderWidth:     { type: String, default: '0.25rem' },
  /** رنگ پس‌زمینه‌ی حاشیه (طرف‌های غیرِ highlight) */
  baseColor:       { type: String, default: 'transparent' },  // gray-200
  /** رنگ head (border-top) */
  color:           { type: String, default: '#3b82f6' },  // blue-500
})
</script>

<template>
  <div
    class="flex items-center justify-center w-full"
    :style="{ height: props.containerHeight }"
  >
    <div
      class="animate-spin rounded-full"
      :style="{
        width:          props.size,
        height:         props.size,
        borderWidth:    props.borderWidth,
        borderStyle:    'solid',
        borderRightColor:    props.baseColor,
        borderBottomColor:    props.baseColor,
        borderLeftColor:    props.color,
        borderTopColor: props.color 
      }"
    />
  </div>
</template>

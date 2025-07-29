<template>
  <apexchart
    v-if="isValid"
    :type="type"
    :series="series"
    :options="options"
    height="300"
  />

  <!-- {{ type }} - {{ isValid }}
  <pre>{{ series }}</pre>

  <pre>{{ options }}</pre> -->
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: { type: String, required: true },
  series: { type: Array, required: true },
  options: { type: Object, required: true },
});

const isValid = computed(() => {
  if (props.type === "pie" || props.type === "donut") {
    return (
      Array.isArray(props.series) &&
      props.series.length > 0 &&
      props.series.every((v) => typeof v === "number" && !isNaN(v))
    );
  }

  return (
    Array.isArray(props.series) &&
    props.series.length > 0 &&
    props.series.every(
      (s) =>
        Array.isArray(s.data) &&
        s.data.length > 0 &&
        s.data.every(
          (p) => p.x !== undefined && typeof p.y === "number" && !isNaN(p.y)
        )
    )
  );
});
</script>

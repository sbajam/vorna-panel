<!-- src/runtime/layouts/modal.vue -->
<script setup>
import Icon from "@nuxt/icon";
const props = defineProps({
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["update:show", "close_popup"]);

function onBackdropClick(e) {
  // اگر روی بک‌دراپ کلیک شد، ببند
  if (e.target.classList.contains("back")) {
    emit("update:show", false);
    emit("close_popup");
  }
}
</script>

<template>
  <teleport to="body">
    <div
      v-show="props.show"
      class="back fixed inset-0 flex items-center justify-center z-[1000] overflow-auto"
      @click="onBackdropClick"
    >
      <div
        class="relative bg-white rounded-xl p-6 md:p-10 max-w-11/12 w-fit max-h-[90vh] overflow-auto"
      >
        <!-- دکمه بستن -->
        <button
          class="absolute top-4 right-4 text-darkBlue bg-white p-2 rounded-full shadow"
          @click="
            $emit('update:show', false);
            $emit('close_popup');
          "
        >
          <Icon name="fa6-solid:x" />
        </button>

        <!-- اسلات پیش‌فرض برای محتوای مدال -->
        <slot />
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.back {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
</style>

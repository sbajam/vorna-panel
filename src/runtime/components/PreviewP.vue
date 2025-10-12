<template>
  <NuxtLayout name="modal" :show="showModal" @close_popup="closeModal">
    <div class="w-[90vw]">
    <FormBuilder
      :config="prop.config"
      :initialValues="fillInitialData"
      @validationError="onValidationError"
      @submitForm="onSubmitForm"
    />
    </div>
  </NuxtLayout>
</template>
<script setup>
import { ref, defineProps } from 'vue';  // برای defineProps و ref

const showModal = ref(true);
let prop = defineProps(["config"]);
function closeModal() {
  showModal.value = false;
}
</script>

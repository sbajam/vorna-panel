<!-- pages/playground/button-playground.vue -->
<script setup>
// all variants, sizes and a color palette
const variants = ["solid", "outline"];
const sizes = ["sm", "md", "lg", "xl"];
const colors = ["primary-100", "secondary-100", "green-500", "red-500"];
</script>

<template>
  <NuxtLayout name="admin">
    <template #main>
      <Box class="">
        <Header class="">Button Playground</Header>

        <div v-for="variant in variants" :key="variant" class="space-y-6">
          <h2 class="text-xl font-semibold capitalize">{{ variant }}</h2>

          <div v-for="size in sizes" :key="size" class="space-y-4">
            <h3 class="font-medium">{{ size }}</h3>
            <div class="flex flex-wrap gap-4 items-center">
              <!-- Normal buttons without icon -->
              <Button
                v-for="color in colors"
                :key="`${variant}-${size}-${color}`"
                :variant="variant"
                :size="size"
                :color="color"
              >
                {{ color }}
              </Button>
              <Button
                v-for="color in colors"
                :key="`${variant}-${size}-${color}`"
                :variant="variant"
                :size="size"
                :color="color"
                :pending="true"
              >
                {{ color }}
              </Button>

              <!-- With icon on the right -->
              <Button
                v-for="color in colors"
                :key="`${variant}-${size}-${color}-icon`"
                :variant="variant"
                :size="size"
                :color="color"
                icon="fa6-solid:trash-can"
              >
                {{ color }}
              </Button>
            </div>
          </div>
          <Button
            v-for="color in colors"
            :key="`${variant}-${size}-${color}-icon`"
            :variant="variant"
            size="2xl"
            :color="color"
            icon="fa6-solid:trash-can"
            :full-width="true"
          >
            {{ color }}
          </Button>
        </div>
      </Box>
    </template>
  </NuxtLayout>
</template>

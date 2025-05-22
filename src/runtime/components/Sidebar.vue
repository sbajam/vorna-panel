<script setup>
import { useOnline } from "@vueuse/core";
import { useBreadcrumbStore } from '~vorna-stores/breadcrumb'

// خواندن menuItems از config اگر از props نفرستاده باشند
const config = useRuntimeConfig().public.vornaPanel;

const emit = defineEmits(["logout", "toggle"]);

const collapsed = ref(false);
const isMobile = ref(false);
const menuContainer = ref(null);
const online = useOnline();
const route = useRoute();

function toggleSidebar() {
  collapsed.value = !collapsed.value;
  emit("toggle", collapsed.value);
}
function handleLogout() {
  document.cookie = "admin=Mahesh; expires=Sun, 19 May 2019 18:04:55 UTC";
  document.cookie = "auth-flag=Mahesh; expires=Sun, 19 May 2019 18:04:55 UTC";
  navigateTo("../../login");
}

watch(
  () => route.fullPath,
  () => {
    const active = menuContainer.value?.querySelector(".router-link-active");
    active?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
);

function onClick(to) {
  useBreadcrumbStore().reset();
  useRouter().push(to);
}
</script>

<template>
  <nav
    :class="[
      'admin-sidebar',
      { 'admin-sidebar-collapsed': collapsed },
      { 'admin-sidebar-mobile': isMobile && !collapsed },
    ]"
  >
    <!-- Logo Section -->
    <div class="sidebar-header">
      <slot name="logo">
        <div class="logo-container">
          {{ menuItems }}
          <img :src="config.logo" :alt="config.name" class="logo-image" />
          <h3 class="logo-title">
            {{ config.name }}
          </h3>
        </div>
      </slot>
      <!-- Online Status -->
      <div
        v-if="config.showOnlineStatus"
        :class="['status-badge', online ? 'status-online' : 'status-offline']"
      >
        <div class="status-indicator" />
        <span>{{ online ? "آنلاین" : "آفلاین" }}</span>
      </div>
    </div>

    <!-- Toggle Button -->
    <button class="sidebar-toggle" @click="toggleSidebar">
      <span />
      <span />
      <span />
    </button>

    <!-- Navigation Menu -->
    <div ref="menuContainer" class="sidebar-menu">
      <template v-for="(section, index) in config.menuItems" :key="index">
        <!-- Section Title -->
        <div v-if="section.title" class="menu-section">
          <h2>{{ section.title }}</h2>
        </div>

        <!-- Menu Items -->
        <div class="menu-items">
          <NuxtLink
            v-for="item in section.items"
            :key="item.path"
            v-slot="{ isActive }"
            :to="item.path"
            @click.native.prevent="onClick(item.path)"
            class="menu-item"
            :class="{ 'has-badge': item.badge }"
          >
            <!-- Icon -->
            <div class="item-icon">
              <icon
                :name="item.icon"
                :class="{ 'icon-active': isActive }"
                class="text-lg"
              />
              <!-- اگر subIcon دارید: -->
              <icon
                v-if="item.subIcon"
                :name="item.subIcon"
                class="sub-icon text-xs bg-white rounded-full p-0.5"
              />
            </div>

            <!-- Label -->
            <span class="item-label">{{ item.label }}</span>

            <!-- Badge -->
            <div v-if="item.badge" class="item-badge">
              {{ typeof item.badge === "function" ? item.badge() : item.badge }}
            </div>
          </NuxtLink>
        </div>
      </template>
    </div>

    <!-- Footer Actions -->
    <div class="sidebar-footer">
      <slot name="footer">
        <button class="logout-button" @click="handleLogout">
          <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
          <span>خروج</span>
        </button>
      </slot>
    </div>
  </nav>
</template>

<style lang="scss">
.admin-sidebar {
  @apply bg-white py-4 h-screen flex flex-col transition-all duration-300 relative shadow-lg;
  width: 280px;

  &.admin-sidebar-collapsed {
    width: 80px;

    .logo-title,
    .item-label,
    .menu-section h2 {
      @apply hidden;
    }

    .menu-item {
      @apply justify-center;
    }

    .item-badge {
      @apply absolute -top-1 -right-1 scale-75;
    }
  }

  &.admin-sidebar-mobile {
    @apply fixed top-0 left-0 z-50;
  }
}

.sidebar-header {
  @apply px-4 mb-6;
}

.logo-container {
  @apply flex flex-col items-center gap-2;
}

.logo-image {
  @apply w-16 h-16 object-contain;
}

.logo-title {
  @apply font-bold text-primary-100 text-lg text-center;
}

.status-badge {
  @apply mt-2 w-full px-4 py-1 flex items-center gap-2 justify-center text-sm font-medium;

  &.status-online {
    @apply bg-green-600 text-white;
    .status-indicator {
      @apply bg-green-800;
    }
  }

  &.status-offline {
    @apply text-white bg-red-600;
    .status-indicator {
      @apply bg-red-800;
    }
  }
}

.status-indicator {
  @apply w-2 h-2 rounded-full animate-pulse;
}

.sidebar-toggle {
  @apply absolute -left-3 top-8 w-6 h-6 bg-white rounded-full shadow-md flex flex-col justify-center items-center gap-0.5 cursor-pointer;

  span {
    @apply w-3 h-0.5 bg-gray-600 transition-all;
  }

  &:hover span {
    @apply bg-primary-100;
  }
}

.sidebar-menu {
  @apply flex-1 overflow-y-auto overflow-x-hidden px-4;
}

.menu-section {
  @apply mb-2;

  h2 {
    @apply text-sm text-gray-400 px-4;
  }
}

.menu-items {
  @apply flex flex-col gap-1 mb-6;
}

.menu-item {
  @apply flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative;

  &.router-link-active {
    @apply bg-primary-20 text-primary-100;
  }

  .item-icon {
    @apply relative flex-shrink-0;

    .sub-icon {
      @apply absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5;
    }
  }

  .item-label {
    @apply text-sm whitespace-nowrap;
  }

  .item-badge {
    @apply min-w-[20px] h-5 rounded-full bg-secondary-100  text-white text-xs flex items-center justify-center absolute right-2;
  }
}

.sidebar-footer {
  @apply px-4 mt-auto pt-4 border-t border-gray-100;
}

.logout-button {
  @apply w-full flex items-center gap-2 border-red-500 border  px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors;

  &:hover {
    @apply text-red-500;
  }
}
</style>

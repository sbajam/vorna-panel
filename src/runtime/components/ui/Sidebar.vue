<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, useRuntimeConfig, navigateTo } from "nuxt/app";
import { useBreadcrumbStore } from "~vorna-stores/breadcrumb";
import { useUserStore } from "~vorna-stores/user";
import { Vue3SlideUpDown } from "vue3-slide-up-down";
import { useOnline, useMediaQuery } from "@vueuse/core";
import { useBadges } from "~vorna-stores/badges"; // ← اضافه کردن این خط برای استفاده از badges store
// خواندن menuItems از config اگر از props نفرستاده باشند
const config = useRuntimeConfig().public.vornaPanel;
const user = useUserStore();
const badgesStore = useBadges();

const emit = defineEmits(["logout", "toggle"]);

const filteredSections = ref(
  (config.menuItems || [])
    .map((section, index) => {
      const filteredItems = (section.items || [])
        .filter((item) => {
          if (
            config.superAdmins?.includes(user.roles) ||
            user.roles == "superAdmin"
          )
            return true;
          if (item.guest) return true;
          return user?.hasRoutePermission?.(item.path);
        })
        .map((item) => ({
          ...item,
        }));

      return {
        ...section,
        _id: `section-${index}`,
        collapsed: !section.collapsed,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0)
);

const collapsed = ref(true);
const isMobile = ref(false);
const menuContainer = ref(null);
const online = useOnline();
const route = useRoute();
let good = ref(false);
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
onBeforeMount(() => {
  if (useMediaQuery("(min-width: 1024px)").value) {
    collapsed.value = false;

    emit("toggle", collapsed.value);
  }
  good.value = true;
});
function onClick(to) {
  useBreadcrumbStore().reset();
  useRouter().push(to);
}
</script>

<template>
  <nav
    v-if="good"
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
      <template v-for="section in filteredSections" :key="section._id">
        <!-- Title + Toggle -->
        <div
          v-if="section.title"
          class="menu-section flex justify-between items-center cursor-pointer px-3 border border-secondary-50 rounded-md py-1"
          @click="section.collapsed = !section.collapsed"
        >
          <h2 class="!px-0">{{ section.title }}</h2>
          <icon
            class="text-sm text-secondary-70"
            :name="
              section.collapsed
                ? 'fa-solid:chevron-down'
                : 'fa-solid:chevron-up'
            "
          />
        </div>
        <!-- Slide menu -->
        <vue3-slide-up-down v-model="section.collapsed" :duration="200">
          <div class="menu-items">
            <NuxtLink
              v-for="item in section.items"
              :key="item.path"
              :to="item.path"
              v-slot="{ isActive }"
              @click.prevent="onClick(item.path)"
              class="menu-item"
              :class="{ 'has-badge': item.badge }"
            >
              <div class="item-icon">
                <icon
                  :name="item.icon"
                  :class="{ 'icon-active': isActive }"
                  class="text-lg"
                />
                <icon
                  v-if="item.subIcon"
                  :name="item.subIcon"
                  class="sub-icon text-xs bg-white rounded-full p-0.5"
                />
              </div>
              <span class="item-label">{{ item.label }}</span>
              <!-- نمایش badge -->
              <span
                v-if=" item.badge && badgesStore.getBadges(item.badge) !== null && badgesStore.getBadges(item.badge)!=0"
                class="item-badge"
              >
                {{ badgesStore.getBadges(item.badge) }}
              </span>
            </NuxtLink>
          </div>
        </vue3-slide-up-down>
      </template>
    </div>

    <!-- Footer Actions -->
    <div class="sidebar-footer">
      <slot name="footer">
        <button class="logout-button menu-item" @click="handleLogout">
          <Icon class="item-icon" name="si:sign-out-alt-fill" />
          <span class="itme-label">خروج</span>
        </button>
      </slot>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
/* ===== Sidebar Base ===== */
.admin-sidebar {
  @apply bg-white h-screen flex flex-col shadow-lg transition-all duration-300;

  /* default width (desktop / tablet) */
  @apply w-72;

  /* ===== Header ===== */
  .sidebar-header {
    @apply px-4 mb-6;

    .logo-container {
      @apply flex flex-col items-center gap-2;

      .logo-image {
        @apply w-16 h-16 object-contain;
      }
      .logo-title {
        @apply font-bold text-primary-100 text-lg text-center;
      }
    }

    .status-badge {
      @apply mt-2 w-full px-4 py-1 flex items-center gap-2 justify-center text-sm font-medium rounded-lg;

      &.status-online {
        @apply bg-green-600 text-white;
        .status-indicator {
          @apply bg-green-800;
        }
      }

      &.status-offline {
        @apply bg-red-600 text-white;
        .status-indicator {
          @apply bg-red-800;
        }
      }

      .status-indicator {
        @apply w-2 h-2 rounded-full animate-pulse;
      }
    }
  }

  /* ===== Toggle Button (base, overridden per breakpoint) ===== */
  .sidebar-toggle {
    @apply flex flex-col justify-center items-center gap-0.5 cursor-pointer rounded-full shadow-md;

    span {
      @apply transition-all;
    }
  }

  /* ===== Menu ===== */
  .sidebar-menu {
    @apply flex-1 overflow-y-auto overflow-x-hidden px-4;

    .menu-section {
      @apply mb-2 flex justify-between items-center cursor-pointer px-3 border border-secondary-50 rounded-md py-1;

      h2 {
        @apply text-sm text-gray-400 px-4;
      }
    }

    .menu-items {
      @apply flex flex-col gap-1 mb-6;

      .menu-item {
        @apply relative flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors;

        &.router-link-active {
          @apply bg-primary-20 text-primary-100;
        }

        .item-icon {
          @apply relative shrink-0;

          .sub-icon {
            @apply absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5;
          }
        }

        .item-label {
          @apply text-sm whitespace-nowrap;
        }

        .item-badge {
          @apply absolute right-2 top-[-2px] min-w-[20px] h-5 rounded-full bg-secondary-100 text-white text-xs flex items-center justify-center;
        }
      }
    }

    /* active route highlight bar (optional) */
    :deep(.router-link-active.router-link-exact-active) {
      &::after {
        content: "";
        @apply absolute left-[-15px] rounded-md;
        width: 5px;
        height: 90%;
        background: theme("colors.primary.10", #cecece);
      }
    }
  }

  /* ===== Footer ===== */
  .sidebar-footer {
    @apply px-4 mt-auto pt-4 border-t border-gray-100;

    .logout-button {
      @apply w-full flex items-center gap-2 border bg-red-800 bg-opacity-80 text-white border-red-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors;

      &:hover {
        @apply bg-opacity-100 bg-red-800;
      }
    }
  }

  /* =======================
     Mobile (< md) behavior
     ======================= */
  @media (max-width: 767px) {
    /* Only toggle visible when collapsed (off-canvas hidden) */
    &.admin-sidebar-collapsed {
      @apply right-[-100%] w-0;
      .sidebar-header,
      .sidebar-menu,
      .sidebar-footer {
        @apply hidden;
      }
    }

    /* Open = full-screen drawer with overlay; page goes behind */
    &:not(.admin-sidebar-collapsed) {
      @apply fixed z-[10000] w-80 max-w-[85vw] right-0 shadow-lg;

      /* overlay behind the panel */
      // &::before {
      //   content: "";
      //   @apply absolute inset-0 bg-black/40 -z-10;
      // }
    }

    .sidebar-toggle {
      @apply fixed top-4 right-4  w-10 h-10 bg-primary-100 text-white z-[100000];

      span {
        @apply w-5 h-0.5 bg-white;
      }
    }
  }

  /* ==========================
     Tablet and up (≥ md)
     ========================== */
  @media (min-width: 768px) {
    @apply relative translate-x-0;

    /* Collapsed on tablet+ = show icons only */
    &.admin-sidebar-collapsed {
      @apply w-20 px-0;

      .logo-title,
      .menu-section h2,
      .menu-item .item-label {
        @apply hidden;
      }

      .menu-item {
        @apply justify-center;
      }
      .item-badge {
        @apply absolute -top-1 -right-1 scale-75;
      }
    }

    /* Toggle small pill on the side */
    .sidebar-toggle {
      @apply absolute -left-3 top-8 w-6 h-6 bg-white z-50;

      span {
        @apply w-3 h-0.5 bg-gray-600;
      }
      &:hover span {
        @apply bg-primary-100;
      }
    }
    &.admin-sidebar-collapsed .logout-button {
      .item-label {
        @apply hidden; /* متن خروج مخفی شود */
      }
      .item-icon {
        @apply flex justify-center items-center; /* آیکون خروج به صورت وسط‌چین نمایش داده شود */
      }
    }
  }
}
/* Optional helper to support existing .admin-sidebar-mobile class if used in template.
   On mobile, it behaves the same as "open" (overlay drawer). */
@media (max-width: 767px) {
  .admin-sidebar.admin-sidebar-mobile {
    @apply fixed inset-0 z-50 w-80 max-w-[85vw];

    &::before {
      content: "";
      @apply fixed inset-0 bg-black/40 -z-10;
    }
  }
}
</style>

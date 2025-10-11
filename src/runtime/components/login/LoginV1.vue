<script setup lang="ts">
import {
  definePageMeta,
  ref,
  useCookie,
  useNuxtApp,
  useRoute,
  navigateTo,
} from "#imports";
import { useRuntimeConfig } from "nuxt/app";
import { useUserStore } from "../../stores/user";
const config = useRuntimeConfig().public.vornaPanel;

definePageMeta({ auth: false });

const { $notify } = useNuxtApp();
const username = ref("");
const password = ref("");
const { pending, error, data, request } = useApi();
const adminCookie = useCookie("token");
const route = useRoute();
const userStore = useUserStore();

const redirectTo = (route.query.redirect as string) || "/";
const passwordShow = ref(false);

const login = async () => {
  try {
    const res = await request("/login", {
      method: "post",
      data: {
        username: username.value.trim(),
        password: password.value.trim(),
      },
      headers: { "Cache-Control": "no-cache" },
    });

    $notify(res.message, res.status ? "success" : "danger");

    if (res.status && res.token) {
      document.cookie = `token=${res.token}; path=/;`;

      // const permRes = await request(`/api/user-permissions?role=${res.roles || "guest"}`, {
      //   method: "get",
      //   headers: { "Cache-Control": "no-cache" },
      //   baseUrl:' '
      // });
      userStore.setUser(res.token, res.roles || "superAdmin"); //defautl Role
      userStore.setUsername(username.value.trim());

      // فقط اگر روی صفحه login هستی، redirect کن
      if (route.path === "/login") {
        navigateTo(redirectTo);
      }
    }
  } catch (e) {
    console.error("Login failed:", e);
  }
};
</script>

<template>
  <main
    class="bg-[#EFEFF4] rtl flex justify-center items-center h-screen overflow-hidden w-full"
  >
    <section class="box !w-11/12 md:!w-6/12">
      <a href="#" class="mx-auto mb-10 block w-[fit-content]">
        <img
          :src="config.logo"
          :alt="config.name"
          class="logo-image block mb-10 h-32 max-w-[10rem] object-contain"
        />
      </a>
      <h1 class="text-2xl text-primary-100 text-center font-bold mb-12">
        پنل مدیریتی {{ config.name }}
      </h1>

      <InputField
        v-model="username"
        type="text"
        label="نام کاربری"
        label-position="right"
        class="mb-4"
      />
      <InputField
        v-model="password"
        type="password"
        label="رمز عبور"
        label-position="right"
        :passwordOptions="false"
      />
      <Button
        color="secondary-100"
        rounded="xl"
        size="md"
        class="my-10"
        :pending="pending"
        @click="login()"
        :full-width="true"
        >ورود</Button
      >
    </section>
  </main>
</template>
